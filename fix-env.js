const fs = require('fs')

console.log('🔧 Corrigiendo archivo .env.local...')

// Contenido correcto sin caracteres especiales
const correctContent = `# Variables de entorno para Supabase
# Configuracion real para SEACORP PERU

# URL de tu proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hruwezjiievzwopxtzal.supabase.co

# Clave anonima publica de Supabase  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydXdlemppaWV2endvcHh0emFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzE2OTQsImV4cCI6MjA5MDQ0NzY5NH0.mkEMNyZDb6oAKrl9Wf86qUtO2hEakxJ8jR8uaQsfp6o`

// Escribir archivo corregido
fs.writeFileSync('.env.local', correctContent)

console.log('✅ .env.local corregido')
console.log('🔄 Reinicia el servidor con: npm run dev')
console.log('🧪 Ejecuta: node test-connection.js para verificar')
