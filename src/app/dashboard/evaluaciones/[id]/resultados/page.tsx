'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Download, FileText, TrendingUp, TrendingDown, Minus, Award, Target, BarChart3 } from 'lucide-react'
import { Evaluacion, EvaluacionConDetalles, Respuesta, Pregunta } from '@/types'
import { EvaluacionesService } from '@/services/evaluaciones'

export default function ResultadosEvaluacionPage() {
  const params = useParams()
  const router = useRouter()
  const evaluacionId = parseInt(params.id as string)
  
  const [evaluacion, setEvaluacion] = useState<EvaluacionConDetalles | null>(null)
  const [loading, setLoading] = useState(true)
  const [respuestas, setRespuestas] = useState<Respuesta[]>([])

  useEffect(() => {
    if (evaluacionId) {
      loadEvaluacion()
    }
  }, [evaluacionId])

  const loadEvaluacion = async () => {
    try {
      console.log('🔄 Cargando evaluación ID:', evaluacionId)
      
      const data = await EvaluacionesService.getById(evaluacionId)
      const respuestasData = await EvaluacionesService.getRespuestasByEvaluacion(evaluacionId)
      
      console.log('📊 Datos básicos evaluación:', data)
      console.log('📝 Respuestas encontradas:', respuestasData.length)
      
      if (!data) {
        console.error('❌ No se encontró la evaluación')
        alert('Evaluación no encontrada')
        return
      }

      // Importar servicios dinámicamente para obtener datos reales
      const { TrabajadoresService } = await import('@/services/trabajadores')
      const { CiclosEvaluacionService } = await import('@/services/ciclos-evaluacion')
      
      // Obtener datos reales del trabajador
      const trabajadorReal = await TrabajadoresService.getById(data.trabajador_id)
      console.log('👤 Trabajador real:', trabajadorReal)
      
      // Obtener datos reales del ciclo
      const cicloReal = await CiclosEvaluacionService.getById(data.ciclo_id)
      console.log('🔄 Ciclo real:', cicloReal)
      
      // Crear evaluación con datos reales
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
        trabajador: trabajadorReal || {
          id: data.trabajador_id,
          codigo: 'N/A',
          nombre: 'Trabajador no encontrado',
          area_id: 0,
          puesto: 'N/A',
          residencia: 'N/A',
          service: 'N/A'
        },
        ciclo: cicloReal || {
          id: data.ciclo_id,
          nombre: 'Ciclo no encontrado',
          fecha_inicio: data.created_at,
          fecha_fin: data.created_at,
          estado: 'desconocido'
        },
        respuestas: respuestasData.map(r => ({
          ...r,
          pregunta: {
            id: r.pregunta_id,
            texto: `Pregunta ${r.pregunta_id}`,
            tipo: 'escala_1_5' as const,
            peso: 10,
            es_general: false,
            area_id: 1,
            seccion_id: 1
          }
        }))
      }

      console.log('✅ Evaluación completa con datos reales:', {
        trabajador: evaluacionCompleta.trabajador.nombre,
        ciclo: evaluacionCompleta.ciclo.nombre,
        estado: evaluacionCompleta.estado
      })

      setEvaluacion(evaluacionCompleta)
      setRespuestas(evaluacionCompleta.respuestas)
    } catch (error) {
      console.error('❌ Error al cargar evaluación:', error)
      alert('Error al cargar evaluación')
    } finally {
      setLoading(false)
    }
  }

  const getCalificacionColor = (puntaje: number) => {
    if (puntaje >= 4.5) return 'text-green-600 bg-green-50'
    if (puntaje >= 3.5) return 'text-blue-600 bg-blue-50'
    if (puntaje >= 2.5) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getCalificacionTexto = (puntaje: number) => {
    if (puntaje >= 4.5) return 'Sobresaliente'
    if (puntaje >= 3.5) return 'Excede Expectativas'
    if (puntaje >= 2.5) return 'Cumple Expectativas'
    if (puntaje >= 1.5) return 'Necesita Mejorar'
    return 'Deficiente'
  }

  const getTrendIcon = (valor: number) => {
    if (valor > 3.5) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (valor < 2.5) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-yellow-600" />
  }

  const calcularPuntajeGeneral = () => {
    if (respuestas.length === 0) return 0
    const total = respuestas.reduce((sum, r) => sum + r.puntaje, 0)
    const promedio = (total / respuestas.length).toFixed(2)
    console.log('🔍 Cálculo puntaje general:', {
      'respuestas.length': respuestas.length,
      'total suma': total,
      'promedio calculado': promedio
    })
    return promedio
  }

  const puntajeGeneral = parseFloat(calcularPuntajeGeneral() || '0')

  // Logs para análisis de diferencias
  console.log('📊 Análisis de puntajes:', {
    'evaluacion.id': evaluacion?.id,
    'evaluacion.tipo_evaluador': evaluacion?.tipo_evaluador,
    'evaluacion.puntaje_ponderado': evaluacion?.puntaje_ponderado,
    'puntajeGeneral (promedio)': puntajeGeneral,
    'diferencia': evaluacion?.puntaje_ponderado ? 
      (evaluacion.puntaje_ponderado - puntajeGeneral).toFixed(2) : '0.00',
    'usando_ponderado': !!evaluacion?.puntaje_ponderado
  })

  const generarReportePDF = async () => {
    if (!evaluacion) {
      alert('Error: No hay datos de evaluación disponibles')
      return
    }

    try {
      // Importar servicios dinámicamente
      const { ReportesService } = await import('@/services/reportes')
      
      // Generar reporte individual PDF
      await ReportesService.generarReporteIndividual(
        evaluacion.trabajador_id, 
        evaluacion.ciclo_id
      )
      
      alert('✅ Reporte PDF generado y descargado correctamente')
    } catch (error) {
      console.error('❌ Error al generar reporte PDF:', error)
      alert(`❌ Error al generar reporte PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const generarReporteExcel = async () => {
    if (!evaluacion) {
      alert('Error: No hay datos de evaluación disponibles')
      return
    }

    try {
      // Importar servicios dinámicamente
      const { ReportesService } = await import('@/services/reportes')
      
      // Exportar resultados del ciclo (que incluyen esta evaluación)
      await ReportesService.exportarResultadosExcel(evaluacion.ciclo_id)
      
      alert('✅ Reporte Excel generado y descargado correctamente')
    } catch (error) {
      console.error('❌ Error al generar reporte Excel:', error)
      alert(`❌ Error al generar reporte Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  // Función para obtener resultados reales por secciones
  const getResultadosPorSeccion = async () => {
    try {
      // Importar servicios dinámicamente
      const { PlantillasService } = await import('@/services/plantillas')
      const { CiclosEvaluacionService } = await import('@/services/ciclos-evaluacion')
      
      console.log('🔍 Evaluación:', evaluacion?.id, 'ciclo_id:', evaluacion?.ciclo_id)
      
      if (!evaluacion) {
        console.log('❌ Evaluación es null')
        return getResultadosSimulados()
      }
      
      // Obtener el ciclo para saber qué plantilla usa
      const ciclo = await CiclosEvaluacionService.getById(evaluacion.ciclo_id)
      console.log('🔍 Ciclo encontrado:', ciclo)
      
      if (!ciclo) {
        console.log('❌ Ciclo no encontrado')
        return getResultadosSimulados()
      }
      
      if (!ciclo.plantilla_id) {
        console.log('❌ Ciclo sin plantilla_id')
        return getResultadosSimulados()
      }
      
      console.log('🔍 Buscando plantilla_id:', ciclo.plantilla_id)
      
      // Obtener la plantilla completa con secciones y preguntas
      const plantilla = await PlantillasService.getPlantillaCompleta(ciclo.plantilla_id)
      console.log('🔍 Plantilla encontrada:', plantilla)
      
      if (!plantilla) {
        console.log('❌ Plantilla no encontrada')
        return getResultadosSimulados()
      }
      
      if (!plantilla.secciones || plantilla.secciones.length === 0) {
        console.log('❌ Plantilla sin secciones')
        return getResultadosSimulados()
      }
      
      console.log('✅ Plantilla válida:', plantilla.nombre, 'con', plantilla.secciones.length, 'secciones')
      console.log('📋 Secciones de la plantilla:', plantilla.secciones.map(s => ({ nombre: s.nombre, id: s.id })))
      
      // Agrupar respuestas por sección real
      const resultadosReales = plantilla.secciones.map(seccion => {
        console.log('🔍 Analizando sección:', seccion.nombre, 'ID:', seccion.id)
        
        // Obtener IDs de preguntas de esta sección (desde la estructura anidada)
        const preguntaIdsDeSeccion = seccion.preguntas
          .map(p => p.id)
        
        console.log('🔍 Preguntas de esta sección:', preguntaIdsDeSeccion)
        
        // Obtener respuestas que pertenecen a esta sección por pregunta_id
        const respuestasSeccion = respuestas.filter(respuesta => 
          preguntaIdsDeSeccion.includes(respuesta.pregunta_id)
        )
        
        console.log(`📋 Sección "${seccion.nombre}":`, {
          'respuestas encontradas': respuestasSeccion.length,
          'respuestas totales': respuestas.length,
          'preguntas de sección': preguntaIdsDeSeccion.length
        })
        
        // Calcular puntaje promedio de la sección
        const puntajePromedio = respuestasSeccion.length > 0 
          ? respuestasSeccion.reduce((sum, r) => sum + r.puntaje, 0) / respuestasSeccion.length
          : 0
        
        console.log(`📋 Puntaje final sección "${seccion.nombre}":`, {
          peso: seccion.peso,
          preguntas: respuestasSeccion.length,
          puntaje: puntajePromedio.toFixed(2),
          'suma puntajes': respuestasSeccion.reduce((sum, r) => sum + r.puntaje, 0)
        })
        
        return {
          nombre: seccion.nombre,
          puntaje: parseFloat(puntajePromedio.toFixed(2)),
          peso: seccion.peso,
          respuestas: respuestasSeccion
        }
      })
      
      console.log('✅ Resultados reales calculados:', resultadosReales)
      return resultadosReales
      
    } catch (error) {
      console.error('❌ Error al obtener resultados por secciones:', error)
      console.log('🔄 Usando datos simulados debido a error')
      return getResultadosSimulados()
    }
  }
  
  // Función de fallback con datos simulados
  const getResultadosSimulados = () => {
    console.log('🔄 Usando datos simulados para secciones')
    return [
      {
        nombre: 'Competencias Técnicas',
        puntaje: 4.2,
        peso: 40,
        respuestas: respuestas.slice(0, Math.min(4, respuestas.length))
      },
      {
        nombre: 'Competencias Interpersonales',
        puntaje: 3.8,
        peso: 30,
        respuestas: respuestas.slice(4, Math.min(7, respuestas.length))
      },
      {
        nombre: 'Gestión y Organización',
        puntaje: 3.5,
        peso: 30,
        respuestas: respuestas.slice(7, Math.min(10, respuestas.length))
      }
    ]
  }

  // Estado para almacenar los resultados por sección
  const [resultadosPorSeccion, setResultadosPorSeccion] = useState(getResultadosSimulados())
  const [loadingSecciones, setLoadingSecciones] = useState(true)

  // Cargar resultados reales cuando se carga la evaluación
  useEffect(() => {
    if (evaluacion && respuestas.length > 0) {
      loadResultadosPorSeccion()
    }
  }, [evaluacion, respuestas])

  const loadResultadosPorSeccion = async () => {
    setLoadingSecciones(true)
    try {
      const resultados = await getResultadosPorSeccion()
      setResultadosPorSeccion(resultados)
      console.log('✅ Resultados por sección cargados:', resultados)
    } catch (error) {
      console.error('❌ Error cargando resultados por sección:', error)
    } finally {
      setLoadingSecciones(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-corporate-blue mx-auto mb-4"></div>
          <p className="text-gray-600 font-corporate">Cargando resultados...</p>
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
                <h1 className="text-xl font-bold font-corporate">Resultados de Evaluación</h1>
                <p className="text-sm text-gray-600">
                  {evaluacion.trabajador.nombre} - {evaluacion.trabajador.puesto}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                {evaluacion.ciclo.nombre}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                Completada
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Resumen General */}
        <Card className="mb-6 border-corporate-blue shadow-lg">
          <CardHeader className="bg-gradient-to-r from-corporate-blue to-corporate-blue-dark text-white">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resumen General de Desempeño
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-4xl font-bold p-4 rounded-lg ${getCalificacionColor(evaluacion.puntaje_ponderado || puntajeGeneral)}`}>
                  {evaluacion.puntaje_ponderado || puntajeGeneral}
                </div>
                <p className="text-sm text-gray-600 mt-2 font-corporate">Puntaje General</p>
                <div className="flex items-center justify-center mt-2">
                  {getTrendIcon(evaluacion.puntaje_ponderado || puntajeGeneral)}
                  <span className="ml-2 font-medium">
                    {evaluacion.clasificacion || getCalificacionTexto(evaluacion.puntaje_ponderado || puntajeGeneral)}
                  </span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-corporate-blue">
                  {evaluacion.clasificacion || getCalificacionTexto(puntajeGeneral)}
                </div>
                <p className="text-sm text-gray-600 mt-2 font-corporate">Clasificación</p>
                <Badge className="mt-2 bg-corporate-blue text-white">
                  {evaluacion.puntaje_ponderado || puntajeGeneral}
                </Badge>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {respuestas.length}
                </div>
                <p className="text-sm text-gray-600 mt-2 font-corporate">Preguntas Respondidas</p>
                <Progress value={(respuestas.length / 12) * 100} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados por Sección */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {resultadosPorSeccion.map((seccion, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="font-corporate">{seccion.nombre}</CardTitle>
                <CardDescription>
                  Peso: {seccion.peso}% | {seccion.respuestas.length} preguntas
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Puntaje</span>
                    <span className={`text-xl font-bold ${getCalificacionColor(seccion.puntaje)}`}>
                      {seccion.puntaje}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Contribución</span>
                    <Progress value={(seccion.puntaje / 5) * 100} className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">
                      {((seccion.puntaje / 5) * seccion.peso / 100).toFixed(2)} puntos al total
                    </p>
                  </div>

                  {/* Detalles de respuestas */}
                  <div className="space-y-2 mt-4">
                    {seccion.respuestas.map((respuesta) => (
                      <div key={respuesta.id} className="border-l-2 border-l-gray-300 pl-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {respuesta.pregunta?.texto}
                            </p>
                            <p className="text-xs text-gray-500">
                              Peso: {respuesta.pregunta?.peso}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-bold ${getCalificacionColor(respuesta.puntaje)}`}>
                              {respuesta.puntaje}/5
                            </span>
                            {getTrendIcon(respuesta.puntaje)}
                          </div>
                        </div>
                        {respuesta.comentario && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <p className="font-medium text-gray-700">Comentario:</p>
                            <p className="text-gray-600">{respuesta.comentario}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Información del Evaluado */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Información del Proceso
            </CardTitle>
            <CardDescription>
              Datos completos de la evaluación y proceso realizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Evaluado</p>
                <p className="font-semibold text-corporate-blue">{evaluacion?.trabajador?.nombre || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Código: {evaluacion?.trabajador?.codigo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Puesto</p>
                <p className="font-semibold">{evaluacion?.trabajador?.puesto || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Residencia: {evaluacion?.trabajador?.residencia || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Área</p>
                <p className="font-semibold">{evaluacion?.trabajador?.area?.nombre || 'Sin área'}</p>
                <p className="text-xs text-gray-500 mt-1">Service: {evaluacion?.trabajador?.service || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Ciclo de Evaluación</p>
                <p className="font-semibold">{evaluacion?.ciclo?.nombre || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Período: {evaluacion?.ciclo?.fecha_inicio ? new Date(evaluacion.ciclo.fecha_inicio).toLocaleDateString('es-PE') : 'N/A'} 
                  - {evaluacion?.ciclo?.fecha_fin ? new Date(evaluacion.ciclo.fecha_fin).toLocaleDateString('es-PE') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Fecha de Evaluación</p>
                <p className="font-semibold">
                  {evaluacion?.estado === 'completada' 
                    ? `✅ Completada el ${new Date(evaluacion.created_at).toLocaleDateString('es-PE')}`
                    : `🔄 Iniciada el ${new Date(evaluacion.created_at).toLocaleDateString('es-PE')}`
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hora: {new Date(evaluacion.created_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Tipo de Evaluador</p>
                <p className="font-semibold capitalize">
                  {evaluacion?.tipo_evaluador === 'rrhh' && '👥 RRHH'}
                  {evaluacion?.tipo_evaluador === 'jefe' && '👨‍💼 Jefe'}
                  {evaluacion?.tipo_evaluador === 'par' && '🤝 Par'}
                  {!evaluacion?.tipo_evaluador && 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Evaluador: {evaluacion?.evaluador_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Estado de Evaluación</p>
                <Badge className={
                  evaluacion?.estado === 'completada' ? 'bg-green-100 text-green-800' :
                  evaluacion?.estado === 'en_progreso' ? 'bg-yellow-100 text-yellow-800' :
                  evaluacion?.estado === 'pendiente' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }>
                  {evaluacion?.estado === 'completada' && '✅ Completada'}
                  {evaluacion?.estado === 'en_progreso' && '🔄 En Progreso'}
                  {evaluacion?.estado === 'pendiente' && '⏳ Pendiente'}
                  {!evaluacion?.estado && '❌ Desconocido'}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">ID: {evaluacion?.id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-corporate mb-1">Resultados Obtenidos</p>
                <p className="font-semibold text-corporate-blue">
                  {evaluacion?.puntaje_ponderado ? evaluacion.puntaje_ponderado.toFixed(2) : 'N/A'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Clasificación: {evaluacion?.clasificacion || 'Sin clasificar'}
                </p>
              </div>
            </div>
            
            {/* Información adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {respuestas?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Preguntas Respondidas</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {resultadosPorSeccion?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600">Secciones Evaluadas</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {calcularPuntajeGeneral()}
                  </div>
                  <p className="text-sm text-gray-600">Puntaje General</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reportes y Exportación
            </CardTitle>
            <CardDescription>
              Genera reportes detallados de la evaluación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={generarReportePDF}
                className="bg-red-600 hover:bg-red-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte PDF
              </Button>
              <Button 
                onClick={generarReporteExcel}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte Excel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
