import React, { useState } from 'react';
import { Users, Shield, Key, ArrowLeft, Activity, UserPlus } from 'lucide-react';
import { UsersTable } from './UsersTable';
import { EditUserModal } from './EditUserModal';
import { AddUserModal, type NewUserData } from './AddUserModal';
import { RolesAndPermissions } from './RolesAndPermissions';
import { SecuritySettings } from './SecuritySettings';
import { SecurityDashboard } from './SecurityDashboard';
import { GroupsManagement } from './GroupsManagement';
import { User, Role, Group } from '@/types/index';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/shared/Header';
import { toast } from 'react-hot-toast';
import { generateTemporaryPassword } from '@/utils/passwordGenerator';
import { sendWelcomeExternalEmail, sendWelcomeInternalEmail } from '@/services/supabaseEmailSMTP';

// Datos mock iniciales. En una aplicación real, vendrían de una API.
const initialUsers: User[] = [
  { id: 'usr_1', name: 'Julio Cesar Soria Diaz', email: 'julio.soria@example.com', role: 'admin', status: 'active', lastLogin: '2024-05-28T10:00:00Z', created_at: '2023-01-15T11:30:00Z' },
  { id: 'usr_2', name: 'Juan Perez', email: 'juan.perez@example.com', role: 'editor', status: 'active', lastLogin: '2024-05-28T09:30:00Z', created_at: '2023-02-20T14:00:00Z' },
  { id: 'usr_3', name: 'Maria Garcia', email: 'maria.garcia@example.com', role: 'viewer', status: 'inactive', lastLogin: '2024-05-27T15:00:00Z', created_at: '2023-03-10T09:00:00Z' },
];

const mockRoles: Role[] = [
    { id: 'admin', name: 'Administrador', description: 'Acceso total a todas las funciones.' },
    { id: 'editor', name: 'Editor', description: 'Puede crear y editar plantillas y carteles.' },
    { id: 'viewer', name: 'Visualizador', description: 'Solo puede ver carteles y plantillas.' },
];

// 🆕 Mock data for groups
const initialGroups: Group[] = [
  { 
    id: 'grp_1', 
    name: 'Sucursal Almagro', 
    description: 'Usuarios de la sucursal Almagro',
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'usr_1',
    users: ['usr_2']
  },
  { 
    id: 'grp_2', 
    name: 'Editorial', 
    description: 'Equipo editorial y creativo',
    created_at: '2024-02-01T10:00:00Z',
    created_by: 'usr_1',
    users: ['usr_2']
  }
];

interface AdministrationProps {
  onBack: () => void;
  onLogout: () => void;
  userEmail: string;
  userName: string;
  currentUser: User;
}

