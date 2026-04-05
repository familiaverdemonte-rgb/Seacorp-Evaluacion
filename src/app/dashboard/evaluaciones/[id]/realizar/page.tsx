'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Save, CheckCircle, Clock, User, Calendar, FileText, Trash2 } from 'lucide-react'
import { Evaluacion, EvaluacionConDetalles, Pregunta, Respuesta } from '@/types'
import { EvaluacionesService } from '@/services/evaluaciones'

export default function RealizarEvaluacionPage() {
  const params = useParams()
  const router = useRouter()
  const evaluacionId = parseInt(params.id as string)
  
  const [evaluacion, setEvaluacion] = useState<EvaluacionConDetalles | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [comentarios, setComentarios] = useState<Record<number, string>>({})
  const [currentSection, setCurrentSection] = useState(0)

  useEffect(() => {
    if (evaluacionId) {
      loadEvaluacion()
    }
  }, [evaluacionId])

  const loadEvaluacion = async () => {
    try {
      console.log('🔍 Cargando evaluación:', evaluacionId)
      const data = await EvaluacionesService.getById(evaluacionId)
      
      if (!data) {
        console.error('❌ Evaluación no encontrada')
        router.push('/dashboard/evaluaciones')
        return
      }
      
      console.log('✅ Evaluación cargada:', data)
      console.log('👤 Trabajador:', data.trabajador)
      
      // Usar los datos reales de la evaluación
      const evaluacionCompleta: EvaluacionConDetalles = {
        id: data.id,
        trabajador_id: data.trabajador_id,
        evaluador_id: data.evaluador_id,
        tipo_evaluador: data.tipo_evaluador,
        ciclo_id: data.ciclo_id,
        estado: data.estado,
        puntaje_ponderado: data.puntaje_ponderado,
        clasificacion: data.clasificacion,
        created_at: data.created_at,
        trabajador: data.trabajador, // ✅ Usar datos reales del trabajador
        ciclo: data.ciclo,
        respuestas: data.respuestas || []
      }
      
      console.log('📋 Evaluación completa:', evaluacionCompleta)
      setEvaluacion(evaluacionCompleta)
      
      // Cargar respuestas existentes si las hay
      if (data.respuestas && data.respuestas.length > 0) {
        console.log('📝 Cargando respuestas existentes:', data.respuestas)
        const respuestasExistentes: Record<number, number> = {}
        const comentariosExistentes: Record<number, string> = {}
        
        data.respuestas.forEach((respuesta: any) => {
          if (respuesta.pregunta_id && respuesta.puntaje !== null) {
            respuestasExistentes[respuesta.pregunta_id] = respuesta.puntaje
            if (respuesta.comentario) {
              comentariosExistentes[respuesta.pregunta_id] = respuesta.comentario
            }
          }
        })
        
        setRespuestas(respuestasExistentes)
        setComentarios(comentariosExistentes)
        console.log('✅ Respuestas cargadas en estado:', respuestasExistentes)
        console.log('✅ Comentarios cargados en estado:', comentariosExistentes)
      }
      
      // Actualizar estado a 'en_progreso' si está pendiente (no si está completada para permitir edición)
      if (data.estado === 'pendiente') {
        await EvaluacionesService.updateEstado(evaluacionId, 'en_progreso')
        evaluacionCompleta.estado = 'en_progreso'
        console.log('✅ Estado actualizado a en_progreso')
      } else if (data.estado === 'completada') {
        console.log('📝 Modo edición: Evaluación completada abierta para corrección')
        // No cambiar el estado, permitir edición
      }
      
    } catch (error) {
      console.error('❌ Error al cargar evaluación:', error)
      alert('Error al cargar evaluación')
      router.push('/dashboard/evaluaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleRespuestaChange = (preguntaId: number, valor: number) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }))
  }

  const handleComentarioChange = (preguntaId: number, comentario: string) => {
    setComentarios(prev => ({
      ...prev,
      [preguntaId]: comentario
    }))
  }

  const handleSaveDraft = async () => {
    if (!evaluacion || Object.keys(respuestas).length === 0) {
      alert('No hay respuestas para guardar')
      return
    }
    
    setSaving(true)
    try {
      console.log('💾 Guardando avance de evaluación...')
      
      // Guardar respuestas actuales
      for (const [preguntaId, valor] of Object.entries(respuestas)) {
        await EvaluacionesService.createOrUpdateRespuesta({
          evaluacion_id: evaluacionId,
          pregunta_id: parseInt(preguntaId),
          puntaje: valor,
          comentario: comentarios[parseInt(preguntaId)] || ''
        })
      }
      
      // Actualizar estado a 'en_progreso' si no está ya en ese estado
      if (evaluacion.estado === 'pendiente') {
        await EvaluacionesService.updateEstado(evaluacionId, 'en_progreso')
        console.log('✅ Estado actualizado a en_progreso')
      }
      
      console.log('💾 Avance guardado correctamente')
      alert('✅ Avance guardado correctamente. Puedes continuar la evaluación más tarde.')
      
    } catch (error) {
      console.error('❌ Error al guardar avance:', error)
      alert('Error al guardar el avance')
    } finally {
      setSaving(false)
    }
  }

  const handleResetEvaluation = async () => {
    if (!confirm('¿Estás seguro de limpiar todas las respuestas y reiniciar la evaluación? Esta acción no se puede deshacer.')) {
      return
    }
    
    try {
      console.log('🔄 Reiniciando evaluación...')
      
      // Eliminar todas las respuestas existentes
      await EvaluacionesService.deleteRespuestasByEvaluacion(evaluacionId)
      
      // Limpiar estado local
      setRespuestas({})
      setComentarios({})
      
      // Cambiar estado a pendiente
      await EvaluacionesService.updateEstado(evaluacionId, 'pendiente')
      
      // Actualizar estado local
      if (evaluacion) {
        evaluacion.estado = 'pendiente'
      }
      
      console.log('✅ Evaluación reiniciada correctamente')
      alert('✅ Evaluación reiniciada. Todas las respuestas han sido eliminadas.')
      
    } catch (error) {
      console.error('❌ Error al reiniciar evaluación:', error)
      alert('Error al reiniciar la evaluación')
    }
  }

  const handleSave = async () => {
    if (!evaluacion) return
    
    setSaving(true)
    try {
      console.log('💾 Finalizando evaluación...')
      
      // Guardar todas las respuestas (usando createOrUpdateRespuesta)
      for (const [preguntaId, valor] of Object.entries(respuestas)) {
        await EvaluacionesService.createOrUpdateRespuesta({
          evaluacion_id: evaluacionId,
          pregunta_id: parseInt(preguntaId),
          puntaje: valor,
          comentario: comentarios[parseInt(preguntaId)] || ''
        })
      }

      // Calcular y guardar los resultados de la evaluación
      console.log('📊 Calculando resultados de la evaluación...')
      await EvaluacionesService.calcularYGuardarResultados(evaluacionId)
      console.log('✅ Resultados calculados y guardados')

      // Actualizar estado de la evaluación a completada
      await EvaluacionesService.update(evaluacionId, {
        estado: 'completada'
      })

      console.log('✅ Evaluación finalizada correctamente')
      alert('✅ Evaluación completada exitosamente')
      router.push('/dashboard/evaluaciones')
    } catch (error) {
      console.error('❌ Error al guardar evaluación:', error)
      alert('Error al guardar evaluación: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  const getTotalPreguntas = () => {
    let total = 0
    secciones.forEach(seccion => {
      if (seccion.preguntas) {
        total += seccion.preguntas.length
      }
    })
    return total
  }

  const getProgress = () => {
    const totalPreguntas = getTotalPreguntas()
    const respondidas = Object.keys(respuestas).length
    return totalPreguntas > 0 ? (respondidas / totalPreguntas) * 100 : 0
  }

  const isEvaluacionCompleta = () => {
    const totalPreguntas = getTotalPreguntas()
    const respondidas = Object.keys(respuestas).length
    return totalPreguntas > 0 && respondidas >= totalPreguntas
  }

  const getCalificacion = (valor: number) => {
    if (valor >= 5) return { text: 'Excelente', color: 'bg-green-100 text-green-800' }
    if (valor >= 4) return { text: 'Muy Bueno', color: 'bg-blue-100 text-blue-800' }
    if (valor >= 3) return { text: 'Bueno', color: 'bg-yellow-100 text-yellow-800' }
    if (valor >= 2) return { text: 'Regular', color: 'bg-orange-100 text-orange-800' }
    return { text: 'Necesita Mejora', color: 'bg-red-100 text-red-800' }
  }

  // Cargar secciones y preguntas desde la base de datos
  const [secciones, setSecciones] = useState<any[]>([])
  const [loadingSecciones, setLoadingSecciones] = useState(true)

  useEffect(() => {
    if (evaluacion) {
      loadSeccionesFromDatabase()
    }
  }, [evaluacion])

  const loadSeccionesFromDatabase = async () => {
    try {
      console.log('🔍 Cargando secciones desde base de datos...')
      
      // Importar servicios dinámicamente
      const { PlantillasService } = await import('@/services/plantillas')
      const { SeccionesService } = await import('@/services/secciones')
      const { PreguntasService } = await import('@/services/preguntas')
      
      // Obtener plantilla del ciclo
      let plantillaId = 1 // ID de plantilla por defecto
      
      try {
        // Obtener plantilla del ciclo
        if (evaluacion?.ciclo_id) {
          console.log('🔍 Buscando ciclo:', evaluacion.ciclo_id)
          const { CiclosEvaluacionService } = await import('@/services/ciclos-evaluacion')
          const ciclo = await CiclosEvaluacionService.getById(evaluacion.ciclo_id)
          console.log('📋 Ciclo encontrado:', ciclo)
          
          if (ciclo.plantilla_id) {
            plantillaId = ciclo.plantilla_id
            console.log('✅ Usando plantilla del ciclo:', plantillaId)
          } else {
            console.log('⚠️ El ciclo no tiene plantilla asignada, usando plantilla por defecto')
          }
        }
      } catch (error) {
        console.log('❌ Error obteniendo plantilla del ciclo:', error)
        console.log('📋 Usando plantilla por defecto')
      }
      
      console.log('🎯 Plantilla final a usar:', plantillaId)
      
      // Cargar secciones de la plantilla
      const seccionesData = await SeccionesService.getByPlantilla(plantillaId)
      console.log('✅ Secciones cargadas:', seccionesData)
      
      // Cargar preguntas para cada sección
      const seccionesConPreguntas = await Promise.all(
        seccionesData.map(async (seccion) => {
          const preguntas = await PreguntasService.getBySeccion(seccion.id)
          console.log(`📋 Preguntas de sección ${seccion.nombre}:`, preguntas)
          
          return {
            ...seccion,
            preguntas: preguntas
          }
        })
      )
      
      console.log('📋 Secciones completas:', seccionesConPreguntas)
      setSecciones(seccionesConPreguntas)
      
    } catch (error) {
      console.error('❌ Error al cargar secciones desde BD:', error)
      
      // Si falla, usar datos hardcodeados como respaldo
      console.log('🔄 Usando datos de respaldo hardcodeados')
      setSecciones([
        {
          id: 1,
          nombre: 'Competencias Técnicas',
          peso: 40,
          preguntas: [
            { id: 1, texto: 'Conocimiento técnico del puesto', peso: 10, tipo: 'escala_1_5' },
            { id: 2, texto: 'Capacidad de resolución de problemas', peso: 10, tipo: 'escala_1_5' },
            { id: 3, texto: 'Uso de herramientas tecnológicas', peso: 10, tipo: 'escala_1_5' },
            { id: 4, texto: 'Calidad del código', peso: 10, tipo: 'escala_1_5' }
          ]
        },
        {
          id: 2,
          nombre: 'Competencias Interpersonales',
          peso: 30,
          preguntas: [
            { id: 5, texto: 'Comunicación efectiva', peso: 10, tipo: 'escala_1_5' },
            { id: 6, texto: 'Trabajo en equipo', peso: 10, tipo: 'escala_1_5' },
            { id: 7, texto: 'Liderazgo', peso: 10, tipo: 'escala_1_5' }
          ]
        },
        {
          id: 3,
          nombre: 'Gestión y Organización',
          peso: 30,
          preguntas: [
            { id: 8, texto: 'Planificación y organización', peso: 10, tipo: 'escala_1_5' },
            { id: 9, texto: 'Gestión del tiempo', peso: 10, tipo: 'escala_1_5' },
            { id: 10, texto: 'Tomar decisiones', peso: 10, tipo: 'escala_1_5' }
          ]
        }
      ])
    } finally {
      setLoadingSecciones(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate-blue mx-auto mb-4"></div>
          <p className="text-gray-600 font-corporate">Cargando evaluación...</p>
        </div>
      </div>
    )
  }

  if (!evaluacion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-corporate">Evaluación no encontrada</p>
          <Button 
            onClick={() => router.push('/dashboard/evaluaciones')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Volver a Evaluaciones
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/evaluaciones')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-xl font-bold font-corporate">Realizar Evaluación</h1>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Trabajador:</span> {evaluacion.trabajador.nombre}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Código:</span> {evaluacion.trabajador.codigo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Puesto:</span> {evaluacion.trabajador.puesto}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Tipo Evaluador:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      evaluacion.tipo_evaluador === 'rrhh' ? 'bg-purple-100 text-purple-800' :
                      evaluacion.tipo_evaluador === 'jefe' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {evaluacion.tipo_evaluador === 'rrhh' ? 'RRHH' :
                       evaluacion.tipo_evaluador === 'jefe' ? 'Jefe' :
                       'Par'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                {evaluacion.ciclo.nombre}
              </Badge>
              <Badge className={`${evaluacion.estado === 'completada' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                {evaluacion.estado === 'completada' ? 'Modo Edición' : 'En Progreso'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Información del Evaluado */}
        <Card className="mb-6 border-corporate-blue shadow-lg">
          <CardHeader className="bg-gradient-to-r from-corporate-blue-light to-corporate-blue text-white">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información del Evaluado
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-corporate">Área</p>
                <p className="font-semibold">{evaluacion.trabajador.area?.nombre || 'Sin área'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate">Ciclo</p>
                <p className="font-semibold">{evaluacion.ciclo.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate">Plantilla</p>
                <p className="font-semibold">{evaluacion.ciclo.plantilla?.nombre || 'Plantilla por Defecto'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progreso */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Progreso de la Evaluación
              </span>
              <span className="text-sm font-normal">
                {Object.keys(respuestas).length} / {getTotalPreguntas()} preguntas respondidas
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={getProgress()} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">
              {getProgress().toFixed(1)}% completado
            </p>
          </CardContent>
        </Card>

        {/* Formulario de Evaluación */}
        <div className="space-y-6">
          {secciones.map((seccion, sectionIndex) => (
            <Card key={seccion.id} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-corporate">{seccion.nombre}</CardTitle>
                    <CardDescription>
                      Peso en la evaluación: {seccion.peso}%
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {seccion.preguntas.length} preguntas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {seccion.preguntas.map((pregunta) => (
                    <div key={pregunta.id} className="border-l-4 border-l-corporate-blue pl-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 mb-2">
                              {pregunta.id}. {pregunta.texto}
                            </p>
                            <p className="text-sm text-gray-600">
                              Peso: {pregunta.peso} puntos
                            </p>
                          </div>
                          <div className="ml-4">
                            {respuestas[pregunta.id] && (
                              <Badge className={getCalificacion(respuestas[pregunta.id]).color}>
                                {getCalificacion(respuestas[pregunta.id]).text}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Escala de calificación */}
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Calificación (1-5):</p>
                          <div className="flex space-x-2">
                            {[1, 2, 3, 4, 5].map((valor) => (
                              <Button
                                key={valor}
                                variant={respuestas[pregunta.id] === valor ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleRespuestaChange(pregunta.id, valor)}
                                className={`min-w-[40px] ${
                                  respuestas[pregunta.id] === valor 
                                    ? 'bg-corporate-blue hover:bg-corporate-blue-dark' 
                                    : ''
                                }`}
                              >
                                {valor}
                              </Button>
                            ))}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                            <div>1 = Deficiente</div>
                            <div>2 = Necesita Mejorar</div>
                            <div>3 = Cumple Expectativas</div>
                            <div>4 = Excede Expectativas</div>
                            <div>5 = Sobresaliente</div>
                          </div>
                        </div>

                        {/* Comentarios */}
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Comentarios (opcional):
                          </label>
                          <textarea
                            className="w-full mt-1 p-2 border rounded-md resize-vertical"
                            rows={3}
                            placeholder="Agrega comentarios adicionales sobre el desempeño en esta área..."
                            value={comentarios[pregunta.id] || ''}
                            onChange={(e) => handleComentarioChange(pregunta.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-between items-center pt-6 border-t">
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/evaluaciones')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar y Volver
          </Button>
          <div className="flex space-x-3">
            {evaluacion.estado === 'completada' && (
              <Button 
                variant="outline"
                onClick={handleResetEvaluation}
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 text-white"
                title="Limpiar todas las respuestas y reiniciar evaluación"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reiniciar Evaluación
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saving || Object.keys(respuestas).length === 0}
              title="Guardar avance para continuar más tarde"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Avance'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving || !isEvaluacionCompleta()}
              className={`${evaluacion.estado === 'completada' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold`}
              title={isEvaluacionCompleta() ? 
                (evaluacion.estado === 'completada' ? "Guardar cambios en evaluación" : "Finalizar evaluación") : 
                "Debes responder todas las preguntas para finalizar"
              }
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : (evaluacion.estado === 'completada' ? 'Guardar Cambios' : 'Finalizar Evaluación')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
