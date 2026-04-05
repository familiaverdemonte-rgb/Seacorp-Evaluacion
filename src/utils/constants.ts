import { PesoEvaluador, ClasificacionDesempeno } from '@/types'

export const PESOS_EVALUADOR: PesoEvaluador = {
  rrhh: 0.4,
  jefe: 0.4,
  par: 0.2
}

export const CLASIFICACION_DESEMPENO: ClasificacionDesempeno[] = [
  { rango: 'alto', min: 4.5, max: 5, etiqueta: 'Alto desempeño' },
  { rango: 'bueno', min: 3.5, max: 4.49, etiqueta: 'Buen desempeño' },
  { rango: 'regular', min: 2.5, max: 3.49, etiqueta: 'Desempeño regular' },
  { rango: 'bajo', min: 0, max: 2.49, etiqueta: 'Bajo desempeño' }
]

export const ESTADOS_EVALUACION = {
  PENDIENTE: 'pendiente',
  EN_PROGRESO: 'en_progreso',
  COMPLETADA: 'completada'
} as const

export const TIPOS_EVALUADOR = {
  RRHH: 'rrhh',
  JEFE: 'jefe',
  PAR: 'par'
} as const

export const ESTADOS_CICLO = {
  ABIERTO: 'abierto',
  CERRADO: 'cerrado'
} as const

export const TIPOS_PREGUNTA = {
  ESCALA_1_5: 'escala_1_5'
} as const

export const COLORES_DESEMPENO = {
  alto: '#10b981', // green-500
  bueno: '#3b82f6', // blue-500
  regular: '#f59e0b', // amber-500
  bajo: '#ef4444' // red-500
}

export const EXPORT_FORMATOS = {
  EXCEL: 'excel',
  PDF: 'pdf'
} as const

export const REPORTES_TIPOS = {
  INDIVIDUAL: 'individual',
  AREA: 'area',
  GENERAL: 'general'
} as const
