'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FileText, 
  Settings, 
  TrendingUp,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { checkSupabaseConnection, checkEnvironmentVariables } from '@/lib/check-supabase'
import { TrabajadoresService } from '@/services/trabajadores'
import { EvaluacionesService } from '@/services/evaluaciones'
import { AreasService } from '@/services/areas'

interface ConnectionStatus {
  success: boolean
  connected: boolean
  error?: string
  data?: any
}

interface DashboardStats {
  totalTrabajadores: number
  totalEvaluaciones: number
  totalAreas: number
  evaluacionesCompletadas: number
}

export default function DashboardPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [checking, setChecking] = useState(false)
  const [envStatus, setEnvStatus] = useState(checkEnvironmentVariables())
  const [stats, setStats] = useState<DashboardStats>({
    totalTrabajadores: 0,
    totalEvaluaciones: 0,
    totalAreas: 0,
    evaluacionesCompletadas: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkConnection()
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      
      // Cargar datos en paralelo
      const [trabajadores, evaluaciones, areas] = await Promise.all([
        TrabajadoresService.getAll(),
        EvaluacionesService.getAll(),
        AreasService.getAll()
      ])

      const evaluacionesCompletadas = evaluaciones.filter(e => e.estado === 'completada').length

      setStats({
        totalTrabajadores: trabajadores.length,
        totalEvaluaciones: evaluaciones.length,
        totalAreas: areas.length,
        evaluacionesCompletadas
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkConnection = async () => {
    setChecking(true)
    try {
      const status = await checkSupabaseConnection()
      setConnectionStatus(status)
    } catch (error) {
      setConnectionStatus({
        success: false,
        connected: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setChecking(false)
    }
  }

  const getConnectionIcon = () => {
    if (checking) return <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />
    if (!connectionStatus) return <Database className="h-4 w-4 text-gray-500" />
    if (connectionStatus.connected) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getConnectionText = () => {
    if (checking) return 'Verificando...'
    if (!connectionStatus) return 'Sin verificar'
    if (connectionStatus.connected) return 'Conectado'
    return 'Error de conexión'
  }

  const getConnectionColor = () => {
    if (checking) return 'text-yellow-600 bg-yellow-100 border-yellow-200'
    if (!connectionStatus) return 'text-gray-600 bg-gray-100 border-gray-200'
    if (connectionStatus.connected) return 'text-green-600 bg-green-100 border-green-200'
    return 'text-red-600 bg-red-100 border-red-200'
  }
  return (
    <div className="space-y-6 font-corporate-body">
      <div>
        <h1 className="text-3xl font-bold font-corporate text-slate-900">Dashboard</h1>
        <p className="text-slate-600 font-medium">Sistema de Evaluación de Desempeño - SEACORP PERÚ</p>
      </div>

      {/* Tarjetas de navegación rápida */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-blue-900 font-corporate">Trabajadores</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-900 font-corporate">
              {loading ? "..." : stats.totalTrabajadores}
            </div>
            <p className="text-xs text-blue-700 font-medium font-corporate">
              Total de trabajadores registrados
            </p>
            <Link href="/dashboard/trabajadores">
              <Button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-700 font-corporate">
                Gestionar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-green-900 font-corporate">Evaluaciones</CardTitle>
            <FileText className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-900 font-corporate">
              {loading ? "..." : stats.totalEvaluaciones}
            </div>
            <p className="text-xs text-green-700 font-medium font-corporate">
              {stats.evaluacionesCompletadas} completadas de {stats.totalEvaluaciones} totales
            </p>
            <Link href="/dashboard/evaluaciones">
              <Button className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white border-green-700 font-corporate">
                Ver Evaluaciones
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-purple-900 font-corporate">Configuración</CardTitle>
            <Settings className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-purple-900 font-corporate">
              {loading ? "..." : stats.totalAreas}
            </div>
            <p className="text-xs text-purple-700 font-medium font-corporate">
              Áreas y plantillas configuradas
            </p>
            <Link href="/dashboard/configuracion">
              <Button className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white border-purple-700 font-corporate">
                Configurar
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg">
            <CardTitle className="text-sm font-medium text-orange-900 font-corporate">Reportes</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-orange-900 font-corporate">
              {loading ? "..." : stats.evaluacionesCompletadas}
            </div>
            <p className="text-xs text-orange-700 font-medium font-corporate">
              Evaluaciones completadas para reportes
            </p>
            <Link href="/dashboard/reportes">
              <Button className="mt-3 w-full bg-orange-600 hover:bg-orange-700 text-white border-orange-700 font-corporate">
                Generar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Estado de conexión a Supabase */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-t-lg">
          <CardTitle className="text-sm font-medium text-indigo-900 font-corporate">Estado de Conexión</CardTitle>
          <Database className="h-5 w-5 text-indigo-600" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            {/* Variables de entorno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 font-corporate">URL Supabase</span>
                  {envStatus.url.configured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <span className="text-xs text-slate-600 font-corporate">
                  {envStatus.url.value || 'No configurada'}
                </span>
              </div>
              <div className="p-3 rounded-lg border bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 font-corporate">API Key</span>
                  {envStatus.key.configured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <span className="text-xs text-slate-600 font-corporate">
                  {envStatus.key.value || 'No configurada'}
                </span>
              </div>
            </div>

            {/* Estado de conexión */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${getConnectionColor()}`}>
              <div className="flex items-center space-x-2">
                {getConnectionIcon()}
                <div>
                  <div className="text-sm font-medium font-corporate">Conexión a Base de Datos</div>
                  <div className="text-xs opacity-75">{getConnectionText()}</div>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkConnection}
                disabled={checking}
                className="font-corporate"
              >
                {checking ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>

            {/* Mensaje de error */}
            {connectionStatus && !connectionStatus.connected && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800 font-corporate">Error de conexión</div>
                    <div className="text-xs text-red-600 font-corporate mt-1">
                      {connectionStatus.error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje de éxito */}
            {connectionStatus && connectionStatus.connected && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-green-800 font-corporate">Conexión exitosa</div>
                    <div className="text-xs text-green-600 font-corporate mt-1">
                      El sistema está conectado correctamente a Supabase
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Card className="border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <CardTitle className="text-xl font-bold text-white font-corporate">Bienvenido al Sistema de Evaluación</CardTitle>
          <CardDescription className="text-blue-100">
            Sistema completo de evaluación de desempeño 360° para SEACORP PERÚ
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center font-corporate">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Características Principales
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✅</span>
                  <span className="text-slate-700 font-corporate font-corporate">Evaluación 360° con pesos ponderados</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✅</span>
                  <span className="text-slate-700 font-corporate">Gestión de trabajadores y áreas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✅</span>
                  <span className="text-slate-700 font-corporate">Plantillas dinámicas de evaluación</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✅</span>
                  <span className="text-slate-700 font-corporate">Auto-save durante evaluaciones</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✅</span>
                  <span className="text-slate-700 font-corporate">Reportes en PDF y Excel</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">✅</span>
                  <span className="text-slate-700 font-corporate">Dashboard con KPIs en tiempo real</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center font-corporate">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Estado del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-800 font-corporate">Servidor funcionando</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Activo</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-blue-800 font-corporate">Base de datos conectada</span>
                  </div>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {connectionStatus?.connected ? 'Real' : 'Demo'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-800 font-corporate">Datos en tiempo real</span>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                    {loading ? 'Cargando...' : 'Listo'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
