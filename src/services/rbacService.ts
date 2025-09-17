// Permisos por defecto para admin (si DB tarda o falla). Mantener sincronizado con la migración
const ADMIN_DEFAULT_PERMISSIONS: Array<{ name: string; category: string; description: string }> = [
  // Builder
  { name: 'builder:access', category: 'builder', description: '' },
  { name: 'builder:family:create', category: 'builder', description: '' },
  { name: 'builder:family:edit', category: 'builder', description: '' },
  { name: 'builder:family:delete', category: 'builder', description: '' },
  { name: 'builder:template:create', category: 'builder', description: '' },
  { name: 'builder:template:edit', category: 'builder', description: '' },
  { name: 'builder:template:delete', category: 'builder', description: '' },
  { name: 'builder:template:duplicate', category: 'builder', description: '' },
  // Poster
  { name: 'poster:view', category: 'poster', description: '' },
  { name: 'poster:edit', category: 'poster', description: '' },
  { name: 'poster:print_direct', category: 'poster', description: '' },
  { name: 'poster:print_audit', category: 'poster', description: '' },
  { name: 'poster:send', category: 'poster', description: '' },
  // Dashboard
  { name: 'dashboard:recibidos', category: 'dashboard', description: '' },
  { name: 'dashboard:enviados', category: 'dashboard', description: '' },
  { name: 'dashboard:analytics', category: 'dashboard', description: '' },
  { name: 'dashboard:admin', category: 'dashboard', description: '' },
  // Groups
  { name: 'group:view_own', category: 'group', description: '' },
  { name: 'group:view_all', category: 'group', description: '' },
  // Admin
  { name: 'admin:users', category: 'admin', description: '' },
  { name: 'admin:roles', category: 'admin', description: '' },
  { name: 'admin:groups', category: 'admin', description: '' },
  { name: 'admin:system', category: 'admin', description: '' },
];
import { supabase, supabaseAdmin } from '@/lib/supabaseClient';
import type { User, Group, Role, Permission, UserPermissions } from '@/types/index';

const db = supabaseAdmin || supabase;

const isDbReady = (): boolean => {
  // crude check: supabase client has from function
  return !!(db as any)?.from;
};

// 🗑️ enabledCards system removed - now using role-based permissions

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

// ================================================
// PERMISSIONS MANAGEMENT
// ================================================

export async function getPermissions(): Promise<Permission[]> {
  if (!isDbReady()) return [];
  const { data, error } = await db.from('permissions').select('id,name,category,description');
  if (error) throw error;
  return (data || []) as Permission[];
}

export async function getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
  const permissions = await getPermissions();
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}

export async function createPermission(permission: Omit<Permission, 'id'>): Promise<Permission> {
  if (!isDbReady()) {
    return { id: `perm_${Date.now()}`, ...permission };
  }
  const { data, error } = await db
    .from('permissions')
    .insert({ 
      name: permission.name, 
      category: permission.category, 
      description: permission.description 
    })
    .select('id,name,category,description')
    .single();
  if (error) throw error;
  return data as Permission;
}

export async function updatePermission(permissionId: string, updates: Partial<Omit<Permission, 'id'>>): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('permissions').update(updates).eq('id', permissionId);
  if (error) throw error;
}

