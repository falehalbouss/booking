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
          notes: string | null
          phone: string
          ref: string
          room_id: string
          room_name_ar: string
          room_name_en: string
          status: string
          user_id: string
        }
        Insert: {
          check_in: string
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          ref: string
          room_id: string
          room_name_ar: string
          room_name_en: string
          status?: string
          user_id: string
        }
        Update: {
          check_in?: string
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          ref?: string
          room_id?: string
          room_name_ar?: string
          room_name_en?: string
          status?: string
          user_id?: string
        }
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
      }
    }
  }
}
