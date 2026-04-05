import { supabase } from '@/lib/supabase'
import { 
  Evaluacion, 
  Respuesta, 
  Pregunta, 
  Seccion, 
  Trabajador, 
  CicloEvaluacion,
  EvaluacionConDetalles,
  PlantillaCompleta
} from '@/types'
import { calcularPuntajePonderado, clasificarDesempeño, calcularPuntajeFinal360 } from '@/utils/calculations'

export class EvaluacionesService {
  static async getAll(): Promise<Evaluacion[]> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select(`
        *,
        trabajador:trabajadores(*),
        ciclo:ciclos_evaluacion(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getById(id: number): Promise<EvaluacionConDetalles | null> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select(`
        *,
        trabajador:trabajadores(*, area:areas(*)),
        ciclo:ciclos_evaluacion(*, plantilla:plantillas(*)),
        respuestas:respuestas(
          *,
          pregunta:preguntas(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }

    return data
  }

  static async getByTrabajador(trabajadorId: number): Promise<Evaluacion[]> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select(`
        *,
        trabajador:trabajadores(*, area:areas(*)),
        ciclo:ciclos_evaluacion(*, plantilla:plantillas(*))
      `)
      .eq('trabajador_id', trabajadorId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getByEvaluador(evaluadorId: string): Promise<Evaluacion[]> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select(`
        *,
        trabajador:trabajadores(*),
        ciclo:ciclos_evaluacion(*)
      `)
      .eq('evaluador_id', evaluadorId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  static async getByCiclo(cicloId: number): Promise<EvaluacionConDetalles[]> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select(`
        *,
        trabajador:trabajadores(*),
        ciclo:ciclos_evaluacion(*)
      `)
      .eq('ciclo_id', cicloId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }

  
  static async create(evaluacion: Omit<Evaluacion, 'id' | 'created_at'>): Promise<Evaluacion> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .insert(evaluacion)
      .select(`
        *,
        trabajador:trabajadores(*),
        ciclo:ciclos_evaluacion(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async update(id: number, evaluacion: Partial<Evaluacion>): Promise<Evaluacion> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .update(evaluacion)
      .eq('id', id)
      .select(`
        *,
        trabajador:trabajadores(*),
        ciclo:ciclos_evaluacion(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async updateEstado(id: number, estado: 'pendiente' | 'en_progreso' | 'completada'): Promise<Evaluacion> {
    return this.update(id, { estado })
  }

  
  static async createRespuesta(respuesta: Omit<Respuesta, 'id'>): Promise<Respuesta> {
    const { data, error } = await supabase
      .from('respuestas')
      .insert(respuesta)
      .select(`
        *,
        pregunta:preguntas(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async updateRespuesta(id: number, respuesta: Partial<Respuesta>): Promise<Respuesta> {
    const { data, error } = await supabase
      .from('respuestas')
      .update(respuesta)
      .eq('id', id)
      .select(`
        *,
        pregunta:preguntas(*)
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  static async getRespuestasByEvaluacion(evaluacionId: number): Promise<(Respuesta & { pregunta: Pregunta })[]> {
    const { data, error } = await supabase
      .from('respuestas')
      .select(`
        *,
        pregunta:preguntas(*)
      `)
      .eq('evaluacion_id', evaluacionId)

    if (error) throw new Error(error.message)
    return data || []
  }

  static async guardarRespuestas(
    evaluacionId: number, 
    respuestas: { pregunta_id: number; puntaje: number; comentario?: string }[]
  ): Promise<void> {
    // Eliminar respuestas existentes
    await supabase
      .from('respuestas')
      .delete()
      .eq('evaluacion_id', evaluacionId)

    // Insertar nuevas respuestas
    if (respuestas.length > 0) {
      const { error } = await supabase
        .from('respuestas')
        .insert(
          respuestas.map(r => ({
            evaluacion_id: evaluacionId,
            pregunta_id: r.pregunta_id,
            puntaje: r.puntaje,
            comentario: r.comentario || ''
          }))
        )

      if (error) throw new Error(error.message)
    }
  }

  static async calcularYGuardarResultados(evaluacionId: number): Promise<void> {
    // Obtener evaluación con respuestas
    const evaluacion = await this.getById(evaluacionId)
    if (!evaluacion) throw new Error('Evaluación no encontrada')

    // Obtener plantilla completa
    const { PlantillasService } = await import('./plantillas')
    const plantilla = await PlantillasService.getCompleta(1) // TODO: Obtener plantilla del ciclo
    if (!plantilla) throw new Error('Plantilla no encontrada')

    // Calcular puntaje ponderado
    const puntajePonderado = calcularPuntajePonderado(
      evaluacion.respuestas.map(r => ({
        ...r,
        pregunta: r.pregunta!
      })),
      plantilla.secciones
    )

    // Clasificar desempeño
    const clasificacion = clasificarDesempeño(puntajePonderado)

    // Actualizar evaluación
    await this.update(evaluacionId, {
      puntaje_ponderado: puntajePonderado,
      clasificacion,
      estado: 'completada'
    })
  }

  static async getByTrabajadorAndCiclo(trabajadorId: number, cicloId: number): Promise<Evaluacion[]> {
    const { data, error } = await supabase
      .from('evaluaciones')
      .select('*')
      .eq('trabajador_id', trabajadorId)
      .eq('ciclo_id', cicloId)

    if (error) throw new Error(error.message)
    return data || []
  }

  static async crearEvaluaciones360(
    trabajadorId: number,
    cicloId: number,
    evaluadores: {
      rrhh?: string[]
      jefe?: string[]
      par?: string[]
    }
  ): Promise<Evaluacion[]> {
    const evaluacionesCreadas: Evaluacion[] = []

    // Verificar si ya existen evaluaciones para este trabajador en este ciclo
    const evaluacionesExistentes = await this.getByTrabajadorAndCiclo(trabajadorId, cicloId)
    const tiposExistentes = new Set(evaluacionesExistentes.map(e => e.tipo_evaluador))

    console.log('🔍 Evaluaciones existentes:', evaluacionesExistentes)
    console.log('🔍 Tipos ya existentes:', tiposExistentes)

    // Crear evaluaciones para RRHH (si no existen)
    if (evaluadores.rrhh && !tiposExistentes.has('rrhh')) {
      for (const evaluadorId of evaluadores.rrhh) {
        const evaluacion = await this.create({
          trabajador_id: trabajadorId,
          evaluador_id: evaluadorId,
          tipo_evaluador: 'rrhh',
          ciclo_id: cicloId,
          estado: 'pendiente',
          puntaje_ponderado: null,
          clasificacion: null
        })
        evaluacionesCreadas.push(evaluacion)
        console.log('✅ Evaluación RRHH creada:', evaluacion)
      }
    } else if (evaluadores.rrhh && tiposExistentes.has('rrhh')) {
      console.log('⚠️ Ya existe evaluación RRHH para este trabajador en este ciclo')
    }

    // Crear evaluaciones para Jefe (si no existen)
    if (evaluadores.jefe && !tiposExistentes.has('jefe')) {
      for (const evaluadorId of evaluadores.jefe) {
        const evaluacion = await this.create({
          trabajador_id: trabajadorId,
          evaluador_id: evaluadorId,
          tipo_evaluador: 'jefe',
          ciclo_id: cicloId,
          estado: 'pendiente',
          puntaje_ponderado: null,
          clasificacion: null
        })
        evaluacionesCreadas.push(evaluacion)
        console.log('✅ Evaluación Jefe creada:', evaluacion)
      }
    } else if (evaluadores.jefe && tiposExistentes.has('jefe')) {
      console.log('⚠️ Ya existe evaluación Jefe para este trabajador en este ciclo')
    }

    // Crear evaluaciones para Pares (si no existen)
    if (evaluadores.par && !tiposExistentes.has('par')) {
      // Si se proporcionan múltiples pares, crear solo uno o manejarlos inteligentemente
      const evaluadoresParaCrear = evaluadores.par.slice(0, 1) // Solo crear el primer par por ahora
      for (const evaluadorId of evaluadoresParaCrear) {
        const evaluacion = await this.create({
          trabajador_id: trabajadorId,
          evaluador_id: evaluadorId,
          tipo_evaluador: 'par',
          ciclo_id: cicloId,
          estado: 'pendiente',
          puntaje_ponderado: null,
          clasificacion: null
        })
        evaluacionesCreadas.push(evaluacion)
        console.log('✅ Evaluación Par creada:', evaluacion)
      }
      
      if (evaluadores.par.length > 1) {
        console.log(`⚠️ Se proporcionaron ${evaluadores.par.length} pares pero solo se creó 1 para evitar duplicación`)
      }
    } else if (evaluadores.par && tiposExistentes.has('par')) {
      console.log('⚠️ Ya existe evaluación Par para este trabajador en este ciclo')
    }

    console.log('📊 Total evaluaciones creadas:', evaluacionesCreadas.length)
    return evaluacionesCreadas
  }

  static async getResultados360(trabajadorId: number, cicloId: number): Promise<{
    evaluaciones: Evaluacion[]
    puntajeFinal: number
    clasificacionFinal: string
    detallePorTipo: {
      rrhh: { promedio: number; cantidad: number }
      jefe: { promedio: number; cantidad: number }
      par: { promedio: number; cantidad: number }
    }
  }> {
    const evaluaciones = await this.getByTrabajador(trabajadorId)
    const evaluacionesCiclo = evaluaciones.filter(e => 
      e.ciclo_id === cicloId && e.estado === 'completada'
    )

    console.log('🔍 Evaluaciones del trabajador:', trabajadorId)
    console.log('🔍 Evaluaciones filtradas (completadas):', evaluacionesCiclo)
    console.log('🔍 Detalle:', evaluacionesCiclo.map(e => ({
      id: e.id,
      tipo: e.tipo_evaluador,
      estado: e.estado,
      puntaje: e.puntaje_ponderado
    })))

    const evaluacionesPorTipo = {
      rrhh: evaluacionesCiclo.filter(e => e.tipo_evaluador === 'rrhh'),
      jefe: evaluacionesCiclo.filter(e => e.tipo_evaluador === 'jefe'),
      par: evaluacionesCiclo.filter(e => e.tipo_evaluador === 'par')
    }

    const calcularPromedio = (evals: Evaluacion[]) => {
      console.log('🔍 Calculando promedio para:', evals.length, 'evaluaciones')
      if (evals.length === 0) return 0
      const promedio = evals.reduce((sum, e) => sum + (e.puntaje_ponderado || 0), 0) / evals.length
      console.log('🔍 Promedio calculado:', promedio)
      return promedio
    }

    const detallePorTipo = {
      rrhh: {
        promedio: calcularPromedio(evaluacionesPorTipo.rrhh),
        cantidad: evaluacionesPorTipo.rrhh.length
      },
      jefe: {
        promedio: calcularPromedio(evaluacionesPorTipo.jefe),
        cantidad: evaluacionesPorTipo.jefe.length
      },
      par: {
        promedio: calcularPromedio(evaluacionesPorTipo.par),
        cantidad: evaluacionesPorTipo.par.length
      }
    }

    console.log('🔍 Detalle por tipo:', detallePorTipo)

    const puntajeFinal = calcularPuntajeFinal360(evaluacionesCiclo)
    const clasificacionFinal = clasificarDesempeño(puntajeFinal)

    console.log('🔍 Resultados finales:', { puntajeFinal, clasificacionFinal })

    return {
      evaluaciones: evaluacionesCiclo,
      puntajeFinal,
      clasificacionFinal,
      detallePorTipo
    }
  }

  static async getEstadisticasCiclo(cicloId: number): Promise<{
    totalEvaluaciones: number
    evaluacionesCompletadas: number
    evaluacionesPendientes: number
    promedioGeneral: number
    distribucionDesempeno: {
      alto: number
      bueno: number
      regular: number
      bajo: number
    }
  }> {
    const evaluaciones = await this.getByCiclo(cicloId)
    
    const completadas = evaluaciones.filter(e => e.estado === 'completada')
    const pendientes = evaluaciones.filter(e => e.estado === 'pendiente')
    
    const promedioGeneral = completadas.length > 0
      ? completadas.reduce((sum, e) => sum + (e.puntaje_ponderado || 0), 0) / completadas.length
      : 0

    const distribucionDesempeno = {
      alto: completadas.filter(e => e.clasificacion?.includes('Alto')).length,
      bueno: completadas.filter(e => e.clasificacion?.includes('Bueno')).length,
      regular: completadas.filter(e => e.clasificacion?.includes('Regular')).length,
      bajo: completadas.filter(e => e.clasificacion?.includes('Bajo')).length
    }

    return {
      totalEvaluaciones: evaluaciones.length,
      evaluacionesCompletadas: completadas.length,
      evaluacionesPendientes: pendientes.length,
      promedioGeneral,
      distribucionDesempeno
    }
  }

  static async actualizarPlantillaDeEvaluaciones(cicloId: number, nuevaPlantillaId: number): Promise<void> {
    try {
      // NOTA: La tabla evaluaciones actualmente no tiene plantilla_id
      // Esta función está preparada para cuando se agregue la columna
      // Por ahora, solo registramos el cambio en la consola
      
      console.log(`⚠️ Función de actualización de plantilla llamada para ciclo ${cicloId} con plantilla ${nuevaPlantillaId}`)
      console.log(`ℹ️ NOTA: La tabla evaluaciones necesita la columna plantilla_id para esta funcionalidad`)
      console.log(`ℹ️ Ejecuta el script 'agregar_plantilla_id_evaluaciones.sql' para agregar la columna`)
      
      // Cuando la columna exista, descomenta este código:
      
      const { error } = await supabase
        .from('evaluaciones')
        .update({ plantilla_id: nuevaPlantillaId })
        .eq('ciclo_id', cicloId)

      if (error) throw new Error(error.message)
      
      console.log(`✅ Evaluaciones del ciclo ${cicloId} actualizadas a la plantilla ${nuevaPlantillaId}`)
      
      
      // Por ahora, simulamos éxito para que el flujo continue
      console.log(`✅ Cambio de plantilla registrado (ejecutar SQL para completar)`)
      
    } catch (error) {
      console.error('Error actualizando plantilla de evaluaciones:', error)
      throw new Error(`Error actualizando plantilla de evaluaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async createOrUpdateRespuesta(respuesta: {
    evaluacion_id: number;
    pregunta_id: number;
    puntaje: number;
    comentario?: string;
  }): Promise<void> {
    try {
      // Primero verificar si ya existe una respuesta para esta evaluación y pregunta
      const { data: existingResponse, error: checkError } = await supabase
        .from('respuestas')
        .select('*')
        .eq('evaluacion_id', respuesta.evaluacion_id)
        .eq('pregunta_id', respuesta.pregunta_id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        throw new Error(checkError.message)
      }

      if (existingResponse) {
        // Actualizar respuesta existente
        const { error: updateError } = await supabase
          .from('respuestas')
          .update({
            puntaje: respuesta.puntaje,
            comentario: respuesta.comentario || null,
            updated_at: new Date().toISOString()
          })
          .eq('evaluacion_id', respuesta.evaluacion_id)
          .eq('pregunta_id', respuesta.pregunta_id)

        if (updateError) throw new Error(updateError.message)
        console.log('✅ Respuesta actualizada:', respuesta)
      } else {
        // Crear nueva respuesta
        const { error: insertError } = await supabase
          .from('respuestas')
          .insert({
            evaluacion_id: respuesta.evaluacion_id,
            pregunta_id: respuesta.pregunta_id,
            puntaje: respuesta.puntaje,
            comentario: respuesta.comentario || null
          })

        if (insertError) throw new Error(insertError.message)
        console.log('✅ Respuesta creada:', respuesta)
      }
    } catch (error) {
      console.error('Error creando/actualizando respuesta:', error)
      throw new Error(`Error al guardar respuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async deleteRespuestasByEvaluacion(evaluacionId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('respuestas')
        .delete()
        .eq('evaluacion_id', evaluacionId)

      if (error) throw new Error(error.message)
      
      console.log(`✅ Respuestas de evaluación ${evaluacionId} eliminadas`)
    } catch (error) {
      console.error('Error eliminando respuestas:', error)
      throw new Error(`Error al eliminar respuestas: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      console.log(`🗑️ Iniciando eliminación de evaluación ${id}`)
      
      // Primero eliminar todas las respuestas asociadas
      console.log('📝 Eliminando respuestas asociadas...')
      const { error: respuestasError } = await supabase
        .from('respuestas')
        .delete()
        .eq('evaluacion_id', id)

      if (respuestasError) {
        console.error('Error eliminando respuestas:', respuestasError)
        throw new Error(`Error eliminando respuestas: ${respuestasError.message}`)
      }
      
      console.log('✅ Respuestas eliminadas correctamente')
      
      // Luego eliminar la evaluación
      console.log('📋 Eliminando evaluación...')
      const { error } = await supabase
        .from('evaluaciones')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error eliminando evaluación:', error)
        throw new Error(`Error eliminando evaluación: ${error.message}`)
      }
      
      console.log(`✅ Evaluación ${id} eliminada completamente`)
    } catch (error) {
      console.error('Error eliminando evaluación:', error)
      throw new Error(`Error al eliminar evaluación: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }
}
