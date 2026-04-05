'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Settings, Edit, Trash2, Copy } from 'lucide-react'
import { Plantilla, Area } from '@/types'
import { Column } from '@/components/ui/data-table'
import { PlantillasService } from '@/services/plantillas'
import { AreasService } from '@/services/areas'

export default function ConfiguracionPage() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlantillaDialog, setShowPlantillaDialog] = useState(false)
  const [showAreaDialog, setShowAreaDialog] = useState(false)
  const [editingPlantilla, setEditingPlantilla] = useState<Plantilla | null>(null)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [formData, setFormData] = useState({ nombre: '' })

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
      const data = await AreasService.getWithStats()
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
      setFormData({ nombre: '' })
      loadPlantillas()
    } catch (error) {
      console.error('Error al crear plantilla:', error)
      alert('Error al crear plantilla')
    }
  }

  const handleCreateArea = async () => {
    try {
      await AreasService.create({ nombre: formData.nombre })
      alert('Área creada correctamente')
      setShowAreaDialog(false)
      setFormData({ nombre: '' })
      loadAreas()
    } catch (error) {
      console.error('Error al crear área:', error)
      alert('Error al crear área')
    }
  }

  const handleUpdatePlantilla = async () => {
    if (!editingPlantilla) return
    try {
      await PlantillasService.update(editingPlantilla.id, { nombre: formData.nombre })
      alert('Plantilla actualizada correctamente')
      setShowPlantillaDialog(false)
      setEditingPlantilla(null)
      setFormData({ nombre: '' })
      loadPlantillas()
    } catch (error) {
      console.error('Error al actualizar plantilla:', error)
      alert('Error al actualizar plantilla')
    }
  }

  const handleUpdateArea = async () => {
    if (!editingArea) return
    try {
      await AreasService.update(editingArea.id, { nombre: formData.nombre })
      alert('Área actualizada correctamente')
      setShowAreaDialog(false)
      setEditingArea(null)
      setFormData({ nombre: '' })
      loadAreas()
    } catch (error) {
      console.error('Error al actualizar área:', error)
      alert('Error al actualizar área')
    }
  }

  const handleDeletePlantilla = async (plantilla: Plantilla) => {
    if (!confirm(`¿Estás seguro de eliminar la plantilla "${plantilla.nombre}"?`)) return
    try {
      await PlantillasService.delete(plantilla.id)
      alert('Plantilla eliminada correctamente')
      loadPlantillas()
    } catch (error) {
      console.error('Error al eliminar plantilla:', error)
      alert('Error al eliminar plantilla')
    }
  }

  const handleDeleteArea = async (area: Area) => {
    if (!confirm(`¿Estás seguro de eliminar el área "${area.nombre}"?`)) return
    try {
      await AreasService.delete(area.id)
      alert('Área eliminada correctamente')
      loadAreas()
    } catch (error) {
      console.error('Error al eliminar área:', error)
      alert('Error al eliminar área')
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

  const handleEditPlantilla = (plantilla: Plantilla) => {
    setEditingPlantilla(plantilla)
    setFormData({ nombre: plantilla.nombre })
    setShowPlantillaDialog(true)
  }

  const handleEditArea = (area: Area) => {
    setEditingArea(area)
    setFormData({ nombre: area.nombre })
    setShowAreaDialog(true)
  }

  const plantillaColumns: Column<Plantilla>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (value: any, row: Plantilla) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditPlantilla(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicatePlantilla(row)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeletePlantilla(row)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const areaColumns: Column<Area>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      key: 'trabajadores_count',
      header: 'Trabajadores',
      render: (value: any) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value === 0 
            ? 'bg-gray-100 text-gray-800' 
            : value <= 5 
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
        }`}>
          {value || 0}
        </span>
      )
    },
    {
      key: 'puestos',
      header: 'Puestos',
      render: (value: any, row: any) => {
        // Obtener puestos únicos para esta área
        const puestosUnicos = row.puestos_unicos || []
        return (
          <div className="max-w-xs">
            {puestosUnicos.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {puestosUnicos.slice(0, 3).map((puesto: string, index: number) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                  >
                    {puesto}
                  </span>
                ))}
                {puestosUnicos.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                    +{puestosUnicos.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-gray-400 text-xs">Sin puestos</span>
            )}
          </div>
        )
      }
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (value: any, row: Area) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditArea(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteArea(row)}
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
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600">Gestión de plantillas y áreas del sistema</p>
      </div>

      {/* Plantillas Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Plantillas de Evaluación</CardTitle>
              <CardDescription>Gestiona las plantillas para evaluaciones de desempeño</CardDescription>
            </div>
            <Dialog open={showPlantillaDialog} onOpenChange={setShowPlantillaDialog}>
              <DialogTrigger>
                <Button onClick={() => {
                  setEditingPlantilla(null)
                  setFormData({ nombre: '' })
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Plantilla
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPlantilla ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPlantilla ? 'Modifica los datos de la plantilla' : 'Crea una nueva plantilla de evaluación'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ nombre: e.target.value })}
                      placeholder="Nombre de la plantilla"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowPlantillaDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={editingPlantilla ? handleUpdatePlantilla : handleCreatePlantilla}>
                      {editingPlantilla ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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

      {/* Areas Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Áreas</CardTitle>
              <CardDescription>Gestiona las áreas organizacionales</CardDescription>
            </div>
            <Dialog open={showAreaDialog} onOpenChange={setShowAreaDialog}>
              <DialogTrigger>
                <Button onClick={() => {
                  setEditingArea(null)
                  setFormData({ nombre: '' })
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Área
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingArea ? 'Editar Área' : 'Nueva Área'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingArea ? 'Modifica los datos del área' : 'Crea una nueva área organizacional'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ nombre: e.target.value })}
                      placeholder="Nombre del área"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAreaDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={editingArea ? handleUpdateArea : handleCreateArea}>
                      {editingArea ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            data={areas} 
            columns={areaColumns}
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
