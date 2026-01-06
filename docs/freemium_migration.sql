-- Expansion Migration: Tiers, Admin & Stats

-- 1. Update user_profiles with new fields
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'trial')),
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_sync_status JSONB DEFAULT '{}'::jsonb;

-- 2. Create System Stats table for Admin Panel
CREATE TABLE IF NOT EXISTS public.system_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_users INTEGER DEFAULT 0,
    active_syncs INTEGER DEFAULT 0,
    premium_conversions INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS for Admin
-- Only admins can see system stats
ALTER TABLE public.system_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view system stats" ON public.system_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
        )
    );

-- 4. Function to update stats (Trigger based or Manual)
-- In a real app, this would be updated by Edge Functions
