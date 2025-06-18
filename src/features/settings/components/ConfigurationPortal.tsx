import React, { useState } from 'react';
import { Users, Shield, Key, X, Folder, Plus, Edit, Trash2 } from 'lucide-react';
import { UsersTable } from './UsersTable';
import { EditUserModal } from './EditUserModal';
import { User, Role } from '@/types/index';
import { FamilyV3 } from '../../builderV3/types';
import { getFamilies, createFamily, updateFamily, deleteFamily } from '../../../services/familyService';

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

interface ConfigurationPortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

export const ConfigurationPortal: React.FC<ConfigurationPortalProps> = ({ isOpen, onClose, currentUser }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Estados para gestión de familias
  const [families, setFamilies] = useState<FamilyV3[]>([]);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<FamilyV3 | null>(null);

  // Cargar familias al abrir la pestaña
  React.useEffect(() => {
    if (activeTab === 'families') {
      loadFamilies();
    }
  }, [activeTab]);

  const loadFamilies = async () => {
    try {
      setIsLoadingFamilies(true);
      const fetchedFamilies = await getFamilies();
      setFamilies(fetchedFamilies);
    } catch (error) {
      console.error('Error al cargar familias:', error);
    } finally {
      setIsLoadingFamilies(false);
    }
  };

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

  // Manejadores para familias
  const handleCreateFamily = () => {
    setSelectedFamily(null);
    setIsFamilyModalOpen(true);
  };

  const handleEditFamily = (family: FamilyV3) => {
    setSelectedFamily(family);
    setIsFamilyModalOpen(true);
  };

  const handleDeleteFamily = async (familyId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta familia y todas sus plantillas?')) {
      try {
        await deleteFamily(familyId);
        await loadFamilies(); // Recargar la lista
      } catch (error) {
        console.error('Error al eliminar familia:', error);
        alert('Error al eliminar la familia. Inténtalo de nuevo.');
      }
    }
  };

  const handleSaveFamily = async (familyData: any) => {
    try {
      if (selectedFamily) {
        // Editar familia existente
        await updateFamily(selectedFamily.id, familyData);
      } else {
        // Crear nueva familia - convertir el nombre a lowercase y agregar campos requeridos
        const familyToCreate = {
          ...familyData,
          name: familyData.name.toLowerCase().replace(/\s+/g, '-'), // Normalizar nombre
          templates: [],
          featuredTemplates: [],
          defaultStyle: {
            brandColors: {
              primary: '#000000',
              secondary: '#666666',
              accent: '#0066cc',
              text: '#333333',
              background: '#ffffff'
            },
            typography: {
              primaryFont: 'Inter',
              secondaryFont: 'Roboto',
              headerFont: 'Poppins'
            },
            visualEffects: {
              headerStyle: {},
              priceStyle: {},
              footerStyle: {}
            }
          },
          recommendedComponents: ['text', 'image', 'price'],
          migrationConfig: {
            allowMigrationFrom: [],
            headerReplacement: {
              replaceHeaderImages: false,
              replaceColors: false
            }
          },
          headerImage: '',
          sortOrder: 0
        };
        await createFamily(familyToCreate);
      }
      await loadFamilies(); // Recargar la lista
      setIsFamilyModalOpen(false);
    } catch (error) {
      console.error('Error al guardar familia:', error);
      alert('Error al guardar la familia. Inténtalo de nuevo.');
    }
  };

  const renderFamiliesContent = () => {
    if (isLoadingFamilies) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando familias...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Gestión de Familias</h2>
          <button
            onClick={handleCreateFamily}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Familia</span>
          </button>
        </div>

        {families.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay familias</h3>
            <p className="text-gray-500 mb-4">Crea tu primera familia de plantillas para comenzar.</p>
            <button
              onClick={handleCreateFamily}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Crear primera familia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {families.map(family => (
              <div key={family.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{family.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{family.displayName}</h3>
                      <p className="text-sm text-gray-500">{family.name}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditFamily(family)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar familia"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFamily(family.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar familia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{family.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{family.templates?.length || 0} plantillas</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${family.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {family.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersTable 
                  users={users} 
                  roles={mockRoles} 
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                />;
      case 'families':
        return renderFamiliesContent();
      case 'roles':
        return <div className="p-6">Gestión de Roles (próximamente)</div>;
      case 'security':
        return <div className="p-6">Configuración de Seguridad (próximamente)</div>;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-gray-50 text-gray-900 rounded-lg shadow-xl max-w-7xl w-full h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold tracking-tight">Portal de Administración</h1>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </header>
        
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-1/4 border-r overflow-y-auto p-4">
            <nav className="space-y-1">
              <button 
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-left ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Users className="w-5 h-5 mr-3" />
                <span>Gestión de Usuarios</span>
              </button>
              <button 
                onClick={() => setActiveTab('families')}
                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-left ${activeTab === 'families' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Folder className="w-5 h-5 mr-3" />
                <span>Gestión de Familias</span>
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
                <span>Seguridad</span>
              </button>
            </nav>
          </aside>
          
          <main className="flex-1 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
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

      {/* Modal de edición/creación de familia */}
      {isFamilyModalOpen && (
        <FamilyModal
          family={selectedFamily}
          isOpen={isFamilyModalOpen}
          onClose={() => setIsFamilyModalOpen(false)}
          onSave={handleSaveFamily}
        />
      )}
    </div>
  );
};

// Modal para crear/editar familias
interface FamilyModalProps {
  family: FamilyV3 | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (familyData: any) => void;
}

const FamilyModal: React.FC<FamilyModalProps> = ({ family, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: family?.name || '',
    displayName: family?.displayName || '',
    description: family?.description || '',
    icon: family?.icon || '🏷️',
    isActive: family?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {family ? 'Editar Familia' : 'Nueva Familia'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre técnico
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ej: ladrillazos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre para mostrar
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ej: Ladrillazos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Descripción de la familia de plantillas..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Icono (emoji)
            </label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="🏷️"
              maxLength={2}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Familia activa
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
            >
              {family ? 'Guardar Cambios' : 'Crear Familia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 