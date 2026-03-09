import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual loading of .env because we don't have dotenv easily available (it's not in package.json)
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return {};

    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    const env = {};
    for (const line of lines) {
        if (line.startsWith('#') || !line.includes('=')) continue;
        const [key, ...valueParts] = line.split('=');
        env[key.trim()] = valueParts.join('=').trim();
    }
    return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
    console.log('Inserting/updating monetization settings...');

    const { data, error } = await supabase
        .from('system_settings')
        .upsert({
            key: 'ad_configuration',
            value: {
                sidebar_enabled: true,
                inline_enabled: false,
                affiliate_links: [
                    'https://amazon.com/?tag=mysec-20',
                    'https://shareasale.com/r.cfm?b=12345'
                ]
            },
            description: 'Controls ad and affiliate link visibility and default URLs across the application.'
        }, { onConflict: 'key' });

    if (error) {
        console.error('Error during upsert:', error);
    } else {
        console.log('Success: Ad configuration updated.');
    }
}

run();
