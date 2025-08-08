// =====================================
// FAMILY SELECTOR V3 - COMPONENT
// =====================================

import React, { useState, useCallback } from 'react';
import { FamilyV3 } from '../types';
import { EditFamilyModal } from './EditFamilyModal';
import { 
  Search,
  Star,
  ArrowRight,
  Tag,
  Zap,
  Plus,
  Trash2, 
  Edit3
} from 'lucide-react';

interface FamilySelectorV3Props {
  families: FamilyV3[];
  onFamilySelect: (family: FamilyV3) => void;
  onFamilyMigration: (fromFamilyId: string, toFamilyId: string, options: {
    migrateAllTemplates: boolean;
    replaceHeaders: boolean;
    replaceColors: boolean;
    templateIds?: string[];
  }) => void;
  userRole: 'admin' | 'limited';
  onCreateFamily?: () => void;
  onFamilyDelete?: (familyId: string) => void;
  onFamilyUpdate?: (familyId: string, updates: { displayName: string }) => Promise<void>;
}

export const FamilySelectorV3: React.FC<FamilySelectorV3Props> = ({
  families,
  onFamilySelect,
  onFamilyMigration,
  userRole,
  onCreateFamily,
  onFamilyDelete,
  onFamilyUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [migrationSource, setMigrationSource] = useState<FamilyV3 | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyV3 | null>(null);

  // Filtrar familias
  const filteredFamilies = families.filter(family => {
    const matchesSearch = family.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         family.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por categoría deshabilitado por solicitud
    return matchesSearch && family.isActive;
  });

  // Categorías disponibles
  // const categories = [...] // oculto por solicitud

  const handleFamilyClick = useCallback((family: FamilyV3) => {
    onFamilySelect(family);
  }, [onFamilySelect]);

  // const handleMigrationStart = useCallback((sourceFamily: FamilyV3) => {
  //   setMigrationSource(sourceFamily);
  //   setShowMigrationModal(true);
  // }, []);

  const handleMigrationExecute = useCallback((targetFamily: FamilyV3, options: {
    migrateAllTemplates: boolean;
    replaceHeaders: boolean;
    replaceColors: boolean;
  }) => {
    if (migrationSource) {
      onFamilyMigration(migrationSource.id, targetFamily.id, options);
      setShowMigrationModal(false);
      setMigrationSource(null);
    }
  }, [migrationSource, onFamilyMigration]);

  const handleEditFamily = useCallback((family: FamilyV3) => {
    setEditingFamily(family);
    setShowEditModal(true);
  }, []);

  const handleEditFamilyClose = useCallback(() => {
    setShowEditModal(false);
    setEditingFamily(null);
  }, []);

  const handleEditFamilyUpdate = useCallback(async (familyId: string, updates: { displayName: string }) => {
    if (onFamilyUpdate) {
      await onFamilyUpdate(familyId, updates);
    }
  }, [onFamilyUpdate]);

  const renderFamilyCard = (family: FamilyV3) => (
    <div
      key={family.id}
      className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group overflow-hidden"
    >
      {/* Header de la familia */}
      <div 
        className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden cursor-pointer"
        onClick={() => handleFamilyClick(family)}
      >
        {family.headerImage ? (
          <img 
            src={family.headerImage} 
            alt={family.displayName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white text-4xl font-bold bg-gray-500"
          >
            {family.displayName.substring(0, 2).toUpperCase()}
          </div>
        )}
        
        {/* Overlay con información */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-end">
          <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">{family.templates.length} plantillas</span>
            </div>
          </div>
        </div>

        {/* Badge de destacado */}
        {family.featuredTemplates.length > 0 && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Destacada</span>
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {family.displayName}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">
            {family.description}
          </p>
        </div>

        {/* Estadísticas - SOLO PLANTILLAS */}
        <div className="flex justify-center mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {family.templates.length}
            </div>
            <div className="text-xs text-gray-500">
              Plantilla{family.templates.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Sección de colores eliminada - ya no se muestran paletas */}

        {/* Acciones */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleFamilyClick(family)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <span>Seleccionar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          {userRole === 'admin' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditFamily(family);
                }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg transition-colors"
                title="Editar nombre de familia"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`¿Estás seguro de que deseas eliminar la familia "${family.displayName}"? Esta acción no se puede deshacer.`)) {
                    onFamilyDelete?.(family.id);
                  }
                }}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg transition-colors"
                title="Eliminar familia"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Búsqueda */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar familias promocionales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por categoría oculto por solicitud */}
          <div className="flex items-center space-x-4">
            {userRole === 'admin' && onCreateFamily && (
              <button
                onClick={onCreateFamily}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                title="Crear nueva familia"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Familia</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Familias Promocionales
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredFamilies.length} encontradas)
            </span>
          </h2>
        </div>

        {filteredFamilies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFamilies.map(renderFamilyCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron familias
              </h3>
              <p className="text-gray-500">
                Intenta con diferentes términos de búsqueda o ajusta los filtros.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de migración */}
      {showMigrationModal && migrationSource && (
        <MigrationModal
          sourceFamily={migrationSource}
          targetFamilies={families.filter(f => f.id !== migrationSource.id)}
          onMigrate={handleMigrationExecute}
          onCancel={() => {
            setShowMigrationModal(false);
            setMigrationSource(null);
          }}
        />
      )}

      {/* Modal de edición de familia */}
      <EditFamilyModal
        isOpen={showEditModal}
        onClose={handleEditFamilyClose}
        onUpdateFamily={handleEditFamilyUpdate}
        family={editingFamily}
        existingFamilies={families}
      />
    </div>
  );
};

// =====================
// MODAL DE MIGRACIÓN
// =====================

interface MigrationModalProps {
  sourceFamily: FamilyV3;
  targetFamilies: FamilyV3[];
  onMigrate: (targetFamily: FamilyV3, options: {
    migrateAllTemplates: boolean;
    replaceHeaders: boolean;
    replaceColors: boolean;
  }) => void;
  onCancel: () => void;
}

const MigrationModal: React.FC<MigrationModalProps> = ({
  sourceFamily,
  targetFamilies,
  onMigrate,
  onCancel
}) => {
  const [selectedTarget, setSelectedTarget] = useState<FamilyV3 | null>(null);
  const [migrateAllTemplates, setMigrateAllTemplates] = useState(true);
  const [replaceHeaders, setReplaceHeaders] = useState(true);
  const [replaceColors, setReplaceColors] = useState(false);

  const handleMigrate = () => {
    if (selectedTarget) {
      onMigrate(selectedTarget, {
        migrateAllTemplates,
        replaceHeaders,
        replaceColors
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Migrar Plantillas
          </h2>
          <p className="text-gray-600 mt-1">
            Migrar plantillas desde "{sourceFamily.displayName}" a otra familia
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Selección de familia destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Familia destino
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {targetFamilies.map(family => (
                <button
                  key={family.id}
                  onClick={() => setSelectedTarget(family)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTarget?.id === family.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {family.displayName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {family.templates.length} plantillas
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Opciones de migración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Opciones de migración
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={migrateAllTemplates}
                  onChange={(e) => setMigrateAllTemplates(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Migrar todas las plantillas
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={replaceHeaders}
                  onChange={(e) => setReplaceHeaders(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Reemplazar imágenes de header automáticamente
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={replaceColors}
                  onChange={(e) => setReplaceColors(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Actualizar colores de marca
                </span>
              </label>
            </div>
          </div>

          {/* Vista previa de cambios */}
          {selectedTarget && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Vista previa de cambios</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Se migrarán {sourceFamily.templates.length} plantillas</div>
                {replaceHeaders && (
                  <div>• Se actualizarán las imágenes de header</div>
                )}
                {replaceColors && (
                  <div>• Se aplicarán los colores de "{selectedTarget.displayName}"</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleMigrate}
            disabled={!selectedTarget}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            Migrar Plantillas
          </button>
        </div>
      </div>
    </div>
  );
}; 