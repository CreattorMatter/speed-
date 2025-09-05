import { supabase } from '@/lib/supabaseClient';
import type { User } from '@/types/index';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

export async function getCurrentProfile(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const authUserId = session.user.id;
  
  // Fetch base profile from users (use status, not is_active)
  const { data: baseProfile, error: baseErr } = await supabase
    .from('users')
    .select('id, name, email, created_at, auth_user_id, status, first_login, role')
    .eq('auth_user_id', authUserId)
    .single();

  if (baseErr || !baseProfile) {
    // Fallback minimal info from auth
    return {
      id: authUserId,
      name: session.user.user_metadata?.name || session.user.email || 'Usuario',
      email: session.user.email || '',
      role: 'viewer',
      status: 'active',
      created_at: new Date().toISOString(),
    } as User;
  }

  // Derive role from user_roles -> roles
  let roleName = baseProfile.role || 'viewer'; // Usar role directo de users como fallback
  
  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', baseProfile.id)
    .maybeSingle();
  
  if (roleRow && (roleRow as any).roles?.name) {
    roleName = (roleRow as any).roles.name as string;
  }

  const isActive = (baseProfile as any).status !== undefined
    ? ((baseProfile as any).status === 'active' || (baseProfile as any).status === true)
    : true;

  const user: User = {
    id: baseProfile.id,
    name: baseProfile.name,
    email: baseProfile.email,
    role: roleName,
    status: isActive ? 'active' : 'inactive',
    created_at: baseProfile.created_at,
    first_login: (baseProfile as any).first_login ?? undefined,
  } as User;

  return user;
}

export async function signInWithPassword(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw error || new Error('No session');
  }
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Perfil no encontrado');
  localStorage.setItem('user', JSON.stringify(profile));
  return profile;
}

export async function signOut(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } finally {
    localStorage.removeItem('user');
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// Marca en la tabla users que el primer login fue completado
export async function markFirstLoginCompleted(): Promise<void> {
  try {
    const session = await getSession();
    if (!session) return;
    await supabase
      .from('users')
      .update({ first_login: false })
      .eq('auth_user_id', session.user.id);
  } catch {
    // silenciar para entornos donde la columna no exista aún
  }
}



