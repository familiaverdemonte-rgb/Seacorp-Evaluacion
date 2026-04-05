export interface Area {
  id: number
  nombre: string
}

export interface Trabajador {
  id: number
  codigo: string
  nombre: string
  area_id: number
  puesto: string
  residencia: string
  service: string
  area?: Area
}

export interface CicloEvaluacion {
  id: number
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  estado: 'abierto' | 'cerrado'
  plantilla_id?: number
  trabajadores_asignados?: number
  plantilla_nombre?: string
}

export interface Plantilla {
  id: number
  nombre: string
}

export interface Seccion {
  id: number
  plantilla_id: number
  nombre: string
  peso: number
  preguntas?: Pregunta[]
}

export interface Pregunta {
  id: number
  seccion_id: number
  texto: string
  tipo: 'escala_1_5'
  peso: number
  es_general: boolean
  // area_id eliminado - no existe en la BD
}

export interface Evaluacion {
  id: number
  trabajador_id: number
  evaluador_id: string
  tipo_evaluador: 'rrhh' | 'jefe' | 'par'
  ciclo_id: number
  estado: 'pendiente' | 'en_progreso' | 'completada'
  puntaje_ponderado: number | null
  clasificacion: string | null
  created_at: string
  trabajador?: Trabajador
  ciclo?: CicloEvaluacion
  respuestas?: Respuesta[]
}

export interface Respuesta {
  id: number
  evaluacion_id: number
  pregunta_id: number
  puntaje: number
  comentario: string
  pregunta?: Pregunta
}

export interface EvaluacionConDetalles extends Evaluacion {
  trabajador: Trabajador
  ciclo: CicloEvaluacion
  respuestas: (Respuesta & { pregunta: Pregunta })[]
}

export interface PlantillaCompleta extends Plantilla {
  secciones: (Seccion & {
    preguntas: Pregunta[]
  })[]
}

export interface PesoEvaluador {
  rrhh: number
  jefe: number
  par: number
}

export interface ClasificacionDesempeno {
  rango: string
  min: number
  max: number
  etiqueta: string
}

export const CLASIFICACION_DESEMPENO: ClasificacionDesempeno[] = [
  { rango: 'alto', min: 4.5, max: 5, etiqueta: 'Alto desempeño' },
  { rango: 'bueno', min: 3.5, max: 4.49, etiqueta: 'Buen desempeño' },
  { rango: 'regular', min: 2.5, max: 3.49, etiqueta: 'Desempeño regular' },
  { rango: 'bajo', min: 0, max: 2.49, etiqueta: 'Bajo desempeño' }
]

export const PESOS_EVALUADOR: PesoEvaluador = {
  rrhh: 0.4,
  jefe: 0.4,
  par: 0.2
}

export interface DashboardStats {
  promedioGeneral: number
  totalEvaluaciones: number
  evaluacionesCompletadas: number
  evaluacionesPendientes: number
  distribucionDesempeño: {
    alto: number
    bueno: number
    regular: number
    bajo: number
  }
  rankingTrabajadores: (Trabajador & {
    puntajePromedio: number
    evaluacionesCount: number
  })[]
  rankingAreas: (Area & {
    puntajePromedio: number
    trabajadoresCount: number
  })[]
}

export interface ExcelImportResult {
  exitosos: number
  errores: number
  trabajadoresCreados: Trabajador[]
  erroresDetallados: {
    fila: number
    error: string
    datos: any
  }[]
}

export interface ReporteConfig {
  tipo: 'individual' | 'area' | 'general'
  formato: 'excel' | 'pdf'
  filtros?: {
    ciclo_id?: number
    area_id?: number
    trabajador_id?: number
    fecha_inicio?: string
    fecha_fin?: string
  }
}
