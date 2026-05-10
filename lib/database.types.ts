export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          check_in: string
          created_at: string
          full_name: string
          id: string
          nights: number
          notes: string | null
          payment_id: string | null
          payment_status: string
          phone: string
          ref: string
          room_id: string
          room_name_ar: string
          room_name_en: string
          status: string
          total_kwd: number
          user_id: string
        }
        Insert: {
          check_in: string
          created_at?: string
          full_name: string
          id?: string
          nights?: number
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          phone: string
          ref: string
          room_id: string
          room_name_ar: string
          room_name_en: string
          status?: string
          total_kwd?: number
          user_id: string
        }
        Update: {
          check_in?: string
          created_at?: string
          full_name?: string
          id?: string
          nights?: number
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          phone?: string
          ref?: string
          room_id?: string
          room_name_ar?: string
          room_name_en?: string
          status?: string
          total_kwd?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_admin?: boolean
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
