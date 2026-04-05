// Prueba directa de conexión a Supabase para verificar si es real o simulado
require('dotenv').config({ path: '.env.local' })

console.log('🔍 PRUEBA DEFINITIVA DE CONEXIÓN')
console.log('=====================================\n')

async function testRealConnection() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔗 URL:', supabaseUrl)
    console.log('🔑 Key:', supabaseAnonKey ? 'Configurada' : 'No configurada')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ No hay credenciales')
      return false
    }
    
    // Crear cliente
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Verificar si es demo o real
    if (supabaseUrl.includes('demo-project.supabase.co')) {
      console.log('❌ ESTÁ USANDO URL DE DEMO')
      console.log('❌ Por eso sale simulado')
      return false
    }
    
    if (supabaseUrl.includes('hruwezjiievzwopxtzal.supabase.co')) {
      console.log('✅ ESTÁ USANDO URL REAL')
      console.log('✅ Debería conectar a Supabase real')
    } else {
      console.log('⚠️ URL desconocida:', supabaseUrl)
    }
    
    // Probar conexión real
    console.log('\n📊 Probando conexión a areas...')
    const { data, error } = await supabase.from('areas').select('*').limit(5)
    
    if (error) {
      console.log('❌ Error de conexión:', error.message)
      return false
    }
    
    console.log('✅ Conexión exitosa')
    console.log('📊 Áreas encontradas:', data?.length || 0)
    
    if (data && data.length > 0) {
      console.log('📋 Áreas:', data.map(a => a.nombre))
    }
    
    // Probar inserción
    console.log('\n🧪 Probando inserción de área de prueba...')
    const testArea = {
      nombre: `ÁREA PRUEBA ${Date.now()}`
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('areas')
      .insert(testArea)
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Error al insertar:', insertError.message)
      console.log('💡 Esto explica por qué sale simulado')
      return false
    }
    
    console.log('✅ Inserción exitosa:', insertData)
    
    // Eliminar área de prueba
    await supabase.from('areas').delete().eq('id', insertData.id)
    console.log('🗑️ Área de prueba eliminada')
    
    return true
    
  } catch (error) {
    console.log('❌ Error general:', error.message)
    return false
  }
}

testRealConnection().then(isReal => {
  console.log('\n🎯 RESULTADO FINAL:')
  if (isReal) {
    console.log('✅ CONEXIÓN REAL A SUPABASE FUNCIONANDO')
    console.log('🔄 Si sigue saliendo simulado, el problema es:')
    console.log('   1. Cache del navegador - Limpia F5')
    console.log('   2. Servidor no recargó - Reinicia npm run dev')
    console.log('   3. Código antiguo - Limpia .next y reinicia')
  } else {
    console.log('❌ NO HAY CONEXIÓN REAL')
    console.log('📁 El problema está en:')
    console.log('   1. Variables de entorno no cargan')
    console.log('   2. Políticas RLS bloquean')
    console.log('   3. Código todavía usa modo demo')
  }
})
