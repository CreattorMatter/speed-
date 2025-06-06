import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';

// ====================================
// TIPOS Y INTERFACES
// ====================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'execute';
  scope: 'global' | 'organization' | 'team' | 'project' | 'own';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  organizationId: string;
  color: string;
  priority: number;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  roles: string[];
  teams: string[];
  organizationId: string;
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
  lastLoginAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  avatar?: string;
  organizationId: string;
  members: {
    userId: string;
    role: 'member' | 'lead' | 'admin';
    joinedAt: number;
  }[];
  projects: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface Organization {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  plan: {
    type: 'free' | 'pro' | 'business' | 'enterprise';
    features: string[];
    limits: {
      users: number;
      teams: number;
      projects: number;
      storage: number;
      templates: number;
    };
    billing: {
      currency: string;
      amount: number;
      interval: 'monthly' | 'yearly';
      nextBilling?: number;
    };
  };
  settings: {
    allowPublicTemplates: boolean;
    requireApproval: boolean;
    enableSSO: boolean;
    enforcePasswordPolicy: boolean;
    auditLogging: boolean;
    dataRetention: number; // días
  };
  owner: string;
  admins: string[];
  status: 'active' | 'suspended' | 'trial' | 'expired';
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  organizationId: string;
  teamId?: string;
  templates: string[];
  members: {
    userId: string;
    role: 'viewer' | 'editor' | 'admin';
    addedAt: number;
  }[];
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    requireApproval: boolean;
    autoSave: boolean;
  };
  metadata: {
    totalTemplates: number;
    totalAssets: number;
    lastActivity: number;
  };
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: number;
}

export interface Invitation {
  id: string;
  organizationId: string;
  email: string;
  roles: string[];
  teams: string[];
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: number;
  createdAt: number;
}

export interface OrganizationState {
  currentOrganization: Organization | null;
  organizations: Organization[];
  users: User[];
  teams: Team[];
  roles: Role[];
  permissions: Permission[];
  projects: Project[];
  auditLogs: AuditLog[];
  invitations: Invitation[];
  
  // Estado actual del usuario
  currentUser: User | null;
  userPermissions: string[];
  userTeams: Team[];
  userProjects: Project[];
  
  // UI State
  selectedTeam: string | null;
  selectedProject: string | null;
  viewMode: 'organization' | 'team' | 'project';
  
  // Filtros y búsqueda
  usersFilter: {
    search: string;
    role: string | null;
    team: string | null;
    status: User['status'] | 'all';
  };
  
  teamsFilter: {
    search: string;
    status: 'all' | 'active' | 'inactive';
  };
  
  auditFilter: {
    search: string;
    action: string | null;
    user: string | null;
    dateRange: {
      start: number | null;
      end: number | null;
    };
  };
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Analytics
  analytics: {
    activeUsers: number;
    totalProjects: number;
    totalTemplates: number;
    storageUsed: number;
    monthlyActivity: { date: string; count: number }[];
    topUsers: { userId: string; activity: number }[];
    teamActivity: { teamId: string; activity: number }[];
  };
}

// ====================================
// ASYNC THUNKS
// ====================================

export const fetchOrganization = createAsyncThunk(
  'organization/fetchOrganization',
  async (organizationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data
    const mockOrganization: Organization = {
      id: organizationId,
      name: 'supermercado-demo',
      displayName: 'Supermercado Demo',
      description: 'Organización de demostración para supermercado',
      logo: '/logos/org-demo.png',
      industry: 'retail',
      size: 'medium',
      plan: {
        type: 'business',
        features: ['templates', 'collaboration', 'analytics', 'api'],
        limits: {
          users: 50,
          teams: 10,
          projects: 100,
          storage: 100 * 1024 * 1024 * 1024, // 100GB
          templates: 1000
        },
        billing: {
          currency: 'USD',
          amount: 99,
          interval: 'monthly',
          nextBilling: Date.now() + 30 * 24 * 60 * 60 * 1000
        }
      },
      settings: {
        allowPublicTemplates: true,
        requireApproval: false,
        enableSSO: false,
        enforcePasswordPolicy: true,
        auditLogging: true,
        dataRetention: 365
      },
      owner: 'user-1',
      admins: ['user-1', 'user-2'],
      status: 'active',
      createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 24 * 60 * 60 * 1000
    };
    
    return mockOrganization;
  }
);

