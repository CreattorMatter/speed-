// Seed admin user in Supabase Auth + public.users + user_roles (ESM/JS version)
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SERVICE_KEY env vars');
  process.exit(1);
}

const admin = createClient(url, serviceKey);

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@admin.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin';

  // Ensure role admin exists
  let { data: roleRow, error: roleErr } = await admin
    .from('roles')
    .select('id,name')
    .eq('name', 'admin')
    .maybeSingle();
  if (roleErr) throw roleErr;
  let roleId = roleRow?.id;
  if (!roleId) {
    const { data: createdRole, error: createRoleErr } = await admin
      .from('roles')
      .insert({ name: 'admin', description: 'Acceso total a todas las funciones.' })
      .select('id')
      .single();
    if (createRoleErr) throw createRoleErr;
    roleId = createdRole.id;
  }

  // Create or get existing auth user
  let authUserId;
  const { data: signUp, error: signUpErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  
  if (signUpErr && signUpErr.code === 'email_exists') {
    // User exists, get user list to find ID
    const { data: users, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existingUser = users.users.find(u => u.email === email);
    if (!existingUser) throw new Error('User exists but cannot find ID');
    authUserId = existingUser.id;
    console.log('ℹ️ Using existing auth user:', email);
  } else if (signUpErr) {
    throw signUpErr;
  } else {
    authUserId = signUp.user?.id;
    if (!authUserId) throw new Error('No auth user id');
    console.log('✅ Created new auth user:', email);
  }

  // Upsert profile - first check what user exists (might have password_hash field required)
  const { data: profile, error: profileErr } = await admin
    .from('users')
    .upsert({
      email,
      name: 'Administrador Principal',
      role: 'admin',
      password_hash: 'dummy_for_auth_user', // Required field from migration
      is_active: true,
      auth_user_id: authUserId,
    }, { onConflict: 'email' })
    .select('id')
    .single();
  if (profileErr) throw profileErr;

  // Assign role
  if (roleId && profile?.id) {
    await admin.from('user_roles').upsert({ user_id: profile.id, role_id: roleId });
  }

  console.log('✅ Seed admin completed:', email);
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});


