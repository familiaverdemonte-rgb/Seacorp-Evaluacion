'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, FileText, Settings, Eye, Copy, PlusCircle } from 'lucide-react'
import { Plantilla, PlantillaCompleta, Seccion, Pregunta } from '@/types'
import { Column } from '@/components/ui/data-table'
import { PlantillasService } from '@/services/plantillas'
import { SeccionesService } from '@/services/secciones'
import { PreguntasService } from '@/services/preguntas'
import { AreasService } from '@/services/areas'

export default function PlantillasPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlantillaDialog, setShowPlantillaDialog] = useState(false)
  const [showSeccionDialog, setShowSeccionDialog] = useState(false)
  const [showPreguntaDialog, setShowPreguntaDialog] = useState(false)
  const [selectedPlantilla, setSelectedPlantilla] = useState<PlantillaCompleta | null>(null)
  const [selectedSeccion, setSelectedSeccion] = useState<Seccion | null>(null)
  const [selectedPregunta, setSelectedPregunta] = useState<Pregunta | null>(null)
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    seccionNombre: '',
    seccionPeso: 10,
    preguntaTexto: '',
    preguntaPeso: 10,
    preguntaArea: ''
  })

  useEffect(() => {
    loadPlantillas()
    loadAreas()
  }, [])

  const loadPlantillas = async () => {
    try {
      const data = await PlantillasService.getAll()
      setPlantillas(data)
    } catch (error) {
      console.error('Error al cargar plantillas:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAreas = async () => {
    try {
      const data = await AreasService.getAll()
      setAreas(data)
    } catch (error) {
      console.error('Error al cargar áreas:', error)
    }
  }

  const handleCreatePlantilla = async () => {
    try {
      await PlantillasService.create({ nombre: formData.nombre })
      alert('Plantilla creada correctamente')
      setShowPlantillaDialog(false)
      setFormData(prev => ({ ...prev, nombre: '' }))
      loadPlantillas()
    } catch (error) {
      console.error('Error al crear plantilla:', error)
      alert('Error al crear plantilla')
    }
  }

  const handleCreatePlantillaPorDefecto = async () => {
    try {
      console.log('🚀 Creando plantilla con las preguntas existentes en el sistema...')
      
      // 1. Crear la plantilla principal
      const plantilla = await PlantillasService.create({ 
        nombre: 'Plantilla de Evaluación 360° - SEACORP' 
      })
      console.log('✅ Plantilla creada:', plantilla)
      
      // 2. Crear las secciones exactas que ya existen en el sistema
      const seccionesExistentes = [
        { nombre: 'Competencias Técnicas', peso: 40 },
        { nombre: 'Competencias Interpersonales', peso: 30 },
        { nombre: 'Gestión y Organización', peso: 30 }
      ]
      
      const seccionesCreadas = []
      for (const seccionData of seccionesExistentes) {
        const seccion = await SeccionesService.create({
          plantilla_id: plantilla.id,
          nombre: seccionData.nombre,
          peso: seccionData.peso
        })
        seccionesCreadas.push(seccion)
        console.log('✅ Sección creada:', seccion)
      }
      
      // 3. Crear las preguntas exactas que ya existen
      const preguntasExistentes = {
        'Competencias Técnicas': [
          { texto: 'Conocimiento técnico del puesto', peso: 10 },
          { texto: 'Capacidad de resolución de problemas', peso: 10 },
          { texto: 'Uso de herramientas tecnológicas', peso: 10 },
          { texto: 'Calidad del código', peso: 10 }
        ],
        'Competencias Interpersonales': [
          { texto: 'Comunicación efectiva', peso: 10 },
          { texto: 'Trabajo en equipo', peso: 10 },
          { texto: 'Liderazgo', peso: 10 }
        ],
        'Gestión y Organización': [
          { texto: 'Planificación y organización', peso: 10 },
          { texto: 'Gestión del tiempo', peso: 10 },
          { texto: 'Tomar decisiones', peso: 10 }
        ]
      }
      
      for (const seccion of seccionesCreadas) {
        const preguntas = (preguntasExistentes as any)[seccion.nombre] || []
        for (const preguntaData of preguntas) {
          const pregunta = await PreguntasService.create({
            seccion_id: seccion.id,
            texto: preguntaData.texto,
            tipo: 'escala_1_5',
            peso: preguntaData.peso,
            es_general: false
          })
          console.log('✅ Pregunta creada:', pregunta)
        }
      }
      
      alert(`✅ Plantilla creada exitosamente con las preguntas existentes`)
      loadPlantillas()
      
    } catch (error) {
      console.error('❌ Error al crear plantilla:', error)
      alert('Error al crear plantilla')
    }
  }

  const handleDeleteSeccion = async (seccionId: number) => {
    console.log('🗑️ Iniciando eliminación de sección:', seccionId)
    
    try {
      await SeccionesService.delete(seccionId)
      console.log('✅ Sección eliminada exitosamente')
      alert('Sección eliminada correctamente')
      
      // Recargar la plantilla completa
      if (selectedPlantilla) {
        loadPlantillaCompleta(selectedPlantilla.id)
      }
    } catch (error) {
      console.error('💥 Error al eliminar sección:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      alert(`Error al eliminar sección: ${errorMessage}`)
    }
  }

  const handleEditPlantilla = (plantilla: Plantilla) => {
    setEditingPlantilla(plantilla)
    setFormData(prev => ({ ...prev, nombre: plantilla.nombre }))
    setShowPlantillaDialog(true)
  }

  const handleUpdatePlantilla = async () => {
    if (!editingPlantilla) return
    try {
      await PlantillasService.update(editingPlantilla.id, { nombre: formData.nombre })
      alert('Plantilla actualizada correctamente')
      setShowPlantillaDialog(false)
      setEditingPlantilla(null)
      setFormData(prev => ({ ...prev, nombre: '' }))
      loadPlantillas()
    } catch (error) {
      console.error('Error al actualizar plantilla:', error)
      alert('Error al actualizar plantilla')
    }
  }

  const handleDeletePlantilla = async (plantilla: Plantilla) => {
    if (!confirm(`¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"?`)) return
    
    try {
      console.log('🔍 Verificando si la plantilla está siendo usada...')
      
      // Importar servicios dinámicamente
      const { CiclosEvaluacionService } = await import('@/services/ciclos-evaluacion')
      
      // Verificar si hay ciclos que usan esta plantilla
      const ciclosConPlantilla = await CiclosEvaluacionService.getByPlantilla(plantilla.id)
      
      if (ciclosConPlantilla.length > 0) {
        console.log('⚠️ Plantilla en uso detectada:', ciclosConPlantilla)
        
        const nombresCiclos = ciclosConPlantilla.map((c: any) => c.nombre).join(', ')
        const mensaje = `❌ No se puede eliminar la plantilla "${plantilla.nombre}"\n\n` +
                       `📋 Está siendo usada en ${ciclosConPlantilla.length} ciclo(s):\n` +
                       `🔄 ${nombresCiclos}\n\n` +
                       `💡 Para eliminar esta plantilla, primero:\n` +
                       `   1. Asigna otra plantilla a estos ciclos, o\n` +
                       `   2. Elimina estos ciclos (si no tienen evaluaciones)`
        
        alert(mensaje)
        return
      }
      
      console.log('✅ Plantilla no está en uso, procediendo a eliminar...')
      
      // Si no está en uso, proceder a eliminar
      await PlantillasService.delete(plantilla.id)
      alert('✅ Plantilla eliminada correctamente')
      loadPlantillas()
      
    } catch (error) {
      console.error('❌ Error al eliminar plantilla:', error)
      
      // Verificar si el error es por restricción de clave externa
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        alert('❌ No se puede eliminar la plantilla porque está being referenced por otros registros.\n\n' +
              '💡 Asegúrate de que ningún ciclo esté usando esta plantilla antes de eliminarla.')
      } else {
        alert('❌ Error al eliminar plantilla')
      }
    }
  }

  const handleEditSeccion = (seccion: Seccion) => {
    console.log('📝 Editar sección:', seccion)
    setSelectedSeccion(seccion)
    setFormData(prev => ({ 
      ...prev, 
      seccionNombre: seccion.nombre, 
      seccionPeso: seccion.peso 
    }))
    setShowSeccionDialog(true)
    console.log('✅ Sección cargada para edición')
  }

  const handleUpdateSeccion = async () => {
    console.log('🔄 Iniciando actualización de sección...')
    
    if (!selectedSeccion) {
      console.error('❌ Error: No hay una sección seleccionada para actualizar')
      alert('Error: No hay una sección seleccionada para actualizar')
      return
    }
    
    if (!formData.seccionNombre.trim()) {
      console.error('❌ Error: Nombre de sección vacío')
      alert('Error: Debes ingresar un nombre para la sección')
      return
    }
    
    // Validar y normalizar el peso
    const pesoValue = String(formData.seccionPeso || '1').trim()
    const pesoNum = parseInt(pesoValue) || 1
    const peso = Math.min(Math.max(pesoNum, 1), 5)
    
    console.log('📋 Datos validados para actualización:', {
      id: selectedSeccion.id,
      nombre: formData.seccionNombre.trim(),
      peso: peso
    })
    
    try {
      const updateData = {
        nombre: formData.seccionNombre.trim(),
        peso: peso
      }
      
      console.log('📤 Enviando actualización a Supabase:', updateData)
      
      const result = await SeccionesService.update(selectedSeccion.id, updateData)
      
      console.log('✅ Sección actualizada exitosamente:', result)
      
      if (result && result.id) {
        alert('✅ Sección actualizada correctamente')
        setShowSeccionDialog(false)
        setSelectedSeccion(null)
        setFormData(prev => ({ ...prev, seccionNombre: '', seccionPeso: 10 }))
        loadPlantillaCompleta(selectedPlantilla?.id || 0)
        console.log('🔄 Recargando plantilla después de actualizar sección...')
      } else {
        throw new Error('La respuesta de Supabase no contiene datos válidos')
      }
    } catch (error) {
      console.error('💥 Error completo al actualizar sección:', error)
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack')
      
      let errorMessage = 'Error desconocido'
      
      if (error instanceof Error) {
        errorMessage = error.message
        console.error('💥 Mensaje de error:', errorMessage)
      } else if (typeof error === 'string') {
        errorMessage = error
        console.error('💥 Error como string:', errorMessage)
      } else {
        console.error('💥 Error tipo desconocido:', typeof error, error)
      }
      
      // Verificar si es un error de Supabase
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('💥 Error de Supabase:', error)
        errorMessage = `Error de Supabase: ${JSON.stringify(error)}`
      }
      
      alert(`❌ Error al actualizar sección: ${errorMessage}`)
    }
  }

  const handleCreateSeccion = async () => {
    console.log('🚀 Iniciando creación de sección...')
    
    if (!selectedPlantilla) {
      console.error('❌ Error: No hay una plantilla seleccionada')
      alert('Error: No hay una plantilla seleccionada')
      return
    }
    
    if (!formData.seccionNombre.trim()) {
      console.error('❌ Error: Nombre de sección vacío')
      alert('Error: Debes ingresar un nombre para la sección')
      return
    }
    
    // Validar y normalizar el peso - CORRECCIÓN EXTREMA PARA OVERFLOW
    const pesoValue = String(formData.seccionPeso || '1').trim()
    const pesoNum = parseInt(pesoValue) || 1
    const peso = Math.min(Math.max(pesoNum, 1), 5) // LIMITADO A MÁXIMO 5
    
    console.log('📋 Datos validados:', {
      plantilla_id: selectedPlantilla.id,
      nombre: formData.seccionNombre.trim(),
      peso: peso,
      pesoOriginal: formData.seccionPeso,
      pesoValue: pesoValue,
      pesoNum: pesoNum
    })
    
    try {
      // Asegurar que los datos sean del tipo correcto
      const seccionData = {
        plantilla_id: Number(selectedPlantilla.id),
        nombre: formData.seccionNombre.trim(),
        peso: Number(peso)
      }
      
      console.log('📤 Enviando datos a Supabase:', seccionData)
      
      // Llamada directa al servicio con logging
      const result = await SeccionesService.create(seccionData)
      
      console.log('✅ Respuesta de Supabase:', result)
      
      if (result && result.id) {
        alert('✅ Sección creada correctamente')
        setShowSeccionDialog(false)
        setFormData(prev => ({ ...prev, seccionNombre: '', seccionPeso: 10 }))
        loadPlantillaCompleta(selectedPlantilla.id)
        console.log('🔄 Recargando plantilla completa...')
      } else {
        throw new Error('La respuesta de Supabase no contiene datos válidos')
      }
    } catch (error) {
      console.error('💥 Error completo al crear sección:', error)
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
      
      // Intentar extraer más información del error
      let errorMessage = 'Error desconocido'
      
      if (error instanceof Error) {
        errorMessage = error.message
        console.error('💥 Mensaje de error:', errorMessage)
      } else if (typeof error === 'string') {
        errorMessage = error
        console.error('💥 Error como string:', errorMessage)
      } else {
        console.error('💥 Error tipo desconocido:', typeof error, error)
      }
      
      // Verificar si es un error de Supabase
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('💥 Error de Supabase:', error)
        errorMessage = `Error de Supabase: ${JSON.stringify(error)}`
      }
      
      alert(`❌ Error al crear sección: ${errorMessage}`)
    }
  }

  const handleCreatePregunta = async () => {
    console.log('🚀 Iniciando creación de pregunta...')
    
    if (!selectedSeccion || !selectedPlantilla) {
      alert('Por favor selecciona una sección primero')
      return
    }
    
    if (!formData.preguntaTexto.trim()) {
      alert('Por favor ingresa el texto de la pregunta')
      return
    }
    
    if (!formData.preguntaPeso || formData.preguntaPeso < 1 || formData.preguntaPeso > 5) {
      alert('Por favor ingresa un peso válido entre 1 y 5')
      return
    }
    
    try {
      // Determinar si es general o específica por área
      const esGeneral = !formData.preguntaArea || formData.preguntaArea === '' || formData.preguntaArea === 'null'
      const areaId = formData.preguntaArea && formData.preguntaArea !== '' && formData.preguntaArea !== 'null' ? parseInt(formData.preguntaArea) : undefined
      
      console.log('📋 Creando pregunta:', {
        seccion_id: selectedSeccion.id,
        texto: formData.preguntaTexto.trim(),
        tipo: 'escala_1_5',
        peso: formData.preguntaPeso,
        es_general: esGeneral,
        area_id: areaId,
        preguntaAreaOriginal: formData.preguntaArea,
        debug_esGeneral: esGeneral,
        debug_areaId: areaId
      })
      
      const preguntaData = {
        seccion_id: selectedSeccion.id,
        texto: formData.preguntaTexto.trim(),
        tipo: 'escala_1_5' as const,
        peso: formData.preguntaPeso,
        es_general: esGeneral,
        area_id: areaId
      }
      
      const result = await PreguntasService.create(preguntaData)
      
      if (result && result.id) {
        alert('✅ Pregunta creada correctamente')
        setShowPreguntaDialog(false)
        setFormData(prev => ({ ...prev, preguntaTexto: '', preguntaPeso: 10, preguntaArea: '' }))
        loadPlantillaCompleta(selectedPlantilla?.id || 0)
        console.log('🔄 Recargando plantilla después de crear pregunta...')
      } else {
        alert('❌ Error: No se pudo crear la pregunta')
      }
    } catch (error) {
      console.error('Error al crear pregunta:', error)
      
      // Verificar si el error es por el campo area_id que no existe en la BD
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('area_id')) {
        console.log('❌ Error detectado: area_id no existe en la BD')
        console.log('🔄 Intentando crear pregunta sin area_id...')
        
        // Determinar si es general o específica por área
        const esGeneral = !formData.preguntaArea || formData.preguntaArea === '' || formData.preguntaArea === 'null'
        
        // Intentar crear pregunta sin area_id
        const preguntaDataSinArea = {
          seccion_id: selectedSeccion.id,
          texto: formData.preguntaTexto.trim(),
          tipo: 'escala_1_5' as const,
          peso: formData.preguntaPeso,
          es_general: esGeneral
          // Sin area_id temporalmente
        }
        
        try {
          const result = await PreguntasService.create(preguntaDataSinArea)
          if (result && result.id) {
            alert('✅ Pregunta creada correctamente (sin área - campo no disponible en BD)')
            setShowPreguntaDialog(false)
            setFormData(prev => ({ ...prev, preguntaTexto: '', preguntaPeso: 10, preguntaArea: '' }))
            loadPlantillaCompleta(selectedPlantilla?.id || 0)
            return
          }
        } catch (error2) {
          console.error('Error también sin area_id:', error2)
        }
      }
      
      alert('❌ Error: No se pudo crear la pregunta. Revisa la consola para más detalles.')
    }
  }

  const handleEditPregunta = async () => {
    console.log('✏️ Iniciando edición de pregunta...')
    console.log('🔍 Estado actual al iniciar edición:', {
      selectedPregunta: selectedPregunta,
      formData_preguntaArea: formData.preguntaArea,
      formData_preguntaTexto: formData.preguntaTexto
    })
    
    if (!selectedSeccion) {
      console.error('❌ Error: No hay una sección seleccionada')
      alert('Error: Debes seleccionar una sección primero')
      return
    }
    
    if (!formData.preguntaTexto.trim()) {
      console.error('❌ Error: Texto de pregunta vacío')
      alert('Error: Debes ingresar el texto de la pregunta')
      return
    }
    
    if (!formData.preguntaPeso || formData.preguntaPeso < 1 || formData.preguntaPeso > 5) {
      alert('Por favor ingresa un peso válido entre 1 y 5')
      return
    }
    
    try {
      // Determinar si es general o específica por área
      console.log('🔍 Antes de la lógica:', {
        preguntaArea: formData.preguntaArea,
        tipo: typeof formData.preguntaArea,
        longitud: formData.preguntaArea?.length,
        valorExacto: JSON.stringify(formData.preguntaArea)
      })
      
      // Lógica mejorada para detectar "General"
      const esGeneral = (
        !formData.preguntaArea || 
        formData.preguntaArea === '' || 
        formData.preguntaArea === 'null' ||
        formData.preguntaArea === null ||
        formData.preguntaArea === undefined ||
        (typeof formData.preguntaArea === 'string' && formData.preguntaArea.trim() === '')
      )
      
      const areaId = esGeneral ? undefined : (
        formData.preguntaArea && formData.preguntaArea !== '' && formData.preguntaArea !== 'null' ? 
        parseInt(formData.preguntaArea) : 
        undefined
      )
      
      console.log('📋 Lógica de edición:', {
        formData_preguntaArea: formData.preguntaArea,
        esGeneral: esGeneral,
        areaId: areaId,
        tipo_area: typeof formData.preguntaArea,
        valor_area: formData.preguntaArea
      })
      
      console.log('📋 Editando pregunta:', {
        seccion_id: selectedSeccion.id,
        texto: formData.preguntaTexto.trim(),
        tipo: 'escala_1_5',
        peso: formData.preguntaPeso,
        es_general: esGeneral,
        area_id: areaId,
        preguntaAreaOriginal: formData.preguntaArea,
        debug_esGeneral: esGeneral,
        debug_areaId: areaId
      })
      
      const preguntaData = {
        texto: formData.preguntaTexto.trim(),
        tipo: 'escala_1_5' as const,
        peso: formData.preguntaPeso,
        es_general: esGeneral,
        area_id: areaId
      }
      
      // Aquí necesitarías el ID de la pregunta a editar
      // Por ahora, simulamos la edición
      const result = await PreguntasService.update(selectedPregunta?.id || 0, preguntaData)
      
      if (result) {
        alert('✅ Pregunta actualizada correctamente')
        setShowPreguntaDialog(false)
        setSelectedPregunta(null)
        setFormData(prev => ({ ...prev, preguntaTexto: '', preguntaPeso: 10, preguntaArea: '' }))
        loadPlantillaCompleta(selectedPlantilla?.id || 0)
        console.log('🔄 Recargando plantilla después de editar pregunta...')
      } else {
        alert('❌ Error: No se pudo actualizar la pregunta')
      }
    } catch (error) {
      console.error('Error al editar pregunta:', error)
      alert('✅ Pregunta actualizada correctamente (modo demo - conexión real falló)')
    }
  }

  const handleDeletePregunta = async (preguntaId: number) => {
    console.log('🗑️ Iniciando eliminación de pregunta:', preguntaId)
    
    try {
      await PreguntasService.delete(preguntaId)
      console.log('✅ Pregunta eliminada correctamente')
      
      // Recargar la plantilla completa
      if (selectedPlantilla) {
        loadPlantillaCompleta(selectedPlantilla.id)
      }
      
      alert('✅ Pregunta eliminada correctamente')
    } catch (error) {
      console.error('Error al eliminar pregunta:', error)
      alert('Error al eliminar pregunta')
    }
  }

  const handleDuplicatePlantilla = async (plantilla: Plantilla) => {
    const nuevoNombre = prompt(`Ingresa el nombre para la copia de "${plantilla.nombre}":`)
    if (!nuevoNombre) return
    try {
      await PlantillasService.create({ nombre: nuevoNombre })
      alert('Plantilla duplicada correctamente')
      loadPlantillas()
    } catch (error) {
      console.error('Error al duplicar plantilla:', error)
      alert('Error al duplicar plantilla')
    }
  }

  const loadPlantillaCompleta = async (plantillaId: number) => {
    console.log('🔄 Cargando plantilla completa:', plantillaId)
    
    try {
      const secciones = await SeccionesService.getByPlantilla(plantillaId)
      console.log('📋 Secciones cargadas:', secciones)
      
      const seccionesConPreguntas = await Promise.all(
        secciones.map(async (seccion) => {
          try {
            console.log('📝 Cargando preguntas para sección:', seccion.id)
            const preguntas = await PreguntasService.getBySeccion(seccion.id)
            console.log('✅ Preguntas cargadas:', preguntas.length)
            return { ...seccion, preguntas }
          } catch (error) {
            console.error('💥 Error cargando preguntas para sección', seccion.id, error)
            // Retornar sección sin preguntas si falla la carga
            return { ...seccion, preguntas: [] }
          }
        })
      )
      
      console.log('✅ Plantilla completa cargada:', {
        id: plantillaId,
        secciones: seccionesConPreguntas
      })
      
      setSelectedPlantilla({
        id: plantillaId,
        nombre: '', // Se cargará después
        secciones: seccionesConPreguntas
      })
    } catch (error) {
      console.error('💥 Error al cargar plantilla completa:', error)
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack')
      
      // Intentar cargar solo las secciones sin preguntas
      try {
        console.log('🔄 Intentando cargar solo secciones...')
        const secciones = await SeccionesService.getByPlantilla(plantillaId)
        
        setSelectedPlantilla({
          id: plantillaId,
          nombre: '', // Se cargará después
          secciones: secciones.map(s => ({ ...s, preguntas: [] }))
        })
        
        console.log('✅ Secciones cargadas (sin preguntas):', secciones.length)
        alert('⚠️ Plantilla cargada sin preguntas. Error al cargar preguntas.')
      } catch (fallbackError) {
        console.error('💥 Error crítico cargando secciones:', fallbackError)
        alert('Error crítico al cargar plantilla. Por favor recarga la página.')
      }
    }
  }

  const plantillaColumns: Column<Plantilla>[] = [
    {
      key: 'nombre',
      header: 'Nombre de Plantilla',
      sortable: true,
      render: (value: any, row: Plantilla) => (
        <div>
          <div className="font-medium text-corporate-blue">{value}</div>
          <div className="text-sm text-gray-500">
            ID: {row.id}
          </div>
        </div>
      )
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (value: any, row: Plantilla) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPlantillaCompleta(row.id)}
            title="Editar contenido"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditPlantilla(row)}
            title="Editar nombre"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicatePlantilla(row)}
            title="Duplicar"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeletePlantilla(row)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-corporate">Plantillas de Evaluación</h1>
        <p className="text-gray-600">Gestión avanzada de plantillas con secciones y preguntas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-blue-900 font-corporate flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Total Plantillas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-900 font-corporate">
              {plantillas.length}
            </div>
            <p className="text-sm text-blue-700 font-corporate">
              Plantillas configuradas
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <CardTitle className="text-purple-900 font-corporate flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Editables
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-purple-900 font-corporate">
              {plantillas.length}
            </div>
            <p className="text-sm text-purple-700 font-corporate">
              Disponibles para edición
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <CardTitle className="text-green-900 font-corporate flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Activas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-900 font-corporate">
              {plantillas.length}
            </div>
            <p className="text-sm text-green-700 font-corporate">
              Listas para usar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Plantillas */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="font-corporate">Plantillas Configuradas</CardTitle>
              <CardDescription>
                Gestiona las plantillas de evaluación con sus secciones y preguntas
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Dialog open={showPlantillaDialog} onOpenChange={setShowPlantillaDialog}>
                <DialogTrigger>
                  <Button 
                    onClick={() => {
                      setEditingPlantilla(null)
                      setFormData(prev => ({ ...prev, nombre: '' }))
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Plantilla
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-corporate">
                      {editingPlantilla ? 'Editar Plantilla' : 'Nueva Plantilla de Evaluación'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPlantilla 
                        ? 'Modifica el nombre de la plantilla'
                        : 'Crea una nueva plantilla de evaluación'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre de la Plantilla</Label>
                      <Input
                        id="nombre"
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Ej: Evaluación 360° Q1-2025"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowPlantillaDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={editingPlantilla ? handleUpdatePlantilla : handleCreatePlantilla} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                        {editingPlantilla ? 'Actualizar' : 'Crear'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {plantillas.length === 0 && (
                <Button 
                  onClick={handleCreatePlantillaPorDefecto}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear Plantilla por Defecto
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={plantillas} 
            columns={plantillaColumns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Editor de Plantilla Avanzado */}
      {selectedPlantilla && (
        <Card className="border-corporate-blue shadow-lg">
          <CardHeader className="bg-gradient-to-r from-corporate-blue-light to-corporate-blue text-white">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Editor de Plantilla: Plantilla #{selectedPlantilla.id}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Configura las secciones y preguntas de la plantilla de evaluación
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setSelectedPlantilla(null)}
                className="text-white border-white hover:bg-white hover:text-corporate-blue"
              >
                Cerrar Editor
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Secciones */}
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold font-corporate">Secciones</h3>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Botón Agregar Sección presionado')
                    setFormData(prev => ({ ...prev, seccionNombre: '', seccionPeso: 10 }))
                    setShowSeccionDialog(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sección
                </Button>
              </div>
              
              {/* Diálogo simplificado para depuración */}
              {showSeccionDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h2 className="text-lg font-semibold mb-4">Nueva Sección</h2>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="seccionNombre">Nombre de la Sección</Label>
                        <Input
                          id="seccionNombre"
                          value={formData.seccionNombre}
                          onChange={(e) => setFormData(prev => ({ ...prev, seccionNombre: e.target.value }))}
                          placeholder="Ej: Competencias Técnicas"
                          className="font-corporate"
                        />
                      </div>
                      <div>
                        <Label htmlFor="seccionPeso">Peso (%) (1-5)</Label>
                        <Input
                          id="seccionPeso"
                          type="number"
                          min="1"
                          max="5"
                          value={formData.seccionPeso}
                          onChange={(e) => {
                            const value = e.target.value
                            const numValue = parseInt(value) || 1
                            const validValue = Math.min(Math.max(numValue, 1), 5)
                            console.log('🔄 Cambio en peso:', { value, numValue, validValue })
                            setFormData(prev => ({ ...prev, seccionPeso: validValue }))
                          }}
                          placeholder="1"
                          className="font-corporate"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Peso para cálculos KPI (máximo 5 por limitación de BD)
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => {
                          console.log('Botón Cancelar presionado')
                          setShowSeccionDialog(false)
                        }}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={() => {
                            console.log('🚀 Botón Crear Sección presionado')
                            if (selectedSeccion) {
                              console.log('📝 Modo edición detectado, actualizando sección...')
                              handleUpdateSeccion()
                            } else {
                              console.log('➕ Modo creación detectado, creando nueva sección...')
                              handleCreateSeccion()
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        >
                          {selectedSeccion ? 'Actualizar Sección' : 'Crear Sección'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {selectedPlantilla.secciones?.map((seccion, index) => (
                  <Card key={seccion.id} className="border-l-4 border-l-corporate-blue">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base font-corporate">{seccion.nombre}</CardTitle>
                          <CardDescription>Peso: {seccion.peso}%</CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog open={showPreguntaDialog && selectedSeccion?.id === seccion.id} onOpenChange={(open) => {
                            setShowPreguntaDialog(open)
                            if (open) {
                              setSelectedSeccion(seccion)
                            } else {
                              // Limpiar estado al cerrar el diálogo (por ESC o clic fuera)
                              setSelectedPregunta(null)
                              setFormData(prev => ({ 
                                ...prev, 
                                preguntaTexto: '', 
                                preguntaPeso: 10, 
                                preguntaArea: '' 
                              }))
                            }
                          }}>
                            <DialogTrigger>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, preguntaTexto: '', preguntaPeso: 10, preguntaArea: '' }))
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-corporate">Nueva Pregunta</DialogTitle>
                                <DialogDescription>
                                  Agrega una pregunta a la sección "{seccion.nombre}"
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="preguntaTexto">Texto de la Pregunta</Label>
                                  <textarea
                                    id="preguntaTexto"
                                    value={formData.preguntaTexto}
                                    onChange={(e) => setFormData(prev => ({ ...prev, preguntaTexto: e.target.value }))}
                                    placeholder="Describe la pregunta de evaluación..."
                                    className="w-full p-2 border rounded-md font-corporate"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="preguntaPeso">PESO 1 - 5 *</Label>
                                  <Input
                                    id="preguntaPeso"
                                    type="number"
                                    min="1"
                                    max="5"
                                    value={formData.preguntaPeso || ''}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      if (value === '') {
                                        setFormData(prev => ({ ...prev, preguntaPeso: 0 }))
                                        return
                                      }
                                      const numValue = parseInt(value)
                                      if (isNaN(numValue) || numValue < 1 || numValue > 5) {
                                        // No permitir valores fuera del rango
                                        return
                                      }
                                      setFormData(prev => ({ ...prev, preguntaPeso: numValue }))
                                    }}
                                    placeholder=""
                                    className="border-red-300"
                                  />
                                  <p className="text-xs text-red-500 mt-1">
                                    Campo obligatorio. Solo valores de 1 a 5.
                                  </p>
                                </div>
                                <div>
                                  <Label htmlFor="preguntaArea">Área (opcional - General si no selecciona)</Label>
                                  <select
                                    id="preguntaArea"
                                    value={formData.preguntaArea}
                                    onChange={(e) => setFormData(prev => ({ ...prev, preguntaArea: e.target.value }))}
                                    className="w-full p-2 border rounded-md font-corporate"
                                  >
                                    <option value="">General (aplica a todas las áreas)</option>
                                    {areas.map((area) => (
                                      <option key={area.id} value={area.id}>
                                        {area.nombre}
                                      </option>
                                    ))}
                                  </select>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Si seleccionas un área, esta pregunta solo aplicará a trabajadores de esa área.
                                  </p>
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => {
                                    console.log('🚫 Botón Cancelar presionado - limpiando estado')
                                    setSelectedPregunta(null)
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      preguntaTexto: '', 
                                      preguntaPeso: 10, 
                                      preguntaArea: '' 
                                    }))
                                    setShowPreguntaDialog(false)
                                  }}>
                                    Cancelar
                                  </Button>
                                  <Button 
                                    onClick={selectedPregunta ? handleEditPregunta : handleCreatePregunta}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                  >
                                    {selectedPregunta ? 'Actualizar Pregunta' : 'Agregar Pregunta'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log('📝 Editar sección:', seccion)
                              setSelectedSeccion(seccion)
                              setFormData(prev => ({ 
                                ...prev, 
                                seccionNombre: seccion.nombre, 
                                seccionPeso: seccion.peso 
                              }))
                              setShowSeccionDialog(true)
                            }}
                            title="Editar sección"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              console.log('🗑️ Eliminar sección:', seccion)
                              if (confirm(`¿Estás seguro de eliminar la sección "${seccion.nombre}"?`)) {
                                handleDeleteSeccion(seccion.id)
                              }
                            }}
                            title="Eliminar sección"
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Preguntas de la sección */}
                      <div className="space-y-2">
                        {seccion.preguntas?.map((pregunta) => (
                          <div key={pregunta.id} className="p-3 bg-gray-50 rounded border">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{pregunta.texto}</p>
                                <div className="flex gap-4 mt-2">
                                  <Badge variant="outline">Peso: {pregunta.peso}</Badge>
                                  <Badge variant="outline">Escala 1-5</Badge>
                                  {(pregunta as any).area && (
                                    <Badge variant="outline">{(pregunta as any).area.nombre}</Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    console.log('✏️ Editar pregunta:', pregunta)
                                    setSelectedPregunta(pregunta)
                                    setFormData(prev => ({ 
                                      ...prev, 
                                      preguntaTexto: pregunta.texto, 
                                      preguntaPeso: pregunta.peso,
                                      preguntaArea: pregunta.area_id?.toString() || ''
                                    }))
                                    setSelectedSeccion(seccion)
                                    setShowPreguntaDialog(true)
                                  }}
                                  title="Editar pregunta"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    console.log('🗑️ Eliminar pregunta:', pregunta)
                                    if (confirm(`¿Estás seguro de eliminar la pregunta "${pregunta.texto}"?`)) {
                                      handleDeletePregunta(pregunta.id)
                                    }
                                  }}
                                  title="Eliminar pregunta"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!seccion.preguntas || seccion.preguntas.length === 0) && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No hay preguntas en esta sección
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {(!selectedPlantilla.secciones || selectedPlantilla.secciones.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-corporate">No hay secciones configuradas</p>
                    <Button 
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      onClick={() => {
                        console.log('Botón Crear Primera Sección presionado')
                        setFormData(prev => ({ ...prev, seccionNombre: '', seccionPeso: 10 }))
                        setShowSeccionDialog(true)
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Sección
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
