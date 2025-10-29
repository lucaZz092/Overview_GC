import { createClient } from '@supabase/supabase-js'

// Valores hardcoded temporariamente para teste
const supabaseUrl = 'https://ocgmsuenqyfebkrqcmjn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZ21zdWVucXlmZWJrcnFjbWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3Njc4OTgsImV4cCI6MjA3NzM0Mzg5OH0.Q25qhlkdNvINmyNUpq2OwW2Co4hBpVtOXxFTEXGGZZY'

export const supabaseTest = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabaseTest.auth.getUser()
  if (error) throw error
  return user
}

export const signOut = async () => {
  const { error } = await supabaseTest.auth.signOut()
  if (error) throw error
}

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabaseTest.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signUpWithEmail = async (email: string, password: string, metadata?: Record<string, any>) => {
  const { data, error } = await supabaseTest.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  if (error) throw error
  return data
}