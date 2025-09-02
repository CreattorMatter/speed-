import React, { useState, useRef, useEffect } from 'react';
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
  const [menuPosition, setMenuPosition] = useState<{ [key: string]: 'bottom' | 'top' }>({});
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

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

  const calculateMenuPosition = (userId: string) => {
    const button = buttonRefs.current[userId];
    if (!button) return 'bottom';

    const rect = button.getBoundingClientRect();
    const menuHeight = 120; // Altura aproximada del menú
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Si hay menos espacio abajo que la altura del menú, y hay más espacio arriba, mostrar arriba
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      return 'top';
    }
    
    return 'bottom';
  };

  const handleMenuToggle = (userId: string) => {
    if (activeMenu === userId) {
      setActiveMenu(null);
    } else {
      const position = calculateMenuPosition(userId);
      setMenuPosition(prev => ({ ...prev, [userId]: position }));
      setActiveMenu(userId);
    }
  };

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !Object.values(buttonRefs.current).some(button => 
        button?.contains(event.target as Node)
      )) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

  return (
    <div className="h-full flex flex-col">
      {/* Header with Add User Button */}
      <div className="flex items-center justify-between mb-4">
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

      {/* Table Container - Flexible height */}
      <div className="flex-1 overflow-hidden bg-white shadow rounded-lg">
        <div className="overflow-x-auto h-full">
          <div className="h-full overflow-y-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol & Tipo</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupos</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
            <th scope="col" className="relative px-4 py-2"><span className="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm">No hay usuarios registrados</p>
                {onAddUser && (
                  <button
                    onClick={onAddUser}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-600 hover:text-blue-500"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Agregar primer usuario
                  </button>
                )}
              </td>
            </tr>
          ) : (
            users.map((user) => {
            const domainInfo = getDomainTypeInfo(user);
            return (
            <tr key={user.id} className="hover:bg-gray-50">
              {/* Usuario Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-semibold text-sm">{user.name.charAt(0)}</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                    {user.first_login && (
                      <div className="text-xs text-orange-600 bg-orange-100 px-1 py-0.5 rounded mt-0.5 inline-block">
                        Primer login pendiente
                      </div>
                    )}
                  </div>
                </div>
              </td>
              
              {/* Rol & Tipo Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Shield className={`w-3 h-3 mr-1 ${user.role === 'admin' ? 'text-blue-500' : 'text-gray-400'}`} />
                    <span className="text-xs text-gray-900">{getRoleName(user.role)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm mr-1">{domainInfo.icon}</span>
                    <span className={`text-xs px-1 py-0.5 rounded bg-${domainInfo.color}-100 text-${domainInfo.color}-800`}>
                      {domainInfo.label}
                    </span>
                  </div>
                </div>
              </td>
              
              {/* Grupos Column */}
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-xs text-gray-900">
                  {getGroupNames(user.groups)}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                {formatDate(user.lastLogin)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="relative inline-block text-left">
                  <button 
                    ref={(el) => buttonRefs.current[user.id] = el}
                    onClick={() => handleMenuToggle(user.id)}
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === user.id && (
                      <motion.div
                        initial={{ 
                          opacity: 0, 
                          y: menuPosition[user.id] === 'top' ? 10 : -10 
                        }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ 
                          opacity: 0, 
                          y: menuPosition[user.id] === 'top' ? 10 : -10 
                        }}
                        className={`
                          absolute right-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50
                          ${menuPosition[user.id] === 'top' 
                            ? 'bottom-full mb-2 origin-bottom-right' 
                            : 'top-full mt-2 origin-top-right'
                          }
                        `}
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <button
                            onClick={() => { onEditUser && onEditUser(user); setActiveMenu(null); }}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            role="menuitem"
                          >
                            <Pencil className="w-4 h-4 mr-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => { onDeleteUser && onDeleteUser(user.id); setActiveMenu(null); }}
                            className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
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
          }))}
        </tbody>
      </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 