export const inviteUser = createAsyncThunk(
  'organization/inviteUser',
  async (params: {
    email: string;
    roles: string[];
    teams: string[];
    organizationId: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const invitation: Invitation = {
      id: nanoid(),
      organizationId: params.organizationId,
      email: params.email,
      roles: params.roles,
      teams: params.teams,
      invitedBy: 'current-user',
      status: 'pending',
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
      createdAt: Date.now()
    };
    
    return invitation;
  }
);

export const createTeam = createAsyncThunk(
  'organization/createTeam',
  async (params: {
    name: string;
    description: string;
    color: string;
    organizationId: string;
    members?: { userId: string; role: 'member' | 'lead' }[];
  }) => {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const team: Team = {
      id: nanoid(),
      name: params.name,
      description: params.description,
      color: params.color,
      organizationId: params.organizationId,
      members: [
        {
          userId: 'current-user',
          role: 'admin',
          joinedAt: Date.now()
        },
        ...(params.members || []).map(m => ({
          ...m,
          joinedAt: Date.now()
        }))
      ],
      projects: [],
      isActive: true,
      createdBy: 'current-user',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    return team;
  }
);

export const logAuditEvent = createAsyncThunk(
  'organization/logAuditEvent',
  async (params: {
    action: string;
    resource: string;
    resourceId: string;
    details?: Record<string, any>;
  }) => {
    // En una implementación real, esto se enviaría al servidor
    const auditLog: AuditLog = {
      id: nanoid(),
      organizationId: 'current-org',
      userId: 'current-user',
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details || {},
      ipAddress: '192.168.1.1',
      userAgent: navigator.userAgent,
      timestamp: Date.now()
    };
    
    return auditLog;
  }
);

// ====================================
// PERMISOS PREDEFINIDOS
// ====================================

const DEFAULT_PERMISSIONS: Permission[] = [
  // Templates
  { id: 'templates:create', name: 'Crear Templates', description: 'Crear nuevos templates', resource: 'templates', action: 'create', scope: 'organization' },
  { id: 'templates:read', name: 'Ver Templates', description: 'Ver templates', resource: 'templates', action: 'read', scope: 'organization' },
  { id: 'templates:update', name: 'Editar Templates', description: 'Editar templates existentes', resource: 'templates', action: 'update', scope: 'own' },
  { id: 'templates:delete', name: 'Eliminar Templates', description: 'Eliminar templates', resource: 'templates', action: 'delete', scope: 'own' },
  { id: 'templates:manage', name: 'Gestionar Templates', description: 'Gestión completa de templates', resource: 'templates', action: 'manage', scope: 'organization' },
  
  // Assets
  { id: 'assets:create', name: 'Subir Assets', description: 'Subir nuevos assets', resource: 'assets', action: 'create', scope: 'organization' },
  { id: 'assets:read', name: 'Ver Assets', description: 'Ver assets', resource: 'assets', action: 'read', scope: 'organization' },
  { id: 'assets:update', name: 'Editar Assets', description: 'Editar assets', resource: 'assets', action: 'update', scope: 'own' },
  { id: 'assets:delete', name: 'Eliminar Assets', description: 'Eliminar assets', resource: 'assets', action: 'delete', scope: 'own' },
  { id: 'assets:manage', name: 'Gestionar Assets', description: 'Gestión completa de assets', resource: 'assets', action: 'manage', scope: 'organization' },
  
  // Users
  { id: 'users:read', name: 'Ver Usuarios', description: 'Ver lista de usuarios', resource: 'users', action: 'read', scope: 'organization' },
  { id: 'users:invite', name: 'Invitar Usuarios', description: 'Invitar nuevos usuarios', resource: 'users', action: 'create', scope: 'organization' },
  { id: 'users:update', name: 'Editar Usuarios', description: 'Editar información de usuarios', resource: 'users', action: 'update', scope: 'organization' },
  { id: 'users:manage', name: 'Gestionar Usuarios', description: 'Gestión completa de usuarios', resource: 'users', action: 'manage', scope: 'organization' },
  
  // Teams
  { id: 'teams:create', name: 'Crear Equipos', description: 'Crear nuevos equipos', resource: 'teams', action: 'create', scope: 'organization' },
  { id: 'teams:read', name: 'Ver Equipos', description: 'Ver equipos', resource: 'teams', action: 'read', scope: 'organization' },
  { id: 'teams:update', name: 'Editar Equipos', description: 'Editar equipos', resource: 'teams', action: 'update', scope: 'team' },
  { id: 'teams:manage', name: 'Gestionar Equipos', description: 'Gestión completa de equipos', resource: 'teams', action: 'manage', scope: 'organization' },
  
  // Organization
  { id: 'org:settings', name: 'Configuración Org.', description: 'Acceder a configuración de organización', resource: 'organization', action: 'update', scope: 'organization' },
  { id: 'org:billing', name: 'Facturación', description: 'Gestionar facturación', resource: 'organization', action: 'manage', scope: 'organization' },
  { id: 'org:audit', name: 'Logs de Auditoría', description: 'Ver logs de auditoría', resource: 'organization', action: 'read', scope: 'organization' },
  { id: 'org:analytics', name: 'Analytics', description: 'Ver analytics de organización', resource: 'organization', action: 'read', scope: 'organization' }
];

const DEFAULT_ROLES: Omit<Role, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Owner',
    description: 'Propietario de la organización con acceso completo',
    permissions: DEFAULT_PERMISSIONS.map(p => p.id),
    isSystem: true,
    color: '#DC2626',
    priority: 1
  },
  {
    name: 'Admin',
    description: 'Administrador con acceso a gestión y configuración',
    permissions: [
      'templates:manage', 'assets:manage', 'users:manage', 'teams:manage',
      'org:settings', 'org:audit', 'org:analytics'
    ],
    isSystem: true,
    color: '#7C3AED',
    priority: 2
  },
  {
    name: 'Editor',
    description: 'Editor con permisos de creación y edición',
    permissions: [
      'templates:create', 'templates:read', 'templates:update',
      'assets:create', 'assets:read', 'assets:update',
      'teams:read', 'users:read'
    ],
    isSystem: true,
    color: '#059669',
    priority: 3
  },
  {
    name: 'Viewer',
    description: 'Visualizador con permisos de solo lectura',
    permissions: [
      'templates:read', 'assets:read', 'teams:read', 'users:read'
    ],
    isSystem: true,
    color: '#6B7280',
    priority: 4
  }
];

