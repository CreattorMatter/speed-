/**
 * Seed admin user in Supabase Auth + public.users + user_roles
 * Usage: ts-node src/scripts/seedAdmin.ts or compile/run with node after ts
 */
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

  // 1) Ensure role admin exists
  const { data: roleRow, error: roleErr } = await admin
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

  // 2) Create auth user
  const { data: signUp, error: signUpErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  } as any);
  if (signUpErr) throw signUpErr;
  const authUserId = signUp.user?.id;
  if (!authUserId) throw new Error('No auth user id');

  // 3) Upsert profile in public.users
  const { data: profile, error: profileErr } = await admin
    .from('users')
    .upsert({
      email,
      name: 'Administrador Principal',
      role: 'admin',
      status: 'active',
      auth_user_id: authUserId,
    } as any, { onConflict: 'email' })
    .select('id')
    .single();
  if (profileErr) throw profileErr;

  // 4) Assign user_roles
  if (roleId && profile?.id) {
    await admin.from('user_roles').upsert({ user_id: profile.id, role_id: roleId } as any);
  }

  console.log('✅ Seed admin completed:', email);
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});


