INSERT INTO system_settings (key, value, description)
VALUES (
    'ad_configuration',
    '{"sidebar_enabled": true, "inline_enabled": false, "default_affiliate_link": "https://amazon.com/?tag=mysec-20"}',
    'Controls ad and affiliate link visibility and default URLs across the application.'
)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Allow all authenticated users to read system settings so they can receive the ad configurations
CREATE POLICY IF NOT EXISTS "Authenticated users can read system settings" ON public.system_settings
    FOR SELECT USING (auth.role() = 'authenticated');

