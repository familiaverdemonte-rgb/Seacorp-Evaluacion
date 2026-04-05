// Diagnóstico completo del sistema
require('dotenv').config({ path: '.env.local' })

console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA')
console.log('=====================================\n')

// 1. Verificar variables de entorno
console.log('1️⃣ VARIABLES DE ENTORNO:')
console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌')

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('   URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
} else {
  console.log('   ❌ URL NO ENCONTRADA')
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('   KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...')
} else {
  console.log('   ❌ KEY NO ENCONTRADA')
}

// 2. Verificar archivo .env.local
const fs = require('fs')
try {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  console.log('\n2️⃣ ARCHIVO .env.local:')
  console.log('   ✅ Archivo existe')
  console.log('   Tamaño:', envContent.length, 'bytes')
  console.log('   Líneas:', envContent.split('\n').length)
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('   ✅ Contiene NEXT_PUBLIC_SUPABASE_URL')
  } else {
    console.log('   ❌ NO contiene NEXT_PUBLIC_SUPABASE_URL')
  }
  
  if (envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log('   ✅ Contiene NEXT_PUBLIC_SUPABASE_ANON_KEY')
  } else {
    console.log('   ❌ NO contiene NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
} catch (error) {
  console.log('\n2️⃣ ARCHIVO .env.local:')
  console.log('   ❌ Error al leer archivo:', error.message)
}

// 3. Probar conexión a Supabase
console.log('\n3️⃣ CONEXIÓN A SUPABASE:')

async function testConnection() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('   ❌ No hay credenciales para probar conexión')
      return false
    }
    
    console.log('   🚀 Creando cliente con URL real...')
    console.log('   URL:', supabaseUrl)
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    console.log('   📊 Probando conexión a tabla areas...')
    const { data, error } = await supabase.from('areas').select('count').single()
    
    if (error) {
      console.log('   ❌ ERROR DE CONEXIÓN:')
      console.log('      Código:', error.code)
      console.log('      Mensaje:', error.message)
      
      if (error.message.includes('relation "public.areas" does not exist')) {
        console.log('      💡 Las tablas no existen en Supabase')
        console.log('      💡 Ejecuta database-schema.sql en tu dashboard')
      }
      
      return false
    }
    
    console.log('   ✅ CONEXIÓN EXITOSA')
    console.log('   📊 Datos:', data)
    
    // Probar insertar un área de prueba
    console.log('   🧪 Probando insertar área de prueba...')
    const { data: insertData, error: insertError } = await supabase
      .from('areas')
      .insert({ nombre: 'ÁREA PRUEBA DIAGNÓSTICO' })
      .select()
      .single()
    
    if (insertError) {
      console.log('   ❌ ERROR AL INSERTAR:', insertError.message)
    } else {
      console.log('   ✅ INSERCIÓN EXITOSA:', insertData)
      
      // Eliminar área de prueba
      await supabase.from('areas').delete().eq('id', insertData.id)
      console.log('   🗑️ Área de prueba eliminada')
    }
    
    return true
  } catch (error) {
    console.log('   ❌ ERROR GENERAL:', error.message)
    return false
  }
}

// 4. Verificar código fuente
console.log('\n4️⃣ CÓDIGO FUENTE:')
try {
  const supabaseCode = fs.readFileSync('./src/lib/supabase.ts', 'utf8')
  
  if (supabaseCode.includes('demo-project.supabase.co')) {
    console.log('   ❌ El código todavía contiene modo demo')
  } else {
    console.log('   ✅ El código no contiene modo demo')
  }
  
  if (supabaseCode.includes('process.env.NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('   ✅ El código usa variables de entorno')
  } else {
    console.log('   ❌ El código no usa variables de entorno')
  }
} catch (error) {
  console.log('   ❌ Error al leer código:', error.message)
}

// Ejecutar prueba de conexión
testConnection().then(success => {
  console.log('\n🎯 RESULTADO FINAL:')
  if (success) {
    console.log('   ✅ SISTEMA CONECTADO A SUPABASE REAL')
    console.log('   🔄 Reinicia el servidor: npm run dev')
    console.log('   🌐 Abre: http://localhost:3000/dashboard')
  } else {
    console.log('   ❌ SISTEMA NO CONECTADO')
    console.log('   📁 Revisa las credenciales en .env.local')
    console.log('   📁 Ejecuta el SQL en database-schema.sql')
  }
})
