import { Evaluacion, Respuesta, Pregunta, Seccion, CLASIFICACION_DESEMPENO, PESOS_EVALUADOR } from '@/types'

export function calcularPuntajePonderado(
  respuestas: (Respuesta & { pregunta: Pregunta })[],
  secciones: Seccion[]
): number {
  // Agrupar respuestas por sección
  const respuestasPorSeccion = new Map<number, (Respuesta & { pregunta: Pregunta })[]>()
  
  respuestas.forEach(respuesta => {
    const seccionId = respuesta.pregunta.seccion_id
    if (!respuestasPorSeccion.has(seccionId)) {
      respuestasPorSeccion.set(seccionId, [])
    }
    respuestasPorSeccion.get(seccionId)!.push(respuesta)
  })

  // Calcular puntaje por sección aplicando pesos
  let puntajeTotalPonderado = 0
  let pesoTotal = 0

  secciones.forEach(seccion => {
    const respuestasSeccion = respuestasPorSeccion.get(seccion.id) || []
    
    if (respuestasSeccion.length === 0) return

    // Calcular puntaje promedio de la sección
    const puntajeSeccion = respuestasSeccion.reduce((sum, respuesta) => {
      return sum + (respuesta.puntaje * respuesta.pregunta.peso)
    }, 0)

    const pesoTotalPreguntas = respuestasSeccion.reduce((sum, respuesta) => {
      return sum + respuesta.pregunta.peso
    }, 0)

    const puntajePromedioSeccion = pesoTotalPreguntas > 0 ? puntajeSeccion / pesoTotalPreguntas : 0

    // Aplicar peso de la sección
    puntajeTotalPonderado += puntajePromedioSeccion * seccion.peso
    pesoTotal += seccion.peso
  })

  return pesoTotal > 0 ? puntajeTotalPonderado / pesoTotal : 0
}

export function clasificarDesempeño(puntaje: number): string {
  const clasificacion = CLASIFICACION_DESEMPENO.find(
    rango => puntaje >= rango.min && puntaje <= rango.max
  )
  return clasificacion?.etiqueta || 'Sin clasificación'
}

export function calcularPuntajeFinal360(
  evaluaciones: Evaluacion[]
): number {
  const puntajesPorTipo = {
    rrhh: [] as number[],
    jefe: [] as number[],
    par: [] as number[]
  }

  // Agrupar puntajes por tipo de evaluador
  evaluaciones.forEach(evaluacion => {
    if (evaluacion.puntaje_ponderado) {
      puntajesPorTipo[evaluacion.tipo_evaluador].push(evaluacion.puntaje_ponderado)
    }
  })

  // Calcular promedio por tipo
  const promedioPorTipo = {
    rrhh: promedioArray(puntajesPorTipo.rrhh),
    jefe: promedioArray(puntajesPorTipo.jefe),
    par: promedioArray(puntajesPorTipo.par)
  }

  // Aplicar pesos 360°
  return (
    (promedioPorTipo.rrhh * PESOS_EVALUADOR.rrhh) +
    (promedioPorTipo.jefe * PESOS_EVALUADOR.jefe) +
    (promedioPorTipo.par * PESOS_EVALUADOR.par)
  )
}

function promedioArray(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((sum, val) => sum + val, 0) / arr.length : 0
}

export function calcularProgresoEvaluacion(
  totalPreguntas: number,
  preguntasRespondidas: number
): number {
  return totalPreguntas > 0 ? Math.round((preguntasRespondidas / totalPreguntas) * 100) : 0
}

export function validarPuntaje(puntaje: number): boolean {
  return puntaje >= 1 && puntaje <= 5
}

export function redondearPuntaje(puntaje: number, decimales: number = 2): number {
  return Math.round(puntaje * Math.pow(10, decimales)) / Math.pow(10, decimales)
}
