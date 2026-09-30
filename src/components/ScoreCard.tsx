import { scorePercentage, statusColor, statusLabel, statusIcon } from '@/lib/scoring';
import type { SectorReport } from '@/lib/types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  label: string;
  score: number;
  status: 'optimo' | 'alerta' | 'critico';
  previousScore?: number | null;
  compact?: boolean;
}

export function ScoreCard({ label, score, status, previousScore, compact }: ScoreCardProps) {
  const pct = scorePercentage(score);
  const colorClass = statusColor(status);
  const hasPrev = previousScore !== null && previousScore !== undefined;
  const diff = hasPrev ? score - (previousScore as number) : 0;
  const diffPct = hasPrev ? Math.round(((score - (previousScore as number)) / 5) * 100) : 0;

  return (
    <div
      className={`cs-card overflow-hidden transition-all hover:shadow-md ${
        status === 'critico' ? 'ring-1 ring-danger/30' : ''
      }`}
    >
      <div className={`h-1 ${colorClass === 'success' ? 'bg-success' : colorClass === 'warning' ? 'bg-warning' : 'bg-danger'}`} />
      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-serif ${compact ? 'text-base' : 'text-lg'} text-charcoal-900 leading-tight`}>
            {label}
          </h3>
          <span className="text-lg">{statusIcon(status)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`font-serif text-3xl ${compact ? 'text-2xl' : ''} ${
            colorClass === 'success' ? 'text-success' : colorClass === 'warning' ? 'text-warning' : 'text-danger'
          }`}>
            {pct}%
          </span>
          <span className="text-xs text-neutral-elegant">
            ({score.toFixed(1)}/5)
          </span>
        </div>
        {hasPrev && diff !== 0 && (
          <div className={`mt-1 flex items-center gap-1 text-xs ${
            diff > 0 ? 'text-success' : 'text-danger'
          }`}>
            {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{diff > 0 ? '+' : ''}{diffPct}% vs. semestre anterior</span>
          </div>
        )}
        {hasPrev && diff === 0 && (
          <div className="mt-1 flex items-center gap-1 text-xs text-neutral-elegant">
            <Minus className="h-3 w-3" />
            <span>Sin cambios vs. semestre anterior</span>
          </div>
        )}
        <div className="mt-3 h-2 rounded-full bg-neutral-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              colorClass === 'success' ? 'bg-success' : colorClass === 'warning' ? 'bg-warning' : 'bg-danger'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className={`mt-2 text-xs font-medium ${
          colorClass === 'success' ? 'text-success' : colorClass === 'warning' ? 'text-warning' : 'text-danger'
        }`}>
          {statusLabel(status)}
        </p>
      </div>
    </div>
  );
}

interface OverviewCardsProps {
  report: SectorReport;
  previousReport: SectorReport | null;
}

export function OverviewCards({ report, previousReport }: OverviewCardsProps) {
  const prevMap = new Map(previousReport?.variables.map((v) => [v.key, v.score]) ?? []);
  const prevFelicidad = previousReport?.felicidadGeneral ?? null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {report.variables.map((v) => (
        <ScoreCard
          key={v.key}
          label={v.label}
          score={v.score}
          status={v.status}
          previousScore={prevMap.get(v.key) ?? null}
        />
      ))}
      <ScoreCard
        label="Felicidad General"
        score={report.felicidadGeneral}
        status={report.felicidadStatus}
        previousScore={prevFelicidad}
      />
    </div>
  );
}
