import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, RefreshCw, Mail, Copy, Check, Users, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import type { User, Role, Group } from '@/types';
import { generatePasswordOptions, getPasswordInfo } from '@/utils/passwordGenerator';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (userData: NewUserData) => Promise<void>;
  roles: Role[];
  groups?: Group[];
}

export interface NewUserData {
  name: string;
  email: string;
  role: string;
  groups: string[];
  domain_type: 'external' | 'cencosud' | 'easy';
  temporary_password?: string;
  first_login: boolean;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
  isOpen,
  onClose,
  onCreateUser,
  roles,
  groups = []
}) => {
  // Form state
  const [formData, setFormData] = useState<NewUserData>({
    name: '',
    email: '',
    role: roles[0]?.id || '',
    groups: [],
    domain_type: 'external',
    temporary_password: '',
    first_login: true
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordOptions, setPasswordOptions] = useState<string[]>([]);
  const [selectedPasswordIndex, setSelectedPasswordIndex] = useState(0);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof NewUserData, string>>>({});

  // Generate password options when modal opens
  useEffect(() => {
    if (isOpen) {
      const options = generatePasswordOptions(3);
      setPasswordOptions(options);
      setFormData(prev => ({
        ...prev,
        temporary_password: options[0]
      }));
    }
  }, [isOpen]);

  // Auto-detect domain type from email
  useEffect(() => {
    const email = formData.email.toLowerCase();
    let domainType: 'external' | 'cencosud' | 'easy' = 'external';
    
    if (email.includes('@cencosud')) {
      domainType = 'cencosud';
    } else if (email.includes('@easy')) {
      domainType = 'easy';
    }
    
    setFormData(prev => ({
      ...prev,
      domain_type: domainType,
      // Internal users don't need temporary password
      temporary_password: domainType !== 'external' ? '' : prev.temporary_password
    }));
  }, [formData.email]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewUserData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.role) {
      newErrors.role = 'El rol es requerido';
    }
    
    // External users need temporary password
    if (formData.domain_type === 'external' && !formData.temporary_password) {
      newErrors.temporary_password = 'Contraseña temporal requerida para usuarios externos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);
    
    try {
      await onCreateUser(formData);
      toast.success('Usuario creado exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: roles[0]?.id || '',
      groups: [],
      domain_type: 'external',
      temporary_password: '',
      first_login: true
    });
    setErrors({});
    setPasswordOptions([]);
    setSelectedPasswordIndex(0);
    setCopiedPassword(false);
    onClose();
  };

  const handlePasswordSelect = (index: number) => {
    setSelectedPasswordIndex(index);
    setFormData(prev => ({
      ...prev,
      temporary_password: passwordOptions[index]
    }));
  };

  const handleGenerateNewPasswords = () => {
    const newOptions = generatePasswordOptions(3);
    setPasswordOptions(newOptions);
    setSelectedPasswordIndex(0);
    setFormData(prev => ({
      ...prev,
      temporary_password: newOptions[0]
    }));
  };

  const handleCopyPassword = async () => {
    if (formData.temporary_password) {
      try {
        await navigator.clipboard.writeText(formData.temporary_password);
        setCopiedPassword(true);
        toast.success('Contraseña copiada al portapapeles');
        setTimeout(() => setCopiedPassword(false), 2000);
      } catch (error) {
        toast.error('Error al copiar la contraseña');
      }
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setFormData(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId]
    }));
  };

  const getDomainTypeInfo = () => {
    switch (formData.domain_type) {
      case 'cencosud':
        return {
          icon: '🏢',
          label: 'Usuario Cencosud',
          description: 'Autenticación vía EntraID - No necesita contraseña temporal',
          color: 'blue'
        };
      case 'easy':
        return {
          icon: '🏪',
          label: 'Usuario Easy',
          description: 'Autenticación vía EntraID - No necesita contraseña temporal',
          color: 'green'
        };
      default:
        return {
          icon: '👤',
          label: 'Usuario Externo',
          description: 'Login tradicional - Requiere contraseña temporal',
          color: 'gray'
        };
    }
  };

  const domainInfo = getDomainTypeInfo();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Agregar Nuevo Usuario</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Domain Type Indicator */}
            <div className={`p-4 rounded-lg border-l-4 bg-${domainInfo.color}-50 border-${domainInfo.color}-400`}>
              <div className="flex items-center">
                <span className="text-2xl mr-3">{domainInfo.icon}</span>
                <div>
                  <h3 className={`font-medium text-${domainInfo.color}-800`}>{domainInfo.label}</h3>
                  <p className={`text-sm text-${domainInfo.color}-600`}>{domainInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Juan Pérez"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="usuario@ejemplo.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            {/* Groups Selection */}
            {groups.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grupos (Opcional)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {groups.map(group => (
                    <label key={group.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.groups.includes(group.id)}
                        onChange={() => handleGroupToggle(group.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {group.name}
                        {group.description && (
                          <span className="text-gray-500"> - {group.description}</span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Password Section - Only for external users */}
            {formData.domain_type === 'external' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña Temporal *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewPasswords}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Generar Nuevas
                  </button>
                </div>

                {/* Password Options */}
                <div className="space-y-2">
                  {passwordOptions.map((password, index) => {
                    const passwordInfo = getPasswordInfo(password);
                    return (
                      <div
                        key={index}
                        onClick={() => handlePasswordSelect(index)}
                        className={`p-3 border rounded-md cursor-pointer transition-colors ${
                          selectedPasswordIndex === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={selectedPasswordIndex === index}
                              onChange={() => handlePasswordSelect(index)}
                              className="mr-3"
                            />
                            <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {passwordInfo.formatted}
                            </code>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded ${
                              passwordInfo.strength.level === 'excellent' ? 'bg-green-100 text-green-800' :
                              passwordInfo.strength.level === 'strong' ? 'bg-blue-100 text-blue-800' :
                              passwordInfo.strength.level === 'good' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {passwordInfo.strength.level === 'excellent' ? 'Excelente' :
                               passwordInfo.strength.level === 'strong' ? 'Fuerte' :
                               passwordInfo.strength.level === 'good' ? 'Buena' :
                               passwordInfo.strength.level === 'fair' ? 'Regular' : 'Débil'}
                            </span>
                            <span className="text-xs text-gray-500">{password.length} chars</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Password Actions */}
                <div className="flex items-center space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    {copiedPassword ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                    {copiedPassword ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                {showPassword && formData.temporary_password && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-1">Contraseña sin formato:</p>
                    <code className="font-mono text-sm bg-white px-2 py-1 rounded border">
                      {formData.temporary_password}
                    </code>
                  </div>
                )}

                {errors.temporary_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.temporary_password}</p>
                )}
              </div>
            )}

            {/* Email Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Mail className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-medium text-gray-900">Preview del Email</h3>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Para:</strong> {formData.email || 'usuario@ejemplo.com'}</p>
                <p><strong>Asunto:</strong> {
                  formData.domain_type === 'external' 
                    ? 'Bienvenido a SPID Plus - Accede con tu contraseña temporal'
                    : 'Has sido dado de alta en SPID Plus'
                }</p>
                <p><strong>Contenido:</strong> {
                  formData.domain_type === 'external'
                    ? 'Email de bienvenida con contraseña temporal y instrucciones de primer login'
                    : 'Email informativo sobre el alta en el sistema (autenticación vía EntraID)'
                }</p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Creando Usuario...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Crear Usuario
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};