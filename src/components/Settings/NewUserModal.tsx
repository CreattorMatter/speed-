import React, { useState } from 'react';

interface NewUserModalProps {
  onClose: () => void;
  onSave: (userData: any) => void;
}

const NewUserModal: React.FC<NewUserModalProps> = ({ onClose, onSave }) => {
  const [userData, setUserData] = useState({ name: '', email: '', role: 'user', password: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(userData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium mb-4">Nuevo Usuario</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            placeholder="Nombre"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            required
          />
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            placeholder="Email"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            required
          />
          <input
            type="password"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            placeholder="Contraseña"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            required
          />
          <select
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
          >
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewUserModal; 