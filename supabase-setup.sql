-- =============================================================================
-- AVAX AI Platform - Supabase Database Setup
-- Execute these queries in your Supabase SQL Editor
-- =============================================================================

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    wallet_address TEXT UNIQUE NOT NULL,
    wallet_private_key TEXT NOT NULL, -- Encrypted in practice
    wallet_created_at TIMESTAMPTZ DEFAULT NOW(),
    total_tokens_created INTEGER DEFAULT 0,
    total_nfts_created INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create wallet_transactions table for transaction history
CREATE TABLE public.wallet_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_hash TEXT NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('token', 'nft', 'send_avax')),
    contract_address TEXT,
    token_name TEXT,
    token_symbol TEXT,
    amount DECIMAL,
    recipient_address TEXT,
    gas_used BIGINT,
    gas_price BIGINT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    explorer_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create user_sessions table for tracking active sessions
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    login_method TEXT NOT NULL CHECK (login_method IN ('email', 'local')),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Wallet transactions policies
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.wallet_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Session policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- 6. Functions for wallet generation (placeholder - will be handled in app)
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, wallet_address, wallet_private_key)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        '', -- Will be updated by app after wallet generation
        ''  -- Will be updated by app after wallet generation
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- 8. Function to update last active timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_last_active
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_last_active();

-- 9. Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_hash ON public.wallet_transactions(transaction_hash);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);

-- 10. Analytics view for dashboard
CREATE VIEW public.user_analytics AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.wallet_address,
    u.total_tokens_created,
    u.total_nfts_created,
    u.total_transactions,
    u.created_at as user_since,
    u.last_active_at,
    COUNT(wt.id) as recent_transactions,
    SUM(CASE WHEN wt.transaction_type = 'token' THEN 1 ELSE 0 END) as tokens_this_month,
    SUM(CASE WHEN wt.transaction_type = 'nft' THEN 1 ELSE 0 END) as nfts_this_month
FROM public.users u
LEFT JOIN public.wallet_transactions wt ON u.id = wt.user_id 
    AND wt.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, u.full_name, u.wallet_address, u.total_tokens_created, 
         u.total_nfts_created, u.total_transactions, u.created_at, u.last_active_at;

-- =============================================================================
-- Setup Complete! 
-- Next: Install Supabase client in your React app
-- =============================================================================
