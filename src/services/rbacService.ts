import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import type { User, Group, Role } from '@/types/index';

const db = supabaseAdmin || supabase;

const isDbReady = (): boolean => {
  // crude check: supabase client has from function
  return !!(db as any)?.from;
};

// Roles
export async function getRoles(): Promise<Role[]> {
  if (!isDbReady()) {
    return [
      { id: 'admin', name: 'Administrador', description: 'Acceso total a todas las funciones.' },
      { id: 'editor', name: 'Editor', description: 'Puede crear y editar plantillas y carteles.' },
      { id: 'viewer', name: 'Visualizador', description: 'Solo puede ver carteles y plantillas.' },
      { id: 'sucursal', name: 'Sucursal', description: 'Permisos limitados para impresión.' },
    ];
  }
  const { data, error } = await db.from('roles').select('id,name,description');
  if (error) throw error;
  return (data || []).map((r: any) => ({ id: r.id, name: r.name, description: r.description }));
}

export async function createRole(role: Omit<Role, 'id'>): Promise<Role> {
  if (!isDbReady()) {
    return { id: `role_${Date.now()}`, ...role };
  }
  const { data, error } = await db
    .from('roles')
    .insert({ name: role.name, description: role.description })
    .select('id,name,description')
    .single();
  if (error) throw error;
  return data as Role;
}

// Permissions
export async function getPermissions(): Promise<{ id: string; name: string; description?: string }[]> {
  if (!isDbReady()) return [];
  const { data, error } = await db.from('permissions').select('id,name,description');
  if (error) throw error;
  return (data || []) as any;
}

export async function getRolesWithPermissions(): Promise<Array<{ id: string; name: string; description?: string; permissions: string[]; userCount: number }>> {
  if (!isDbReady()) return [];
  const [{ data: roles, error: rolesErr }, { data: rolePerms }, { data: userRoles }] = await Promise.all([
    db.from('roles').select('id,name,description'),
    db.from('role_permissions').select('role_id, permissions(name)'),
    db.from('user_roles').select('role_id')
  ]);
  if (rolesErr) throw rolesErr;
  const permsByRole: Record<string, string[]> = {};
  (rolePerms || []).forEach((rp: any) => {
    if (!permsByRole[rp.role_id]) permsByRole[rp.role_id] = [];
    if (rp.permissions?.name) permsByRole[rp.role_id].push(rp.permissions.name as string);
  });
  const countByRole: Record<string, number> = {};
  (userRoles || []).forEach((ur: any) => {
    countByRole[ur.role_id] = (countByRole[ur.role_id] || 0) + 1;
  });
  return (roles || []).map((r: any) => ({ id: r.id, name: r.name, description: r.description, permissions: permsByRole[r.id] || [], userCount: countByRole[r.id] || 0 }));
}

export async function updateRole(roleId: string, updates: Partial<Pick<Role, 'name' | 'description'>>): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('roles').update(updates).eq('id', roleId);
  if (error) throw error;
}

export async function deleteRole(roleId: string): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('roles').delete().eq('id', roleId);
  if (error) throw error;
}

export async function updateRolePermissions(roleId: string, permissionNames: string[]): Promise<void> {
  if (!isDbReady()) return;
  // Map names -> ids
  const { data: allPerms, error: permsErr } = await db.from('permissions').select('id,name');
  if (permsErr) throw permsErr;
  const nameToId: Record<string, string> = {};
  (allPerms || []).forEach((p: any) => (nameToId[p.name] = p.id));
  const ids = permissionNames.map((n) => nameToId[n]).filter(Boolean);

  // Replace role permissions
  await db.from('role_permissions').delete().eq('role_id', roleId);
  if (ids.length) {
    const rows = ids.map((pid) => ({ role_id: roleId, permission_id: pid }));
    const { error: insErr } = await db.from('role_permissions').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function upsertPermissions(perms: Array<{ name: string; description?: string }>): Promise<void> {
  if (!isDbReady()) return;
  if (!perms || perms.length === 0) return;
  const { error } = await db
    .from('permissions')
    .upsert(
      perms.map((p) => ({ name: p.name, description: p.description || null })),
      { onConflict: 'name' }
    );
  if (error) throw error;
}

// Permission checks (uses SQL function public.has_permission)
export async function hasPermission(permissionName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('has_permission', { perm_name: permissionName });
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function hasAllPermissions(permissionNames: string[]): Promise<boolean> {
  if (!permissionNames || permissionNames.length === 0) return true;
  const checks = await Promise.all(permissionNames.map((p) => hasPermission(p)));
  return checks.every(Boolean);
}

// Users
export async function getUsers(): Promise<User[]> {
  if (!isDbReady()) {
    return [];
  }
  // Fetch users base data
  const { data: users, error } = await db
    .from('users')
    .select('id,name,email,status,created_at');
  if (error) throw error;

  const userList = (users || []) as any[];
  if (userList.length === 0) return [];

  // Fetch roles for all users in one query
  const userIds = userList.map(u => u.id);
  const { data: rolesRows } = await db
    .from('user_roles')
    .select('user_id, roles(name)')
    .in('user_id', userIds);

  const userIdToRole: Record<string, string> = {};
  (rolesRows || []).forEach((row: any) => {
    if (row?.user_id && row?.roles?.name) {
      userIdToRole[row.user_id] = row.roles.name as string;
    }
  });

  return userList.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: userIdToRole[u.id] || 'viewer',
    status: u.status,
    created_at: u.created_at,
  }));
}

