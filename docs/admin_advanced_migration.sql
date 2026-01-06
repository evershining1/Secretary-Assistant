-- Advanced Admin Migration: Global Rules & Security Oversight

-- 1. Create System Settings Table
-- Used to store global configuration that the Admin can 'correct'
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed some default rules
INSERT INTO public.system_settings (key, value, description) 
VALUES 
('freemium_limits', '{"max_calendars": 1, "max_goals": 5, "ad_frequency": "high"}', 'Global limits for free tier users'),
('maintenance_mode', 'false', 'Enable to block non-admin access'),
('security_enforcement', '"strict"', 'Global security level (strict/relaxed)')
ON CONFLICT (key) DO NOTHING;

-- 2. RLS view for Admin (Read-only metadata)
-- This allows the Admin UI to see the current security policies
CREATE OR REPLACE VIEW public.admin_security_policies AS
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies
WHERE schemaname = 'public';

-- 3. Ensure Admin can see everything
-- RLS for system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_profiles.id = auth.uid() AND user_profiles.is_admin = true
        )
    );
