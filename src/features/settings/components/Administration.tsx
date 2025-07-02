import React, { useState } from 'react';
import { Users, Shield, Key, ArrowLeft, Activity } from 'lucide-react';
import { UsersTable } from './UsersTable';
import { EditUserModal } from './EditUserModal';
import { RolesAndPermissions } from './RolesAndPermissions';
import { SecuritySettings } from './SecuritySettings';
import { SecurityDashboard } from './SecurityDashboard';
import { User, Role } from '@/types/index';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/shared/Header';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <SecurityDashboard className="p-6" />;
      case 'users':
        return <UsersTable 
                  users={users} 
                  roles={mockRoles} 
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
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

      {/* Modal de edición de usuario */}
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