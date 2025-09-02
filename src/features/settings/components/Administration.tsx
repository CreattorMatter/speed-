import React, { useState } from 'react';
import { Users, Shield, Key, ArrowLeft, Activity, UserPlus } from 'lucide-react';
import { UsersTable } from './UsersTable';
import { EditUserModal } from './EditUserModal';
import { AddUserModal, type NewUserData } from './AddUserModal';
import { RolePermissionsManagement } from './RolePermissionsManagement';
// import { SecuritySettings } from './SecuritySettings';
import { SecurityDashboard } from './SecurityDashboard';
import { GroupsManagement } from './GroupsManagement';
import { User, Role, Group } from '@/types/index';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/shared/Header';
import { toast } from 'react-hot-toast';
import { generateTemporaryPassword } from '@/utils/passwordGenerator';
import { sendWelcomeExternalEmail, sendWelcomeInternalEmail } from '@/services/supabaseEmailSMTP';
import { useAdministrationData } from '@/hooks/useAdministrationData';



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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Usar el hook centralizado para todos los datos
  const {
    users,
    roles,
    groups,
    isLoading,
    error,
    createUser: createUserAction,
    updateUser: updateUserAction,
    deleteUser: deleteUserAction,
    createGroup: createGroupAction,
    updateGroup: updateGroupAction,
    deleteGroup: deleteGroupAction,
    addUserToGroup: addUserToGroupAction,
    removeUserFromGroup: removeUserFromGroupAction
  } = useAdministrationData();

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar a este usuario?')) return;
    try {
      await deleteUserAction(userId);
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleSaveUser = async (userId: string, updates: { name: string; email: string; role: string }) => {
    try {
      await updateUserAction(userId, updates);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  // 🆕 User Management Handlers
  const handleAddUser = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCreateUser = async (userData: NewUserData): Promise<void> => {
    try {
      // Crear usuario usando la acción centralizada
      await createUserAction({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        domain_type: userData.domain_type,
        groups: userData.groups,
        first_login: userData.first_login,
        temporary_password: userData.temporary_password,
      });

      // Send welcome email based on domain type
      const mockUser = { name: userData.name, email: userData.email } as User;
      if (userData.domain_type === 'external' && userData.temporary_password) {
        await sendWelcomeExternalEmail(mockUser, userData.temporary_password);
      } else {
        await sendWelcomeInternalEmail(mockUser);
      }

      console.log('🎉 [USER CREATED]', {
        user: mockUser,
        emailSent: true,
        type: userData.domain_type === 'external' ? 'external_welcome' : 'internal_welcome'
      });

      setIsAddUserModalOpen(false);
      
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  // 🆕 Group Management Handlers
  const handleCreateGroup = async (groupData: Omit<Group, 'id' | 'created_at'>): Promise<void> => {
    try {
      await createGroupAction({ ...groupData, created_by: currentUser.id } as any);
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  };

  const handleUpdateGroup = async (groupId: string, groupData: Partial<Group>): Promise<void> => {
    try {
      await updateGroupAction(groupId, groupData);
    } catch (error) {
      console.error('Error updating group:', error);
      throw error;
    }
  };

  const handleDeleteGroup = async (groupId: string): Promise<void> => {
    try {
      await deleteGroupAction(groupId);
    } catch (error) {
      console.error('Error deleting group:', error);
      throw error;
    }
  };

  const handleAddUserToGroup = async (groupId: string, userId: string): Promise<void> => {
    try {
      await addUserToGroupAction(groupId, userId);
    } catch (error) {
      console.error('Error adding user to group:', error);
      throw error;
    }
  };

  const handleRemoveUserFromGroup = async (groupId: string, userId: string): Promise<void> => {
    try {
      await removeUserFromGroupAction(groupId, userId);
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
                  roles={roles}
                  groups={groups}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  onAddUser={handleAddUser}
                />;
      case 'groups':
        return <GroupsManagement
                  groups={groups}
                  users={users}
                  roles={roles}
                  onCreateGroup={handleCreateGroup}
                  onUpdateGroup={handleUpdateGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onAddUserToGroup={handleAddUserToGroup}
                  onRemoveUserFromGroup={handleRemoveUserFromGroup}
                />;
      case 'roles':
        return <RolePermissionsManagement onBack={() => setCurrentView('dashboard')} />;
      // 'security' tab removed
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
        <aside className="w-1/4 bg-white border-r">
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
            {/* Security Settings removed for now */}
          </nav>
        </aside>
        
        <main className="flex-1 flex flex-col bg-gray-50 min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* 🆕 Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onCreateUser={handleCreateUser}
        roles={roles}
        groups={groups}
      />

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
}; 