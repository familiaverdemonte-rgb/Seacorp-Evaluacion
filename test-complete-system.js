// PRUEBA COMPLETA DEL SISTEMA - CONEXIÓN A SUPABASE
require('dotenv').config({ path: '.env.local' })

console.log('🔍 AUDIT COMPLETO DEL SISTEMA')
console.log('=====================================\n')

async function testCompleteSystem() {
  try {
    // 1. Verificar conexión a Supabase
    console.log('1️⃣ VERIFICANDO CONEXIÓN A SUPABASE...')
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Variables de entorno no configuradas')
      return false
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Conexión a Supabase establecida')
    
    // 2. Prueba de áreas
    console.log('\n2️⃣ PROBANDO ÁREAS...')
    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('*')
      .limit(5)
    
    if (areasError) {
      console.log('❌ Error en áreas:', areasError.message)
      return false
    }
    
    console.log(`✅ Áreas encontradas: ${areas.length}`)
    if (areas.length > 0) {
      console.log('📋 Ejemplo:', areas[0])
    }
    
    // 3. Prueba de trabajadores
    console.log('\n3️⃣ PROBANDO TRABAJADORES...')
    const { data: trabajadores, error: trabajadoresError } = await supabase
      .from('trabajadores')
      .select('*')
      .limit(5)
    
    if (trabajadoresError) {
      console.log('❌ Error en trabajadores:', trabajadoresError.message)
      return false
    }
    
    console.log(`✅ Trabajadores encontrados: ${trabajadores.length}`)
    if (trabajadores.length > 0) {
      console.log('👤 Ejemplo:', trabajadores[0])
    }
    
    // 4. Prueba de plantillas
    console.log('\n4️⃣ PROBANDO PLANTILLAS...')
    const { data: plantillas, error: plantillasError } = await supabase
      .from('plantillas')
      .select('*')
      .limit(5)
    
    if (plantillasError) {
      console.log('❌ Error en plantillas:', plantillasError.message)
      return false
    }
    
    console.log(`✅ Plantillas encontradas: ${plantillas.length}`)
    if (plantillas.length > 0) {
      console.log('📄 Ejemplo:', plantillas[0])
    }
    
    // 5. Prueba de inserción
    console.log('\n5️⃣ PROBANDO INSERCIÓN...')
    const testArea = {
      nombre: `ÁREA PRUEBA ${Date.now()}`
    }
    
    const { data: insertedArea, error: insertError } = await supabase
      .from('areas')
      .insert(testArea)
      .select()
      .single()
    
    if (insertError) {
      console.log('❌ Error al insertar:', insertError.message)
      return false
    }
    
    console.log('✅ Inserción exitosa:', insertedArea.nombre)
    
    // 6. Eliminar área de prueba
    await supabase.from('areas').delete().eq('id', insertedArea.id)
    console.log('✅ Área de prueba eliminada')
    
    // 7. Verificar evaluaciones
    console.log('\n6️⃣ PROBANDO EVALUACIONES...')
    const { data: evaluaciones, error: evaluacionesError } = await supabase
      .from('evaluaciones')
      .select('*')
      .limit(5)
    
    if (evaluacionesError) {
      console.log('❌ Error en evaluaciones:', evaluacionesError.message)
      return false
    }
    
    console.log(`✅ Evaluaciones encontradas: ${evaluaciones.length}`)
    
    console.log('\n🎉 RESULTADO FINAL:')
    console.log('✅ SISTEMA 100% CONECTADO A SUPABASE')
    console.log('✅ Todas las tablas accesibles')
    console.log('✅ Inserciones funcionando')
    console.log('✅ Listo para pruebas en interfaz')
    
    return true
    
  } catch (error) {
    console.log('❌ Error general:', error.message)
    return false
  }
}

testCompleteSystem().then(success => {
  if (success) {
    console.log('\n🚀 PRÓXIMOS PASOS:')
    console.log('1. Inicia el servidor: npm run dev')
    console.log('2. Abre: http://localhost:3000/dashboard')
    console.log('3. Prueba agregar datos en cada sección')
    console.log('4. Verifica en Supabase que persistan')
  } else {
    console.log('\n❌ SISTEMA NO LISTO - Revisa configuración')
  }
})
