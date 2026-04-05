const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando posición de .env.local')
console.log('=====================================\n')

// Verificar posición actual
const currentPath = path.join(__dirname, '.env.local')
const exists = fs.existsSync(currentPath)

console.log('📁 Ruta actual:', currentPath)
console.log('📁 Existe:', exists ? '✅' : '❌')

if (exists) {
  const content = fs.readFileSync(currentPath, 'utf8')
  console.log('📊 Tamaño:', content.length, 'bytes')
  console.log('📊 Líneas:', content.split('\n').length)
  
  // Verificar variables
  const hasUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL')
  const hasKey = content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  console.log('🔗 Tiene URL:', hasUrl ? '✅' : '❌')
  console.log('🔑 Tiene Key:', hasKey ? '✅' : '❌')
  
  if (hasUrl && hasKey) {
    console.log('\n✅ .env.local está BIEN configurado')
    console.log('💡 El problema NO es el archivo')
    console.log('💡 El problema es:')
    console.log('   1. Cache del navegador')
    console.log('   2. Servidor no recargó variables')
    console.log('   3. Código antiguo compilado')
  } else {
    console.log('\n❌ .env.local está MAL configurado')
  }
} else {
  console.log('\n❌ .env.local NO EXISTE')
  console.log('💡 Creando archivo nuevo...')
  
  const newContent = `NEXT_PUBLIC_SUPABASE_URL=https://hruwezjiievzwopxtzal.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydXdlemppaWV2endvcHh0emFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzE2OTQsImV4cCI6MjA5MDQ0NzY5NH0.mkEMNyZDb6oAKrl9Wf86qUtO2hEakxJ8jR8uaQsfp6o`
  
  fs.writeFileSync(currentPath, newContent)
  console.log('✅ .env.local creado')
}

console.log('\n🎯 ACCIONES RECOMENDADAS:')
console.log('1. Limpia cache del navegador: Ctrl+F5')
console.log('2. Reinicia servidor: npm run dev')
console.log('3. Si sigue mal, borra carpeta .next y reinicia')
