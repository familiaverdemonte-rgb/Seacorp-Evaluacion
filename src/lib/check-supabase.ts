import { supabase } from './supabase'

export async function checkSupabaseConnection() {
  try {
    console.log('Verificando conexión a Supabase...')
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'No configurada')
    console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada')
    
    // Intentar una consulta simple para verificar la conexión
    const { data, error } = await supabase.from('areas').select('count').single()
    
    if (error) {
      console.error('Error de conexión a Supabase:', error.message)
      return {
        success: false,
        error: error.message,
        connected: false
      }
    }
    
    console.log('✅ Conexión a Supabase exitosa')
    return {
      success: true,
      connected: true,
      data: data
    }
  } catch (err) {
    console.error('Error al verificar Supabase:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
      connected: false
    }
  }
}

// Función para verificar si las variables de entorno están configuradas
export function checkEnvironmentVariables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return {
    url: {
      configured: !!url,
      value: url ? url.replace(/https?:\/\/([^\.]+)\..*/, 'https://***.***') : null
    },
    key: {
      configured: !!key,
      value: key ? `${key.substring(0, 20)}...` : null
    }
  }
}
