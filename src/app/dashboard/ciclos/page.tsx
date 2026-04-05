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
  const [areas, setAreas] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedTrabajadores, setSelectedTrabajadores] = useState<number[]>([])
  const [trabajadoresAsignados, setTrabajadoresAsignados] = useState<any[]>([])
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    plantilla_id: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Datos de ejemplo garantizados - SIEMPRE funcionan
      console.log('🔄 Cargando datos de ejemplo garantizados...')
      
      const exampleCiclos = [
        {
          id: 1,
          nombre: 'Evaluación 2024 - Primer Semestre',
          estado: 'abierto' as const,
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-06-30',
          trabajadores_asignados: 15,
          plantilla_nombre: 'Plantilla Corporativa'
        },
        {
          id: 2,
          nombre: 'Evaluación 2024 - Segundo Semestre',
          estado: 'abierto' as const,
          fecha_inicio: '2024-07-01',
          fecha_fin: '2024-12-31',
          trabajadores_asignados: 20,
          plantilla_nombre: 'Plantilla Senior'
        },
        {
          id: 3,
          nombre: 'Evaluación 2023 - Anual',
          estado: 'cerrado' as const,
          fecha_inicio: '2023-01-01',
          fecha_fin: '2023-12-31',
          trabajadores_asignados: 25,
          plantilla_nombre: 'Plantilla 2023'
        }
      ]
      
      const examplePlantillas = [
        { id: 1, nombre: 'Plantilla Corporativa' },
        { id: 2, nombre: 'Plantilla Senior' },
        { id: 3, nombre: 'Plantilla 2023' }
      ]
      
      const exampleTrabajadores = [
        { id: 1, nombre: 'Juan Pérez', codigo: 'EMP001', puesto: 'Desarrollador', area: { id: 1, nombre: 'TI' } },
        { id: 2, nombre: 'María García', codigo: 'EMP002', puesto: 'Diseñadora', area: { id: 2, nombre: 'Marketing' } },
        { id: 3, nombre: 'Carlos López', codigo: 'EMP003', puesto: 'Gerente', area: { id: 3, nombre: 'Ventas' } },
        { id: 4, nombre: 'Ana Martínez', codigo: 'EMP004', puesto: 'Analista', area: { id: 1, nombre: 'TI' } }
      ]
      
      const exampleAreas = [
        { id: 1, nombre: 'TI' },
        { id: 2, nombre: 'Marketing' },
        { id: 3, nombre: 'Ventas' }
      ]
      
      setCiclos(exampleCiclos)
      setPlantillas(examplePlantillas)
      setTrabajadores(exampleTrabajadores)
      setAreas(exampleAreas)
      
      console.log('✅ Datos cargados exitosamente:', {
        ciclos: exampleCiclos.length,
        plantillas: examplePlantillas.length,
        trabajadores: exampleTrabajadores.length,
        areas: exampleAreas.length
      })
      
    } catch (error) {
      console.error('❌ Error en loadData:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setFormData({
      nombre: '',
      fecha_inicio: '',
      fecha_fin: '',
      plantilla_id: ''
    })
    setShowCreateDialog(true)
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

  const openViewTrabajadoresDialog = (ciclo: CicloEvaluacion) => {
    setSelectedCiclo(ciclo)
    // Datos de ejemplo de trabajadores asignados
    const exampleAsignados = [
      {
        id: 1,
        nombre: 'Juan Pérez',
        codigo: 'EMP001',
        puesto: 'Desarrollador',
        area: { id: 1, nombre: 'TI' }
      },
      {
        id: 2,
        nombre: 'María García',
        codigo: 'EMP002',
        puesto: 'Diseñadora',
        area: { id: 2, nombre: 'Marketing' }
      }
    ]
    setTrabajadoresAsignados(exampleAsignados)
    setShowViewTrabajadoresDialog(true)
  }

  const openAssignTrabajadoresDialog = (ciclo: CicloEvaluacion) => {
    setSelectedCiclo(ciclo)
    setShowAssignTrabajadoresDialog(true)
  }

  const handleAssignTrabajadoresToCiclo = () => {
    if (!selectedCiclo || selectedTrabajadores.length === 0) return
    
    console.log('🔄 Asignando trabajadores al ciclo:', {
      ciclo: selectedCiclo.nombre,
      trabajadores: selectedTrabajadores.length
    })
    
    setShowAssignTrabajadoresDialog(false)
    setSelectedTrabajadores([])
    alert('✅ Trabajadores asignados exitosamente (modo demo)')
  }

  const handleDelete = async (ciclo: CicloEvaluacion) => {
    if (confirm(`¿Estás seguro de eliminar el ciclo "${ciclo.nombre}"?`)) {
      console.log('🔄 Eliminando ciclo:', ciclo.nombre)
      setCiclos(ciclos.filter(c => c.id !== ciclo.id))
      alert('✅ Ciclo eliminado exitosamente (modo demo)')
    }
  }

  const handleCreate = async () => {
    console.log('🔄 Creando ciclo:', formData)
    const newCiclo: CicloEvaluacion = {
      id: Math.max(...ciclos.map(c => c.id), 0) + 1,
      nombre: formData.nombre,
      estado: 'abierto',
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.fecha_fin,
      plantilla_id: parseInt(formData.plantilla_id),
      trabajadores_asignados: 0
    }
    setCiclos([...ciclos, newCiclo])
    setShowCreateDialog(false)
    alert('✅ Ciclo creado exitosamente (modo demo)')
  }

  const handleEdit = async () => {
    if (!selectedCiclo) return
    
    console.log('🔄 Editando ciclo:', formData)
    setCiclos(ciclos.map(c => 
      c.id === selectedCiclo.id 
        ? { ...c, nombre: formData.nombre, fecha_inicio: formData.fecha_inicio, fecha_fin: formData.fecha_fin }
        : c
    ))
    setShowEditDialog(false)
    alert('✅ Ciclo actualizado exitosamente (modo demo)')
  }

  const handleSearchTrabajadores = (query: string) => {
    setSearchQuery(query)
  }

  const filteredTrabajadores = trabajadores.filter(trabajador => {
    const matchesSearch = trabajador.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trabajador.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trabajador.puesto.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesArea = !selectedArea || trabajador.area?.nombre === selectedArea
    return matchesSearch && matchesArea
  })

  const columns: Column<CicloEvaluacion>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true
    },
    {
      key: 'nombre',
      header: 'Nombre del Ciclo',
      sortable: true
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      render: (value: string) => (
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
      key: 'plantilla_nombre',
      header: 'Plantilla',
      sortable: true
    },
    {
      key: 'trabajadores_asignados',
      header: 'Trabajadores Asignados',
      sortable: true
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (_: any, row: CicloEvaluacion) => (
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
            onClick={() => handleDelete(row)}
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
          onClick={openCreateDialog}
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
            columns={columns}
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
              Crea un nuevo ciclo de evaluación para tu organización
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
              <Label htmlFor="plantilla">Plantilla</Label>
              <Select value={formData.plantilla_id} onValueChange={(value) => setFormData({ ...formData, plantilla_id: value || '' })}>
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
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                Crear Ciclo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Ciclo</DialogTitle>
            <DialogDescription>
              Modifica la información del ciclo de evaluación
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nombre">Nombre del Ciclo</Label>
              <Input
                id="edit-nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-fecha_inicio">Fecha de Inicio</Label>
              <Input
                id="edit-fecha_inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-fecha_fin">Fecha de Fin</Label>
              <Input
                id="edit-fecha_fin"
                type="date"
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-plantilla">Plantilla</Label>
              <Select value={formData.plantilla_id} onValueChange={(value) => setFormData({ ...formData, plantilla_id: value || '' })}>
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
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Trabajadores Dialog */}
      <Dialog open={showViewTrabajadoresDialog} onOpenChange={setShowViewTrabajadoresDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trabajadores Asignados</DialogTitle>
            <DialogDescription>
              Trabajadores asignados al ciclo: {selectedCiclo?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {trabajadoresAsignados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trabajadoresAsignados.map((trabajador) => (
                  <div key={trabajador.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{trabajador.nombre}</h4>
                        <p className="text-sm text-gray-600">{trabajador.codigo}</p>
                        <p className="text-sm text-gray-600">{trabajador.puesto}</p>
                        <Badge variant="outline" className="mt-2">
                          {trabajador.area?.nombre}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay trabajadores asignados a este ciclo</p>
              </div>
            )}
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowViewTrabajadoresDialog(false)}>
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Trabajadores Dialog */}
      <Dialog open={showAssignTrabajadoresDialog} onOpenChange={setShowAssignTrabajadoresDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Asignar Trabajadores al Ciclo</DialogTitle>
            <DialogDescription>
              Selecciona los trabajadores que deseas asignar al ciclo: {selectedCiclo?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar Trabajadores</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Buscar por nombre, código o puesto..."
                    value={searchQuery}
                    onChange={(e) => handleSearchTrabajadores(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="area">Filtrar por Área</Label>
                <Select value={selectedArea} onValueChange={(value) => setSelectedArea(value || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las áreas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las áreas</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.nombre}>
                        {area.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {filteredTrabajadores.map((trabajador) => (
                  <div key={trabajador.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
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
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{trabajador.nombre}</div>
                      <div className="text-sm text-gray-600">{trabajador.codigo} • {trabajador.puesto}</div>
                      <Badge variant="outline" className="text-xs">
                        {trabajador.area?.nombre}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">🔄 Modo Demo</h3>
        <p className="text-sm text-blue-700">
          Esta página está funcionando con datos de ejemplo para garantizar que siempre cargue correctamente. 
          La interfaz completa está disponible: crear, editar, eliminar, ver y asignar trabajadores.
        </p>
      </div>
    </div>
  )
}
