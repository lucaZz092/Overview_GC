import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'

type UseSupabaseQueryOptions = {
  enabled?: boolean
  dependencies?: any[]
}

export const useSupabaseQuery = <T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: UseSupabaseQueryOptions = {}
) => {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState(true)

  const { enabled = true, dependencies = [] } = options

  const refetch = async () => {
    if (!enabled) return

    setLoading(true)
    try {
      const result = await queryFn()
      setData(result.data)
      setError(result.error)
    } catch (err) {
      setError(err as PostgrestError)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [enabled, ...dependencies])

  return { data, error, loading, refetch }
}

export const useSupabaseMutation = <T, P>(
  mutationFn: (params: P) => Promise<{ data: T | null; error: PostgrestError | null }>
) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<PostgrestError | null>(null)

  const mutate = async (params: P): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await mutationFn(params)
      if (result.error) {
        setError(result.error)
        throw result.error
      }
      return result.data
    } catch (err) {
      setError(err as PostgrestError)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { mutate, loading, error }
}

// Tipos para as tabelas
export interface Member {
  id: string
  created_at: string
  updated_at: string
  name: string
  email?: string
  phone?: string
  birth_date?: string
  address?: string
  is_active: boolean
  joined_date: string
  notes?: string
  user_id?: string
}

export interface MemberInsert {
  name: string
  email?: string
  phone?: string
  birth_date?: string
  address?: string
  is_active?: boolean
  joined_date: string
  notes?: string
  user_id?: string
}

export interface MemberUpdate {
  name?: string
  email?: string
  phone?: string
  birth_date?: string
  address?: string
  is_active?: boolean
  joined_date?: string
  notes?: string
  user_id?: string
}

// Hooks específicos para as tabelas do sistema
export const useMembers = () => {
  return useSupabaseQuery<Member[]>(async () => {
    return await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })
  })
}

export const useMember = (id: string) => {
  return useSupabaseQuery<Member>(
    async () => {
      return await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single()
    },
    { enabled: !!id, dependencies: [id] }
  )
}

export const useCreateMember = () => {
  return useSupabaseMutation<Member, MemberInsert>(async (memberData: MemberInsert) => {
    return await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()
  })
}

export const useUpdateMember = () => {
  return useSupabaseMutation<Member, { id: string } & MemberUpdate>(async ({ id, ...updates }) => {
    return await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
  })
}

export const useDeleteMember = () => {
  return useSupabaseMutation<any, string>(async (id: string) => {
    return await supabase
      .from('members')
      .delete()
      .eq('id', id)
  })
}

// Tipos para meetings
export interface Meeting {
  id: string
  created_at: string
  updated_at: string
  title: string
  description?: string
  date: string
  location?: string
  attendance_count?: number
  notes?: string
  user_id?: string
}

export interface MeetingInsert {
  title: string
  description?: string
  date: string
  location?: string
  attendance_count?: number
  notes?: string
  user_id?: string
}

// Tipos para reports
export interface Report {
  id: string
  created_at: string
  updated_at: string
  title: string
  content: string
  type: string
  period_start?: string
  period_end?: string
  user_id?: string
}

export interface ReportInsert {
  title: string
  content: string
  type: string
  period_start?: string
  period_end?: string
  user_id?: string
}

// Hooks para encontros/reuniões
export const useMeetings = () => {
  return useSupabaseQuery<Meeting[]>(async () => {
    return await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false })
  })
}

export const useCreateMeeting = () => {
  return useSupabaseMutation<Meeting, MeetingInsert>(async (meetingData: MeetingInsert) => {
    return await supabase
      .from('meetings')
      .insert([meetingData])
      .select()
      .single()
  })
}

// Hooks para relatórios
export const useReports = (userId?: string) => {
  return useSupabaseQuery<Report[]>(
    async () => {
      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      return await query
    },
    { dependencies: [userId] }
  )
}

export const useCreateReport = () => {
  return useSupabaseMutation<Report, ReportInsert>(async (reportData: ReportInsert) => {
    return await supabase
      .from('reports')
      .insert([reportData])
      .select()
      .single()
  })
}