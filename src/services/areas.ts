import { supabase } from '@/lib/supabase'
import { Area } from '@/types'

export class AreasService {
  static async getAll(): Promise<Area[]> {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .order('nombre')

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getById(id: number): Promise<Area | null> {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }
    return data
  }

  static async create(area: Omit<Area, 'id'>): Promise<Area> {
    const { data, error } = await supabase
      .from('areas')
      .insert(area)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async update(id: number, area: Partial<Area>): Promise<Area> {
    const { data, error } = await supabase
      .from('areas')
      .update(area)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async delete(id: number): Promise<void> {
    // Verificar si hay trabajadores asociados
    const { data: trabajadores, error: checkError } = await supabase
      .from('trabajadores')
      .select('id')
      .eq('area_id', id)
      .limit(1)

    if (checkError) throw new Error(checkError.message)

    if (trabajadores && trabajadores.length > 0) {
      throw new Error('No se puede eliminar el área porque tiene trabajadores asociados')
    }

    const { error } = await supabase
      .from('areas')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  static async search(query: string): Promise<Area[]> {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .ilike('nombre', `%${query}%`)
      .order('nombre')

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getWithStats(): Promise<(Area & { 
    trabajadores_count: number 
    promedio_desempeno: number 
    puestos_unicos: string[]
  })[]> {
    // Obtener áreas con conteo de trabajadores
    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('*')
      .order('nombre')

    if (areasError) throw new Error(areasError.message)

    // Para cada área, obtener estadísticas
    const areasWithStats = await Promise.all(
      (areas || []).map(async (area: any) => {
        // Contar trabajadores
        const { data: trabajadores, error: trabajadoresError } = await supabase
          .from('trabajadores')
          .select('id, puesto')
          .eq('area_id', area.id)

        if (trabajadoresError) throw new Error(trabajadoresError.message)

        const trabajadoresCount = trabajadores?.length || 0

        // Obtener puestos únicos
        const puestosUnicos = [...new Set(trabajadores?.map((t: any) => t.puesto).filter(Boolean) || [])]

        // TODO: Calcular promedio de desempeño real
        const promedioDesempeno = 0

        return {
          ...area,
          trabajadores_count: trabajadoresCount,
          promedio_desempeno: promedioDesempeno,
          puestos_unicos: puestosUnicos
        }
      })
    )

    return areasWithStats
  }
}
