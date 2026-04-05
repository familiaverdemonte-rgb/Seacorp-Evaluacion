'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar, Edit, Trash2, Users, CheckCircle, Clock, XCircle, Eye, FileText } from 'lucide-react'
import { CicloEvaluacion } from '@/types'
import { Column } from '@/components/ui/data-table'
import { CiclosEvaluacionService } from '@/services/ciclos-evaluacion'
import { PlantillasService } from '@/services/plantillas'

export default function CiclosPage() {
  const [ciclos, setCiclos] = useState<CicloEvaluacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [showViewTrabajadoresDialog, setShowViewTrabajadoresDialog] = useState(false)
  const [editingCiclo, setEditingCiclo] = useState<CicloEvaluacion | null>(null)
  const [selectedCiclo, setSelectedCiclo] = useState<CicloEvaluacion | null>(null)
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [selectedTrabajadores, setSelectedTrabajadores] = useState<any[]>([])
  const [trabajadoresAsignados, setTrabajadoresAsignados] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [areas, setAreas] = useState<any[]>([])
  const [puestos, setPuestos] = useState<string[]>([])
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroPuesto, setFiltroPuesto] = useState('')
  const [puestosFiltradosPorArea, setPuestosFiltradosPorArea] = useState<string[]>([])
  const [plantillas, setPlantillas] = useState<any[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    plantilla_id: ''
  })

  useEffect(() => {
    loadCiclos()
    loadPlantillas()
  }, [])

  useEffect(() => {
    if (showAssignDialog && selectedCiclo) {
      loadTrabajadores()
      loadAreas()
    }
  }, [showAssignDialog, selectedCiclo])

  const loadCiclos = async () => {
    try {
      const data = await CiclosEvaluacionService.getAll()
      setCiclos(data)
    } catch (error) {
      console.error('Error loading ciclos:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPlantillas = async () => {
    try {
      const data = await PlantillasService.getAll()
      setPlantillas(data)
    } catch (error) {
      console.error('Error loading plantillas:', error)
    }
  }

  const loadTrabajadores = async () => {
    try {
      const { TrabajadoresService } = await import('@/services/trabajadores')
      const data = await TrabajadoresService.getAll()
      setTrabajadores(data)
      
      const puestosUnicos = [...new Set(data.map(t => t.puesto).filter(Boolean))]
      setPuestos(puestosUnicos)
    } catch (error) {
      console.error('Error loading trabajadores:', error)
    }
  }

  const loadAreas = async () => {
    try {
      const { AreasService } = await import('@/services/areas')
      const data = await AreasService.getAll()
      setAreas(data)
    } catch (error) {
      console.error('Error loading areas:', error)
    }
  }

  const loadTrabajadoresAsignados = async (cicloId: number) => {
    try {
      console.log('🔍 Cargando trabajadores asignados al ciclo:', cicloId)
      const { TrabajadoresService } = await import('@/services/trabajadores')
      const data = await TrabajadoresService.getTrabajadoresAsignadosACiclo(cicloId)
      console.log('👥 Trabajadores asignados cargados:', data)
      setTrabajadoresAsignados(data)
    } catch (error) {
      console.error('Error loading trabajadores asignados:', error)
    }
  }

  const handleCreate = async () => {
    try {
      await CiclosEvaluacionService.create({
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        estado: 'abierto',
        plantilla_id: formData.plantilla_id ? parseInt(formData.plantilla_id) : null
      })
      setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '', plantilla_id: '' })
      setShowCreateDialog(false)
      await loadCiclos()
    } catch (error) {
      console.error('Error creating ciclo:', error)
      alert('Error al crear el ciclo')
    }
  }

  const handleUpdate = async () => {
    if (!editingCiclo) return
    
    // Verificar si se está cambiando la plantilla
    const plantillaCambiada = editingCiclo.plantilla_id !== parseInt(formData.plantilla_id || '0')
    
    if (plantillaCambiada && formData.plantilla_id) {
      // Hay evaluaciones existentes?
      const { EvaluacionesService } = await import('@/services/evaluaciones')
      const evaluacionesExistentes = await EvaluacionesService.getByCiclo(editingCiclo.id)
      
      if (evaluacionesExistentes.length > 0) {
        const confirmUpdate = confirm(
          `⚠️ ESTÁS CAMBIANDO LA PLANTILLA DEL CICLO\n\n` +
          `Este ciclo tiene ${evaluacionesExistentes.length} evaluación(es) existente(s).\n\n` +
          `¿Qué deseas hacer?\n\n` +
          `✅ OK = Actualizar TODAS las evaluaciones a la nueva plantilla\n` +
          `❌ CANCELAR = Mantener evaluaciones con la plantilla original\n\n` +
          `Recomendación: Solo actualiza si las evaluaciones están pendientes o no comenzadas.`
        )
        
        if (!confirmUpdate) {
          // Usuario canceló, no hacer nada
          return
        }
        
        try {
          // Actualizar todas las evaluaciones del ciclo a la nueva plantilla
          await EvaluacionesService.actualizarPlantillaDeEvaluaciones(
            editingCiclo.id, 
            parseInt(formData.plantilla_id)
          )
          console.log(`✅ ${evaluacionesExistentes.length} evaluaciones actualizadas a la nueva plantilla`)
        } catch (error) {
          console.error('Error actualizando evaluaciones:', error)
          alert('Error al actualizar las evaluaciones existentes')
          return
        }
      }
    }
    
    try {
      await CiclosEvaluacionService.update(editingCiclo.id, {
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        plantilla_id: formData.plantilla_id ? parseInt(formData.plantilla_id) : null
      })
      
      setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '', plantilla_id: '' })
      setEditingCiclo(null)
      setShowCreateDialog(false)
      await loadCiclos()
      
      if (plantillaCambiada) {
        alert('✅ Ciclo actualizado correctamente' + (formData.plantilla_id ? ' y evaluaciones actualizadas a la nueva plantilla' : ''))
      } else {
        alert('✅ Ciclo actualizado correctamente')
      }
    } catch (error) {
      console.error('Error updating ciclo:', error)
      alert('Error al actualizar el ciclo')
    }
  }

  const handleDelete = async (ciclo: CicloEvaluacion) => {
    if (!confirm(`¿Estás seguro de eliminar el ciclo "${ciclo.nombre}"?`)) return
    
    try {
      await CiclosEvaluacionService.delete(ciclo.id)
      await loadCiclos()
      alert('Ciclo eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting ciclo:', error)
      alert('Error al eliminar el ciclo')
    }
  }

  const handleAssignTrabajadores = async (ciclo: CicloEvaluacion) => {
    console.log('🎯 Asignando trabajadores al ciclo:', ciclo)
    setSelectedCiclo(ciclo)
    setShowAssignDialog(true)
  }

  const handleViewTrabajadores = async (ciclo: CicloEvaluacion) => {
    console.log('👥 Ver trabajadores asignados al ciclo:', ciclo)
    setSelectedCiclo(ciclo)
    setShowViewTrabajadoresDialog(true)
    await loadTrabajadoresAsignados(ciclo.id)
  }

  const handleSearchTrabajadores = (query: string) => {
    setSearchQuery(query)
  }

  const handleToggleTrabajador = (trabajador: any) => {
    setSelectedTrabajadores(prev => {
      const isSelected = prev.some(t => t.id === trabajador.id)
      if (isSelected) {
        return prev.filter(t => t.id !== trabajador.id)
      } else {
        return [...prev, trabajador]
      }
    })
  }

  const handleSelectAllFiltered = () => {
    const trabajadoresFiltrados = getTrabajadoresFiltrados()
    setSelectedTrabajadores(trabajadoresFiltrados)
  }

  const handleSelectAllByArea = () => {
    if (!filtroArea) return
    
    const trabajadoresPorArea = trabajadores.filter(t => 
      t.area?.nombre === filtroArea
    )
    setSelectedTrabajadores(prev => [...prev, ...trabajadoresPorArea])
  }

  const handleSelectAllByPuesto = () => {
    if (!filtroPuesto) return
    
    const trabajadoresPorPuesto = trabajadores.filter(t => 
      t.puesto === filtroPuesto
    )
    setSelectedTrabajadores(prev => [...prev, ...trabajadoresPorPuesto])
  }

  const handleClearSelection = () => {
    setSelectedTrabajadores([])
  }

  const getTrabajadoresFiltrados = () => {
    return trabajadores.filter(trabajador => {
      const matchesSearch = !searchQuery || 
        trabajador.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trabajador.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trabajador.puesto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trabajador.area?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesArea = !filtroArea || trabajador.area?.nombre === filtroArea
      const matchesPuesto = !filtroPuesto || trabajador.puesto === filtroPuesto
      
      return matchesSearch && matchesArea && matchesPuesto
    })
  }

  const handleAssignTrabajadoresToCiclo = async () => {
    if (!selectedCiclo || selectedTrabajadores.length === 0) {
      alert('Por favor selecciona al menos un trabajador')
      return
    }
    
    try {
      const { EvaluacionesService } = await import('@/services/evaluaciones')
      
      console.log('🎯 Asignando', selectedTrabajadores.length, 'trabajadores al ciclo:', selectedCiclo.nombre)
      
      let totalCreadas = 0
      let totalYaExistian = 0
      
      for (const trabajador of selectedTrabajadores) {
        console.log(`🔍 Procesando ${trabajador.nombre} (${trabajador.codigo})`)
        
        // Verificar qué evaluaciones ya existen
        const evaluacionesExistentes = await EvaluacionesService.getByTrabajadorAndCiclo(trabajador.id, selectedCiclo.id)
        const tiposExistentes = new Set(evaluacionesExistentes.map(e => e.tipo_evaluador))
        
        console.log(`📋 Tipos existentes para ${trabajador.nombre}:`, Array.from(tiposExistentes))
        
        // Determinar qué evaluaciones crear
        const evaluacionesACrear = {
          rrhh: !tiposExistentes.has('rrhh'),
          jefe: !tiposExistentes.has('jefe'),
          par: !tiposExistentes.has('par')
        }
        
        console.log(`🎯 Evaluaciones a crear para ${trabajador.nombre}:`, evaluacionesACrear)
        
        // Solo crear si hay evaluaciones faltantes
        if (evaluacionesACrear.rrhh || evaluacionesACrear.jefe || evaluacionesACrear.par) {
          const evaluacionesCreadas = await EvaluacionesService.crearEvaluaciones360(trabajador.id, selectedCiclo.id, {
            rrhh: evaluacionesACrear.rrhh ? ['rrhh@seacorp.com'] : undefined,
            jefe: evaluacionesACrear.jefe ? ['jefe@seacorp.com'] : undefined,
            par: evaluacionesACrear.par ? ['par1@seacorp.com', 'par2@seacorp.com'] : undefined
          })
          
          totalCreadas += evaluacionesCreadas.length
          console.log(`✅ Evaluaciones creadas para ${trabajador.nombre}:`, evaluacionesCreadas)
        } else {
          totalYaExistian++
          console.log(`ℹ️ ${trabajador.nombre} ya tiene todas las evaluaciones asignadas`)
        }
      }
      
      // Mensaje detallado del resultado
      let mensaje = `✅ Proceso completado para ${selectedTrabajadores.length} trabajador(es):\n\n`
      
      if (totalCreadas > 0) {
        mensaje += `📝 ${totalCreadas} evaluación(es) creada(s)\n`
      }
      
      if (totalYaExistian > 0) {
        mensaje += `ℹ️ ${totalYaExistian} trabajador(es) ya tenían evaluaciones asignadas\n`
      }
      
      if (totalCreadas === 0 && totalYaExistian > 0) {
        mensaje += `\n🎉 Todos los trabajadores seleccionados ya tenían sus evaluaciones completas`
      } else if (totalCreadas > 0) {
        mensaje += `\n🎯 Las evaluaciones están listas para ser completadas`
      }
      
      setShowAssignDialog(false)
      setSelectedTrabajadores([])
      setSearchQuery('')
      setFiltroArea('')
      setFiltroPuesto('')
      
      // Recargar ciclos para actualizar el conteo de trabajadores asignados
      await loadCiclos()
      
      alert(mensaje)
      
    } catch (error) {
      console.error('Error asignando trabajadores:', error)
      alert('Error al asignar trabajadores al ciclo')
    }
  }

  const handleToggleEstado = async (ciclo: CicloEvaluacion) => {
    const nuevoEstado = ciclo.estado === 'abierto' ? 'cerrado' : 'abierto'
    const accion = nuevoEstado === 'abierto' ? 'abrir' : 'cerrar'
    
    if (!confirm(`¿Estás seguro de ${accion} el ciclo "${ciclo.nombre}"?`)) return
    
    try {
      await CiclosEvaluacionService.update(ciclo.id, {
        ...ciclo,
        estado: nuevoEstado
      })
      
      await loadCiclos()
      alert(`Ciclo "${ciclo.nombre}" ${nuevoEstado === 'abierto' ? 'abierto' : 'cerrado'} exitosamente`)
    } catch (error) {
      console.error('Error cambiando estado del ciclo:', error)
      alert('Error al cambiar el estado del ciclo')
    }
  }

  const handleEdit = (ciclo: CicloEvaluacion) => {
    setEditingCiclo(ciclo)
    setFormData({
      nombre: ciclo.nombre,
      fecha_inicio: ciclo.fecha_inicio,
      fecha_fin: ciclo.fecha_fin,
      plantilla_id: ciclo.plantilla_id?.toString() || ''
    })
    setShowCreateDialog(true)
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Abierto
        </Badge>
      case 'cerrado':
        return <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Cerrado
        </Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">
          {estado}
        </Badge>
    }
  }

  const getDaysRemaining = (fecha_fin: string) => {
    const today = new Date()
    const end = new Date(fecha_fin)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return <span className="text-red-600">Vencido hace {Math.abs(diffDays)} días</span>
    } else if (diffDays === 0) {
      return <span className="text-orange-600">Vence hoy</span>
    } else {
      return <span className="text-green-600">{diffDays} días restantes</span>
    }
  }

  const columns: Column<CicloEvaluacion>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true,
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      render: (value: string) => getEstadoBadge(value)
    },
    {
      key: 'plantilla_id',
      header: 'Plantilla',
      sortable: true,
      render: (value: any, row: CicloEvaluacion) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-purple-500" />
          <span className="font-medium">{row.plantilla_nombre || 'Plantilla por Defecto'}</span>
        </div>
      )
    },
    {
      key: 'fecha_fin',
      header: 'Fecha de Fin',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{new Date(value).toLocaleDateString('es-PE')}</span>
        </div>
      )
    },
    {
      key: 'trabajadores_asignados',
      header: 'Trabajadores Asignados',
      sortable: true,
      render: (value: any, row: CicloEvaluacion) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-500" />
          <span className="font-medium">{value || 0}</span>
          <span className="text-sm text-gray-500">trabajadores</span>
        </div>
      )
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (value: any, row: CicloEvaluacion) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAssignTrabajadores(row)}
            disabled={row.estado === 'cerrado'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            title="Asignar Trabajadores"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewTrabajadores(row)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
            title="Ver Trabajadores Asignados"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleEstado(row)}
            className={`${
              row.estado === 'abierto' 
                ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            } font-semibold`}
            title={row.estado === 'abierto' ? 'Cerrar ciclo' : 'Abrir ciclo'}
          >
            {row.estado === 'abierto' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row)}
            title="Editar ciclo"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row)}
            disabled={row.estado === 'abierto'}
            title={row.estado === 'abierto' ? 'No se puede eliminar un ciclo abierto' : 'Eliminar ciclo'}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const estadisticas = {
    total: ciclos.length,
    abiertos: ciclos.filter(c => c.estado === 'abierto').length,
    cerrados: ciclos.filter(c => c.estado === 'cerrado').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-corporate">Ciclos de Evaluación</h1>
        <p className="text-gray-600">Gestión de ciclos de evaluación de desempeño</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-blue-900 font-corporate flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Total de Ciclos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-blue-900 font-corporate">
              {estadisticas.total}
            </div>
            <p className="text-sm text-blue-700 font-corporate">
              Ciclos configurados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <CardTitle className="text-green-900 font-corporate flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Ciclos Abiertos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-900 font-corporate">
              {estadisticas.abiertos}
            </div>
            <p className="text-sm text-green-700 font-corporate">
              Activos para evaluaciones
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg">
            <CardTitle className="text-red-900 font-corporate flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Ciclos Cerrados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-900 font-corporate">
              {estadisticas.cerrados}
            </div>
            <p className="text-sm text-red-700 font-corporate">
              Finalizados y archivados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ciclos */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="font-corporate flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lista de Ciclos
            </span>
            <Button
              onClick={() => {
                setEditingCiclo(null)
                setFormData({ nombre: '', fecha_inicio: '', fecha_fin: '', plantilla_id: '' })
                setShowCreateDialog(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ciclo
            </Button>
          </CardTitle>
          <CardDescription>
            Administra los ciclos de evaluación de desempeño
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={ciclos} 
            columns={columns}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Diálogo de Creación/Edición */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCiclo ? 'Editar Ciclo' : 'Crear Nuevo Ciclo'}
            </DialogTitle>
            <DialogDescription>
              {editingCiclo ? 'Modifica los datos del ciclo de evaluación' : 'Crea un nuevo ciclo de evaluación'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Ciclo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                placeholder="Ej: Evaluación 2024 - Primer Semestre"
              />
            </div>
            <div>
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="plantilla_id">Plantilla</Label>
              <Select value={formData.plantilla_id || ''} onValueChange={(value) => setFormData({...formData, plantilla_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin plantilla</SelectItem>
                  {plantillas.map((plantilla: any) => (
                    <SelectItem key={plantilla.id} value={plantilla.id.toString()}>
                      {plantilla.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={editingCiclo ? handleUpdate : handleCreate}>
              {editingCiclo ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Asignación de Trabajadores */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Asignar Trabajadores al Ciclo: {selectedCiclo?.nombre}</DialogTitle>
            <DialogDescription>
              Selecciona los trabajadores que participarán en este ciclo de evaluación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
              <div>
                <Label htmlFor="search-trabajadores">Buscar Trabajadores</Label>
                <Input
                  id="search-trabajadores"
                  placeholder="Código, nombre o puesto..."
                  value={searchQuery}
                  onChange={(e) => handleSearchTrabajadores(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="filtro-area">Filtrar por Área</Label>
                <Select value={filtroArea} onValueChange={setFiltroArea}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todas las áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las áreas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id || area.nombre} value={area.nombre}>
                        {area.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="filtro-puesto">Filtrar por Puesto</Label>
                <Select value={filtroPuesto} onValueChange={setFiltroPuesto}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={filtroArea ? "Puestos del área" : "Todos los puestos"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los puestos</SelectItem>
                    {puestosFiltradosPorArea.map((puesto) => (
                      <SelectItem key={puesto} value={puesto}>
                        {puesto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botones de selección masiva */}
            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllFiltered}
                disabled={getTrabajadoresFiltrados().length === 0}
                className="hover:bg-blue-100"
              >
                Seleccionar todos ({getTrabajadoresFiltrados().length})
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllByArea}
                disabled={!filtroArea}
                className="hover:bg-blue-100"
              >
                Todos de {filtroArea || 'área'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllByPuesto}
                disabled={!filtroPuesto}
                className="hover:bg-blue-100"
              >
                Todos de {filtroPuesto || 'puesto'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSelection}
                disabled={selectedTrabajadores.length === 0}
                className="hover:bg-red-100 text-red-600 border-red-300"
              >
                Limpiar ({selectedTrabajadores.length})
              </Button>
            </div>
            
            {/* Lista de trabajadores */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {getTrabajadoresFiltrados().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron trabajadores con los filtros seleccionados
                  </div>
                ) : (
                  getTrabajadoresFiltrados().map((trabajador) => (
                    <div
                      key={trabajador.id}
                      className="p-4 border-b last:border-b-0 hover:bg-gray-50 flex items-center space-x-3"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTrabajadores.some(t => t.id === trabajador.id)}
                        onChange={() => handleToggleTrabajador(trabajador)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{trabajador.nombre}</div>
                        <div className="text-sm text-gray-600">{trabajador.codigo}</div>
                        <div className="text-sm text-gray-600">{trabajador.puesto}</div>
                        <div className="text-sm text-gray-500">{trabajador.area?.nombre}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Barra inferior */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-700">
                <span className="font-semibold text-blue-600">{selectedTrabajadores.length}</span>
                <span className="mx-2">trabajador(es) seleccionado(s)</span>
                {selectedTrabajadores.length > 0 && (
                  <span className="text-xs text-gray-500">
                    (de {getTrabajadoresFiltrados().length} visibles)
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAssignDialog(false)
                    setSelectedTrabajadores([])
                    setSearchQuery('')
                    setFiltroArea('')
                    setFiltroPuesto('')
                  }}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAssignTrabajadoresToCiclo}
                  disabled={selectedTrabajadores.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Asignar ({selectedTrabajadores.length})
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para Ver Trabajadores Asignados */}
      <Dialog open={showViewTrabajadoresDialog} onOpenChange={setShowViewTrabajadoresDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Trabajadores Asignados al Ciclo: {selectedCiclo?.nombre}</DialogTitle>
            <DialogDescription>
              Lista de trabajadores asignados a este ciclo de evaluación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Total de trabajadores asignados: {trabajadoresAsignados.length}
              </div>
              <div className="text-sm text-gray-600">
                Total de evaluaciones: {trabajadoresAsignados.reduce((sum, t) => sum + (t.evaluacionesCount || 0), 0)}
              </div>
            </div>
            
            <div className="border rounded-md max-h-96 overflow-y-auto">
              {trabajadoresAsignados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay trabajadores asignados a este ciclo
                </div>
              ) : (
                trabajadoresAsignados.map((trabajador) => (
                  <div
                    key={trabajador.id}
                    className="p-4 border-b last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">{trabajador.nombre}</div>
                    <div className="text-sm text-gray-600">{trabajador.codigo}</div>
                    <div className="text-sm text-gray-600">{trabajador.puesto}</div>
                    <div className="text-sm text-gray-500">{trabajador.area?.nombre}</div>
                    {trabajador.evaluaciones && trabajador.evaluaciones.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {trabajador.evaluaciones.map((evaluacion: any) => (
                          <div key={evaluacion.id} className="text-xs text-gray-600 flex justify-between items-center">
                            <span>
                              {evaluacion.tipo_evaluador.toUpperCase()} - {evaluacion.estado}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                evaluacion.estado === 'pendiente' ? 'border-yellow-300 text-yellow-700' :
                                evaluacion.estado === 'en_progreso' ? 'border-blue-300 text-blue-700' :
                                'border-green-300 text-green-700'
                              }`}
                            >
                              {evaluacion.estado}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowViewTrabajadoresDialog(false)
                  setTrabajadoresAsignados([])
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
