import type { Hotel, Sector } from './types';

export const HOTELS: Hotel[] = ['Recoleta', 'Palermo', 'Bellini', 'Hotel Collection'];

// The 4 valid options shown in the "Hotel" dropdown of /encuesta.
export const HOTEL_OPTIONS: { value: Hotel; label: string }[] = [
  { value: 'Recoleta', label: 'Recoleta' },
  { value: 'Palermo', label: 'Palermo' },
  { value: 'Bellini', label: 'Bellini' },
  {
    value: 'Hotel Collection',
    label: 'Hotel Collection (Comercial, RRHH, Administracion, Gerencia)',
  },
];

export const SECTORS: Sector[] = [
  'Front',
  'Housekeeping',
  'Administración',
  'RRHH',
  'Comercial',
  'Gerencia',
  'Seguridad',
];

// Corporate sectors consolidate across all hotels (no hotel filter)
export const CORPORATE_SECTORS: string[] = ['Administración', 'RRHH', 'Comercial', 'Gerencia'];

// Front reports also include Seguridad responses
export const FRONT_MERGED_SECTORS: string[] = ['Front', 'Seguridad'];

export const ADMIN_PIN = 'CasaSur2026';

export const SURVEY_OPEN_MONTHS = [0, 6]; // January (0) and July (6)

export interface VariableConfig {
  key: string;
  label: string;
  shortLabel: string;
  questions: { key: string; label: string }[];
}

export const VARIABLES: VariableConfig[] = [
  {
    key: 'valoracion',
    label: 'Valoración Personal',
    shortLabel: 'Valoración',
    questions: [
      { key: 'val_reconocimiento', label: 'Mi líder reconoce y valora mi trabajo.' },
      { key: 'val_feedback', label: 'Recibo feedback claro y constructivo sobre mi desempeño.' },
      { key: 'val_distribucion_justa', label: 'Mi líder distribuye las tareas de manera justa y objetiva.' },
      { key: 'val_expresar_ideas', label: 'Me siento cómodo/a expresando mis ideas.' },
      { key: 'val_satisfaccion_desempeno', label: 'Me siento satisfecho/a con mi desempeño.' },
    ],
  },
  {
    key: 'relaciones',
    label: 'Relaciones / Ambiente Laboral',
    shortLabel: 'Relaciones',
    questions: [
      { key: 'rel_conforme_lider', label: 'Estoy conforme con mi líder.' },
      { key: 'rel_comunicacion_clara', label: 'La comunicación en el equipo es clara y transparente.' },
      { key: 'rel_ambiente_trabajo', label: 'Me siento satisfecho/a con el ambiente en mi lugar de trabajo.' },
      { key: 'rel_respeto_companeros', label: 'Me siento respetado/a por mis compañeros.' },
      { key: 'rel_colaboracion_equipo', label: 'Hay un buen nivel de colaboración en mi equipo.' },
      { key: 'rel_colaboracion_deptos', label: 'Hay un buen nivel de colaboración con otros departamentos.' },
      { key: 'rel_resolucion_conflictos', label: 'Siento que puedo plantear y resolver conflictos de manera constructiva dentro del equipo.' },
    ],
  },
  {
    key: 'motivacion',
    label: 'Motivación y Desarrollo',
    shortLabel: 'Motivación',
    questions: [
      { key: 'mot_capacitaciones', label: 'He tenido oportunidades de capacitación en los últimos 6 meses.' },
      { key: 'mot_aprender_crecer', label: 'Siento que tengo posibilidades de aprender y crecer en este trabajo.' },
      { key: 'mot_tareas_variadas', label: 'Mis tareas son variadas y me presentan desafíos.' },
      { key: 'mot_mentor_guia', label: 'Tengo acceso a alguien que me guía o apoya en mi desarrollo.' },
      { key: 'mot_motivacion_general', label: 'Me siento motivado/a en mi trabajo.' },
      { key: 'mot_objetivos_claros', label: 'Conozco claramente los objetivos de mi puesto.' },
    ],
  },
  {
    key: 'compromiso',
    label: 'Compromiso y Felicidad',
    shortLabel: 'Compromiso',
    questions: [
      { key: 'com_experiencia_general', label: 'Estoy satisfecho/a con mi experiencia laboral en general.' },
    ],
  },
];

export const FELICIDAD_KEY = 'com_experiencia_general';

export interface SectorTab {
  hotel: string;
  sector: string;
  label: string;
  jefe: string;
}

