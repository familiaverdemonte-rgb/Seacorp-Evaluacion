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
import { Plus, Calendar, Edit, Trash2, Users, CheckCircle, Clock, XCircle, Eye, FileText, Search } from 'lucide-react'
import { CicloEvaluacion } from '@/types'
import { Column } from '@/components/ui/data-table'
import { CiclosEvaluacionService } from '@/services/ciclos-evaluacion'
import { PlantillasService } from '@/services/plantillas'
import { TrabajadoresService } from '@/services/trabajadores'

export default function CiclosPage() {
  const [ciclos, setCiclos] = useState<CicloEvaluacion[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewTrabajadoresDialog, setShowViewTrabajadoresDialog] = useState(false)
  const [showAssignTrabajadoresDialog, setShowAssignTrabajadoresDialog] = useState(false)
  const [selectedCiclo, setSelectedCiclo] = useState<CicloEvaluacion | null>(null)
  const [plantillas, setPlantillas] = useState<any[]>([])
  const [trabajadores, setTrabajadores] = useState<any[]>([])
  const [trabajadoresAsignados, setTrabajadoresAsignados] = useState<any[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    plantilla_id: '' as string | null
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filtroArea, setFiltroArea] = useState('')
  const [filtroPuesto, setFiltroPuesto] = useState('')
  const [areas, setAreas] = useState<any[]>([])
  const [selectedTrabajadores, setSelectedTrabajadores] = useState<number[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ciclosData, plantillasData, trabajadoresData, areasData] = await Promise.all([
        CiclosEvaluacionService.getAll(),
        PlantillasService.getAll(),
        TrabajadoresService.getAll(),
        TrabajadoresService.getAreas()
      ])
      setCiclos(ciclosData)
      setPlantillas(plantillasData)
      setTrabajadores(trabajadoresData)
      setAreas(areasData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
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
      setShowCreateDialog(false)
      setFormData({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        plantilla_id: ''
      })
      loadData()
    } catch (error) {
      console.error('Error creating ciclo:', error)
    }
  }

  const handleUpdate = async () => {
    if (!selectedCiclo) return
    
    try {
      await CiclosEvaluacionService.update(selectedCiclo.id, {
        nombre: formData.nombre,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        plantilla_id: formData.plantilla_id ? parseInt(formData.plantilla_id) : null
      })
      setShowEditDialog(false)
      setSelectedCiclo(null)
      setFormData({
        nombre: '',
        fecha_inicio: '',
        fecha_fin: '',
        plantilla_id: ''
      })
      loadData()
    } catch (error) {
      console.error('Error updating ciclo:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este ciclo?')) return
    
    try {
      await CiclosEvaluacionService.delete(id)
      loadData()
    } catch (error) {
      console.error('Error deleting ciclo:', error)
    }
  }

  const openEditDialog = (ciclo: CicloEvaluacion) => {
    setSelectedCiclo(ciclo)
    setFormData({
      nombre: ciclo.nombre,
      fecha_inicio: ciclo.fecha_inicio,
      fecha_fin: ciclo.fecha_fin,
      plantilla_id: ciclo.plantilla_id?.toString() || ''
    })
    setShowEditDialog(true)
  }

  const openViewTrabajadoresDialog = async (ciclo: CicloEvaluacion) => {
    setSelectedCiclo(ciclo)
    try {
      const asignados = await CiclosEvaluacionService.getTrabajadoresAsignados(ciclo.id)
      setTrabajadoresAsignados(asignados)
    } catch (error) {
      console.error('Error loading trabajadores asignados:', error)
      setTrabajadoresAsignados([])
    }
    setShowViewTrabajadoresDialog(true)
  }

  const openAssignTrabajadoresDialog = (ciclo: CicloEvaluacion) => {
    setSelectedCiclo(ciclo)
    setShowAssignTrabajadoresDialog(true)
  }

  const handleAssignTrabajadoresToCiclo = async () => {
    if (!selectedCiclo || selectedTrabajadores.length === 0) return
    
    try {
      await CiclosEvaluacionService.assignTrabajadores(selectedCiclo.id, selectedTrabajadores)
      setShowAssignTrabajadoresDialog(false)
      setSelectedTrabajadores([])
      loadData()
    } catch (error) {
      console.error('Error assigning trabajadores:', error)
    }
  }

  const handleSearchTrabajadores = (query: string) => {
    setSearchQuery(query)
  }

  const filteredTrabajadores = trabajadores.filter(trabajador => {
    const matchesSearch = trabajador.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trabajador.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trabajador.puesto.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesArea = !filtroArea || trabajador.area?.nombre === filtroArea
    const matchesPuesto = !filtroPuesto || trabajador.puesto === filtroPuesto
    
    return matchesSearch && matchesArea && matchesPuesto
  })

  const puestosFiltradosPorArea = Array.from(new Set(
    filteredTrabajadores
      .filter(t => !filtroArea || t.area?.nombre === filtroArea)
      .map(t => t.puesto)
  ))

  const cols: Column<CicloEvaluacion>[] = [
    {
      key: 'nombre',
      header: 'Nombre del Ciclo',
      sortable: true,
      render: (value: any, row: CicloEvaluacion) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">
            {new Date(row.fecha_inicio).toLocaleDateString()} - {new Date(row.fecha_fin).toLocaleDateString()}
          </div>
        </div>
      )
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      render: (value: any) => (
        <Badge
          variant={value === 'abierto' ? 'default' : 'secondary'}
          className={
            value === 'abierto' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }
        >
          {value === 'abierto' ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Abierto
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Cerrado
            </>
          )}
        </Badge>
      )
    },
    {
      key: 'plantilla_id',
      header: 'Plantilla',
      sortable: true,
      render: (value: any, row: CicloEvaluacion) => (
        <span className="font-medium">{row.plantilla_nombre || 'Plantilla por Defecto'}</span>
      )
    },
    {
      key: 'trabajadores_asignados',
      header: 'Trabajadores Asignados',
      sortable: true,
      render: (value: any) => (
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1 text-gray-500" />
          <span>{value || 0}</span>
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
            onClick={() => openEditDialog(row)}
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openViewTrabajadoresDialog(row)}
          >
            <Eye className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openAssignTrabajadoresDialog(row)}
          >
            <Users className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ciclos de evaluación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ciclos de Evaluación</h1>
          <p className="text-gray-600">Gestiona los períodos de evaluación de desempeño</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Ciclo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ciclos Activos</CardTitle>
          <CardDescription>
            Administra los ciclos de evaluación y su configuración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={ciclos}
            columns={cols}
            searchable={true}
            searchPlaceholder="Buscar ciclos..."
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Ciclo</DialogTitle>
            <DialogDescription>
              Configura un nuevo ciclo de evaluación para la empresa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Ciclo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Evaluación 2024 - Primer Semestre"
              />
            </div>
            <div>
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="plantilla">Plantilla de Evaluación</Label>
              <Select value={formData.plantilla_id || ''} onValueChange={(value) => setFormData({...formData, plantilla_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {plantillas.map((plantilla) => (
                    <SelectItem key={plantilla.id} value={plantilla.id.toString()}>
                      {plantilla.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Crear Ciclo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ciclo</DialogTitle>
            <DialogDescription>
              Modifica la configuración del ciclo de evaluación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Ciclo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Evaluación 2024 - Primer Semestre"
              />
            </div>
            <div>
              <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="fecha_fin">Fecha de Fin</Label>
              <Input
                id="fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="plantilla">Plantilla de Evaluación</Label>
              <Select value={formData.plantilla_id || ''} onValueChange={(value) => setFormData({...formData, plantilla_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {plantillas.map((plantilla) => (
                    <SelectItem key={plantilla.id} value={plantilla.id.toString()}>
                      {plantilla.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate}>
              Actualizar Ciclo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Trabajadores Dialog */}
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
                Total de trabajadores: {trabajadoresAsignados.length}
              </div>
              <div className="text-sm text-gray-600">
                Estado del ciclo: <Badge variant={selectedCiclo?.estado === 'abierto' ? 'default' : 'secondary'}>
                  {selectedCiclo?.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                </Badge>
              </div>
            </div>
            <div className="border rounded-md max-h-96 overflow-y-auto">
              {trabajadoresAsignados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay trabajadores asignados a este ciclo</p>
                  <p className="text-sm mt-2">Usa la función de asignación masiva para agregar trabajadores</p>
                </div>
              ) : (
                <div className="divide-y">
                  {trabajadoresAsignados.map((trabajador) => (
                    <div key={trabajador.id} className="p-4 border-b last:border-b-0 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{trabajador.nombre}</div>
                          <div className="text-sm text-gray-600">{trabajador.codigo}</div>
                          <div className="text-sm text-gray-600">{trabajador.puesto}</div>
                          <div className="text-sm text-gray-500">{trabajador.area?.nombre}</div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navegar a evaluaciones del trabajador
                              window.location.href = `/dashboard/evaluaciones/trabajador/${trabajador.id}`
                            }}
                          >
                            <FileText className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowViewTrabajadoresDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Trabajadores Dialog */}
      <Dialog open={showAssignTrabajadoresDialog} onOpenChange={setShowAssignTrabajadoresDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Asignar Trabajadores al Ciclo: {selectedCiclo?.nombre}</DialogTitle>
            <DialogDescription>
              Selecciona los trabajadores que deseas asignar a este ciclo de evaluación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar trabajador..."
                    value={searchQuery}
                    onChange={(e) => handleSearchTrabajadores(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Select value={filtroArea} onValueChange={(value) => setFiltroArea(value || '')}>
                  <SelectTrigger className="w-48">
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
                <Select value={filtroPuesto} onValueChange={(value) => setFiltroPuesto(value || '')}>
                  <SelectTrigger className="w-48">
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

            {/* Lista de trabajadores */}
            <div className="border rounded-md max-h-96 overflow-y-auto">
              {filteredTrabajadores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No se encontraron trabajadores</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredTrabajadores.map((trabajador) => (
                    <div key={trabajador.id} className="p-3 hover:bg-gray-50">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTrabajadores.includes(trabajador.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTrabajadores([...selectedTrabajadores, trabajador.id])
                            } else {
                              setSelectedTrabajadores(selectedTrabajadores.filter(id => id !== trabajador.id))
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{trabajador.nombre}</div>
                          <div className="text-sm text-gray-600">{trabajador.codigo} - {trabajador.puesto}</div>
                          <div className="text-sm text-gray-500">{trabajador.area?.nombre}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resumen de selección */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-600">
                {selectedTrabajadores.length} trabajador(es) seleccionado(s)
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => {
                  setShowAssignTrabajadoresDialog(false)
                  setSelectedTrabajadores([])
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAssignTrabajadoresToCiclo}
                  disabled={selectedTrabajadores.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Asignar Trabajadores
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
