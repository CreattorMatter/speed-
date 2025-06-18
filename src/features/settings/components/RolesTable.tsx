import React from 'react';
import { Edit2, Trash2, Shield } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  usersCount: number;
}

interface RolesTableProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
}

export function RolesTable({ roles, onEdit, onDelete }: RolesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-gray-50">
          <tr>
            <th className="px-6 py-3">Rol</th>
            <th className="px-6 py-3">Descripción</th>
            <th className="px-6 py-3">Permisos</th>
            <th className="px-6 py-3">Usuarios</th>
            <th className="px-6 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role) => (
            <tr key={role.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-500" />
                  {role.name}
                </div>
              </td>
              <td className="px-6 py-4">{role.description}</td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission.id}
                      className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {permission.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {role.usersCount} usuarios
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(role)}
                    className="p-1 hover:bg-violet-100 rounded-lg transition-colors text-violet-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(role.id)}
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