export const SECTOR_TABS: SectorTab[] = [
  { hotel: 'Palermo', sector: 'Housekeeping', label: 'Housekeeping Palermo', jefe: 'Jefe de Housekeeping Palermo' },
  { hotel: 'Bellini', sector: 'Housekeeping', label: 'Housekeeping Bellini', jefe: 'Jefe de Housekeeping Bellini' },
  { hotel: 'Recoleta', sector: 'Housekeeping', label: 'Housekeeping Recoleta', jefe: 'Jefe de Housekeeping Recoleta' },
  { hotel: 'Palermo', sector: 'Front', label: 'Front / Recepción Palermo', jefe: 'Jefe de Recepción Palermo' },
  { hotel: 'Bellini', sector: 'Front', label: 'Front / Recepción Bellini', jefe: 'Jefe de Recepción Bellini' },
  { hotel: 'Recoleta', sector: 'Front', label: 'Front / Recepción Recoleta', jefe: 'Jefe de Recepción Recoleta' },
  { hotel: 'Hotel Collection', sector: 'Administración', label: 'Administración', jefe: 'Gerente de Administración' },
  { hotel: 'Hotel Collection', sector: 'RRHH', label: 'RRHH', jefe: 'Gerente de RRHH' },
  { hotel: 'Hotel Collection', sector: 'Comercial', label: 'Comercial', jefe: 'Gerente Comercial' },
  { hotel: 'Hotel Collection', sector: 'Gerencia', label: 'Gerencia General', jefe: 'Gerente General / Dirección' },
];

// Returns the sectors to fetch data for, given a tab's sector.
// Front tabs also include Seguridad. Corporate sectors ignore hotel.
export function getSectorsForTab(sector: string): string[] {
  if (sector === 'Front') return FRONT_MERGED_SECTORS;
  return [sector];
}

// Whether this tab consolidates across all hotels (corporate sectors)
export function isCorporateSector(sector: string): boolean {
  return CORPORATE_SECTORS.includes(sector);
}

export function getCurrentPeriod(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  if (month <= 5) {
    return `Enero ${year}`;
  }
  return `Julio ${year}`;
}

export function getPreviousPeriod(currentPeriod: string): string | null {
  const match = currentPeriod.match(/(Enero|Julio) (\d{4})/);
  if (!match) return null;
  const [, sem, yearStr] = match;
  const year = parseInt(yearStr ?? '', 10);
  if (sem === 'Julio') {
    return `Enero ${year}`;
  }
  return `Julio ${year - 1}`;
}

export function isSurveyOpenNow(): boolean {
  const month = new Date().getMonth();
  return SURVEY_OPEN_MONTHS.includes(month);
}

export function getNextOpenPeriod(): string {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  if (month >= 0 && month <= 5) {
    return `Julio ${year}`;
  }
  return `Enero ${year + 1}`;
}