// ====================================
// ESTADO INICIAL
// ====================================

const initialState: OrganizationState = {
  currentOrganization: null,
  organizations: [],
  users: [],
  teams: [],
  roles: [],
  permissions: DEFAULT_PERMISSIONS,
  projects: [],
  auditLogs: [],
  invitations: [],
  
  currentUser: null,
  userPermissions: [],
  userTeams: [],
  userProjects: [],
  
  selectedTeam: null,
  selectedProject: null,
  viewMode: 'organization',
  
  usersFilter: {
    search: '',
    role: null,
    team: null,
    status: 'all'
  },
  
  teamsFilter: {
    search: '',
    status: 'all'
  },
  
  auditFilter: {
    search: '',
    action: null,
    user: null,
    dateRange: {
      start: null,
      end: null
    }
  },
  
  isLoading: false,
  error: null,
  
  analytics: {
    activeUsers: 0,
    totalProjects: 0,
    totalTemplates: 0,
    storageUsed: 0,
    monthlyActivity: [],
    topUsers: [],
    teamActivity: []
  }
};

// ====================================
// SLICE
// ====================================

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    // Usuario actual
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.userPermissions = getUserPermissions(action.payload, state.roles);
      state.userTeams = state.teams.filter(team => 
        team.members.some(member => member.userId === action.payload.id)
      );
    },
    
    // Navegación
    setSelectedTeam: (state, action: PayloadAction<string | null>) => {
      state.selectedTeam = action.payload;
      state.viewMode = action.payload ? 'team' : 'organization';
    },
    
    setSelectedProject: (state, action: PayloadAction<string | null>) => {
      state.selectedProject = action.payload;
      state.viewMode = action.payload ? 'project' : 'organization';
    },
    
    setViewMode: (state, action: PayloadAction<OrganizationState['viewMode']>) => {
      state.viewMode = action.payload;
    },
    
    // Filtros
    setUsersFilter: (state, action: PayloadAction<Partial<OrganizationState['usersFilter']>>) => {
      state.usersFilter = { ...state.usersFilter, ...action.payload };
    },
    
    setTeamsFilter: (state, action: PayloadAction<Partial<OrganizationState['teamsFilter']>>) => {
      state.teamsFilter = { ...state.teamsFilter, ...action.payload };
    },
    
    setAuditFilter: (state, action: PayloadAction<Partial<OrganizationState['auditFilter']>>) => {
      state.auditFilter = { ...state.auditFilter, ...action.payload };
    },
    
    // Gestión de usuarios
    updateUser: (state, action: PayloadAction<{ id: string; updates: Partial<User> }>) => {
      const { id, updates } = action.payload;
      const user = state.users.find(u => u.id === id);
      if (user) {
        Object.assign(user, updates, { updatedAt: Date.now() });
        
        // Actualizar permisos si es el usuario actual
        if (state.currentUser?.id === id) {
          state.currentUser = { ...state.currentUser, ...updates };
          state.userPermissions = getUserPermissions(state.currentUser, state.roles);
        }
      }
    },
    
    removeUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.users = state.users.filter(u => u.id !== userId);
      
      // Remover de equipos
      state.teams.forEach(team => {
        team.members = team.members.filter(m => m.userId !== userId);
      });
      
      // Remover de proyectos
      state.projects.forEach(project => {
        project.members = project.members.filter(m => m.userId !== userId);
      });
    },
    
    // Gestión de equipos
    updateTeam: (state, action: PayloadAction<{ id: string; updates: Partial<Team> }>) => {
      const { id, updates } = action.payload;
      const team = state.teams.find(t => t.id === id);
      if (team) {
        Object.assign(team, updates, { updatedAt: Date.now() });
        
        // Actualizar userTeams si afecta al usuario actual
        if (state.currentUser && team.members.some(m => m.userId === state.currentUser!.id)) {
          state.userTeams = state.teams.filter(t => 
            t.members.some(m => m.userId === state.currentUser!.id)
          );
        }
      }
    },
    
    addTeamMember: (state, action: PayloadAction<{ 
      teamId: string; 
      userId: string; 
      role: 'member' | 'lead' | 'admin' 
    }>) => {
      const { teamId, userId, role } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      if (team) {
        const existingMember = team.members.find(m => m.userId === userId);
        if (!existingMember) {
          team.members.push({
            userId,
            role,
            joinedAt: Date.now()
          });
          team.updatedAt = Date.now();
        }
      }
    },
    
    removeTeamMember: (state, action: PayloadAction<{ teamId: string; userId: string }>) => {
      const { teamId, userId } = action.payload;
      const team = state.teams.find(t => t.id === teamId);
      if (team) {
        team.members = team.members.filter(m => m.userId !== userId);
        team.updatedAt = Date.now();
      }
    },
    
    // Gestión de roles
    createRole: (state, action: PayloadAction<Omit<Role, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newRole: Role = {
        ...action.payload,
        id: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      state.roles.push(newRole);
    },
    
    updateRole: (state, action: PayloadAction<{ id: string; updates: Partial<Role> }>) => {
      const { id, updates } = action.payload;
      const role = state.roles.find(r => r.id === id);
      if (role && !role.isSystem) {
        Object.assign(role, updates, { updatedAt: Date.now() });
      }
    },
    
    deleteRole: (state, action: PayloadAction<string>) => {
      const roleId = action.payload;
      const role = state.roles.find(r => r.id === roleId);
      if (role && !role.isSystem) {
        state.roles = state.roles.filter(r => r.id !== roleId);
        
        // Remover rol de usuarios
        state.users.forEach(user => {
          user.roles = user.roles.filter(r => r !== roleId);
        });
      }
    },
    
    // Gestión de proyectos
    createProject: (state, action: PayloadAction<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>>) => {
      const newProject: Project = {
        ...action.payload,
        id: nanoid(),
        metadata: {
          totalTemplates: 0,
          totalAssets: 0,
          lastActivity: Date.now()
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      state.projects.push(newProject);
    },
    
    updateProject: (state, action: PayloadAction<{ id: string; updates: Partial<Project> }>) => {
      const { id, updates } = action.payload;
      const project = state.projects.find(p => p.id === id);
      if (project) {
        Object.assign(project, updates, { updatedAt: Date.now() });
        project.metadata.lastActivity = Date.now();
      }
    },
    
    // Configuración de organización
    updateOrganizationSettings: (state, action: PayloadAction<Partial<Organization['settings']>>) => {
      if (state.currentOrganization) {
        state.currentOrganization.settings = {
          ...state.currentOrganization.settings,
          ...action.payload
        };
        state.currentOrganization.updatedAt = Date.now();
      }
    },
    
    // Invitaciones
    updateInvitation: (state, action: PayloadAction<{ 
      id: string; 
      status: Invitation['status'] 
    }>) => {
      const { id, status } = action.payload;
      const invitation = state.invitations.find(i => i.id === id);
      if (invitation) {
        invitation.status = status;
      }
    },
    
    removeInvitation: (state, action: PayloadAction<string>) => {
      state.invitations = state.invitations.filter(i => i.id !== action.payload);
    },
    
    // Analytics
    updateAnalytics: (state, action: PayloadAction<Partial<OrganizationState['analytics']>>) => {
      state.analytics = { ...state.analytics, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch organization
      .addCase(fetchOrganization.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrganization.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentOrganization = action.payload;
        
        // Inicializar roles por defecto si no existen
        if (state.roles.length === 0) {
          state.roles = DEFAULT_ROLES.map(role => ({
            ...role,
            id: nanoid(),
            organizationId: action.payload.id,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }));
        }
      })
      .addCase(fetchOrganization.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar organización';
      })
      
      // Invite user
      .addCase(inviteUser.fulfilled, (state, action) => {
        state.invitations.push(action.payload);
      })
      
      // Create team
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.push(action.payload);
        
        // Actualizar userTeams si el usuario actual es miembro
        if (state.currentUser && action.payload.members.some(m => m.userId === state.currentUser!.id)) {
          state.userTeams.push(action.payload);
        }
      })
      
      // Log audit event
      .addCase(logAuditEvent.fulfilled, (state, action) => {
        state.auditLogs.unshift(action.payload);
        // Mantener solo los últimos 1000 logs en memoria
        state.auditLogs = state.auditLogs.slice(0, 1000);
      });
  }
});

