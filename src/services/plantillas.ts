import { supabase } from '@/lib/supabase'
import { Plantilla, PlantillaCompleta, Seccion, Pregunta, Area } from '@/types'

export class PlantillasService {
  static async getAll(): Promise<Plantilla[]> {
    const { data, error } = await supabase
      .from('plantillas')
      .select('*')
      .order('nombre')

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getById(id: number): Promise<Plantilla | null> {
    const { data, error } = await supabase
      .from('plantillas')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }
    return data
  }

  static async getCompleta(id: number): Promise<PlantillaCompleta | null> {
    const { data, error } = await supabase
      .from('plantillas')
      .select(`
        *,
        secciones (
          *,
          preguntas (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  // Alias para compatibilidad
  static async getPlantillaCompleta(id: number): Promise<PlantillaCompleta | null> {
    return this.getCompleta(id)
  }

  static async create(plantilla: Omit<Plantilla, 'id'>): Promise<Plantilla> {
    const { data, error } = await supabase
      .from('plantillas')
      .insert(plantilla)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async update(id: number, plantilla: Partial<Plantilla>): Promise<Plantilla> {
    const { data, error } = await supabase
      .from('plantillas')
      .update(plantilla)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('plantillas')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  static async createSeccion(seccion: Omit<Seccion, 'id'>): Promise<Seccion> {
    const { data, error } = await supabase
      .from('secciones')
      .insert(seccion)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async updateSeccion(id: number, seccion: Partial<Seccion>): Promise<Seccion> {
    const { data, error } = await supabase
      .from('secciones')
      .update(seccion)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async deleteSeccion(id: number): Promise<void> {
    const { error } = await supabase
      .from('secciones')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  static async createPregunta(pregunta: Omit<Pregunta, 'id'>): Promise<Pregunta> {
    const { data, error } = await supabase
      .from('preguntas')
      .insert(pregunta)
      .select(`
        *,
        area:areas(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async updatePregunta(id: number, pregunta: Partial<Pregunta>): Promise<Pregunta> {
    const { data, error } = await supabase
      .from('preguntas')
      .update(pregunta)
      .eq('id', id)
      .select(`
        *,
        area:areas(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async deletePregunta(id: number): Promise<void> {
    const { error } = await supabase
      .from('preguntas')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }

  static async getPreguntasGenerales(): Promise<Pregunta[]> {
    const { data, error } = await supabase
      .from('preguntas')
      .select(`
        *,
        area:areas(*)
      `)
      .eq('es_general', true)

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getPreguntasPorArea(areaId: number): Promise<Pregunta[]> {
    const { data, error } = await supabase
      .from('preguntas')
      .select(`
        *,
        area:areas(*)
      `)
      .eq('area_id', areaId)

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getPreguntasPorSeccion(seccionId: number): Promise<Pregunta[]> {
    const { data, error } = await supabase
      .from('preguntas')
      .select(`
        *,
        area:areas(*)
      `)
      .eq('seccion_id', seccionId)

    if (error) throw new Error(error.message)
    return data || []
  }

  static async duplicarPlantilla(id: number, nuevoNombre: string): Promise<PlantillaCompleta> {
    // Obtener plantilla original
    const plantillaOriginal = await this.getCompleta(id)
    if (!plantillaOriginal) {
      throw new Error('Plantilla no encontrada')
    }

    // Crear nueva plantilla
    const nuevaPlantilla = await this.create({
      nombre: nuevoNombre
    })

    // Duplicar secciones y preguntas
    const nuevasSecciones = await Promise.all(
      plantillaOriginal.secciones.map(async (seccion) => {
        const nuevaSeccion = await this.createSeccion({
          plantilla_id: nuevaPlantilla.id,
          nombre: seccion.nombre,
          peso: seccion.peso
        })

        // Duplicar preguntas de la sección
        await Promise.all(
          seccion.preguntas.map(async (pregunta) => {
            await this.createPregunta({
              seccion_id: nuevaSeccion.id,
              texto: pregunta.texto,
              tipo: pregunta.tipo,
              peso: pregunta.peso,
              es_general: pregunta.es_general
            })
          })
        )

        return nuevaSeccion
      })
    )

    return {
      ...nuevaPlantilla,
      secciones: nuevasSecciones.map(seccion => ({
        ...seccion,
        preguntas: []
      }))
    }
  }
}
