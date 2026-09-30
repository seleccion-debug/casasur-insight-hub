import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Lock, LogOut, BarChart3, Calendar, Upload } from 'lucide-react';
import Logo from '@/components/Logo';
import SectorReportView from '@/components/SectorReportView';
import { OverviewCards } from '@/components/ScoreCard';
import ImportCSVModal from '@/components/ImportCSVModal';
import {
  ADMIN_PIN,
  SECTOR_TABS,
  getCurrentPeriod,
  getPreviousPeriod,
} from '@/lib/constants';
import { fetchAllRespuestas } from '@/lib/api';
import { computeSectorReport } from '@/lib/scoring';
import type { RespuestaEncuesta, SectorReport } from '@/lib/types';

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [periodo, setPeriodo] = useState(getCurrentPeriod());
  const [activeTab, setActiveTab] = useState(0);
  const [allRespuestas, setAllRespuestas] = useState<RespuestaEncuesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [overviewReport, setOverviewReport] = useState<SectorReport | null>(null);
  const [prevOverviewReport, setPrevOverviewReport] = useState<SectorReport | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const handleLogin = () => {
    if (pinInput === ADMIN_PIN) {
      setAuthed(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllRespuestas();
    setAllRespuestas(data);

    const periodData = data.filter((r) => r.periodo === periodo);
    const overall = computeSectorReport('Todos', 'Todos', periodo, periodData);
    setOverviewReport(overall);

    const prevPeriod = getPreviousPeriod(periodo);
    if (prevPeriod) {
      const prevData = data.filter((r) => r.periodo === prevPeriod);
      setPrevOverviewReport(computeSectorReport('Todos', 'Todos', prevPeriod, prevData));
    } else {
      setPrevOverviewReport(null);
    }
    setLoading(false);
  }, [periodo]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  // Login screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center px-4">
        <div className="cs-card max-w-md w-full p-8 animate-slide-up">
          <div className="flex justify-center mb-6">
            <Logo variant="circle" />
          </div>
          <div className="mb-6 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cream-200 mb-3">
              <Lock className="h-7 w-7 text-gold" />
            </div>
            <h1 className="font-serif text-2xl text-charcoal-900 mb-1">Acceso Administrativo</h1>
            <p className="text-sm text-neutral-elegant">
              Ingresa el PIN para acceder al dashboard de resultados.
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="PIN de acceso..."
              className="cs-input text-center tracking-widest"
              autoFocus
            />
            {pinError && (
              <p className="text-sm text-danger text-center">
                PIN incorrecto. Inténtalo nuevamente.
              </p>
            )}
            <button onClick={handleLogin} className="cs-btn-primary w-full">
              Ingresar
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate({ to: '/encuesta' })}
              className="text-xs text-neutral-elegant hover:text-gold transition-colors"
            >
              Volver a la encuesta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Available periods from data
  const availablePeriods = Array.from(new Set(allRespuestas.map((r) => r.periodo))).sort().reverse();
  if (!availablePeriods.includes(periodo) && !loading) {
    availablePeriods.unshift(periodo);
  }

  const totalRespuestas = allRespuestas.filter((r) => r.periodo === periodo).length;
  const totalPrev = prevOverviewReport?.totalResponses ?? 0;

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo variant="circle" />
            <div className="hidden sm:block w-px h-8 bg-neutral-border" />
            <div className="hidden sm:block">
              <p className="text-xs text-neutral-elegant uppercase tracking-widest">Dashboard</p>
              <p className="text-sm font-medium text-charcoal-800">Clima Laboral</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gold" />
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm text-charcoal-800 focus:border-gold focus:outline-none"
              >
                {availablePeriods.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm font-medium text-charcoal-800 transition-all hover:border-gold hover:bg-cream-50"
            >
              <Upload className="h-4 w-4 text-gold" />
              <span className="hidden sm:inline">Importar CSV</span>
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-elegant hover:text-danger transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mobile period selector */}
        <div className="sm:hidden mb-4">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="cs-input"
          >
            {availablePeriods.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Overview / General tab */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gold" />
            <h1 className="font-serif text-2xl sm:text-3xl text-charcoal-900">
              Vista General
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-neutral-border border-t-gold" />
            </div>
          ) : totalRespuestas === 0 ? (
            <div className="cs-card p-8 text-center">
              <p className="text-sm text-neutral-elegant">
                No hay respuestas registradas para {periodo}. La encuesta se encuentra disponible
                en enero y julio de cada año.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="cs-card px-4 py-3">
                  <p className="text-xs text-neutral-elegant uppercase tracking-wider">Respuestas del periodo</p>
                  <p className="font-serif text-2xl text-charcoal-900">{totalRespuestas}</p>
                </div>
                {totalPrev > 0 && (
                  <div className="cs-card px-4 py-3">
                    <p className="text-xs text-neutral-elegant uppercase tracking-wider">Periodo anterior</p>
                    <p className="font-serif text-2xl text-charcoal-900">{totalPrev}</p>
                  </div>
                )}
              </div>
              {overviewReport && (
                <OverviewCards report={overviewReport} previousReport={prevOverviewReport} />
              )}
            </>
          )}
        </div>

        {/* Sector tabs */}
        <div className="border-t border-neutral-border pt-6">
          <h2 className="font-serif text-xl text-charcoal-900 mb-4">Reportes por Sector</h2>

          {/* Tab navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {SECTOR_TABS.map((tab, idx) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(idx)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                  activeTab === idx
                    ? 'bg-charcoal-900 text-white'
                    : 'bg-white border border-neutral-border text-charcoal-800 hover:border-gold hover:bg-cream-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          <SectorReportView tab={SECTOR_TABS[activeTab] ?? SECTOR_TABS[0]!} periodo={periodo} />
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
        <div className="flex justify-center mb-3">
          <Logo variant="horizontal" />
        </div>
        <p className="text-xs text-neutral-elegant">
          CasaSur Hotel Collection — Dashboard de Clima Laboral · {periodo}
        </p>
      </footer>

      <ImportCSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => loadData()}
      />
    </div>
  );
}
