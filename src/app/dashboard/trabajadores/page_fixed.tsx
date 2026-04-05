'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Upload, Download, Search, Edit, Trash2, FileText } from 'lucide-react'
import { Trabajador, Area } from '@/types'
import { Column } from '@/components/ui/data-table'
import { TrabajadoresService } from '@/services/trabajadores'
import { AreasService } from '@/services/areas'

export default function TrabajadoresPage() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    area_id: '',
    puesto: '',
    residencia: '',
    service: ''
  })
  const [editingTrabajador, setEditingTrabajador] = useState<Trabajador | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredTrabajadores, setFilteredTrabajadores] = useState<Trabajador[]>([])

  useEffect(() => {
    loadTrabajadores()
    loadAreas()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTrabajadores(trabajadores)
    } else {
      const filtered = trabajadores.filter(trabajador => 
        trabajador.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trabajador.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trabajador.puesto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trabajador.residencia.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredTrabajadores(filtered)
    }
  }, [searchQuery, trabajadores])

  const loadTrabajadores = async () => {
    try {
      const data = await TrabajadoresService.getAll()
      setTrabajadores(data)
      setFilteredTrabajadores(data)
    } catch (error) {
      console.error('Error al cargar trabajadores:', error)
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

  const handleSearch = (query: string) => {
    console.log('🔍 Buscando:', query)
    setSearchQuery(query)
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setTimeout(() => {
      alert('Importación simulada completada')
      setShowImportDialog(false)
      setImportFile(null)
      setImporting(false)
    }, 2000)
  }

  const handleAdd = async () => {
    try {
      if (editingTrabajador) {
        // Modo edición
        await TrabajadoresService.update(editingTrabajador.id, {
          codigo: formData.codigo,
          nombre: formData.nombre,
          area_id: parseInt(formData.area_id),
          puesto: formData.puesto,
          residencia: formData.residencia,
          service: formData.service
        })
        alert('Trabajador actualizado correctamente')
      } else {
        // Modo creación
        await TrabajadoresService.create({
          codigo: formData.codigo,
          nombre: formData.nombre,
          area_id: parseInt(formData.area_id),
          puesto: formData.puesto,
          residencia: formData.residencia,
          service: formData.service
        })
        alert('Trabajador creado correctamente')
      }
      
      setShowAddDialog(false)
      setEditingTrabajador(null)
      setFormData({
        codigo: '',
        nombre: '',
        area_id: '',
        puesto: '',
        residencia: '',
        service: ''
      })
      loadTrabajadores()
    } catch (error) {
      console.error('Error al guardar trabajador:', error)
      alert('Error al guardar trabajador')
    }
  }

  const handleEdit = (trabajador: Trabajador) => {
    setEditingTrabajador(trabajador)
    setFormData({
      codigo: trabajador.codigo,
      nombre: trabajador.nombre,
      area_id: trabajador.area_id.toString(),
      puesto: trabajador.puesto,
      residencia: trabajador.residencia,
      service: trabajador.service
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (trabajador: Trabajador) => {
    if (!confirm(`¿Estás seguro de eliminar al trabajador "${trabajador.nombre}"?`)) return
    
    try {
      const { EvaluacionesService } = await import('@/services/evaluaciones')
      
      const evaluacionesDelTrabajador = await EvaluacionesService.getByTrabajador(trabajador.id)
      
      if (evaluacionesDelTrabajador.length > 0) {
        const evaluacionesPorCiclo = evaluacionesDelTrabajador.reduce((acc, evaluacion) => {
          const cicloNombre = evaluacion.ciclo?.nombre || 'Ciclo desconocido'
          if (!acc[cicloNombre]) {
            acc[cicloNombre] = []
          }
          acc[cicloNombre].push(evaluacion.tipo_evaluador)
          return acc
        }, {} as Record<string, string[]>)
        
        const listaCiclos = Object.entries(evaluacionesPorCiclo)
          .map(([ciclo, evaluadores]) => `• ${ciclo} (${evaluadores.join(', ')})`)
          .join('\n   ')
        
        const mensaje = `❌ No se puede eliminar al trabajador "${trabajador.nombre}"\n\n` +
                       `👤 Tiene ${evaluacionesDelTrabajador.length} evaluaciones asociadas:\n` +
                       `   ${listaCiclos}\n\n` +
                       `⚠️ Para eliminar al trabajador, primero debe eliminar sus evaluaciones.\n` +
                       `📋 Esto protege la integridad del historial de evaluaciones.`
        
        alert(mensaje)
        return
      }
      
      await TrabajadoresService.delete(trabajador.id)
      alert('✅ Trabajador eliminado correctamente')
      loadTrabajadores()
    } catch (error) {
      console.error('❌ Error al eliminar trabajador:', error)
      
      if (error instanceof Error && error.message.includes('foreign key constraint')) {
        alert('❌ No se puede eliminar al trabajador porque tiene referencias en el sistema.\n\n' +
              '📋 Contacte al administrador para eliminar las referencias manualmente.')
      } else {
        alert('❌ Error al eliminar trabajador')
      }
    }
  }

  const handleExport = async () => {
    try {
      console.log('🚀 Iniciando exportación de trabajadores...')
      
      const { TrabajadoresService } = await import('@/services/trabajadores')
      
      await TrabajadoresService.exportToExcel(trabajadores)
      
      alert('✅ Trabajadores exportados correctamente a Excel')
    } catch (error) {
      console.error('❌ Error al exportar trabajadores:', error)
      alert('❌ Error al exportar trabajadores a Excel')
    }
  }

  const handleDownloadPlantilla = async () => {
    try {
      console.log('📋 Descargando plantilla de importación...')
      
      const { TrabajadoresService } = await import('@/services/trabajadores')
      
      await TrabajadoresService.downloadPlantillaImportacion()
      
      alert('✅ Plantilla de importación descargada correctamente')
    } catch (error) {
      console.error('❌ Error al descargar plantilla:', error)
      alert('❌ Error al descargar plantilla')
    }
  }

  const columns: Column<Trabajador>[] = [
    {
      key: 'codigo',
      header: 'Código',
      sortable: true
    },
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: true
    },
    {
      key: 'area',
      header: 'Área',
      render: (value: any) => value?.nombre || 'N/A'
    },
    {
      key: 'puesto',
      header: 'Puesto',
      sortable: true
    },
    {
      key: 'residencia',
      header: 'Residencia',
      sortable: true
    },
    {
      key: 'service',
      header: 'Service',
      sortable: true
    },
    {
      key: 'id',
      header: 'Acciones',
      render: (value: any, row: Trabajador) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Eliminar
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trabajadores</h1>
          <p className="text-gray-600">Gestión de trabajadores de SEACORP PERÚ</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Trabajadores desde Excel</DialogTitle>
                <DialogDescription>
                  Sube un archivo Excel con las columnas: codigo, nombre, area, puesto, residencia, service
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Archivo Excel</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImport} disabled={!importFile || importing}>
                    {importing ? 'Importando...' : 'Importar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTrabajador ? 'Editar Trabajador' : 'Agregar Nuevo Trabajador'}
                </DialogTitle>
                <DialogDescription>
                  {editingTrabajador ? 'Modifica los datos del trabajador' : 'Completa los datos para agregar un nuevo trabajador'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="codigo">Código</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Área</Label>
                    <Select value={formData.area_id} onValueChange={(value) => setFormData({ ...formData, area_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un área" />
                      </SelectTrigger>
                      <SelectContent>
                        {areas.map((area) => (
                          <SelectItem key={area.id} value={area.id.toString()}>
                            {area.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="puesto">Puesto</Label>
                    <Input
                      id="puesto"
                      value={formData.puesto}
                      onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="residencia">Residencia</Label>
                    <Input
                      id="residencia"
                      value={formData.residencia}
                      onChange={(e) => setFormData({ ...formData, residencia: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="service">Service</Label>
                    <Input
                      id="service"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setShowAddDialog(false)
                    setEditingTrabajador(null)
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                    {editingTrabajador ? 'Actualizar' : 'Guardar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Trabajador
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setShowImportDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Importar Excel
        </Button>

        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>

        <Button variant="outline" onClick={handleDownloadPlantilla}>
          <FileText className="mr-2 h-4 w-4" />
          Descargar Plantilla
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Trabajadores</CardTitle>
              <CardDescription>
                Total de trabajadores: {filteredTrabajadores.length} de {trabajadores.length}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar trabajador..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredTrabajadores}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron trabajadores"
          />
        </CardContent>
      </Card>
    </div>
  )
}
