import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
    const { data, error } = await supabaseAdmin.from('system_settings').upsert({
        key: 'ad_configuration',
        value: { sidebar_enabled: true, inline_enabled: false, default_affiliate_link: 'https://amazon.com/?tag=mysec-20' },
        description: 'Controls ad and affiliate link visibility and default URLs across the application.'
    });
    console.log("Upsert result:", error || "Success");
}
run();
