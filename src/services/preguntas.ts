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
    console.log('🔄 Actualizando pregunta:', { id, pregunta })
    
    // Verificar si area_id existe en la tabla antes de intentar actualizar
    const preguntaData: any = { ...pregunta }
    
    // Si area_id es undefined, no incluirlo en la actualización
    if (preguntaData.area_id === undefined) {
      delete preguntaData.area_id
      console.log('🗑️ Eliminando area_id de la actualización (no existe en BD)')
    }
    
    console.log('📋 Datos finales a actualizar:', preguntaData)
    
    const { data, error } = await supabase
      .from('preguntas')
      .update(preguntaData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('❌ Error de Supabase al actualizar:', error)
      throw new Error(`Error de Supabase: ${error.message}`)
    }

    if (!data) {
      console.error('❌ No se recibieron datos de Supabase al actualizar')
      throw new Error('No se recibieron datos de Supabase al actualizar')
    }

    console.log('✅ Pregunta actualizada exitosamente:', data)
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
