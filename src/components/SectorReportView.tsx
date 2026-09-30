import { useState, useEffect, useCallback } from 'react';
import type { SectorReport, RespuestaEncuesta } from '@/lib/types';
import { fetchRespuestasForTab } from '@/lib/api';
import { computeSectorReport } from '@/lib/scoring';
import {
  getPreviousPeriod,
  getSectorsForTab,
  isCorporateSector,
  type SectorTab,
} from '@/lib/constants';
import { OverviewCards } from '@/components/ScoreCard';
import ActionPlan from '@/components/ActionPlan';
import { Users, AlertCircle, FileText } from 'lucide-react';

interface SectorReportViewProps {
  tab: SectorTab;
  periodo: string;
}

export default function SectorReportView({ tab, periodo }: SectorReportViewProps) {
  const [report, setReport] = useState<SectorReport | null>(null);
  const [previousReport, setPreviousReport] = useState<SectorReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const sectors = getSectorsForTab(tab.sector);
    const corporate = isCorporateSector(tab.sector);
    const prevPeriod = getPreviousPeriod(periodo);

    const [current, prev] = await Promise.all([
      fetchRespuestasForTab(tab.hotel, sectors, corporate, periodo),
      prevPeriod
        ? fetchRespuestasForTab(tab.hotel, sectors, corporate, prevPeriod)
        : Promise.resolve([] as RespuestaEncuesta[]),
    ]);

    setReport(computeSectorReport(tab.hotel, tab.sector, periodo, current));
    setPreviousReport(
      prevPeriod ? computeSectorReport(tab.hotel, tab.sector, prevPeriod, prev) : null
    );
    setLoading(false);
  }, [tab.hotel, tab.sector, periodo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-border border-t-gold" />
          <p className="mt-3 text-sm text-neutral-elegant">Cargando resultados...</p>
        </div>
      </div>
    );
  }

  if (!report) return null;

  if (report.totalResponses === 0) {
    return (
      <div className="py-16 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cream-200 mb-4">
          <FileText className="h-8 w-8 text-gold" />
        </div>
        <h3 className="font-serif text-xl text-charcoal-900 mb-2">
          Sin respuestas para {tab.label}
        </h3>
        <p className="text-sm text-neutral-elegant">
          Aún no se han recibido respuestas para este sector en {periodo}.
        </p>
      </div>
    );
  }

  const criticalVars = report.variables.filter((v) => v.status === 'critico');
  const alertVars = report.variables.filter((v) => v.status === 'alerta');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-charcoal-900">{tab.label}</h2>
          <p className="text-sm text-neutral-elegant">{tab.jefe}</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-cream-100 px-4 py-2">
          <Users className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-charcoal-800">
            {report.totalResponses} {report.totalResponses === 1 ? 'respuesta' : 'respuestas'}
          </span>
        </div>
      </div>

      {/* A. Informe de Situación Actual */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-white text-xs font-bold">
            A
          </div>
          <h3 className="font-serif text-xl text-charcoal-900">Informe de Situación Actual</h3>
        </div>
        <OverviewCards report={report} previousReport={previousReport} />
      </section>

      {/* Critical variables highlight */}
      {(criticalVars.length > 0 || alertVars.length > 0) && (
        <div className="cs-card p-4 border-danger/20 bg-danger-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-serif text-base text-charcoal-900 mb-1">Puntos prioritarios a corregir</h4>
              <ul className="space-y-1">
                {criticalVars.map((v) => (
                  <li key={v.key} className="text-sm text-danger">
                    <span className="font-medium">{v.label}</span> — {Math.round((v.score / 5) * 100)}% (Crítico)
                  </li>
                ))}
                {alertVars.map((v) => (
                  <li key={v.key} className="text-sm text-warning">
                    <span className="font-medium">{v.label}</span> — {Math.round((v.score / 5) * 100)}% (Alerta)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* B. Plan de Acción */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-white text-xs font-bold">
            B
          </div>
          <h3 className="font-serif text-xl text-charcoal-900">Plan de Acción Interactivo</h3>
        </div>
        <ActionPlan tab={tab} report={report} previousReport={previousReport} />
      </section>
    </div>
  );
}
