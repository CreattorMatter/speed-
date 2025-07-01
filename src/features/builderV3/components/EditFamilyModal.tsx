// =====================================
// SPEED BUILDER V3 - EDIT FAMILY MODAL
// =====================================

import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, AlertTriangle } from 'lucide-react';
import { FamilyV3 } from '../types';

interface EditFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateFamily: (familyId: string, updates: { displayName: string }) => Promise<void>;
  family: FamilyV3 | null;
  existingFamilies: FamilyV3[];
}

export const EditFamilyModal: React.FC<EditFamilyModalProps> = ({
  isOpen,
  onClose,
  onUpdateFamily,
  family,
  existingFamilies
}) => {
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Inicializar valores cuando se abre el modal
  useEffect(() => {
    if (isOpen && family) {
      setDisplayName(family.displayName);
      setError('');
    }
  }, [isOpen, family]);

  const validateForm = (): boolean => {
    if (!displayName.trim()) {
      setError('El nombre de la familia es requerido');
      return false;
    }

    if (displayName.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return false;
    }

    if (displayName.trim().length > 50) {
      setError('El nombre no puede exceder 50 caracteres');
      return false;
    }

    // Verificar que no exista otra familia con el mismo displayName
    const existingFamily = existingFamilies.find(
      f => f.id !== family?.id && f.displayName.toLowerCase() === displayName.trim().toLowerCase()
    );
    
    if (existingFamily) {
      setError('Ya existe una familia con este nombre');
      return false;
    }

    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!family || !validateForm()) return;

    setIsLoading(true);
    try {
      await onUpdateFamily(family.id, {
        displayName: displayName.trim()
      });
      
      onClose();
    } catch (error) {
      console.error('Error al actualizar familia:', error);
      setError('Error al guardar los cambios. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setDisplayName('');
      setError('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    } else if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  };

  if (!isOpen || !family) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Editar Familia</h2>
              <p className="text-sm text-gray-500">Modifica el nombre de la familia</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Información actual */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{family.icon}</span>
              <div>
                <p className="text-sm text-gray-600">Familia actual:</p>
                <p className="font-medium text-gray-900">{family.displayName}</p>
                <p className="text-xs text-gray-500">ID: {family.name}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la familia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (error) setError(''); // Limpiar error al escribir
                }}
                onKeyPress={handleKeyPress}
                placeholder="Ej: Hot Sale 2024"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  error ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                maxLength={50}
                disabled={isLoading}
                autoFocus
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">
                  {displayName.length}/50 caracteres
                </span>
                {displayName.trim() && (
                  <span className="text-xs text-green-600">
                    ✓ Nombre válido
                  </span>
                )}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Info message */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Solo se puede editar el nombre mostrado de la familia. 
                El ID interno ({family.name}) permanecerá sin cambios.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !displayName.trim() || !!error}
            className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              isLoading || !displayName.trim() || !!error
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 