// ====================================
// FUNCIONES AUXILIARES
// ====================================

function getUserPermissions(user: User, roles: Role[]): string[] {
  const userRoles = roles.filter(role => user.roles.includes(role.id));
  const permissions = new Set<string>();
  
  userRoles.forEach(role => {
    role.permissions.forEach(permission => {
      permissions.add(permission);
    });
  });
  
  return Array.from(permissions);
}

// ====================================
// SELECTORES
// ====================================

export const selectCurrentOrganization = (state: { organization: OrganizationState }) => 
  state.organization.currentOrganization;

export const selectCurrentUser = (state: { organization: OrganizationState }) => 
  state.organization.currentUser;

export const selectUserPermissions = (state: { organization: OrganizationState }) => 
  state.organization.userPermissions;

export const selectTeams = (state: { organization: OrganizationState }) => 
  state.organization.teams;

export const selectUsers = (state: { organization: OrganizationState }) => 
  state.organization.users;

export const selectRoles = (state: { organization: OrganizationState }) => 
  state.organization.roles;

export const selectProjects = (state: { organization: OrganizationState }) => 
  state.organization.projects;

export const selectAuditLogs = (state: { organization: OrganizationState }) => 
  state.organization.auditLogs;

export const selectAnalytics = (state: { organization: OrganizationState }) => 
  state.organization.analytics;