export async function createUser(input: {
  name: string; email: string; role: string; temporary_password?: string;
  domain_type?: User['domain_type']; groups?: string[]; first_login?: boolean;
}): Promise<User> {
  if (!isDbReady()) {
    return {
      id: `usr_${Date.now()}`,
      name: input.name,
      email: input.email,
      role: input.role,
      status: 'active',
      created_at: new Date().toISOString(),
      domain_type: input.domain_type,
      groups: input.groups,
      first_login: input.first_login,
      temporary_password: input.temporary_password,
    };
  }

  // 1) Crear usuario en auth para externos (password)
  let authUserId: string | undefined;
  if (input.domain_type === 'external') {
    const redirectUrl = (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173') + '/welcome';
    const { data: signUp, error: signUpErr } = await supabase.auth.signUp({
      email: input.email,
      password: input.temporary_password || 'Temporary123!',
      options: { emailRedirectTo: redirectUrl }
    });
    if (signUpErr || !signUp.user) throw signUpErr || new Error('No se pudo crear el usuario auth');
    authUserId = signUp.user.id;
  }

  // 2) Crear perfil en tabla users con mapping a auth_user_id
  // Intento resiliente: reintenta adaptando columnas segun el esquema
  let payload: Record<string, any> = {
    name: input.name,
    email: input.email,
    role: input.role,
    status: true, // boolean schema in your DB
    auth_user_id: authUserId || null,
  };

  let lastError: any = null;
  let insertRes: { data?: any; error?: any } | null = null;
  for (let i = 0; i < 5; i++) {
    const { data, error } = await db
      .from('users')
      .insert(payload)
      .select('id,name,email,role,status,created_at,auth_user_id')
      .single();
    if (!error) {
      insertRes = { data, error: null } as any;
      break;
    }
    lastError = error;
    const msg = String(error.message || '').toLowerCase();
    // Ajustes según error
    if (msg.includes('boolean')) {
      payload.status = true; // esquema booleano
      continue;
    }
    if (/column .*status.* does not exist/i.test(error.message || '')) {
      delete payload.status;
      payload.is_active = true; // esquema alternativo
      continue;
    }
    if (msg.includes('password_hash')) {
      delete (payload as any).password_hash;
      continue;
    }
    if (/column .*role.* does not exist/i.test(error.message || '')) {
      delete payload.role;
      continue;
    }
    // si otro error, cortar
    break;
  }

  if (!insertRes || insertRes.error) throw lastError || insertRes?.error;

  const raw = (insertRes as any).data as any;
  const normalizedStatus: User['status'] = typeof raw.status === 'boolean'
    ? (raw.status ? 'active' : 'inactive')
    : (raw.status ?? 'active');
  const user: User = { ...(raw as any), status: normalizedStatus } as User;

  // 3) Asignar rol en user_roles si existe coincidencia por nombre de rol
  try {
    // buscar id del rol por nombre si roles table poblada
    const { data: roleRow } = await db.from('roles').select('id,name').eq('name', input.role).maybeSingle();
    if (roleRow?.id) {
      await db.from('user_roles').insert({ user_id: user.id, role_id: roleRow.id });
    }
  } catch {}

  // 4) Grupos
  if (input.groups && input.groups.length) {
    const rows = input.groups.map(g => ({ group_id: g, user_id: user.id }));
    try { await db.from('group_users').insert(rows); } catch {}
  }
  return user;
}

export async function updateUser(userId: string, updates: Partial<Pick<User, 'name'|'email'|'role'|'status'>>): Promise<void> {
  if (!isDbReady()) return;
  // Split role update from profile updates
  const { role, ...profileUpdates } = updates || {} as any;
  if (Object.keys(profileUpdates).length > 0) {
    const { error } = await db.from('users').update(profileUpdates).eq('id', userId);
    if (error) throw error;
  }
  if (role) {
    // Find role id
    const { data: roleRow, error: roleErr } = await db.from('roles').select('id').eq('name', role).maybeSingle();
    if (roleErr) throw roleErr;
    if (roleRow?.id) {
      // Upsert user_roles
      // Try update first
      const { data: existing } = await db.from('user_roles').select('user_id').eq('user_id', userId).maybeSingle();
      if (existing) {
        const { error: updErr } = await db.from('user_roles').update({ role_id: roleRow.id }).eq('user_id', userId);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await db.from('user_roles').insert({ user_id: userId, role_id: roleRow.id });
        if (insErr) throw insErr;
      }
    }
  }
}

export async function deleteUser(userId: string): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('users').delete().eq('id', userId);
  if (error) throw error;
}

// Groups
export async function getGroups(): Promise<Group[]> {
  if (!isDbReady()) return [];
  const { data, error } = await db
    .from('groups')
    .select('id,name,description,created_at,created_by');
  if (error) throw error;
  return (data || []) as Group[];
}

export async function createGroup(group: Omit<Group, 'id'|'created_at'|'created_by'> & { created_by?: string }): Promise<Group> {
  if (!isDbReady()) {
    return { id: `grp_${Date.now()}`, ...group } as Group;
  }
  const { data, error } = await db
    .from('groups')
    .insert({ name: group.name, description: group.description, created_by: group.created_by })
    .select('id,name,description,created_at,created_by')
    .single();
  if (error) throw error;
  return data as Group;
}

export async function updateGroupDb(groupId: string, updates: Partial<Group>): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('groups').update(updates).eq('id', groupId);
  if (error) throw error;
}

export async function deleteGroupDb(groupId: string): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('groups').delete().eq('id', groupId);
  if (error) throw error;
}

export async function addUserToGroupDb(groupId: string, userId: string): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('group_users').insert({ group_id: groupId, user_id: userId });
  if (error) throw error;
}

export async function removeUserFromGroupDb(groupId: string, userId: string): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('group_users').delete().match({ group_id: groupId, user_id: userId });
  if (error) throw error;
}


