import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2, Shield, Plus, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Role, Group } from '@/types';

interface UsersTableProps {
  users: User[];
  roles: Role[];
  groups?: Group[];
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onChangeUserRole?: (userId: string, newRole: string) => void;
  onAddUser?: () => void; // 🆕 Handler for add user button
}

export const UsersTable: React.FC<UsersTableProps> = ({ 
  users, 
  roles, 
  groups, 
  onEditUser, 
  onDeleteUser, 
  onChangeUserRole, 
  onAddUser 
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const getRoleName = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.name || roleId;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  const getDomainTypeInfo = (user: User) => {
    switch (user.domain_type) {
      case 'cencosud':
        return { icon: '🏢', label: 'Cencosud', color: 'blue' };
      case 'easy':
        return { icon: '🏪', label: 'Easy', color: 'green' };
      default:
        return { icon: '👤', label: 'Externo', color: 'gray' };
    }
  };

  const getGroupNames = (userGroups: string[] = []) => {
    if (!userGroups.length || !groups?.length) return 'Sin grupos';
    
    return userGroups
      .map(groupId => groups.find(g => g.id === groupId)?.name)
      .filter(Boolean)
      .join(', ') || 'Sin grupos';
  };

  return (
    <div className="space-y-4">
      {/* Header with Add User Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Users className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Usuarios del Sistema
          </h3>
          <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
            {users.length} usuario{users.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {onAddUser && (
          <button
            onClick={onAddUser}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Usuario
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol & Tipo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupos</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => {
            const domainInfo = getDomainTypeInfo(user);
            return (
            <tr key={user.id}>
              {/* Usuario Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-semibold">{user.name.charAt(0)}</span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.first_login && (
                      <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1 inline-block">
                        Primer login pendiente
                      </div>
                    )}
                  </div>
                </div>
              </td>
              
              {/* Rol & Tipo Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Shield className={`w-4 h-4 mr-2 ${user.role === 'admin' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-900">{getRoleName(user.role)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg mr-1">{domainInfo.icon}</span>
                    <span className={`text-xs px-2 py-1 rounded bg-${domainInfo.color}-100 text-${domainInfo.color}-800`}>
                      {domainInfo.label}
                    </span>
                  </div>
                </div>
              </td>
              
              {/* Grupos Column */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {getGroupNames(user.groups)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(user.lastLogin)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative inline-block text-left">
                  <button 
                    onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === user.id && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <button
                            onClick={() => { onEditUser && onEditUser(user); setActiveMenu(null); }}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <Pencil className="w-4 h-4 mr-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => { onDeleteUser && onDeleteUser(user.id); setActiveMenu(null); }}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            role="menuitem"
                          >
                            <Trash2 className="w-4 h-4 mr-3" />
                            Eliminar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </td>
            </tr>
          )
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}; 