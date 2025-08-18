import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vdfeyoppwnwstewbatlg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkZmV5b3Bwd253c3Rld2JhdGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MTcwODcsImV4cCI6MjA3MDk5MzA4N30.Pk8jl10J0ARldmwpaGOTTur9LfNCU6UUNlgtIV6EQgo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  wallet_address: string;
  wallet_private_key: string;
  wallet_created_at: string;
  total_tokens_created: number;
  total_nfts_created: number;
  total_transactions: number;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: 'token' | 'nft' | 'send_avax';
  contract_address?: string;
  token_name?: string;
  token_symbol?: string;
  amount?: number;
  recipient_address?: string;
  gas_used?: number;
  gas_price?: number;
  status: 'pending' | 'confirmed' | 'failed';
  explorer_url?: string;
  metadata?: any;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  login_method: 'email' | 'local';
  ip_address?: string;
  user_agent?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}
