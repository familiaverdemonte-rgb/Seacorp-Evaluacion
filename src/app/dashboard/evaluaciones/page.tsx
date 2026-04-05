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
import { Search, Plus, Play, Eye, CheckCircle, Clock, AlertCircle, Settings, Calendar, Trash2 } from 'lucide-react'
import { Evaluacion, Trabajador } from '@/types'
import { Column } from '@/components/ui/data-table'
import { EvaluacionesService } from '@/services/evaluaciones'
import { TrabajadoresService } from '@/services/trabajadores'

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showSearchDialog, setShowSearchDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTrabajador, setSelectedTrabajador] = useState<Trabajador | null>(null)
  const [searchResults, setSearchResults] = useState<Trabajador[]>([])
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipoEvaluador, setFiltroTipoEvaluador] = useState('')
  const [filteredEvaluaciones, setFilteredEvaluaciones] = useState<Evaluacion[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadEvaluaciones()
  }, [])

  useEffect(() => {
    let filtered = evaluaciones

    // Filtrar por estado
    if (filtroEstado) {
      filtered = filtered.filter(evaluacion => 
        evaluacion.estado === filtroEstado
      )
    }

    // Filtrar por tipo de evaluador
    if (filtroTipoEvaluador) {
      filtered = filtered.filter(evaluacion => 
        evaluacion.tipo_evaluador === filtroTipoEvaluador
      )
    }

    setFilteredEvaluaciones(filtered)
    setCurrentPage(1) // Resetear página cuando se filtra
  }, [evaluaciones, filtroEstado, filtroTipoEvaluador])

  const loadEvaluaciones = async () => {
    try {
      const data = await EvaluacionesService.getAll()
      setEvaluaciones(data)
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length >= 2) {
      try {
        const results = await TrabajadoresService.search(query)
        setSearchResults(results)
      } catch (error) {
        console.error('Error al buscar:', error)
      }
    } else {
      setSearchResults([])
    }
  }

  const handleSelectTrabajador = async (trabajador: Trabajador) => {
    console.log('🎯 Trabajador seleccionado:', trabajador)
    setSelectedTrabajador(trabajador)
    setShowSearchDialog(false)
    setSearchQuery('')
    setSearchResults([])
    
    // Cargar evaluaciones del trabajador seleccionado
    try {
      const evaluacionesTrabajador = await EvaluacionesService.getByTrabajador(trabajador.id)
      console.log('📋 Evaluaciones del trabajador:', evaluacionesTrabajador)
      setEvaluaciones(evaluacionesTrabajador)
    } catch (error) {
      console.error('Error al cargar evaluaciones del trabajador:', error)
      setEvaluaciones([])
    }
  }

  const handleStartEvaluation = (evaluacion: Evaluacion) => {
    console.log('🚀 Iniciando evaluación:', evaluacion)
    
    // Redirigir a la página de realización de evaluación
    if (evaluacion.id && evaluacion.trabajador) {
      console.log('📱 Redirigiendo a evaluación:', `/dashboard/evaluaciones/${evaluacion.id}/realizar`)
      window.location.href = `/dashboard/evaluaciones/${evaluacion.id}/realizar`
    } else {
      console.error('❌ Evaluación sin datos válidos')
      alert('Error: Evaluación no válida')
    }
  }

  const handleViewEvaluation = (evaluacion: Evaluacion) => {
    console.log('👁️ Viendo evaluación:', evaluacion)
    
    // Redirigir a la página de resultados de evaluación
    if (evaluacion.id && evaluacion.trabajador) {
      console.log('📱 Redirigiendo a resultados:', `/dashboard/evaluaciones/${evaluacion.id}/resultados`)
      window.location.href = `/dashboard/evaluaciones/${evaluacion.id}/resultados`
    } else {
      console.error('❌ Evaluación sin datos válidos')
      alert('Error: Evaluación no válida')
    }
  }

  const handleEditEvaluation = (evaluacion: Evaluacion) => {
    console.log('✏️ Editando evaluación:', evaluacion)
    
    // Redirigir a la página de realización para permitir edición
    if (evaluacion.id && evaluacion.trabajador) {
      console.log('📱 Redirigiendo a edición:', `/dashboard/evaluaciones/${evaluacion.id}/realizar`)
      window.location.href = `/dashboard/evaluaciones/${evaluacion.id}/realizar`
    } else {
      console.error('❌ Evaluación sin datos válidos')
      alert('Error: Evaluación no válida')
    }
  }

  const handleDeleteEvaluation = async (evaluacion: Evaluacion) => {
    if (!confirm(`¿Estás seguro de eliminar la evaluación de ${evaluacion.trabajador?.nombre}? Esta acción no se puede deshacer.`)) {
      return
    }
    
    try {
      console.log('🗑️ Eliminando evaluación:', evaluacion.id)
      await EvaluacionesService.delete(evaluacion.id)
      console.log('✅ Evaluación eliminada correctamente')
      
      // Recargar la lista de evaluaciones
      loadEvaluaciones()
      alert('✅ Evaluación eliminada exitosamente')
    } catch (error) {
      console.error('❌ Error al eliminar evaluación:', error)
      alert('Error al eliminar evaluación')
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completada':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>
      case 'en_progreso':
        return <Badge className="bg-blue-100 text-blue-800">En Progreso</Badge>
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const getTipoEvaluadorBadge = (tipo: string) => {
    switch (tipo) {
      case 'rrhh':
        return <Badge variant="outline">RRHH</Badge>
      case 'jefe':
        return <Badge variant="outline">Jefe</Badge>
      case 'par':
        return <Badge variant="outline">Par</Badge>
      default:
        return <Badge variant="secondary">{tipo}</Badge>
    }
  }

  const getDesempenoBadge = (clasificacion: string | null) => {
    if (!clasificacion) return <Badge variant="secondary">Sin clasificar</Badge>
    
    if (clasificacion.includes('Alto')) {
      return <Badge className="bg-green-100 text-green-800">Alto</Badge>
    }
    if (clasificacion.includes('Bueno')) {
      return <Badge className="bg-blue-100 text-blue-800">Bueno</Badge>
    }
    if (clasificacion.includes('Regular')) {
      return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>
    }
    if (clasificacion.includes('Bajo')) {
      return <Badge className="bg-red-100 text-red-800">Bajo</Badge>
    }
    
    return <Badge variant="secondary">{clasificacion}</Badge>
  }

  const columns: Column<Evaluacion>[] = [
    {
      key: 'trabajador',
      header: 'Trabajador',
      render: (value: any, row: Evaluacion) => (
        <div>
          <div className="font-medium">{row.trabajador?.nombre}</div>
          <div className="text-sm text-gray-600">{row.trabajador?.codigo}</div>
        </div>
      )
    },
    {
      key: 'ciclo',
      header: 'Ciclo',
      render: (value: any, row: Evaluacion) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <div>
            <div className="font-medium">{row.ciclo?.nombre || 'N/A'}</div>
            <div className="text-sm text-gray-600">
              {row.ciclo?.estado && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  row.ciclo.estado === 'abierto' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {row.ciclo.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'tipo_evaluador',
      header: 'Tipo Evaluador',
      render: (value: any) => getTipoEvaluadorBadge(value)
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value: any) => getEstadoBadge(value)
    },
    {
      key: 'puntaje_ponderado',
      header: 'Puntaje',
      render: (value: any, row: Evaluacion) => (
        <div>
          <div className="font-medium">
            {value ? value.toFixed(2) : 'N/A'}
          </div>
          {row.clasificacion && (
            <div className="mt-1">
              {getDesempenoBadge(row.clasificacion)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Fecha Creación',
      render: (value: any) => new Date(value).toLocaleDateString('es-PE')
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (value: any, row: Evaluacion) => (
        <div className="flex space-x-2">
          {row.estado === 'pendiente' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartEvaluation(row)}
              title="Iniciar Evaluación"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {row.estado === 'en_progreso' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStartEvaluation(row)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              title="Continuar Evaluación"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {row.estado === 'completada' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditEvaluation(row)}
                title="Editar Evaluación"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewEvaluation(row)}
                title="Ver Resultados"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteEvaluation(row)}
                title="Eliminar Evaluación"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  const estadisticas = {
    total: evaluaciones.length,
    completadas: evaluaciones.filter(e => e.estado === 'completada').length,
    pendientes: evaluaciones.filter(e => e.estado === 'pendiente').length,
    enProgreso: evaluaciones.filter(e => e.estado === 'en_progreso').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evaluaciones</h1>
        <p className="text-gray-600">Gestión de evaluaciones de desempeño 360°</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{estadisticas.completadas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{estadisticas.enProgreso}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y Acciones */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Lista de Evaluaciones</h2>
          <p className="text-gray-600">
            {selectedTrabajador 
              ? `Evaluaciones de: ${selectedTrabajador.nombre}`
              : 'Todas las evaluaciones'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowSearchDialog(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Buscar Trabajador
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard/evaluaciones/admin'}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            <Settings className="mr-2 h-4 w-4" />
            Administración
          </Button>
          {selectedTrabajador && (
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('🔄 Mostrando todas las evaluaciones')
                setSelectedTrabajador(null)
                // Recargar todas las evaluaciones
                await loadEvaluaciones()
              }}
            >
              Mostrar Todas
            </Button>
          )}
        </div>
      </div>

      {/* Tabla de Evaluaciones */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Evaluaciones</CardTitle>
              <CardDescription>
                {selectedTrabajador 
                  ? `Evaluaciones asignadas para ${selectedTrabajador.nombre}`
                  : 'Todas las evaluaciones del sistema'
                }
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select value={filtroEstado} onValueChange={(value) => setFiltroEstado(value || '')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroTipoEvaluador} onValueChange={(value) => setFiltroTipoEvaluador(value || '')}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los tipos</SelectItem>
                  <SelectItem value="rrhh">RRHH</SelectItem>
                  <SelectItem value="jefe">Jefe</SelectItem>
                  <SelectItem value="par">Par</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredEvaluaciones}
            columns={columns}
            loading={loading}
            emptyMessage="No hay evaluaciones disponibles"
            itemsPerPage={15}
            searchable={false}
            searchQuery={searchQuery}
            currentPage={currentPage}
            onSearchChange={setSearchQuery}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Diálogo de Búsqueda */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buscar Trabajador</DialogTitle>
            <DialogDescription>
              Busca un trabajador por código, nombre o puesto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Escribe para buscar..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="max-h-60 overflow-y-auto border rounded-md">
                {searchResults.map((trabajador) => (
                  <div
                    key={trabajador.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectTrabajador(trabajador)}
                  >
                    <div className="font-medium">{trabajador.nombre}</div>
                    <div className="text-sm text-gray-600">
                      {trabajador.codigo} - {trabajador.puesto}
                    </div>
                    <div className="text-sm text-gray-500">
                      {trabajador.area?.nombre}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No se encontraron trabajadores
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSearchDialog(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
