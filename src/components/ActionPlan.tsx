import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Circle, Clock, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import type { PlanAccion, SectorReport, RespuestaEncuesta } from '@/lib/types';
import {
  fetchPlanAcciones,
  upsertPlanAccion,
  bulkInsertPlanes,
  deletePlanAccion,
  fetchRespuestasBySector,
} from '@/lib/api';
import {
  ACTION_SUGGESTIONS,
  ESCALATION_ACTIONS,
  getPreviousPeriod,
  type SectorTab,
} from '@/lib/constants';

interface ActionPlanProps {
  tab: SectorTab;
  report: SectorReport;
  previousReport: SectorReport | null;
}

export default function ActionPlan({ tab, report, previousReport }: ActionPlanProps) {
  const [planes, setPlanes] = useState<PlanAccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [notaText, setNotaText] = useState<Record<string, string>>({});
  const [responsableText, setResponsableText] = useState<Record<string, string>>({});
  const [prevPlanes, setPrevPlanes] = useState<PlanAccion[]>([]);
  const [escalationTriggered, setEscalationTriggered] = useState(false);

  const loadPlanes = useCallback(async () => {
    setLoading(true);
    const data = await fetchPlanAcciones(tab.hotel, tab.sector, report.periodo);
    setPlanes(data);
    const notas: Record<string, string> = {};
    const responsables: Record<string, string> = {};
    data.forEach((p) => {
      if (p.notas_seguimiento) notas[p.id!] = p.notas_seguimiento;
      if (p.responsable) responsables[p.id!] = p.responsable;
    });
    setNotaText(notas);
    setResponsableText(responsables);
    setLoading(false);
  }, [tab.hotel, tab.sector, report.periodo]);

  useEffect(() => {
    loadPlanes();
  }, [loadPlanes]);

  // Load previous period plan to check which actions were completed
  useEffect(() => {
    const prevPeriod = getPreviousPeriod(report.periodo);
    if (!prevPeriod || !previousReport) return;
    fetchPlanAcciones(tab.hotel, tab.sector, prevPeriod).then(setPrevPlanes);
  }, [tab.hotel, tab.sector, report.periodo, previousReport]);

  // Check for escalation: if a variable is still critico/alerta despite completed actions
  useEffect(() => {
    if (!previousReport || prevPlanes.length === 0) return;
    const completedVars = new Set(
      prevPlanes
        .filter((p) => p.estado === 'Completado')
        .map((p) => p.variable_afectada)
    );
    const needsEscalation = report.variables.some(
      (v) =>
        completedVars.has(v.key) &&
        (v.status === 'critico' || v.status === 'alerta')
    );
    setEscalationTriggered(needsEscalation);
  }, [previousReport, prevPlanes, report.variables]);

  const generateActionPlan = async () => {
    setLoading(true);
    const newPlanes: PlanAccion[] = [];

    report.variables.forEach((v) => {
      if (v.status === 'critico' || v.status === 'alerta') {
        const suggestions = ACTION_SUGGESTIONS[v.key] ?? [];
        suggestions.forEach((s) => {
          newPlanes.push({
            hotel: tab.hotel,
            sector: tab.sector,
            periodo: report.periodo,
            programa: s.programa,
            variable_afectada: v.key,
            accion_sugerida: s.accion,
            prioridad: s.prioridad,
            frecuencia: 'Mensual',
            kpi_medicion: s.kpi,
            estado: 'Pendiente',
          });
        });
      }
    });

    if (newPlanes.length > 0) {
      await bulkInsertPlanes(newPlanes);
      await loadPlanes();
    } else {
      setLoading(false);
    }
  };

  const generateEscalationPlan = async () => {
    setLoading(true);
    const newPlanes: PlanAccion[] = [];

    report.variables.forEach((v) => {
      if (v.status === 'critico' || v.status === 'alerta') {
        const escalations = ESCALATION_ACTIONS[v.key] ?? [];
        escalations.forEach((s) => {
          newPlanes.push({
            hotel: tab.hotel,
            sector: tab.sector,
            periodo: report.periodo,
            programa: s.programa,
            variable_afectada: v.key,
            accion_sugerida: s.accion,
            prioridad: s.prioridad,
            frecuencia: 'Mensual',
            kpi_medicion: s.kpi,
            estado: 'Pendiente',
          });
        });
      }
    });

    if (newPlanes.length > 0) {
      await bulkInsertPlanes(newPlanes);
      await loadPlanes();
    } else {
      setLoading(false);
    }
  };

  const toggleEstado = async (plan: PlanAccion) => {
    const next: PlanAccion['estado'] =
      plan.estado === 'Pendiente' ? 'En Proceso' :
      plan.estado === 'En Proceso' ? 'Completado' : 'Pendiente';
    const updated = await upsertPlanAccion({ ...plan, estado: next });
    if (updated) {
      setPlanes((prev) => prev.map((p) => (p.id === plan.id ? { ...p, estado: next } : p)));
    }
  };

  const saveNota = async (plan: PlanAccion) => {
    const nota = notaText[plan.id!] ?? '';
    const updated = await upsertPlanAccion({ ...plan, notas_seguimiento: nota });
    if (updated) {
      setPlanes((prev) => prev.map((p) => (p.id === plan.id ? { ...p, notas_seguimiento: nota } : p)));
    }
  };

  const saveResponsable = async (plan: PlanAccion) => {
    const responsable = responsableText[plan.id!] ?? '';
    const updated = await upsertPlanAccion({ ...plan, responsable });
    if (updated) {
      setPlanes((prev) => prev.map((p) => (p.id === plan.id ? { ...p, responsable } : p)));
    }
  };

  const handleDelete = async (id: string) => {
    await deletePlanAccion(id);
    setPlanes((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const completedCount = planes.filter((p) => p.estado === 'Completado').length;
  const progressPct = planes.length > 0 ? Math.round((completedCount / planes.length) * 100) : 0;

  const prioridadLabel = (p: number) => (p === 1 ? 'Alta' : p === 2 ? 'Media' : 'Baja');
  const prioridadColor = (p: number) =>
    p === 1 ? 'text-danger bg-danger-50' : p === 2 ? 'text-warning bg-warning-50' : 'text-neutral-elegant bg-neutral-light';

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="cs-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg text-charcoal-900">Progreso del Plan de Acción</h3>
          <span className="text-sm font-medium text-charcoal-800">{progressPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-neutral-border overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-elegant">
          {completedCount} de {planes.length} acciones completadas
        </p>
      </div>

      {/* Escalation alert */}
      {escalationTriggered && (
        <div className="cs-card p-4 border-danger/30 bg-danger-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-danger text-white text-sm font-bold">
                !
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-serif text-base text-charcoal-900 mb-1">
                Escalamiento recomendado
              </h4>
              <p className="text-xs text-neutral-elegant mb-3">
                Algunas variables continúan en estado crítico o de alerta a pesar de las acciones
                completadas en el semestre anterior. Se recomienda generar un plan de escalamiento
                con acciones de mayor impacto.
              </p>
              <button onClick={generateEscalationPlan} className="cs-btn-primary text-xs py-2">
                Generar plan de escalamiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate plan button */}
      {planes.length === 0 && !loading && (
        <div className="cs-card p-8 text-center">
          <p className="text-sm text-neutral-elegant mb-4">
            No hay acciones generadas para este sector en {report.periodo}.
          </p>
          <button onClick={generateActionPlan} className="cs-btn-gold">
            <Plus className="h-4 w-4" />
            Generar plan de acción automático
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="cs-card p-8 text-center">
          <p className="text-sm text-neutral-elegant">Cargando plan de acción...</p>
        </div>
      )}

      {/* Action list */}
      {planes.length > 0 && !loading && (
        <div className="space-y-3">
          {planes
            .sort((a, b) => a.prioridad - b.prioridad)
            .map((plan) => (
              <div
                key={plan.id}
                className={`cs-card p-4 transition-all ${
                  plan.estado === 'Completado' ? 'opacity-70' : ''
                } ${plan.estado === 'Completado' ? 'ring-1 ring-success/20' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleEstado(plan)}
                    className="flex-shrink-0 mt-0.5"
                  >
                    {plan.estado === 'Completado' ? (
                      <CheckCircle2 className="h-6 w-6 text-success transition-transform hover:scale-110" />
                    ) : plan.estado === 'En Proceso' ? (
                      <Clock className="h-6 w-6 text-warning transition-transform hover:scale-110" />
                    ) : (
                      <Circle className="h-6 w-6 text-neutral-elegant transition-transform hover:scale-110 hover:text-gold" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${prioridadColor(plan.prioridad)}`}>
                        {prioridadLabel(plan.prioridad)}
                      </span>
                      <span className="text-xs text-gold font-medium">{plan.programa}</span>
                      <span className="text-xs text-neutral-elegant">·</span>
                      <span className="text-xs text-neutral-elegant capitalize">
                        {plan.variable_afectada}
                      </span>
                    </div>
                    <p className={`text-sm text-charcoal-800 ${plan.estado === 'Completado' ? 'line-through' : ''}`}>
                      {plan.accion_sugerida}
                    </p>
                    {plan.kpi_medicion && (
                      <p className="mt-1 text-xs text-neutral-elegant">
                        <span className="font-medium">KPI:</span> {plan.kpi_medicion}
                      </p>
                    )}

                    {/* Responsable */}
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={responsableText[plan.id!] ?? plan.responsable ?? ''}
                        onChange={(e) =>
                          setResponsableText((prev) => ({ ...prev, [plan.id!]: e.target.value }))
                        }
                        onBlur={() => saveResponsable(plan)}
                        placeholder="Responsable..."
                        className="flex-1 rounded-md border border-neutral-border bg-cream-50 px-2 py-1 text-xs text-charcoal-800 focus:border-gold focus:outline-none"
                      />
                    </div>

                    {/* Notes toggle */}
                    <button
                      onClick={() => toggleNotes(plan.id!)}
                      className="mt-2 flex items-center gap-1 text-xs text-neutral-elegant hover:text-charcoal-800 transition-colors"
                    >
                      {expandedNotes.has(plan.id!) ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      Notas de seguimiento
                    </button>

                    {expandedNotes.has(plan.id!) && (
                      <div className="mt-2">
                        <textarea
                          value={notaText[plan.id!] ?? plan.notas_seguimiento ?? ''}
                          onChange={(e) =>
                            setNotaText((prev) => ({ ...prev, [plan.id!]: e.target.value }))
                          }
                          onBlur={() => saveNota(plan)}
                          placeholder="Añade notas de seguimiento..."
                          className="w-full rounded-md border border-neutral-border bg-white px-3 py-2 text-xs text-charcoal-800 focus:border-gold focus:outline-none min-h-[60px] resize-y"
                        />
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(plan.id!)}
                    className="flex-shrink-0 text-neutral-elegant hover:text-danger transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
