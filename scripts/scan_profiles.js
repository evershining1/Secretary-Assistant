import { createClient } from '@supabase/supabase-js';

const url = 'https://flcknyqhgdwuvmjcsqvs.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY2tueXFoZ2R3dXZtamNzcXZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjUyMjc4NCwiZXhwIjoyMDgyMDk4Nzg0fQ.Hlwmq3JNRAuILOIWzpYpj06I2w2EMjFEpqDS_bZybfs';

async function scanProfiles() {
    const supabase = createClient(url, key);

    console.log('Scanning ALL user profiles in user_profiles table...');
    const { data, error } = await supabase.from('user_profiles').select('*');

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Total profiles found:', data.length);
        data.forEach(p => {
            console.log(` - ${p.email} | ID: ${p.id} | Admin: ${p.is_admin}`);
        });
    }
}

scanProfiles();
