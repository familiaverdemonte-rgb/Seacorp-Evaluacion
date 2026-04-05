import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: Mostrar variables en Vercel
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Config Debug:', {
    url: supabaseUrl ? '✅ Configurada' : '❌ No configurada',
    key: supabaseAnonKey ? '✅ Configurada' : '❌ No configurada',
    env: process.env.NODE_ENV
  })
}

// Validación robusta con fallback para Vercel
let client: any = null

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de Supabase no configuradas en Vercel')
  console.error('Verifica las variables de entorno en el dashboard de Vercel')
  
  // No lanzar error en producción para que la página no se rompa
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      'Faltan las variables de entorno de Supabase. ' +
      'Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en tu archivo .env.local'
    )
  }
} else {
  client = createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = client

// Función para verificar conexión
export const checkSupabaseConnection = async () => {
  try {
    if (!supabase) {
      return { connected: false, error: 'Cliente Supabase no inicializado' }
    }
    
    const { data, error } = await supabase
      .from('areas')
      .select('count')
      .limit(1)
      .single()
    
    if (error) {
      return { connected: false, error: error.message }
    }
    
    return { connected: true, data }
  } catch (err) {
    return { connected: false, error: err instanceof Error ? err.message : 'Error desconocido' }
  }
}

export type Database = {
  public: {
    Tables: {
      areas: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
      }
      trabajadores: {
        Row: {
          id: number
          codigo: string
          nombre: string
          area_id: number
          puesto: string
          residencia: string
          service: string
        }
        Insert: {
          id?: number
          codigo: string
          nombre: string
          area_id: number
          puesto: string
          residencia: string
          service: string
        }
        Update: {
          id?: number
          codigo?: string
          nombre?: string
          area_id?: number
          puesto?: string
          residencia?: string
          service?: string
        }
      }
      ciclos_evaluacion: {
        Row: {
          id: number
          nombre: string
          fecha_inicio: string
          fecha_fin: string
          estado: 'abierto' | 'cerrado'
          plantilla_id: number | null
        }
        Insert: {
          id?: number
          nombre: string
          fecha_inicio: string
          fecha_fin: string
          estado?: 'abierto' | 'cerrado'
          plantilla_id?: number | null
        }
        Update: {
          id?: number
          nombre?: string
          fecha_inicio?: string
          fecha_fin?: string
          estado?: 'abierto' | 'cerrado'
          plantilla_id?: number | null
        }
      }
      plantillas: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
      }
      secciones: {
        Row: {
          id: number
          plantilla_id: number
          nombre: string
          peso: number
        }
        Insert: {
          id?: number
          plantilla_id: number
          nombre: string
          peso: number
        }
        Update: {
          id?: number
          plantilla_id?: number
          nombre?: string
          peso?: number
        }
      }
      preguntas: {
        Row: {
          id: number
          seccion_id: number
          texto: string
          tipo: 'escala_1_5'
          peso: number
          es_general: boolean
          area_id: number | null
        }
        Insert: {
          id?: number
          seccion_id: number
          texto: string
          tipo?: 'escala_1_5'
          peso: number
          es_general?: boolean
          area_id?: number | null
        }
        Update: {
          id?: number
          seccion_id?: number
          texto?: string
          tipo?: 'escala_1_5'
          peso?: number
          es_general?: boolean
          area_id?: number | null
        }
      }
      evaluaciones: {
        Row: {
          id: number
          trabajador_id: number
          evaluador_id: string
          tipo_evaluador: 'rrhh' | 'jefe' | 'par'
          ciclo_id: number
          estado: 'pendiente' | 'en_progreso' | 'completada'
          puntaje_ponderado: number | null
          clasificacion: string | null
          created_at: string
        }
        Insert: {
          id?: number
          trabajador_id: number
          evaluador_id: string
          tipo_evaluador: 'rrhh' | 'jefe' | 'par'
          ciclo_id: number
          estado?: 'pendiente' | 'en_progreso' | 'completada'
          puntaje_ponderado?: number | null
          clasificacion?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          trabajador_id?: number
          evaluador_id?: string
          tipo_evaluador?: 'rrhh' | 'jefe' | 'par'
          ciclo_id?: number
          estado?: 'pendiente' | 'en_progreso' | 'completada'
          puntaje_ponderado?: number | null
          clasificacion?: string | null
          created_at?: string
        }
      }
      respuestas: {
        Row: {
          id: number
          evaluacion_id: number
          pregunta_id: number
          puntaje: number
          comentario: string
        }
        Insert: {
          id?: number
          evaluacion_id: number
          pregunta_id: number
          puntaje: number
          comentario?: string
        }
        Update: {
          id?: number
          evaluacion_id?: number
          pregunta_id?: number
          puntaje?: number
          comentario?: string
        }
      }
    }
  }
}
