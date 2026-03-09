const url = 'https://flcknyqhgdwuvmjcsqvs.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2tueXFoZ2R3dXZtamNzcXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMjc4NCwiZXhwIjoyMDgyMDk4Nzg0fQ.Hlwmq3JNRAuILOIWzpYpj06I2w2EMjFEpqDS_bZybfs';

async function promote() {
    const targetEmail = 'evershining17@gmail.com';
    console.log(`Step 1: Fetching users from Auth...`);

    try {
        const authResponse = await fetch(`${url}/auth/v1/admin/users`, {
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        const { users } = await authResponse.json();
        const authUser = users.find(u => u.email === targetEmail);

        if (!authUser) {
            console.log('No user found with email:', targetEmail);
            return;
        }

        console.log(`Step 2: Promoting ${targetEmail} (${authUser.id})...`);

        const upsertResponse = await fetch(`${url}/rest/v1/user_profiles`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify({
                id: authUser.id,
                email: authUser.email,
                name: authUser.user_metadata?.full_name || 'Admin',
                is_admin: true,
                tier: 'premium'
            })
        });

        if (upsertResponse.ok) {
            console.log('SUCCESS: Admin access granted to', targetEmail);
            console.log('Please REFRESH your browser at app.my-secretary.net/admin now.');
        } else {
            console.error('FAILED:', await upsertResponse.text());
        }
    } catch (err) {
        console.error('ERROR:', err);
    }
}

promote();
