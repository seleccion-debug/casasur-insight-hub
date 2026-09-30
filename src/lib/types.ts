export type Hotel = 'Recoleta' | 'Palermo' | 'Bellini' | 'Hotel Collection';

export type Sector =
  | 'Front'
  | 'Housekeeping'
  | 'Administración'
  | 'RRHH'
  | 'Comercial'
  | 'Gerencia'
  | 'Seguridad';

export interface RespuestaEncuesta {
  id?: string;
  fecha_envio?: string;
  hotel: string;
  sector: string;
  nombre_completo?: string | null;
  periodo: string;
  val_reconocimiento?: number | null;
  val_feedback?: number | null;
  val_distribucion_justa?: number | null;
  val_expresar_ideas?: number | null;
  val_satisfaccion_desempeno?: number | null;
  rel_conforme_lider?: number | null;
  rel_comunicacion_clara?: number | null;
  rel_ambiente_trabajo?: number | null;
  rel_respeto_companeros?: number | null;
  rel_colaboracion_equipo?: number | null;
  rel_colaboracion_deptos?: number | null;
  rel_resolucion_conflictos?: number | null;
  mot_capacitaciones?: number | null;
  mot_aprender_crecer?: number | null;
  mot_tareas_variadas?: number | null;
  mot_mentor_guia?: number | null;
  mot_motivacion_general?: number | null;
  mot_objetivos_claros?: number | null;
  com_experiencia_general?: number | null;
  com_beneficios_deseados?: string | null;
  comentarios_observaciones?: string | null;
}

export type PlanEstado = 'Pendiente' | 'En Proceso' | 'Completado';

export interface PlanAccion {
  id?: string;
  hotel: string;
  sector: string;
  periodo: string;
  programa: string;
  variable_afectada: string;
  accion_sugerida: string;
  prioridad: number;
  frecuencia: string;
  kpi_medicion?: string | null;
  estado: PlanEstado;
  responsable?: string | null;
  notas_seguimiento?: string | null;
  created_at?: string;
}

export interface VariableScore {
  key: string;
  label: string;
  score: number;
  status: 'optimo' | 'alerta' | 'critico';
  questions: { key: string; label: string; score: number }[];
}

export interface SectorReport {
  hotel: string;
  sector: string;
  periodo: string;
  totalResponses: number;
  variables: VariableScore[];
  felicidadGeneral: number;
  felicidadStatus: 'optimo' | 'alerta' | 'critico';
}