export const ACTION_SUGGESTIONS: Record<string, { prioridad: number; accion: string; programa: string; kpi: string }[]> = {
  valoracion: [
    { prioridad: 1, accion: 'Implementar reuniones quincenales de reconocimiento individual con feedback específico sobre logros concretos.', programa: 'Programa de Reconocimiento', kpi: '% de colaboradores que reportan recibir reconocimiento quincenal' },
    { prioridad: 1, accion: 'Establecer un sistema de feedback estructurado con formato 360° simplificado cada 3 meses.', programa: 'Feedback Estructurado', kpi: 'N° de sesiones de feedback realizadas por trimestre' },
    { prioridad: 2, accion: 'Revisar y documentar criterios de asignación de tareas para garantizar transparencia y equidad.', programa: 'Distribución Equitativa', kpi: 'Índice de percepción de justicia en asignación de tareas' },
    { prioridad: 2, accion: 'Crear espacios seguros mensuales para que el equipo comparta ideas sin temor a juicio.', programa: 'Voz Abierta', kpi: 'N° de ideas propuestas e implementadas por el equipo' },
  ],
  relaciones: [
    { prioridad: 1, accion: 'Organizar actividades de integración mensuales dentro y entre departamentos.', programa: 'Integración Interdepartamental', kpi: 'N° de actividades de integración realizadas por semestre' },
    { prioridad: 1, accion: 'Implementar protocolo de resolución de conflictos con mediación neutral y seguimiento formal.', programa: 'Protocolo de Mediación', kpi: '% de conflictos resueltos en menos de 7 días' },
    { prioridad: 2, accion: 'Establecer canales de comunicación formal (newsletter interno, tablón digital) con actualización semanal.', programa: 'Comunicación Transparente', kpi: 'Frecuencia de actualización de canales formales' },
    { prioridad: 2, accion: 'Realizar encuestas pulse mensuales de clima de equipo para detectar tensiones temprano.', programa: 'Pulse de Clima', kpi: 'Tendencia mensual del índice de ambiente laboral' },
  ],
  motivacion: [
    { prioridad: 1, accion: 'Diseñar un plan de capacitación semestral con mínimo 2 cursos por colaborador.', programa: 'Plan de Capacitación', kpi: 'N° de capacitaciones completadas por colaborador por semestre' },
    { prioridad: 1, accion: 'Asignar un mentor interno a cada colaborador con reuniones mensuales de seguimiento.', programa: 'Mentoría Interna', kpi: '% de colaboradores con mentor asignado y reuniones al día' },
    { prioridad: 2, accion: 'Rotar responsabilidades dentro del equipo para enriquecer variedad de tareas.', programa: 'Rotación de Tareas', kpi: 'N° de rotaciones implementadas por semestre' },
    { prioridad: 2, accion: 'Definir y comunicar objetivos SMART individuales al inicio de cada semestre.', programa: 'Objetivos SMART', kpi: '% de colaboradores con objetivos documentados y firmados' },
  ],
  compromiso: [
    { prioridad: 1, accion: 'Lanzar programa de beneficios flexibles basado en preferencias expresadas por el equipo.', programa: 'Beneficios a Medida', kpi: 'Tasa de utilización de beneficios ofrecidos' },
    { prioridad: 1, accion: 'Realizar entrevistas de retención semestrales con cada colaborador para detectar señales de insatisfacción.', programa: 'Entrevistas de Retención', kpi: '% de colaboradores entrevistados por semestre' },
    { prioridad: 2, accion: 'Crear un comité de bienestar que proponga e implemente iniciativas cada trimestre.', programa: 'Comité de Bienestar', kpi: 'N° de iniciativas de bienestar implementadas' },
  ],
};

export const ESCALATION_ACTIONS: Record<string, { prioridad: number; accion: string; programa: string; kpi: string }[]> = {
  valoracion: [
    { prioridad: 1, accion: 'ESCALAMIENTO: Implementar programa de reconocimiento 1-a-1 semanal con el director del hotel.', programa: 'Reconocimiento Directo', kpi: 'N° de reconocimientos directos documentados mensualmente' },
    { prioridad: 1, accion: 'ESCALAMIENTO: Contratar consultoría externa para auditar procesos de evaluación de desempeño.', programa: 'Auditoría Externa', kpi: 'Informe de auditoría completado y plan de acción ejecutado' },
  ],
  relaciones: [
    { prioridad: 1, accion: 'ESCALAMIENTO: Facilitar taller de dinámica de equipos con especialista externo.', programa: 'Taller de Cohesión', kpi: 'Mejora en puntaje de colaboración en próxima encuesta' },
    { prioridad: 1, accion: 'ESCALAMIENTO: Reestructurar canales de comunicación con plataforma digital dedicada.', programa: 'Plataforma de Comunicación', kpi: 'Adopción de plataforma > 80% del equipo' },
  ],
  motivacion: [
    { prioridad: 1, accion: 'ESCALAMIENTO: Crear planes de desarrollo individual (PDI) con presupuesto asignado por colaborador.', programa: 'PDI con Presupuesto', kpi: '% de colaboradores con PDI activo y presupuesto ejecutado' },
    { prioridad: 1, accion: 'ESCALAMIENTO: Implementar programa de intercambio entre hoteles para enriquecer experiencia.', programa: 'Intercambio entre Hoteles', kpi: 'N° de intercambios realizados por semestre' },
  ],
  compromiso: [
    { prioridad: 1, accion: 'ESCALAMIENTO: Revisar y ajustar paquete de compensación y beneficios con benchmark de mercado.', programa: 'Benchmark de Compensación', kpi: 'Informe de benchmark completado y ajustes implementados' },
    { prioridad: 1, accion: 'ESCALAMIENTO: Implementar programa de liderazgo transformacional para jefes de sector.', programa: 'Liderazgo Transformacional', kpi: 'Mejora en puntajes de valoración personal en próxima encuesta' },
  ],
};
