import { supabase } from '@/lib/supabase'
import { Pregunta } from '@/types'

export class PreguntasService {
  static async getAll(): Promise<Pregunta[]> {
    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .order('texto', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: number): Promise<Pregunta | null> {
    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async getBySeccion(seccionId: number): Promise<Pregunta[]> {
    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .eq('seccion_id', seccionId)
      .order('texto', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getByArea(areaId: number): Promise<Pregunta[]> {
    const { data, error } = await supabase
      .from('preguntas')
      .select('*')
      .eq('area_id', areaId)
      .order('texto', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async create(pregunta: Omit<Pregunta, 'id'>): Promise<Pregunta> {
    console.log('🔍 PreguntasService.create - Iniciando...', pregunta)
    
    try {
      const { data, error } = await supabase
        .from('preguntas')
        .insert(pregunta)
        .select('*')
        .single()

      console.log('📤 Respuesta de Supabase:', { data, error })

      if (error) {
        console.error('❌ Error de Supabase:', error)
        throw new Error(`Error de Supabase: ${error.message}`)
      }

      if (!data) {
        console.error('❌ No se recibieron datos de Supabase')
        throw new Error('No se recibieron datos de Supabase')
      }

      console.log('✅ Pregunta creada exitosamente:', data)
      return data
    } catch (error) {
      console.error('💥 Error en PreguntasService.create:', error)
      throw error
    }
  }

  static async update(id: number, pregunta: Partial<Pregunta>): Promise<Pregunta> {
    const { data, error } = await supabase
      .from('preguntas')
      .update(pregunta)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('preguntas')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