export async function deletePermission(permissionId: string): Promise<void> {
  if (!isDbReady()) return;
  const { error } = await db.from('permissions').delete().eq('id', permissionId);
  if (error) throw error;
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

// ================================================
// PERMISSION CHECKS AND USER PERMISSIONS
// ================================================

// Get current user's permissions
export async function getCurrentUserPermissions(): Promise<UserPermissions> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      return { permissions: [], groups: [], hasPermission: () => false };
    }

    // 0) Fast-path: si en localStorage el rol es admin, devolver superuser inmediatamente con permisos por defecto
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('user');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (String(parsed?.role || '').toLowerCase() === 'admin') {
            const hasPermission = (_permissionName: string): boolean => true;
            return { permissions: ADMIN_DEFAULT_PERMISSIONS, groups: [], hasPermission };
          }
        }
      } catch {}
    }

    // Resolve current profile row id and role in users table
    let dbUserId: string | null = null;
    let dbUserRole: string | null = null;

    // 1) Try by email first (siempre existe y evita 400 por columnas faltantes)
    if (user.email) {
      try {
        const { data: byEmail } = await db
          .from('users')
          .select('id, role')
          .eq('email', user.email)
          .maybeSingle();
        dbUserId = byEmail?.id ?? null;
        dbUserRole = (byEmail as any)?.role ?? null;
      } catch (e: any) {
        console.warn('RBAC: error consultando users por email:', String(e?.message || e));
      }
    }

    // 2) Fallback by auth_user_id only if no email available
    if (!dbUserId && !user.email) {
      try {
        const { data: byAuth } = await db
          .from('users')
          .select('id, role')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        dbUserId = byAuth?.id ?? null;
        dbUserRole = (byAuth as any)?.role ?? null;
      } catch (e: any) {
        const msg = String(e?.message || e);
        if (/column .*auth_user_id.* does not exist/i.test(msg)) {
          console.warn('RBAC: users.auth_user_id no existe; no se puede resolver por id de auth');
        } else {
          console.warn('RBAC: error consultando users por auth_user_id:', msg);
        }
      }
    }

    if (!dbUserId) {
      console.warn('RBAC: No se encontró fila en users para el usuario actual');
      return { permissions: [], groups: [], hasPermission: () => false };
    }

    // Si el rol del usuario es admin en users.role, devolver permisos ilimitados (superuser)
    if ((dbUserRole || '').toLowerCase() === 'admin') {
      try {
        const { data: allPerms } = await db.from('permissions').select('name,category,description');
        const permissions = (allPerms || []).map((p: any) => ({ name: p.name, category: p.category, description: p.description ?? '' }));
        // Superuser: aunque la tabla permissions esté vacía, conceder todos los permisos
        const hasPermission = (_permissionName: string): boolean => true;
        return { permissions, groups: [], hasPermission };
      } catch (e) {
        console.warn('RBAC: error trayendo permisos completos para admin:', e);
      }
    }

    return getUserPermissions(dbUserId);
  } catch (error) {
    console.error('Error getting current user permissions:', error);
    return { permissions: [], groups: [], hasPermission: () => false };
  }
}

// Get user permissions by user ID
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  try {
    // 1) Intentar vía RPC si existe
    try {
      const [permissionsResult, groupsResult] = await Promise.all([
        db.rpc('get_user_permissions', { user_uuid: userId }),
        db.rpc('get_user_groups', { user_uuid: userId })
      ]);

      if (!permissionsResult.error && permissionsResult.data) {
        const permissions = (permissionsResult.data || []).map((p: any) => ({
          name: p.permission_name,
          category: p.category,
          description: p.description
        }));

        const groups = (!groupsResult?.error && groupsResult?.data ? groupsResult.data : []).map((g: any) => ({
          id: g.group_id,
          name: g.group_name
        }));

        const hasPermission = (permissionName: string): boolean => permissions.some((p: any) => p.name === permissionName);
        return { permissions, groups, hasPermission };
      }
    } catch (e) {
      // Si la RPC no existe/RLS, caemos al fallback
      console.warn('RBAC: RPC no disponible, usando fallback por tablas:', e);
    }

    // 2) Fallback sin RPC: user_roles -> role_permissions -> permissions y groups
    // 2a) Rol del usuario
    let roleId: string | null = null;
    let roleName: string | null = null;
    const { data: ur } = await db
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (ur?.role_id) roleId = ur.role_id as string;

    // Si no hay user_roles, intentar derivar desde users.role
    if (!roleId) {
      const { data: userRow } = await db
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      roleName = (userRow as any)?.role ?? null;
      if (roleName) {
        const { data: roleRow } = await db
          .from('roles')
          .select('id')
          .eq('name', roleName)
          .maybeSingle();
        roleId = roleRow?.id ?? null;
      }
    }

    // 2b) Permisos para el rol
    let permissionIds: string[] = [];
    if (roleId) {
      const { data: rpRows } = await db
        .from('role_permissions')
        .select('permission_id')
        .eq('role_id', roleId);
      permissionIds = (rpRows || []).map((r: any) => r.permission_id).filter(Boolean);
    }

    // 2c) Cargar permisos
    let permissions: Array<{ name: string; category: string; description: string }> = [];
    if (permissionIds.length) {
      const { data: permRows } = await db
        .from('permissions')
        .select('name,category,description')
        .in('id', permissionIds);
      permissions = (permRows || []).map((p: any) => ({ name: p.name, category: p.category, description: p.description ?? '' }));
    }

    // 2d) Grupos
    const { data: guRows } = await db
      .from('group_users')
      .select('group_id')
      .eq('user_id', userId);
    const groupIds = (guRows || []).map((g: any) => g.group_id).filter(Boolean);
    let groups: Array<{ id: string; name: string }> = [];
    if (groupIds.length) {
      const { data: gRows } = await db
        .from('groups')
        .select('id,name')
        .in('id', groupIds);
      groups = (gRows || []).map((g: any) => ({ id: g.id, name: g.name }));
    }

    const hasPermission = (permissionName: string): boolean => permissions.some((p: any) => p.name === permissionName);
    return { permissions, groups, hasPermission };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return { permissions: [], groups: [], hasPermission: () => false };
  }
}

