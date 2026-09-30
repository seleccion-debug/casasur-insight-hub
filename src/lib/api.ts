import { supabase } from '@/integrations/supabase/client';
import type { RespuestaEncuesta, PlanAccion } from './types';

export async function insertRespuesta(data: RespuestaEncuesta): Promise<{ error: string | null }> {
  const { error } = await supabase.from('respuestas_encuesta').insert(data);
  return { error: error?.message ?? null };
}

export async function fetchRespuestasByPeriod(periodo: string): Promise<RespuestaEncuesta[]> {
  const { data, error } = await supabase
    .from('respuestas_encuesta')
    .select('*')
    .eq('periodo', periodo);
  if (error) {
    console.error('Error fetching respuestas:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchAllRespuestas(): Promise<RespuestaEncuesta[]> {
  const { data, error } = await supabase
    .from('respuestas_encuesta')
    .select('*')
    .order('fecha_envio', { ascending: false });
  if (error) {
    console.error('Error fetching all respuestas:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchRespuestasBySector(
  hotel: string,
  sector: string,
  periodo: string
): Promise<RespuestaEncuesta[]> {
  const { data, error } = await supabase
    .from('respuestas_encuesta')
    .select('*')
    .eq('hotel', hotel)
    .eq('sector', sector)
    .eq('periodo', periodo);
  if (error) {
    console.error('Error fetching respuestas by sector:', error.message);
    return [];
  }
  return data ?? [];
}

// Fetch responses for a tab, applying corporate consolidation (all hotels)
// and Front+Seguridad merging as needed.
export async function fetchRespuestasForTab(
  hotel: string,
  sectors: string[],
  isCorporate: boolean,
  periodo: string
): Promise<RespuestaEncuesta[]> {
  let query = supabase
    .from('respuestas_encuesta')
    .select('*')
    .in('sector', sectors)
    .eq('periodo', periodo);

  if (!isCorporate) {
    query = query.eq('hotel', hotel);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching respuestas for tab:', error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchPlanAcciones(
  hotel: string,
  sector: string,
  periodo: string
): Promise<PlanAccion[]> {
  const { data, error } = await supabase
    .from('plan_accion_seguimiento')
    .select('*')
    .eq('hotel', hotel)
    .eq('sector', sector)
    .eq('periodo', periodo)
    .order('prioridad', { ascending: true });
  if (error) {
    console.error('Error fetching plan acciones:', error.message);
    return [];
  }
  return data ?? [];
}

export async function upsertPlanAccion(plan: PlanAccion): Promise<PlanAccion | null> {
  if (plan.id) {
    const { data, error } = await supabase
      .from('plan_accion_seguimiento')
      .update(plan)
      .eq('id', plan.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error('Error updating plan:', error.message);
      return null;
    }
    return data;
  } else {
    const { data, error } = await supabase
      .from('plan_accion_seguimiento')
      .insert(plan)
      .select()
      .maybeSingle();
    if (error) {
      console.error('Error inserting plan:', error.message);
      return null;
    }
    return data;
  }
}

export async function bulkInsertPlanes(planes: PlanAccion[]): Promise<boolean> {
  const { error } = await supabase.from('plan_accion_seguimiento').insert(planes);
  if (error) {
    console.error('Error bulk inserting planes:', error.message);
    return false;
  }
  return true;
}

export async function bulkInsertRespuestas(
  respuestas: RespuestaEncuesta[]
): Promise<{ inserted: number; error: string | null }> {
  if (respuestas.length === 0) return { inserted: 0, error: null };
  const { data, error } = await supabase
    .from('respuestas_encuesta')
    .insert(respuestas)
    .select('id');
  if (error) {
    return { inserted: 0, error: error.message };
  }
  return { inserted: data?.length ?? 0, error: null };
}

export async function deletePlanAccion(id: string): Promise<boolean> {
  const { error } = await supabase.from('plan_accion_seguimiento').delete().eq('id', id);
  if (error) {
    console.error('Error deleting plan:', error.message);
    return false;
  }
  return true;
}
