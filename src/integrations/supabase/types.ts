export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          attempt_id: string
          id: string
          is_correct: boolean
          option_id: string
          option_snapshot: string
          prompt_snapshot: string
          question_id: string
          question_version: number
          user_id: string
        }
        Insert: {
          attempt_id: string
          id?: string
          is_correct: boolean
          option_id: string
          option_snapshot: string
          prompt_snapshot: string
          question_id: string
          question_version: number
          user_id: string
        }
        Update: {
          attempt_id?: string
          id?: string
          is_correct?: boolean
          option_id?: string
          option_snapshot?: string
          prompt_snapshot?: string
          question_id?: string
          question_version?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "level_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      level_attempts: {
        Row: {
          correct_count: number
          created_at: string
          id: string
          level_id: number
          percentage: number
          points: number
          stars: number
          total_questions: number
          user_id: string
        }
        Insert: {
          correct_count: number
          created_at?: string
          id?: string
          level_id: number
          percentage: number
          points: number
          stars: number
          total_questions: number
          user_id: string
        }
        Update: {
          correct_count?: number
          created_at?: string
          id?: string
          level_id?: number
          percentage?: number
          points?: number
          stars?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_attempts_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      level_progress: {
        Row: {
          attempts: number
          best_correct: number
          best_points: number
          best_stars: number
          completed: boolean
          level_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          best_correct?: number
          best_points?: number
          best_stars?: number
          completed?: boolean
          level_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          best_correct?: number
          best_points?: number
          best_stars?: number
          completed?: boolean
          level_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "level_progress_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
      levels: {
        Row: {
          description: string
          id: number
          title: string
          topics: string[]
        }
        Insert: {
          description: string
          id: number
          title: string
          topics?: string[]
        }
        Update: {
          description?: string
          id?: number
          title?: string
          topics?: string[]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      question_keys: {
        Row: {
          correct_option_id: string
          explanation: string
          question_id: string
        }
        Insert: {
          correct_option_id: string
          explanation: string
          question_id: string
        }
        Update: {
          correct_option_id?: string
          explanation?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_keys_correct_option_id_fkey"
            columns: ["correct_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_keys_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: true
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          id: string
          label: string
          position: number
          question_id: string
        }
        Insert: {
          id?: string
          label: string
          position: number
          question_id: string
        }
        Update: {
          id?: string
          label?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          level_id: number
          position: number
          prompt: string
          version: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          level_id: number
          position: number
          prompt: string
          version?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          level_id?: number
          position?: number
          prompt?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "levels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_answer: {
        Args: { _option_id: string; _question_id: string }
        Returns: {
          correct_option_id: string
          explanation: string
          is_correct: boolean
        }[]
      }
      is_level_unlocked: {
        Args: { _level: number; _user: string }
        Returns: boolean
      }
      submit_level: {
        Args: { _answers: Json; _level_id: number }
        Returns: {
          attempt_id: string
          completed: boolean
          correct_count: number
          percentage: number
          points: number
          stars: number
          total_questions: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
