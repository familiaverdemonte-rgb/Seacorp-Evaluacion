'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Users, 
  Building,
  FileSpreadsheet,
  File,
  Loader2
} from 'lucide-react'
import { Trabajador, Area } from '@/types'
import { TrabajadoresService } from '@/services/trabajadores'
import { AreasService } from '@/services/areas'

export default function ReportesPage() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrabajador, setSelectedTrabajador] = useState<string | undefined>(undefined)
  const [selectedArea, setSelectedArea] = useState<string | undefined>(undefined)
  const [selectedCiclo, setSelectedCiclo] = useState<string>('1')
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => {
    loadTrabajadores()
    loadAreas()
  }, [])

  const loadTrabajadores = async () => {
    try {
      const data = await TrabajadoresService.getAll()
      setTrabajadores(data)
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

  const handleGenerateReport = async (type: string, scope: string) => {
    const reportId = `${type}-${scope}`
    
    try {
      setGenerating(reportId)

      // Importar servicios dinámicamente
      const { ReportesService } = await import('@/services/reportes')
      const { CiclosEvaluacionService } = await import('@/services/ciclos-evaluacion')

      const cicloId = parseInt(selectedCiclo)

      // Generar reporte según tipo y alcance
      switch (type) {
        case 'pdf':
          switch (scope) {
            case 'individual':
              if (!selectedTrabajador) {
                alert('Por favor selecciona un trabajador para el reporte individual')
                return
              }
              await ReportesService.generarReporteIndividual(parseInt(selectedTrabajador), cicloId)
              break
            case 'area':
              if (!selectedArea) {
                alert('Por favor selecciona un área para el reporte por área')
                return
              }
              await ReportesService.generarReportePorArea(parseInt(selectedArea), cicloId)
              break
            case 'general':
              await ReportesService.generarReporteGeneral(cicloId)
              break
          }
          break

        case 'excel':
          switch (scope) {
            case 'evaluaciones':
              await ReportesService.exportarEvaluacionesExcel(cicloId)
              break
            case 'resultados':
              await ReportesService.exportarResultadosExcel(cicloId)
              break
          }
          break
      }

      alert(`Reporte ${type} - ${scope} generado y descargado correctamente`)
    } catch (error) {
      console.error('Error al generar reporte:', error)
      alert(`Error al generar reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setGenerating(null)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <File className="h-8 w-8 text-red-600" />
      case 'excel':
        return <FileSpreadsheet className="h-8 w-8 text-green-600" />
      default:
        return <FileText className="h-8 w-8 text-blue-600" />
    }
  }

  const isLoading = (type: string, scope: string) => {
    return generating === `${type}-${scope}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="text-gray-600">Generación de reportes de evaluación de desempeño</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>
            Selecciona los parámetros para generar el reporte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="ciclo">Ciclo de Evaluación</Label>
              <Select value={selectedCiclo || ''} onValueChange={(value) => setSelectedCiclo(value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ciclo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Ciclo 2024-01</SelectItem>
                  <SelectItem value="2">Ciclo 2024-02</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trabajador">Trabajador (para reporte individual)</Label>
              <Select value={selectedTrabajador || ''} onValueChange={(value) => setSelectedTrabajador(value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar trabajador" />
                </SelectTrigger>
                <SelectContent>
                  {trabajadores.map((trabajador) => (
                    <SelectItem key={trabajador.id} value={trabajador.id.toString()}>
                      {trabajador.nombre} - {trabajador.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area">Área (para reporte por área)</Label>
              <Select value={selectedArea || ''} onValueChange={(value) => setSelectedArea(value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar área" />
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
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Reporte */}
      <Tabs defaultValue="pdf" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pdf">Reportes PDF</TabsTrigger>
          <TabsTrigger value="excel">Exportación Excel</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reporte Individual */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {getIcon('pdf')}
                  <div>
                    <CardTitle className="text-lg">Reporte Individual</CardTitle>
                    <CardDescription>
                      Reporte detallado para un trabajador específico
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {selectedTrabajador 
                        ? trabajadores.find(t => t.id.toString() === selectedTrabajador)?.nombre
                        : 'Sin seleccionar'
                      }
                    </span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleGenerateReport('pdf', 'individual')}
                    disabled={!selectedTrabajador || isLoading('pdf', 'individual')}
                  >
                    {isLoading('pdf', 'individual') ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generar PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reporte por Área */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {getIcon('pdf')}
                  <div>
                    <CardTitle className="text-lg">Reporte por Área</CardTitle>
                    <CardDescription>
                      Reporte consolidado de todos los trabajadores de un área
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {selectedArea 
                        ? areas.find(a => a.id.toString() === selectedArea)?.nombre
                        : 'Sin seleccionar'
                      }
                    </span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleGenerateReport('pdf', 'area')}
                    disabled={!selectedArea || isLoading('pdf', 'area')}
                  >
                    {isLoading('pdf', 'area') ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generar PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reporte General */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {getIcon('pdf')}
                  <div>
                    <CardTitle className="text-lg">Reporte General</CardTitle>
                    <CardDescription>
                      Reporte completo de toda la empresa
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Todas las áreas y trabajadores
                    </span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => handleGenerateReport('pdf', 'general')}
                    disabled={isLoading('pdf', 'general')}
                  >
                    {isLoading('pdf', 'general') ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generar PDF
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="excel" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exportar Evaluaciones */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {getIcon('excel')}
                  <div>
                    <CardTitle className="text-lg">Evaluaciones</CardTitle>
                    <CardDescription>
                      Exporta todas las evaluaciones del ciclo
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Datos completos de evaluaciones
                    </span>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleGenerateReport('excel', 'evaluaciones')}
                    disabled={isLoading('excel', 'evaluaciones')}
                  >
                    {isLoading('excel', 'evaluaciones') ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Excel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exportar Resultados */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  {getIcon('excel')}
                  <div>
                    <CardTitle className="text-lg">Resultados 360°</CardTitle>
                    <CardDescription>
                      Exporta los resultados finales calculados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      Puntajes finales y clasificaciones
                    </span>
                  </div>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => handleGenerateReport('excel', 'resultados')}
                    disabled={isLoading('excel', 'resultados')}
                  >
                    {isLoading('excel', 'resultados') ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Exportando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Excel
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Información */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Reportes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Reportes PDF</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Formato profesional para impresión</li>
                <li>• Incluye gráficos y tablas detalladas</li>
                <li>• Ideal para presentaciones ejecutivas</li>
                <li>• Contiene firmas y sellos digitales</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Exportación Excel</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Datos crudos para análisis</li>
                <li>• Compatible con Microsoft Excel</li>
                <li>• Permite crear gráficos personalizados</li>
                <li>• Ideal para análisis de datos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
