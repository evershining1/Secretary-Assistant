import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://flcknyqhgdwuvmjcsqvs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2tueXFoZ2R3dXZtamNzcXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMjc4NCwiZXhwIjoyMDgyMDk4Nzg0fQ.Hlwmq3JNRAuILOIWzpYpj06I2w2EMjFEpqDS_bZybfs';

async function checkStatus() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const targetEmail = 'evershining17@proton.me';

    console.log(`Searching for ${targetEmail}...`);

    // Search auth users specifically
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const foundUser = users.find(u => u.email === targetEmail);

    if (foundUser) {
        console.log('USER FOUND IN AUTH:');
        console.log('ID:', foundUser.id);
        console.log('Email:', foundUser.email);

        // Promote him now
        console.log('\nPromoting to admin in user_profiles...');
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                id: foundUser.id,
                email: foundUser.email,
                is_admin: true,
                tier: 'premium',
                name: foundUser.user_metadata?.full_name || 'Admin'
            })
            .select();

        if (profileError) {
            console.error('Promotion failed:', profileError.message);
        } else {
            console.log('SUCCESS! Profile updated:', profile);
        }
    } else {
        console.log('USER NOT FOUND IN AUTH.');
        console.log('Total users found:', users.length);
        console.log('All emails:', users.map(u => u.email).join(', '));
    }
}

checkStatus();
