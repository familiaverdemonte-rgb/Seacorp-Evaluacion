import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type CicloEvaluacion = Database['public']['Tables']['ciclos_evaluacion']['Row']

export class CiclosEvaluacionService {
  static async getAll() {
    const { data, error } = await supabase
      .from('ciclos_evaluacion')
      .select(`
        *,
        plantilla:plantillas(id, nombre),
        trabajadores_asignados:evaluaciones!evaluaciones_ciclo_id_fkey(
          id,
          trabajador_id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Contar trabajadores únicos por ciclo
    const ciclosConConteo = (data || []).map((ciclo: any) => {
      const trabajadoresUnicos = new Set(
        ciclo.trabajadores_asignados?.map((evaluacion: any) => evaluacion.trabajador_id) || []
      )
      return {
        ...ciclo,
        trabajadores_asignados_count: trabajadoresUnicos.size
      }
    })

    return ciclosConConteo
  }

  static async getById(id: number) {
    const { data, error } = await supabase
      .from('ciclos_evaluacion')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async create(ciclo: Omit<CicloEvaluacion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('ciclos_evaluacion')
      .insert(ciclo)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async update(id: number, ciclo: Partial<CicloEvaluacion>) {
    const { data, error } = await supabase
      .from('ciclos_evaluacion')
      .update(ciclo)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async delete(id: number) {
    const { error } = await supabase
      .from('ciclos_evaluacion')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async getAbiertos() {
    const { data, error } = await supabase
      .from('ciclos_evaluacion')
      .select('*')
      .eq('estado', 'abierto')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getByPlantilla(plantillaId: number) {
    const { data, error } = await supabase
      .from('ciclos_evaluacion')
      .select('*')
      .eq('plantilla_id', plantillaId)

    if (error) throw error
    return data || []
  }
}