export const selectFilteredUsers = (state: { organization: OrganizationState }) => {
  let filtered = state.organization.users;
  const filter = state.organization.usersFilter;
  
  if (filter.search) {
    const search = filter.search.toLowerCase();
    filtered = filtered.filter(user => 
      user.firstName.toLowerCase().includes(search) ||
      user.lastName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search)
    );
  }
  
  if (filter.status !== 'all') {
    filtered = filtered.filter(user => user.status === filter.status);
  }
  
  if (filter.role) {
    filtered = filtered.filter(user => user.roles.includes(filter.role!));
  }
  
  if (filter.team) {
    filtered = filtered.filter(user => user.teams.includes(filter.team!));
  }
  
  return filtered;
};

export const selectFilteredTeams = (state: { organization: OrganizationState }) => {
  let filtered = state.organization.teams;
  const filter = state.organization.teamsFilter;
  
  if (filter.search) {
    const search = filter.search.toLowerCase();
    filtered = filtered.filter(team => 
      team.name.toLowerCase().includes(search) ||
      team.description.toLowerCase().includes(search)
    );
  }
  
  if (filter.status !== 'all') {
    filtered = filtered.filter(team => 
      filter.status === 'active' ? team.isActive : !team.isActive
    );
  }
  
  return filtered;
};

export const selectCanPerform = (state: { organization: OrganizationState }) => 
  (permission: string): boolean => {
    return state.organization.userPermissions.includes(permission);
  };

// ====================================
// ACTIONS
// ====================================

export const {
  setCurrentUser,
  setSelectedTeam,
  setSelectedProject,
  setViewMode,
  setUsersFilter,
  setTeamsFilter,
  setAuditFilter,
  updateUser,
  removeUser,
  updateTeam,
  addTeamMember,
  removeTeamMember,
  createRole,
  updateRole,
  deleteRole,
  createProject,
  updateProject,
  updateOrganizationSettings,
  updateInvitation,
  removeInvitation,
  updateAnalytics
} = organizationSlice.actions;

export default organizationSlice.reducer; 