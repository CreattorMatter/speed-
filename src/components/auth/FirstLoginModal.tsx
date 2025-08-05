import React, { useState } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { validatePasswordStrength } from '@/utils/passwordGenerator';
import type { User } from '@/types';

interface FirstLoginModalProps {
  isOpen: boolean;
  user: User;
  onPasswordChanged: (newPassword: string) => Promise<void>;
  onClose?: () => void; // Optional since this modal is mandatory
}

export const FirstLoginModal: React.FC<FirstLoginModalProps> = ({
  isOpen,
  user,
  onPasswordChanged,
  onClose
}) => {
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });
  
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    new?: string;
    confirm?: string;
    general?: string;
  }>({});

  // Password strength validation
  const passwordStrength = passwords.new ? validatePasswordStrength(passwords.new) : null;
  const passwordsMatch = passwords.new === passwords.confirm;
  const isFormValid = passwords.new && passwords.confirm && passwordsMatch && 
                      passwordStrength && passwordStrength.score >= 70; // Require at least "good" strength

  const handlePasswordChange = (field: 'new' | 'confirm', value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user types
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!passwords.new) {
      newErrors.new = 'La nueva contraseña es requerida';
    } else if (passwordStrength && passwordStrength.score < 70) {
      newErrors.new = 'La contraseña debe ser más segura';
    }
    
    if (!passwords.confirm) {
      newErrors.confirm = 'Debes confirmar la contraseña';
    } else if (!passwordsMatch) {
      newErrors.confirm = 'Las contraseñas no coinciden';
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
      await onPasswordChanged(passwords.new);
      toast.success('¡Contraseña actualizada exitosamente!');
      
      // Clear form
      setPasswords({ new: '', confirm: '' });
      setErrors({});
      
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors({ general: 'Error al cambiar la contraseña. Inténtalo nuevamente.' });
      toast.error('Error al cambiar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'strong': return 'text-blue-600 bg-blue-100';
      case 'good': return 'text-yellow-600 bg-yellow-100';
      case 'fair': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getStrengthText = (level: string) => {
    switch (level) {
      case 'excellent': return 'Excelente';
      case 'strong': return 'Fuerte';
      case 'good': return 'Buena';
      case 'fair': return 'Regular';
      default: return 'Débil';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
        // Note: No onClick close since this is mandatory
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center">
              <Lock className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-xl font-bold">Configuración Inicial</h2>
                <p className="text-blue-100 text-sm">Es necesario cambiar tu contraseña temporal</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Welcome Message */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <h3 className="font-medium text-blue-800">¡Bienvenido, {user.name}!</h3>
                  <p className="text-blue-600 text-sm mt-1">
                    Por seguridad, debes crear una nueva contraseña antes de continuar.
                  </p>
                </div>
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.new ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu nueva contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwords.new && passwordStrength && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Seguridad:</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStrengthColor(passwordStrength.level)}`}>
                      {getStrengthText(passwordStrength.level)} ({passwordStrength.score}/100)
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score >= 90 ? 'bg-green-500' :
                        passwordStrength.score >= 70 ? 'bg-blue-500' :
                        passwordStrength.score >= 50 ? 'bg-yellow-500' :
                        passwordStrength.score >= 30 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  
                  {/* Suggestions */}
                  {passwordStrength.suggestions.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <p className="font-medium">Sugerencias:</p>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {passwordStrength.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {errors.new && <p className="mt-1 text-sm text-red-600">{errors.new}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirm ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirma tu nueva contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {passwords.confirm && (
                <div className="mt-2 flex items-center">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-green-600">Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-600">Las contraseñas no coinciden</span>
                    </>
                  )}
                </div>
              )}
              
              {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm}</p>}
            </div>

            {/* Security Tips */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">💡 Consejos de seguridad:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Usa al menos 8 caracteres</li>
                <li>• Combina mayúsculas, minúsculas, números y símbolos</li>
                <li>• Evita información personal (nombre, fecha de nacimiento)</li>
                <li>• No reutilices contraseñas de otras cuentas</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Actualizando Contraseña...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Confirmar Nueva Contraseña
                </>
              )}
            </button>

            {/* Note */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Una vez confirmada, recibirás un email de confirmación y serás redirigido al dashboard.
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstLoginModal;