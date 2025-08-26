import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Building2, Users, Send, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Sucursal {
  id: string;
  name: string;
  description?: string;
  type: 'group' | 'branch';
  memberCount?: number;
}

interface SucursalSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedSucursales: Sucursal[]) => void;
  title?: string;
  groups: Sucursal[]; // Listado real de grupos/sucursales (sin mocks)
}

export const SucursalSelectionModal: React.FC<SucursalSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Enviar a Sucursales',
  groups
}) => {
  const [selectedSucursales, setSelectedSucursales] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSucursales = (groups || []).filter(sucursal =>
    sucursal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sucursal.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSucursal = (sucursalId: string) => {
    setSelectedSucursales(prev => 
      prev.includes(sucursalId)
        ? prev.filter(id => id !== sucursalId)
        : [...prev, sucursalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSucursales.length === filteredSucursales.length) {
      setSelectedSucursales([]);
    } else {
      setSelectedSucursales(filteredSucursales.map(s => s.id));
    }
  };

  const handleConfirm = () => {
    const selectedObjects = (groups || []).filter(s => selectedSucursales.includes(s.id));
    onConfirm(selectedObjects);
    onClose();
    setSelectedSucursales([]);
    setSearchTerm('');
  };

  const handleClose = () => {
    onClose();
    setSelectedSucursales([]);
    setSearchTerm('');
  };

  // Resetear selecciones cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setSelectedSucursales([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Selecciona las sucursales que recibirán el cartel
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar sucursales..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSelectAll}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {selectedSucursales.length === filteredSucursales.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                </button>
              </div>
            </div>

            {/* Sucursales list */}
            <div className="max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSucursales.map((sucursal) => {
                  const isSelected = selectedSucursales.includes(sucursal.id);
                  return (
                    <motion.div
                      key={sucursal.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleToggleSucursal(sucursal.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            sucursal.type === 'group' 
                              ? 'bg-purple-100 text-purple-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {sucursal.type === 'group' ? (
                              <Users className="w-4 h-4" />
                            ) : (
                              <Building2 className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {sucursal.name}
                            </h4>
                            {sucursal.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {sucursal.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                sucursal.type === 'group'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {sucursal.type === 'group' ? 'Grupo' : 'Sucursal'}
                              </span>
                              {sucursal.memberCount && (
                                <span className="text-xs text-gray-500">
                                  {sucursal.memberCount} miembros
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {filteredSucursales.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron sucursales
                </h3>
                <p className="text-gray-500">
                  Intenta con un término de búsqueda diferente
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                {selectedSucursales.length} sucursal{selectedSucursales.length !== 1 ? 'es' : ''} seleccionada{selectedSucursales.length !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedSucursales.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar a {selectedSucursales.length} sucursal{selectedSucursales.length !== 1 ? 'es' : ''}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );

  // Render modal via portal to escape any stacking contexts/overflow from parent containers
  const target = typeof document !== 'undefined' ? document.body : null;
  return target ? ReactDOM.createPortal(modalContent, target) : modalContent;
};
