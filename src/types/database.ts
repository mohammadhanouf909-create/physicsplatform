export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: string
          created_at: string
        }
      }
      // هنبقى نضيف باقي الجداول هنا بعدين
    }
  }
}