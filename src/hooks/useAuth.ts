import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('🔐 useAuth: Inicializando...')
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔐 useAuth: Buscando sessão inicial...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ useAuth: Erro ao buscar sessão:', error)
          setLoading(false)
          return
        }
        
        console.log('✅ useAuth: Sessão obtida:', session ? 'Usuário logado' : 'Sem usuário')
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (err) {
        console.error('❌ useAuth: Erro crítico ao inicializar:', err)
        setLoading(false)
        // Não fazer throw para não quebrar a aplicação
      }
    }

    getInitialSession()

    // Listen for auth changes
    console.log('👂 useAuth: Configurando listener de auth...')
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 useAuth: Auth state changed:', event, session ? 'com sessão' : 'sem sessão')
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      console.log('🧹 useAuth: Limpando subscription...')
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: undefined, // Não redirecionar por email
      }
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }
}