CREATE TABLE IF NOT EXISTS public.respuestas_encuesta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha_envio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    hotel VARCHAR(80) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    nombre_completo VARCHAR(120),
    periodo VARCHAR(20) NOT NULL,
    val_reconocimiento INT,
    val_feedback INT,
    val_distribucion_justa INT,
    val_expresar_ideas INT,
    val_satisfaccion_desempeno INT,
    rel_conforme_lider INT,
    rel_comunicacion_clara INT,
    rel_ambiente_trabajo INT,
    rel_respeto_companeros INT,
    rel_colaboracion_equipo INT,
    rel_colaboracion_deptos INT,
    rel_resolucion_conflictos INT,
    mot_capacitaciones INT,
    mot_aprender_crecer INT,
    mot_tareas_variadas INT,
    mot_mentor_guia INT,
    mot_motivacion_general INT,
    mot_objetivos_claros INT,
    com_experiencia_general INT,
    com_beneficios_deseados TEXT,
    comentarios_observaciones TEXT
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.respuestas_encuesta TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.respuestas_encuesta TO authenticated;
GRANT ALL ON public.respuestas_encuesta TO service_role;

ALTER TABLE public.respuestas_encuesta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Respuestas: lectura publica" ON public.respuestas_encuesta FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Respuestas: carga publica" ON public.respuestas_encuesta FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Respuestas: actualizacion publica" ON public.respuestas_encuesta FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Respuestas: borrado publico" ON public.respuestas_encuesta FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_respuestas_hotel_sector_periodo ON public.respuestas_encuesta (hotel, sector, periodo);

CREATE TABLE IF NOT EXISTS public.plan_accion_seguimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel VARCHAR(80) NOT NULL,
    sector VARCHAR(50) NOT NULL,
    periodo VARCHAR(20) NOT NULL,
    programa VARCHAR(160) NOT NULL,
    variable_afectada VARCHAR(60) NOT NULL,
    accion_sugerida TEXT NOT NULL,
    prioridad INT NOT NULL DEFAULT 1,
    frecuencia VARCHAR(40) NOT NULL DEFAULT 'Mensual',
    kpi_medicion VARCHAR(255),
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente',
    responsable VARCHAR(120),
    notas_seguimiento TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_accion_seguimiento TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plan_accion_seguimiento TO authenticated;
GRANT ALL ON public.plan_accion_seguimiento TO service_role;

ALTER TABLE public.plan_accion_seguimiento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planes: lectura publica" ON public.plan_accion_seguimiento FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Planes: carga publica" ON public.plan_accion_seguimiento FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Planes: actualizacion publica" ON public.plan_accion_seguimiento FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Planes: borrado publico" ON public.plan_accion_seguimiento FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_planes_hotel_sector_periodo ON public.plan_accion_seguimiento (hotel, sector, periodo);