// Check if current user has specific permission
export async function hasPermission(permissionName: string): Promise<boolean> {
  try {
    const userPerms = await getCurrentUserPermissions();
    return userPerms.hasPermission(permissionName);
  } catch {
    return false;
  }
}

// Check if user has specific permission by user ID
export async function userHasPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    const { data, error } = await db.rpc('user_has_permission', { 
      user_uuid: userId, 
      permission_name: permissionName 
    });
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

export async function hasAllPermissions(permissionNames: string[]): Promise<boolean> {
  if (!permissionNames || permissionNames.length === 0) return true;
  const userPerms = await getCurrentUserPermissions();
  return permissionNames.every(perm => userPerms.hasPermission(perm));
}

// Check if user has any of the specified permissions
export async function hasAnyPermission(permissionNames: string[]): Promise<boolean> {
  if (!permissionNames || permissionNames.length === 0) return false;
  const userPerms = await getCurrentUserPermissions();
  return permissionNames.some(perm => userPerms.hasPermission(perm));
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

  // Fetch roles for all users SIN embed (evita 400); mapear en memoria
  const userIds = userList.map(u => u.id);
  const { data: urRows } = await db
    .from('user_roles')
    .select('user_id, role_id')
    .in('user_id', userIds);

  const roleIds = Array.from(new Set((urRows || []).map((r: any) => r.role_id).filter(Boolean)));
  let roleIdToName: Record<string, string> = {};
  if (roleIds.length) {
    const { data: rolesRows2 } = await db
      .from('roles')
      .select('id,name')
      .in('id', roleIds);
    (rolesRows2 || []).forEach((r: any) => {
      if (r?.id && r?.name) roleIdToName[r.id] = r.name as string;
    });
  }

  const userIdToRole: Record<string, string> = {};
  (urRows || []).forEach((row: any) => {
    if (row?.user_id && row?.role_id) {
      const name = roleIdToName[row.role_id];
      if (name) userIdToRole[row.user_id] = name;
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
    // si existe la columna en el esquema actual, quedará persistido; si no existe, se ignora en los retries
    first_login: input.first_login ?? (input.domain_type === 'external' ? true : false),
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
    if (/column .*first_login.* does not exist/i.test(error.message || '')) {
      delete (payload as any).first_login;
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
  
  // Only send whitelisted columns to avoid schema mismatches across environments
  const allowedKeys: Array<keyof Group> = ['name', 'description', 'created_by'];
  const payload: Record<string, any> = {};
  for (const key of allowedKeys) {
    if (key in (updates || {})) {
      payload[key] = (updates as any)[key];
    }
  }

  // If nothing to update, silently succeed
  if (Object.keys(payload).length === 0) return;

  const { error } = await db.from('groups').update(payload).eq('id', groupId);
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


