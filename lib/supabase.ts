import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Review {
  id: string;
  review_date: string;
  user_email: string;
  review_text: string;
  sentiment_score: number | null;
  created_at: string;
}

export interface OverallSentiment {
  id: string;
  total_score: number;
  description: string;
  total_reviews: number;
  last_updated: string;
}

