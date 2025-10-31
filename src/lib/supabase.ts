import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Fallback values - replace with your actual values
const FALLBACK_URL = 'https://ocgmsuenqyfebkrqcmjn.supabase.co'
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY

console.log('🔧 Inicializando Supabase...')
console.log('📍 URL:', supabaseUrl)
console.log('📍 URL source:', import.meta.env.VITE_SUPABASE_URL ? 'Environment Variable' : 'Fallback')
console.log('📍 Key source:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Environment Variable' : 'Fallback')
console.log('📍 Key presente:', supabaseAnonKey ? '✅ Sim' : '❌ Não')

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables'
  console.error('❌', errorMsg)
  throw new Error(errorMsg)
}

let supabase: ReturnType<typeof createClient<Database>>

try {
  console.log('🚀 Criando cliente Supabase...')
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  console.log('✅ Cliente Supabase criado com sucesso!')
} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error)
  throw new Error(`Falha ao criar cliente Supabase: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
}

export { supabase }

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, metadata?: Record<string, any>) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  if (error) throw error
  return data
}