export const Administration: React.FC<AdministrationProps> = ({ 
  onBack, 
  onLogout, 
  userEmail, 
  userName,
  currentUser 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este usuario?')) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      // TODO: Llamar a la API para eliminar el usuario
    }
  };

  const handleSaveUser = (userId: string, updates: { name: string; email: string; role: string }) => {
    setUsers(prevUsers => prevUsers.map(u => (u.id === userId ? { ...u, ...updates } : u)));
    // TODO: Llamar a la API para guardar los cambios
    setIsEditModalOpen(false);
  };

  // 🆕 User Management Handlers
  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCreateUser = async (userData: NewUserData): Promise<void> => {
    try {
      // Generate unique ID
      const newUserId = `usr_${Date.now()}`;
      
      // Create new user object
      const newUser: User = {
        id: newUserId,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: 'active',
        domain_type: userData.domain_type,
        first_login: userData.first_login,
        groups: userData.groups,
        temporary_password: userData.temporary_password,
        created_at: new Date().toISOString(),
        lastLogin: undefined
      };

      // Add to users list
      setUsers(prevUsers => [...prevUsers, newUser]);

      // Send welcome email based on domain type
      if (userData.domain_type === 'external' && userData.temporary_password) {
        await sendWelcomeExternalEmail(newUser, userData.temporary_password);
      } else {
        await sendWelcomeInternalEmail(newUser);
      }

      console.log('🎉 [USER CREATED]', {
        user: newUser,
        emailSent: true,
        type: userData.domain_type === 'external' ? 'external_welcome' : 'internal_welcome'
      });

      // TODO: En producción, guardar en base de datos via API
      
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  // 🆕 Group Management Handlers
  const handleCreateGroup = async (groupData: Omit<Group, 'id' | 'created_at'>): Promise<void> => {
    try {
      const newGroup: Group = {
        id: `grp_${Date.now()}`,
        name: groupData.name,
        description: groupData.description,
        users: groupData.users || [],
        created_at: new Date().toISOString(),
        created_by: currentUser.id
      };

      setGroups(prevGroups => [...prevGroups, newGroup]);
      
      console.log('🎉 [GROUP CREATED]', newGroup);
      // TODO: En producción, guardar en base de datos via API

    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const handleUpdateGroup = async (groupId: string, groupData: Partial<Group>): Promise<void> => {
    try {
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { ...group, ...groupData }
            : group
        )
      );

      console.log('✅ [GROUP UPDATED]', { groupId, updates: groupData });
      // TODO: En producción, actualizar en base de datos via API

    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  };

  const handleDeleteGroup = async (groupId: string): Promise<void> => {
    try {
      // Remove group from groups list
      setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));

      // Remove group from all users
      setUsers(prevUsers => 
        prevUsers.map(user => ({
          ...user,
          groups: user.groups?.filter(gId => gId !== groupId) || []
        }))
      );

      console.log('🗑️ [GROUP DELETED]', { groupId });
      // TODO: En producción, eliminar de base de datos via API

    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const handleAddUserToGroup = async (groupId: string, userId: string): Promise<void> => {
    try {
      // Add group to user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId
            ? { ...user, groups: [...(user.groups || []), groupId] }
            : user
        )
      );

      // Add user to group
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId
            ? { ...group, users: [...(group.users || []), userId] }
            : group
        )
      );

      console.log('👥 [USER ADDED TO GROUP]', { groupId, userId });
      // TODO: En producción, actualizar en base de datos via API

    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  };

  const handleRemoveUserFromGroup = async (groupId: string, userId: string): Promise<void> => {
    try {
      // Remove group from user
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId
            ? { ...user, groups: (user.groups || []).filter(gId => gId !== groupId) }
            : user
        )
      );

      // Remove user from group
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId
            ? { ...group, users: (group.users || []).filter(uId => uId !== userId) }
            : group
        )
      );

      console.log('👥 [USER REMOVED FROM GROUP]', { groupId, userId });
      // TODO: En producción, actualizar en base de datos via API

    } catch (error) {
      console.error('Error removing user from group:', error);
      throw error;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SecurityDashboard className="p-6" />;
      case 'users':
        return <UsersTable 
                  users={users} 
                  roles={mockRoles}
                  groups={groups}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUser={handleAddUser}
                />;
      case 'groups':
        return <GroupsManagement
                  groups={groups}
                  users={users}
                  roles={mockRoles}
                  onCreateGroup={handleCreateGroup}
                  onUpdateGroup={handleUpdateGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onAddUserToGroup={handleAddUserToGroup}
                  onRemoveUserFromGroup={handleRemoveUserFromGroup}
                />;
      case 'roles':
        return <RolesAndPermissions />;
      case 'security':
        return <SecuritySettings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onBack={onBack}
        onLogout={onLogout}
        userName={userName}
      />
      
      <div className="flex h-[calc(100vh-64px)]">
        <aside className="w-1/4 bg-white border-r overflow-y-auto">
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-left ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Activity className="w-5 h-5 mr-3" />
              <span>Dashboard de Seguridad</span>
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-left ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Users className="w-5 h-5 mr-3" />
              <span>Gestión de Usuarios</span>
            </button>
            <button 
              onClick={() => setActiveTab('groups')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-left ${activeTab === 'groups' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <UserPlus className="w-5 h-5 mr-3" />
              <span>Gestión de Grupos</span>
            </button>
            <button 
              onClick={() => setActiveTab('roles')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-left ${activeTab === 'roles' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Shield className="w-5 h-5 mr-3" />
              <span>Roles y Permisos</span>
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-left ${activeTab === 'security' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Key className="w-5 h-5 mr-3" />
              <span>Configuración de Seguridad</span>
            </button>
          </nav>
        </aside>
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {renderContent()}
        </main>
      </div>

      {/* 🆕 Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onCreateUser={handleCreateUser}
        roles={mockRoles}
        groups={groups}
      />

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={mockRoles}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}; 