'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Edit, Trash2, Users, CheckCircle, XCircle, Eye } from 'lucide-react'

export default function CiclosPage() {
  const [loading, setLoading] = useState(true)
  const [ciclos, setCiclos] = useState<any[]>([])

  useEffect(() => {
    // Simular carga de datos sin depender de Supabase
    setTimeout(() => {
      setCiclos([
        {
          id: 1,
          nombre: 'Evaluación 2024 - Primer Semestre',
          estado: 'abierto',
          fecha_inicio: '2024-01-01',
          fecha_fin: '2024-06-30',
          trabajadores_asignados: 15,
          plantilla_nombre: 'Plantilla Corporativa'
        },
        {
          id: 2,
          nombre: 'Evaluación 2023 - Segundo Semestre',
          estado: 'cerrado',
          fecha_inicio: '2023-07-01',
          fecha_fin: '2023-12-31',
          trabajadores_asignados: 12,
          plantilla_nombre: 'Plantilla Corporativa'
        }
      ])
      setLoading(false)
    }, 1000)
  }, [])

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
          onClick={() => alert('Función de crear ciclo en desarrollo')}
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
          <div className="space-y-4">
            {ciclos.map((ciclo) => (
              <div key={ciclo.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{ciclo.nombre}</h3>
                      <Badge
                        variant={ciclo.estado === 'abierto' ? 'default' : 'secondary'}
                        className={
                          ciclo.estado === 'abierto'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {ciclo.estado === 'abierto' ? (
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
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(ciclo.fecha_inicio).toLocaleDateString()} - {new Date(ciclo.fecha_fin).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {ciclo.trabajadores_asignados} trabajadores asignados
                      </div>
                      <div>
                        Plantilla: {ciclo.plantilla_nombre}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Función de editar en desarrollo')}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Función de ver trabajadores en desarrollo')}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alert('Función de eliminar en desarrollo')}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">🚧 Modo de Desarrollo</h3>
        <p className="text-sm text-yellow-700">
          Esta página está funcionando con datos de ejemplo para aislar problemas de conexión. 
          La funcionalidad completa estará disponible cuando se resuelvan los problemas de conexión con Supabase en Vercel.
        </p>
      </div>
    </div>
  )
}
