const fs = require('fs')
const path = require('path')

console.log('🔧 Configurador de entorno para SEACORP PERÚ')
console.log('=====================================\n')

// Verificar si .env.local existe
const envPath = path.join(__dirname, '.env.local')
const envExists = fs.existsSync(envPath)

if (envExists) {
  console.log('✅ .env.local ya existe')
  
  // Leer contenido actual
  const content = fs.readFileSync(envPath, 'utf8')
  
  if (content.trim() === '') {
    console.log('❌ .env.local está vacío')
    console.log('\n📝 Vamos a crear el archivo con plantilla...\n')
    
    const template = `# Variables de entorno para Supabase
# Reemplaza estos valores con tus credenciales reales

# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave anónima pública de Supabase  
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica-aqui

# Nota: Obtén estos valores desde tu dashboard de Supabase > Settings > API
`
    
    fs.writeFileSync(envPath, template)
    console.log('✅ .env.local creado con plantilla')
    console.log('📝 Edita el archivo con tus credenciales reales de Supabase')
  } else {
    console.log('✅ .env.local contiene configuración')
    
    // Verificar si tiene las variables necesarias
    const hasUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL=')
    const hasKey = content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')
    
    if (hasUrl && hasKey) {
      console.log('✅ Variables de entorno configuradas')
    } else {
      console.log('❌ Faltan variables de entorno')
      console.log('📝 Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }
  }
} else {
  console.log('❌ .env.local no existe')
  console.log('📝 Creando archivo con plantilla...\n')
  
  const template = `# Variables de entorno para Supabase
# Reemplaza estos valores con tus credenciales reales

# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Clave anónima pública de Supabase  
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima-publica-aqui

# Nota: Obtén estos valores desde tu dashboard de Supabase > Settings > API
`
  
  fs.writeFileSync(envPath, template)
  console.log('✅ .env.local creado con plantilla')
}

console.log('\n📋 Próximos pasos:')
console.log('1. Edita .env.local con tus credenciales de Supabase')
console.log('2. Reinicia el servidor: npm run dev')
console.log('3. Ve a http://localhost:3000/dashboard')
console.log('4. Verifica el estado de conexión en el dashboard')
console.log('\n📖 Revisa env-config.md para instrucciones detalladas')
