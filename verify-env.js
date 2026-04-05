// Verificación correcta de variables de entorno
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Verificación de .env.local')
console.log('==============================')

console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅' : '❌')

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('✅ URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
} else {
  console.log('❌ URL NO encontrada')
}

if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log('✅ KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30) + '...')
} else {
  console.log('❌ KEY NO encontrada')
}

console.log('\n🎯 Si ambas son ✅, entonces:')
console.log('1. El archivo .env.local está bien')
console.log('2. Reinicia el servidor con: npm run dev')
console.log('3. El sistema debería conectar a Supabase real')
