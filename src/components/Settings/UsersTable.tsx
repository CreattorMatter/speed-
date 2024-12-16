import React from 'react';
import { Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  created_at?: string;
}

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onStatusChange: (userId: number, newStatus: 'active' | 'inactive') => void;
}

export function UsersTable({ users, onEdit, onDelete, onStatusChange }: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Usuario</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Rol</th>
            <th className="px-6 py-3">Estado</th>
            <th className="px-6 py-3">Creado</th>
            <th className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-800">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                    ${user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'}`}
                >
                  {user.status === 'active' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <XCircle className="w-3 h-3" />
                  )}
                  {user.status === 'active' ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {user.created_at && formatDistanceToNow(new Date(user.created_at), { 
                  addSuffix: true,
                  locale: es 
                })}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1 hover:bg-violet-100 rounded-lg transition-colors text-violet-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 