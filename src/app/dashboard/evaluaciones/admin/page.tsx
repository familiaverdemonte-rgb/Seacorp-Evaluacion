'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Edit, Trash2, Eye, Plus, Users, Calendar } from 'lucide-react'
import { Evaluacion, Trabajador, CicloEvaluacion } from '@/types'
import { Column } from '@/components/ui/data-table'
import { EvaluacionesService } from '@/services/evaluaciones'
import { TrabajadoresService } from '@/services/trabajadores'
import { CiclosEvaluacionService } from '@/services/ciclos-evaluacion'

export default function EvaluacionesAdminPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [ciclos, setCiclos] = useState<CicloEvaluacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredEvaluaciones, setFilteredEvaluaciones] = useState<Evaluacion[]>([])
  const [formData, setFormData] = useState({
    trabajador_id: '',
    ciclo_id: '',
    tipo_evaluador: 'jefe' as 'rrhh' | 'jefe' | 'par',
    evaluador_id: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Filtrar evaluaciones cuando cambia la búsqueda
    if (searchQuery.trim() === '') {
      setFilteredEvaluaciones(evaluaciones)
    } else {
      const filtered = evaluaciones.filter(evaluacion => 
        evaluacion.trabajador?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evaluacion.trabajador?.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evaluacion.ciclo?.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredEvaluaciones(filtered)
    }
  }, [searchQuery, evaluaciones])

  const loadData = async () => {
    try {
      const [evaluacionesData, trabajadoresData, ciclosData] = await Promise.all([
        EvaluacionesService.getAll(),
        TrabajadoresService.getAll(),
        CiclosEvaluacionService.getAll()
      ])
      
      setEvaluaciones(evaluacionesData)
      setFilteredEvaluaciones(evaluacionesData)
      setTrabajadores(trabajadoresData)
      setCiclos(ciclosData)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvaluacion = async () => {
    if (!formData.trabajador_id || !formData.ciclo_id || !formData.evaluador_id) {
      alert('Por favor completa todos los campos')
      return
    }

    try {
      await EvaluacionesService.create({
        trabajador_id: parseInt(formData.trabajador_id),
        evaluador_id: formData.evaluador_id,
        tipo_evaluador: formData.tipo_evaluador,
        ciclo_id: parseInt(formData.ciclo_id),
        estado: 'pendiente',
        puntaje_ponderado: null,
        clasificacion: null
      })

      alert('Evaluación creada correctamente')
      setShowCreateDialog(false)
      setFormData({
        trabajador_id: '',
        ciclo_id: '',
        tipo_evaluador: 'jefe',
        evaluador_id: ''
      })
      loadData()
    } catch (error) {
      console.error('Error al crear evaluación:', error)
      alert('Error al crear evaluación')
    }
  }

  const handleDeleteEvaluacion = async (evaluacion: Evaluacion) => {
    if (!confirm(`¿Estás seguro de eliminar esta evaluación de ${evaluacion.trabajador?.nombre}?`)) return
    
    try {
      await EvaluacionesService.delete(evaluacion.id)
      alert('Evaluación eliminada correctamente')
      loadData()
    } catch (error) {
      console.error('Error al eliminar evaluación:', error)
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

  const columns: Column<Evaluacion>[] = [
    {
      key: 'trabajador',
      header: 'Trabajador',
      render: (value: any, row: Evaluacion) => (
        <div>
          <div className="font-medium">{row.trabajador?.nombre}</div>
          <div className="text-sm text-gray-600">{row.trabajador?.codigo}</div>
          <div className="text-xs text-gray-500">{row.trabajador?.puesto}</div>
        </div>
      )
    },
    {
      key: 'ciclo',
      header: 'Ciclo',
      render: (value: any, row: Evaluacion) => (
        <div>
          <div className="font-medium">{row.ciclo?.nombre}</div>
          <div className="text-sm text-gray-600">{row.ciclo?.estado}</div>
        </div>
      )
    },
    {
      key: 'tipo_evaluador',
      header: 'Tipo',
      render: (value: any) => getTipoEvaluadorBadge(value)
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (value: any) => getEstadoBadge(value)
    },
    {
      key: 'evaluador_id',
      header: 'Evaluador',
      render: (value: any) => (
        <div className="text-sm">{value || 'No asignado'}</div>
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
              onClick={() => window.location.href = `/dashboard/evaluaciones/${row.id}/realizar`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {row.estado === 'completada' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `/dashboard/evaluaciones/${row.id}/resultados`}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteEvaluacion(row)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Administración de Evaluaciones</h1>
          <p className="text-gray-600">Gestión completa de evaluaciones del sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Evaluación
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Evaluaciones</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{evaluaciones.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {evaluaciones.filter(e => e.estado === 'pendiente').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {evaluaciones.filter(e => e.estado === 'en_progreso').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {evaluaciones.filter(e => e.estado === 'completada').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Evaluaciones</CardTitle>
              <CardDescription>
                Total: {filteredEvaluaciones.length} de {evaluaciones.length} evaluaciones
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar evaluación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredEvaluaciones}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron evaluaciones"
          />
        </CardContent>
      </Card>

      {/* Diálogo de Creación */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Evaluación</DialogTitle>
            <DialogDescription>
              Crea una nueva evaluación manualmente para un trabajador específico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="trabajador">Trabajador</Label>
              <Select value={formData.trabajador_id} onValueChange={(value) => setFormData(prev => ({ ...prev, trabajador_id: value || '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un trabajador" />
                </SelectTrigger>
                <SelectContent>
                  {trabajadores.map((trabajador) => (
                    <SelectItem key={trabajador.id} value={trabajador.id.toString()}>
                      {trabajador.nombre} ({trabajador.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ciclo">Ciclo de Evaluación</Label>
              <Select value={formData.ciclo_id} onValueChange={(value) => setFormData(prev => ({ ...prev, ciclo_id: value || '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un ciclo" />
                </SelectTrigger>
                <SelectContent>
                  {ciclos.map((ciclo) => (
                    <SelectItem key={ciclo.id} value={ciclo.id.toString()}>
                      {ciclo.nombre} ({ciclo.estado})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipo">Tipo de Evaluador</Label>
              <Select value={formData.tipo_evaluador} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_evaluador: value || 'rrhh' }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rrhh">RRHH</SelectItem>
                  <SelectItem value="jefe">Jefe</SelectItem>
                  <SelectItem value="par">Par</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="evaluador">ID del Evaluador</Label>
              <Input
                id="evaluador"
                value={formData.evaluador_id}
                onChange={(e) => setFormData(prev => ({ ...prev, evaluador_id: e.target.value }))}
                placeholder="Ej: jefe@seacorp.com"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateEvaluacion} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                Crear Evaluación
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
