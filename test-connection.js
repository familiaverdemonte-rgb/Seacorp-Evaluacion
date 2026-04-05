// Script para verificar conexión a Supabase
console.log('🔍 Verificando conexión a Supabase...')
console.log('=====================================\n')

// Verificar variables de entorno
console.log('📋 Variables de entorno:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configurada' : '❌ No configurada')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada')

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('🔗 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
}
if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('🔑 Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...')
}

console.log('\n🧪 Probando conexión...')

// Importar y probar conexión
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ ERROR: Faltan variables de entorno')
  process.exit(1)
}

console.log('🚀 Creando cliente Supabase con URL real...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Probar conexión
async function testConnection() {
  try {
    console.log('📊 Intentando consultar tabla areas...')
    const { data, error } = await supabase.from('areas').select('count').single()
    
    if (error) {
      console.log('❌ ERROR DE CONEXIÓN:')
      console.log('   Código:', error.code)
      console.log('   Mensaje:', error.message)
      console.log('   Detalles:', error.details)
      
      if (error.message.includes('relation "public.areas" does not exist')) {
        console.log('\n💡 SOLUCIÓN: Las tablas no existen')
        console.log('   Ejecuta el SQL en database-schema.sql en tu dashboard de Supabase')
      }
      
      return false
    }
    
    console.log('✅ CONEXIÓN EXITOSA:')
    console.log('   Datos:', data)
    console.log('   Tabla areas accesible')
    
    // Probar otra tabla
    console.log('\n📊 Intentando consultar tabla trabajadores...')
    const { data: trabajadores, error: errorTrabajadores } = await supabase.from('trabajadores').select('count').single()
    
    if (errorTrabajadores) {
      console.log('❌ ERROR en tabla trabajadores:', errorTrabajadores.message)
    } else {
      console.log('✅ Tabla trabajadores accesible:', trabajadores)
    }
    
    return true
  } catch (err) {
    console.log('❌ ERROR GENERAL:', err.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 ¡SISTEMA CONECTADO A SUPABASE REAL!')
    console.log('📁 El archivo .env.local está configurado correctamente')
    console.log('🔄 Reinicia el servidor con: npm run dev')
  } else {
    console.log('\n❌ NO HAY CONEXIÓN A SUPABASE')
    console.log('📁 Revisa tu archivo .env.local')
    console.log('📁 Ejecuta el SQL en database-schema.sql')
  }
})
