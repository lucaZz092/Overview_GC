import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://ocgmsuenqyfebkrqcmjn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function addGCColumn() {
  try {
    console.log('🔧 Checking if grupo_crescimento column exists...')
    
    // Fazer uma query para verificar se a coluna já existe
    const { data, error } = await supabase
      .from('users')
      .select('grupo_crescimento')
      .limit(1)

    if (error) {
      if (error.message.includes('column "grupo_crescimento" does not exist')) {
        console.log('❌ Column grupo_crescimento does not exist')
        console.log('📝 You need to run this SQL in your Supabase SQL Editor:')
        console.log('')
        console.log('ALTER TABLE public.users ADD COLUMN IF NOT EXISTS grupo_crescimento TEXT;')
        console.log('')
        console.log('🌐 Go to: https://supabase.com/dashboard/project/ocgmsuenqyfebkrqcmjn/sql/new')
        console.log('📋 Copy and paste the SQL above, then click "Run"')
        return false
      } else {
        console.error('❌ Error checking column:', error)
        return false
      }
    } else {
      console.log('✅ Column grupo_crescimento already exists!')
      return true
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err)
    return false
  }
}

// Executar a verificação
addGCColumn().then((exists) => {
  if (exists) {
    console.log('🎉 Database is ready for GC selection feature!')
  } else {
    console.log('⚠️  Please add the column manually using the Supabase dashboard')
  }
  process.exit(0)
})