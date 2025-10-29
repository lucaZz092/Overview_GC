// Teste rápido para verificar conexão com Supabase
// Cole este código em um componente temporário para testar

import { supabase } from '@/lib/supabase'

const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' })
    if (error) {
      console.error('Erro de conexão:', error.message)
    } else {
      console.log('✅ Conexão com Supabase funcionando!')
    }
  } catch (err) {
    console.error('❌ Erro:', err)
  }
}

// Chame testConnection() em um useEffect para testar