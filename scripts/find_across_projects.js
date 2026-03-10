import { createClient } from '@supabase/supabase-js';

const projects = [
    {
        url: 'https://flcknyqhgdwuvmjcsqvs.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2tueXFoZ2R3dXZtamNzcXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMjc4NCwiZXhwIjoyMDgyMDk4Nzg0fQ.Hlwmq3JNRAuILOIWzpYpj06I2w2EMjFEpqDS_bZybfs'
    },
    {
        url: 'https://aqykyfomuhbllkymtpyt.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeWt5Zm9tdWhibGxreW10cHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMjkwNjY3MiwiZXhwIjoyMDE4NDgyNjcyfQ.i6S_0f3r7o0q4_r0_r0_r0_r0_r0_r0_r0_r0_r0'
    }
];

async function findUser() {
    const targetEmail = 'evershining17@proton.me';

    for (const project of projects) {
        console.log(`Checking project: ${project.url}...`);
        const supabase = createClient(project.url, project.key);

        try {
            const { data: { users }, error } = await supabase.auth.admin.listUsers();
            if (error) {
                console.error(`  Error: ${error.message}`);
                continue;
            }

            const user = users.find(u => u.email === targetEmail);
            if (user) {
                console.log(`  MATCH FOUND! User ID: ${user.id}`);
                console.log(`  Promoting...`);
                const { data, error: upsertError } = await supabase
                    .from('user_profiles')
                    .upsert({
                        id: user.id,
                        email: user.email,
                        is_admin: true,
                        tier: 'premium'
                    })
                    .select();

                if (upsertError) {
                    console.error(`  Upsert error: ${upsertError.message}`);
                } else {
                    console.log(`  SUCCESS! Admin enabled for ${targetEmail}`);
                }
                return;
            } else {
                console.log(`  Not found in this project. Users: ${users.map(u => u.email).join(', ')}`);
            }
        } catch (e) {
            console.error(`  Exception: ${e.message}`);
        }
    }
}

findUser();
