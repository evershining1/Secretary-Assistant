import { createClient } from '@supabase/supabase-js';

const url = 'https://flcknyqhgdwuvmjcsqvs.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2tueXFoZ2R3dXZtamNzcXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMjc4NCwiZXhwIjoyMDgyMDk4Nzg0fQ.Hlwmq3JNRAuILOIWzpYpj06I2w2EMjFEpqDS_bZybfs';

async function forcePromote() {
    const email = 'evershining17@proton.me';
    const supabase = createClient(url, key);

    console.log(`Force searching for ${email}...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
        console.error('List error:', error.message);
        return;
    }

    // Print all emails and IDs found
    console.log('Total users found in project:', users.length);
    users.forEach(u => console.log(` - ${u.email} (${u.id})`));

    const target = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (target) {
        console.log(`\nPromoting ${target.email} (${target.id}) to ADMIN...`);
        const { data, error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                id: target.id,
                email: target.email,
                is_admin: true,
                tier: 'premium'
            })
            .select();

        if (profileError) {
            console.error('Promotion error:', profileError.message);
        } else {
            console.log('PROMOTION SUCCESSFUL!');
            console.log(data);
        }
    } else {
        console.log(`\nFATAL ERROR: User ${email} not found in this Supabase auth list.`);
        console.log('Please double check the email address or the Supabase project URL.');
    }
}

forcePromote();
