import type { RespuestaEncuesta, VariableScore, SectorReport } from './types';
import { VARIABLES, FELICIDAD_KEY } from './constants';

function avg(values: (number | null | undefined)[]): number {
  const valid = values.filter((v): v is number => v !== null && v !== undefined && !isNaN(v));
  if (valid.length === 0) return 0;
  return valid.reduce((sum, v) => sum + v, 0) / valid.length;
}

function getStatus(score: number): 'optimo' | 'alerta' | 'critico' {
  const pct = (score / 5) * 100;
  if (pct >= 80) return 'optimo';
  if (pct >= 60) return 'alerta';
  return 'critico';
}

export function computeSectorReport(
  hotel: string,
  sector: string,
  periodo: string,
  respuestas: RespuestaEncuesta[]
): SectorReport {
  const variables: VariableScore[] = VARIABLES.map((v) => {
    const questionScores = v.questions.map((q) => ({
      key: q.key,
      label: q.label,
      score: avg(respuestas.map((r) => r[q.key as keyof RespuestaEncuesta] as number)),
    }));
    const overall = avg(questionScores.map((q) => q.score));
    return {
      key: v.key,
      label: v.label,
      score: overall,
      status: getStatus(overall),
      questions: questionScores,
    };
  });

  const felicidadGeneral = avg(
    respuestas.map((r) => r[FELICIDAD_KEY as keyof RespuestaEncuesta] as number)
  );

  return {
    hotel,
    sector,
    periodo,
    totalResponses: respuestas.length,
    variables,
    felicidadGeneral,
    felicidadStatus: getStatus(felicidadGeneral),
  };
}

export function statusLabel(status: 'optimo' | 'alerta' | 'critico'): string {
  switch (status) {
    case 'optimo':
      return 'Óptimo';
    case 'alerta':
      return 'Alerta';
    case 'critico':
      return 'Crítico';
  }
}

export function statusColor(status: 'optimo' | 'alerta' | 'critico'): string {
  switch (status) {
    case 'optimo':
      return 'success';
    case 'alerta':
      return 'warning';
    case 'critico':
      return 'danger';
  }
}

export function statusIcon(status: 'optimo' | 'alerta' | 'critico'): string {
  switch (status) {
    case 'optimo':
      return '🟢';
    case 'alerta':
      return '🟡';
    case 'critico':
      return '🔴';
  }
}

export function scorePercentage(score: number): number {
  return Math.round((score / 5) * 100);
}
