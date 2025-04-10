export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      floor_plate_templates: {
        Row: {
          area: number
          created_at: string
          id: string
          length: number | null
          name: string
          project_id: string
          updated_at: string
          width: number | null
        }
        Insert: {
          area: number
          created_at?: string
          id?: string
          length?: number | null
          name: string
          project_id: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          area?: number
          created_at?: string
          id?: string
          length?: number | null
          name?: string
          project_id?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "floor_plate_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_usage_template_allocations: {
        Row: {
          created_at: string
          floor_usage_template_id: string
          id: string
          quantity: number
          unit_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor_usage_template_id: string
          id?: string
          quantity?: number
          unit_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor_usage_template_id?: string
          id?: string
          quantity?: number
          unit_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_usage_template_allocations_floor_usage_template_id_fkey"
            columns: ["floor_usage_template_id"]
            isOneToOne: false
            referencedRelation: "floor_usage_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_usage_template_allocations_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_usage_templates: {
        Row: {
          created_at: string
          id: string
          name: string
          project_id: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          project_id: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floor_usage_templates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floor_usage_templates_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "floor_plate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      floors: {
        Row: {
          created_at: string
          floor_type: string
          id: string
          label: string
          position: number
          project_id: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor_type?: string
          id?: string
          label: string
          position: number
          project_id: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor_type?: string
          id?: string
          label?: string
          position?: number
          project_id?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "floors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "floors_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "floor_plate_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      non_rentable_spaces: {
        Row: {
          allocation_method: string
          created_at: string
          id: string
          name: string
          project_id: string
          specific_floors: number[] | null
          square_footage: number
          updated_at: string
        }
        Insert: {
          allocation_method: string
          created_at?: string
          id?: string
          name: string
          project_id: string
          specific_floors?: number[] | null
          square_footage: number
          updated_at?: string
        }
        Update: {
          allocation_method?: string
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          specific_floors?: number[] | null
          square_footage?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_rentable_spaces_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      non_rentable_types: {
        Row: {
          allocation_method: string
          created_at: string | null
          floor_constraints: Json
          id: string
          name: string
          percentage: number | null
          project_id: string
          square_footage: number
          updated_at: string | null
        }
        Insert: {
          allocation_method?: string
          created_at?: string | null
          floor_constraints?: Json
          id?: string
          name: string
          percentage?: number | null
          project_id: string
          square_footage?: number
          updated_at?: string | null
        }
        Update: {
          allocation_method?: string
          created_at?: string | null
          floor_constraints?: Json
          id?: string
          name?: string
          percentage?: number | null
          project_id?: string
          square_footage?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "non_rentable_types_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          far_allowance: number | null
          id: string
          location: string
          lot_size: number | null
          max_buildable_area: number | null
          name: string
          project_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          far_allowance?: number | null
          id?: string
          location: string
          lot_size?: number | null
          max_buildable_area?: number | null
          name: string
          project_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          far_allowance?: number | null
          id?: string
          location?: string
          lot_size?: number | null
          max_buildable_area?: number | null
          name?: string
          project_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      unit_allocations: {
        Row: {
          created_at: string
          floor_id: string
          id: string
          quantity: number
          unit_type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          floor_id: string
          id?: string
          quantity?: number
          unit_type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          floor_id?: string
          id?: string
          quantity?: number
          unit_type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_allocations_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_allocations_unit_type_id_fkey"
            columns: ["unit_type_id"]
            isOneToOne: false
            referencedRelation: "unit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_types: {
        Row: {
          area: number
          category: string
          created_at: string
          id: string
          length: number | null
          name: string
          project_id: string
          units: number
          updated_at: string
          width: number | null
        }
        Insert: {
          area: number
          category: string
          created_at?: string
          id?: string
          length?: number | null
          name: string
          project_id: string
          units?: number
          updated_at?: string
          width?: number | null
        }
        Update: {
          area?: number
          category?: string
          created_at?: string
          id?: string
          length?: number | null
          name?: string
          project_id?: string
          units?: number
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_types_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
