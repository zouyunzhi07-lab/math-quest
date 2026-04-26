import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ovuqozdgdyqhqsvfwime.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92dXFvemRnZHlxaHFzdmZ3aW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNjI5ODEsImV4cCI6MjA5MjczODk4MX0.mH2pEUebhaRGXrqduhnRvlGUCwwyfKPbiAEbwm10pYw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Tenant {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student';
  tenant_id: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  tenant_id: string;
  major_level: number;
  minor_level: number;
  question_text: string;
  question_type: 'multiple_choice' | 'fill_blank' | 'true_false';
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  created_by: string;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  character: 'nana' | 'jimi';
  current_major_level: number;
  current_minor_level: number;
  total_points: number;
  questions_answered: number;
  correct_answers: number;
  character_stage: number;
  created_at: string;
  updated_at: string;
}

export interface AnswerHistory {
  id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_taken: number;
  created_at: string;
}
