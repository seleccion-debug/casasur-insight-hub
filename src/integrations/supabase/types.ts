export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      plan_accion_seguimiento: {
        Row: {
          accion_sugerida: string
          created_at: string
          estado: string
          frecuencia: string
          hotel: string
          id: string
          kpi_medicion: string | null
          notas_seguimiento: string | null
          periodo: string
          prioridad: number
          programa: string
          responsable: string | null
          sector: string
          variable_afectada: string
        }
        Insert: {
          accion_sugerida: string
          created_at?: string
          estado?: string
          frecuencia?: string
          hotel: string
          id?: string
          kpi_medicion?: string | null
          notas_seguimiento?: string | null
          periodo: string
          prioridad?: number
          programa: string
          responsable?: string | null
          sector: string
          variable_afectada: string
        }
        Update: {
          accion_sugerida?: string
          created_at?: string
          estado?: string
          frecuencia?: string
          hotel?: string
          id?: string
          kpi_medicion?: string | null
          notas_seguimiento?: string | null
          periodo?: string
          prioridad?: number
          programa?: string
          responsable?: string | null
          sector?: string
          variable_afectada?: string
        }
        Relationships: []
      }
      respuestas_encuesta: {
        Row: {
          com_beneficios_deseados: string | null
          com_experiencia_general: number | null
          comentarios_observaciones: string | null
          fecha_envio: string
          hotel: string
          id: string
          mot_aprender_crecer: number | null
          mot_capacitaciones: number | null
          mot_mentor_guia: number | null
          mot_motivacion_general: number | null
          mot_objetivos_claros: number | null
          mot_tareas_variadas: number | null
          nombre_completo: string | null
          periodo: string
          rel_ambiente_trabajo: number | null
          rel_colaboracion_deptos: number | null
          rel_colaboracion_equipo: number | null
          rel_comunicacion_clara: number | null
          rel_conforme_lider: number | null
          rel_resolucion_conflictos: number | null
          rel_respeto_companeros: number | null
          sector: string
          val_distribucion_justa: number | null
          val_expresar_ideas: number | null
          val_feedback: number | null
          val_reconocimiento: number | null
          val_satisfaccion_desempeno: number | null
        }
        Insert: {
          com_beneficios_deseados?: string | null
          com_experiencia_general?: number | null
          comentarios_observaciones?: string | null
          fecha_envio?: string
          hotel: string
          id?: string
          mot_aprender_crecer?: number | null
          mot_capacitaciones?: number | null
          mot_mentor_guia?: number | null
          mot_motivacion_general?: number | null
          mot_objetivos_claros?: number | null
          mot_tareas_variadas?: number | null
          nombre_completo?: string | null
          periodo: string
          rel_ambiente_trabajo?: number | null
          rel_colaboracion_deptos?: number | null
          rel_colaboracion_equipo?: number | null
          rel_comunicacion_clara?: number | null
          rel_conforme_lider?: number | null
          rel_resolucion_conflictos?: number | null
          rel_respeto_companeros?: number | null
          sector: string
          val_distribucion_justa?: number | null
          val_expresar_ideas?: number | null
          val_feedback?: number | null
          val_reconocimiento?: number | null
          val_satisfaccion_desempeno?: number | null
        }
        Update: {
          com_beneficios_deseados?: string | null
          com_experiencia_general?: number | null
          comentarios_observaciones?: string | null
          fecha_envio?: string
          hotel?: string
          id?: string
          mot_aprender_crecer?: number | null
          mot_capacitaciones?: number | null
          mot_mentor_guia?: number | null
          mot_motivacion_general?: number | null
          mot_objetivos_claros?: number | null
          mot_tareas_variadas?: number | null
          nombre_completo?: string | null
          periodo?: string
          rel_ambiente_trabajo?: number | null
          rel_colaboracion_deptos?: number | null
          rel_colaboracion_equipo?: number | null
          rel_comunicacion_clara?: number | null
          rel_conforme_lider?: number | null
          rel_resolucion_conflictos?: number | null
          rel_respeto_companeros?: number | null
          sector?: string
          val_distribucion_justa?: number | null
          val_expresar_ideas?: number | null
          val_feedback?: number | null
          val_reconocimiento?: number | null
          val_satisfaccion_desempeno?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
