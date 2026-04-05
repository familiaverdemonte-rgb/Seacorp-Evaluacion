'use client'

import { useState, useEffect } from 'react'

export default function CiclosPage() {
  const [loading, setLoading] = useState(true)
  const [ciclos, setCiclos] = useState<any[]>([])

  useEffect(() => {
    // Simular carga de datos
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
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <span className="mr-2">+</span>
          Nuevo Ciclo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Ciclos Activos</h2>
          <div className="space-y-4">
            {ciclos.map((ciclo) => (
              <div key={ciclo.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{ciclo.nombre}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ciclo.estado === 'abierto'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {ciclo.estado === 'abierto' ? 'Abierto' : 'Cerrado'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <strong>Fecha:</strong> {new Date(ciclo.fecha_inicio).toLocaleDateString()} - {new Date(ciclo.fecha_fin).toLocaleDateString()}
                      </div>
                      <div>
                        <strong>Trabajadores asignados:</strong> {ciclo.trabajadores_asignados}
                      </div>
                      <div>
                        <strong>Plantilla:</strong> {ciclo.plantilla_nombre}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
                      Editar
                    </button>
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
                      Ver
                    </button>
                    <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
