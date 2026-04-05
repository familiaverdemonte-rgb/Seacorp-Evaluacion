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
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewTrabajadoresDialog, setShowViewTrabajadoresDialog] = useState(false)
  const [selectedCiclo, setSelectedCiclo] = useState<CicloEvaluacion | null>(null)
  const [plantillas, setPlantillas] = useState<any[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    plantilla_id: '' as string | null
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ciclosData, plantillasData] = await Promise.all([
        CiclosEvaluacionService.getAll(),
        PlantillasService.getAll()
      ])
      setCiclos(ciclosData)
      setPlantillas(plantillasData)
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
            onClick={() => {
              setSelectedCiclo(row)
              setShowViewTrabajadoresDialog(true)
            }}
          >
            <Eye className="w-3 h-3" />
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
                Total de trabajadores: {selectedCiclo?.trabajadores_asignados || 0}
              </div>
              <div className="text-sm text-gray-600">
                Estado del ciclo: <Badge variant={selectedCiclo?.estado === 'abierto' ? 'default' : 'secondary'}>
                  {selectedCiclo?.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                </Badge>
              </div>
            </div>
            <div className="border rounded-md max-h-96 overflow-y-auto">
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>No hay trabajadores asignados a este ciclo</p>
                <p className="text-sm mt-2">Usa la función de asignación masiva para agregar trabajadores</p>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowViewTrabajadoresDialog(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
