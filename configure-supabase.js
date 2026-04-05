const fs = require('fs')
const path = require('path')

console.log('🔧 Configurando Supabase con tus credenciales reales...')
console.log('================================================\n')

// Tus credenciales reales
const supabaseUrl = 'https://hruwezjiievzwopxtzal.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydXdlemppaWV2endvcHh0emFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzE2OTQsImV4cCI6MjA5MDQ0NzY5NH0.mkEMNyZDb6oAKrl9Wf86qUtO2hEakxJ8jR8uaQsfp6o'

// Crear el contenido del archivo .env.local
const envContent = `# Variables de entorno para Supabase
# Configuración real para SEACORP PERÚ

# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}

# Clave anónima pública de Supabase  
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Configuración completada - ${new Date().toLocaleString()}
`

// Escribir el archivo
const envPath = path.join(__dirname, '.env.local')
fs.writeFileSync(envPath, envContent)

console.log('✅ .env.local configurado con tus credenciales reales')
console.log('🔗 URL:', supabaseUrl)
console.log('🔑 API Key configurada')
console.log('\n📋 Próximos pasos:')
console.log('1. Reinicia el servidor: npm run dev')
console.log('2. Ve a http://localhost:3000/dashboard')
console.log('3. Verifica que la conexión esté en verde 🟢')
console.log('\n🎉 ¡Listo para conectar a Supabase!')
