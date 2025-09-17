import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseClient';
import type { User } from '@/types/index';

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session || null;
}

// Garantiza que el usuario tenga un vínculo en user_roles acorde a su rol efectivo
async function ensureUserRoleLink(userId: string, roleName: string): Promise<void> {
  try {
    const db = (supabaseAdmin as any)?.from ? supabaseAdmin : supabase;

    // Buscar rol por nombre, o crearlo si no existe
    let roleId: string | null = null;
    const { data: existingRole } = await db.from('roles').select('id,name').eq('name', roleName).maybeSingle();
    if (existingRole?.id) {
      roleId = existingRole.id as string;
    } else {
      const { data: newRole } = await db
        .from('roles')
        .insert({ name: roleName, description: `${roleName} (auto)` })
        .select('id')
        .maybeSingle();
      roleId = newRole?.id ?? null;
    }

    if (!roleId) return;

    // Verificar si ya existe vínculo
    const { data: existingLink } = await db
      .from('user_roles')
      .select('user_id, role_id')
      .eq('user_id', userId)
      .maybeSingle();

    let changed = false;
    if (existingLink?.user_id) {
      if (existingLink.role_id !== roleId) {
        const { error: updErr } = await db
          .from('user_roles')
          .update({ role_id: roleId })
          .eq('user_id', userId);
        if (!updErr) changed = true;
      }
    } else {
      const { error: insErr } = await db
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId });
      if (!insErr) changed = true;
    }

    // Invalidar permisos en el Front si hubo cambios
    if (changed && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('permissions:invalidate'));
    }
  } catch (e) {
    // No romper flujo si falla; RLS o esquema pueden variar
    console.warn('ensureUserRoleLink: no se pudo asegurar el vínculo user_roles:', e);
  }
}

export async function getCurrentProfile(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;

  const authUserId = session.user.id;
  
  // Fetch base profile from users con selección amplia para evitar fallos por columnas
  let baseProfile: any | null = null;
  let baseErr: any | null = null;
  try {
    // Intentar primero por email (siempre existe y evita 400 por columna faltante)
    const byEmail = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .maybeSingle();
    if (byEmail.data) {
      baseProfile = byEmail.data;
    } else {
      // Fallback: por auth_user_id si la columna existe
      const byAuth = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      baseProfile = byAuth.data ?? null;
      baseErr = byAuth.error ?? null;
    }
  } catch (e) {
    baseErr = e;
  }

  if (baseErr || !baseProfile) {
    if (baseErr) {
      console.warn('getCurrentProfile: users lookup error', baseErr.message);
    }
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

  // Derive role desde users.role (evitar embed a user_roles -> roles que está causando 400)
  let roleName = baseProfile.role || 'viewer';

  // Asegurar que exista el vínculo en user_roles (sobre todo para admin)
  await ensureUserRoleLink(baseProfile.id, roleName);

  // Normalizar estado activo: soportar "status" (bool o texto) y "is_active" (bool)
  const rawStatus = (baseProfile as any).status;
  const rawIsActive = (baseProfile as any).is_active;
  const isActive =
    rawStatus !== undefined
      ? (rawStatus === 'active' || rawStatus === true)
      : (rawIsActive !== undefined ? Boolean(rawIsActive) : true);

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
      .eq('email', session.user.email);
  } catch {
    // silenciar para entornos donde la columna no exista aún
  }
}



