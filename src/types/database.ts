export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Tipos para as tabelas do banco de dados
export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          email: string | null
          phone: string | null
          birth_date: string | null
          address: string | null
          is_active: boolean
          joined_date: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          address?: string | null
          is_active?: boolean
          joined_date: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          email?: string | null
          phone?: string | null
          birth_date?: string | null
          address?: string | null
          is_active?: boolean
          joined_date?: string
          notes?: string | null
          user_id?: string | null
        }
      }
      meetings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          date: string
          location: string | null
          attendance_count: number | null
          notes: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          date: string
          location?: string | null
          attendance_count?: number | null
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          date?: string
          location?: string | null
          attendance_count?: number | null
          notes?: string | null
          user_id?: string | null
        }
      }
      meeting_attendances: {
        Row: {
          id: string
          created_at: string
          meeting_id: string
          member_id: string
          attended: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          meeting_id: string
          member_id: string
          attended?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          meeting_id?: string
          member_id?: string
          attended?: boolean
          notes?: string | null
        }
      }
      reports: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          content: string
          type: string
          period_start: string | null
          period_end: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          content: string
          type: string
          period_start?: string | null
          period_end?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          content?: string
          type?: string
          period_start?: string | null
          period_end?: string | null
          user_id?: string | null
        }
      }
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          role: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          role?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          role?: string
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Tipos de conveniência
export type Member = Database['public']['Tables']['members']['Row']
export type MemberInsert = Database['public']['Tables']['members']['Insert']
export type MemberUpdate = Database['public']['Tables']['members']['Update']

export type Meeting = Database['public']['Tables']['meetings']['Row']
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert']
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update']

export type MeetingAttendance = Database['public']['Tables']['meeting_attendances']['Row']
export type MeetingAttendanceInsert = Database['public']['Tables']['meeting_attendances']['Insert']
export type MeetingAttendanceUpdate = Database['public']['Tables']['meeting_attendances']['Update']

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']