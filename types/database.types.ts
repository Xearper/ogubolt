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
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          reputation: number
          role: 'user' | 'moderator' | 'admin'
          role_id: string | null
          location: string | null
          website: string | null
          signature: string | null
          post_count: number
          thread_count: number
          likes_received: number
          likes_given: number
          experience_points: number
          level: number
          daily_streak: number
          last_login_date: string | null
          total_login_days: number
          follower_count: number
          following_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          reputation?: number
          role?: 'user' | 'moderator' | 'admin'
          role_id?: string | null
          location?: string | null
          website?: string | null
          signature?: string | null
          post_count?: number
          thread_count?: number
          likes_received?: number
          likes_given?: number
          experience_points?: number
          level?: number
          daily_streak?: number
          last_login_date?: string | null
          total_login_days?: number
          follower_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          reputation?: number
          role?: 'user' | 'moderator' | 'admin'
          role_id?: string | null
          location?: string | null
          website?: string | null
          signature?: string | null
          post_count?: number
          thread_count?: number
          likes_received?: number
          likes_given?: number
          experience_points?: number
          level?: number
          daily_streak?: number
          last_login_date?: string | null
          total_login_days?: number
          follower_count?: number
          following_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      threads: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category_id: string | null
          is_pinned: boolean
          is_locked: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category_id?: string | null
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category_id?: string | null
          is_pinned?: boolean
          is_locked?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          thread_id: string
          author_id: string
          parent_id: string | null
          quoted_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          thread_id: string
          author_id: string
          parent_id?: string | null
          quoted_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          thread_id?: string
          author_id?: string
          parent_id?: string | null
          quoted_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          thread_id: string | null
          comment_id: string | null
          vote_type: 'upvote' | 'downvote'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thread_id?: string | null
          comment_id?: string | null
          vote_type: 'upvote' | 'downvote'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thread_id?: string | null
          comment_id?: string | null
          vote_type?: 'upvote' | 'downvote'
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'reply' | 'mention' | 'vote'
          content: string
          thread_id: string | null
          comment_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'reply' | 'mention' | 'vote'
          content: string
          thread_id?: string | null
          comment_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'reply' | 'mention' | 'vote'
          content?: string
          thread_id?: string | null
          comment_id?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      thread_tags: {
        Row: {
          thread_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          thread_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          thread_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          user_id: string
          thread_id: string | null
          comment_id: string | null
          reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thread_id?: string | null
          comment_id?: string | null
          reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thread_id?: string | null
          comment_id?: string | null
          reaction_type?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'
          created_at?: string
        }
      }
      thread_bookmarks: {
        Row: {
          id: string
          user_id: string
          thread_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thread_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thread_id?: string
          created_at?: string
        }
      }
      thread_watchers: {
        Row: {
          id: string
          user_id: string
          thread_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          thread_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          thread_id?: string
          created_at?: string
        }
      }
      edit_history: {
        Row: {
          id: string
          thread_id: string | null
          comment_id: string | null
          editor_id: string
          old_content: string
          edit_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          thread_id?: string | null
          comment_id?: string | null
          editor_id: string
          old_content: string
          edit_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string | null
          comment_id?: string | null
          editor_id?: string
          old_content?: string
          edit_reason?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          icon: string
          color: string
          requirement_type: 'post_count' | 'thread_count' | 'reputation' | 'login_streak' | 'likes_received' | 'level' | 'manual'
          requirement_value: number | null
          badge_tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          icon: string
          color?: string
          requirement_type: 'post_count' | 'thread_count' | 'reputation' | 'login_streak' | 'likes_received' | 'level' | 'manual'
          requirement_value?: number | null
          badge_tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          icon?: string
          color?: string
          requirement_type?: 'post_count' | 'thread_count' | 'reputation' | 'login_streak' | 'likes_received' | 'level' | 'manual'
          requirement_value?: number | null
          badge_tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | null
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          text_color: string
          priority: number
          permissions: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          color?: string
          text_color?: string
          priority?: number
          permissions?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          color?: string
          text_color?: string
          priority?: number
          permissions?: Json
          created_at?: string
        }
      }
      followers: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
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
  }
}
