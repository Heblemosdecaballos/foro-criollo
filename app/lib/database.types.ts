
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
      andares: {
        Row: {
          slug: string
          name: string
        }
        Insert: {
          slug: string
          name: string
        }
        Update: {
          slug?: string
          name?: string
        }
        Relationships: []
      }
      horses: {
        Row: {
          id: string
          name: string
          slug: string
          andar_slug: string
          description: string | null
          pedigree_url: string | null
          created_by: string
          is_deleted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          andar_slug: string
          description?: string | null
          pedigree_url?: string | null
          created_by: string
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          andar_slug?: string
          description?: string | null
          pedigree_url?: string | null
          created_by?: string
          is_deleted?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "horses_andar_slug_fkey"
            columns: ["andar_slug"]
            isOneToOne: false
            referencedRelation: "andares"
            referencedColumns: ["slug"]
          }
        ]
      }
      horse_media: {
        Row: {
          id: string
          horse_id: string
          storage_path: string
          public_url: string
          is_cover: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          horse_id: string
          storage_path: string
          public_url: string
          is_cover?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          horse_id?: string
          storage_path?: string
          public_url?: string
          is_cover?: boolean
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "horse_media_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          }
        ]
      }
      hall_votes: {
        Row: {
          id: number
          horse_id: string
          created_by: string
          value: number
        }
        Insert: {
          id?: number
          horse_id: string
          created_by: string
          value: number
        }
        Update: {
          id?: number
          horse_id?: string
          created_by?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "hall_votes_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          }
        ]
      }
      hall_comments: {
        Row: {
          id: number
          horse_id: string
          content: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: number
          horse_id: string
          content: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: number
          horse_id?: string
          content?: string
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hall_comments_horse_id_fkey"
            columns: ["horse_id"]
            isOneToOne: false
            referencedRelation: "horses"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string
          icon: string
          order_index: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description: string
          icon: string
          order_index: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string
          icon?: string
          order_index?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      forum_threads: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          category_id: string
          created_by: string
          is_pinned: boolean
          is_locked: boolean
          is_deleted: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          category_id: string
          created_by: string
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          category_id?: string
          created_by?: string
          is_pinned?: boolean
          is_locked?: boolean
          is_deleted?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_replies: {
        Row: {
          id: string
          content: string
          thread_id: string
          parent_id: string | null
          created_by: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          thread_id: string
          parent_id?: string | null
          created_by: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          thread_id?: string
          parent_id?: string | null
          created_by?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_likes: {
        Row: {
          id: number
          user_id: string
          thread_id: string | null
          reply_id: string | null
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          thread_id?: string | null
          reply_id?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          thread_id?: string | null
          reply_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          }
        ]
      }
      forum_favorites: {
        Row: {
          id: number
          user_id: string
          thread_id: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          thread_id: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          thread_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_favorites_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          }
        ]
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
