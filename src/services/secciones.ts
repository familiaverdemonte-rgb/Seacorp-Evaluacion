import { supabase } from '@/lib/supabase'
import { Seccion } from '@/types'

export class SeccionesService {
  static async getAll(): Promise<Seccion[]> {
    const { data, error } = await supabase
      .from('secciones')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getById(id: number): Promise<Seccion | null> {
    const { data, error } = await supabase
      .from('secciones')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async getByPlantilla(plantillaId: number): Promise<Seccion[]> {
    const { data, error } = await supabase
      .from('secciones')
      .select('*')
      .eq('plantilla_id', plantillaId)
      .order('nombre', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async create(seccion: Omit<Seccion, 'id'>): Promise<Seccion> {
    console.log('🔍 SeccionesService.create - Iniciando...', seccion)
    
    try {
      const { data, error } = await supabase
        .from('secciones')
        .insert(seccion)
        .select()
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

      console.log('✅ Sección creada exitosamente:', data)
      return data
    } catch (error) {
      console.error('💥 Error en SeccionesService.create:', error)
      throw error
    }
  }

  static async update(id: number, seccion: Partial<Seccion>): Promise<Seccion> {
    const { data, error } = await supabase
      .from('secciones')
      .update(seccion)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('secciones')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
