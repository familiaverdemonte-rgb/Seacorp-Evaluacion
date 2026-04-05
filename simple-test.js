// Test simple de variables de entorno
require('dotenv').config()

console.log('🔍 Verificación simple de variables de entorno')
console.log('==========================================')

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌')

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('URL encontrada:', process.env.NEXT_PUBLIC_SUPABASE_URL)
} else {
  console.log('❌ URL NO encontrada')
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('KEY encontrada:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...')
} else {
  console.log('❌ KEY NO encontrada')
}
