import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://flcknyqhgdwuvmjcsqvs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2tueXFoZ2R3dXZtamNzcXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMjc4NCwiZXhwIjoyMDgyMDk4Nzg0fQ.Hlwmq3JNRAuILOIWzpYpj06I2w2EMjFEpqDS_bZybfs';

async function checkStatus() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Checking User Profile ---');
    const email = 'evershining17@proton.me';

    console.log('Fetching auth user...');
    try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error listing auth users:', authError.message);
        } else {
            const user = authUsers.users.find(u => u.email === email);
            if (user) {
                console.log('Auth User Found:', user.id, user.email);
            } else {
                console.log('Auth User NOT Found for email:', email);
                console.log('Available emails:', authUsers.users.map(u => u.email).slice(0, 5).join(', '), '...');
            }
        }
    } catch (e) {
        console.error('Auth check error:', e.message);
    }

    console.log('\nFetching table profile...');
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('email', email);

        if (error) {
            console.error('Error fetching profile:', error.message);
        } else if (data.length === 0) {
            console.log('No profile found in user_profiles for email:', email);

            console.log('\nScanning first 5 profiles to see what we have...');
            const { data: allProfiles } = await supabase.from('user_profiles').select('*').limit(5);
            console.log('Sample profiles:', allProfiles.map(p => p.email).join(', '));
        } else {
            data.forEach(p => {
                console.log('Profile found:');
                console.log('ID:', p.id);
                console.log('Email:', p.email);
                console.log('Is Admin:', p.is_admin);
                console.log('Tier:', p.tier);
            });
        }
    } catch (e) {
        console.error('Profile check error:', e.message);
    }
}

checkStatus();
