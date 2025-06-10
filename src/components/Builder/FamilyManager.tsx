import React, { useState, useCallback } from 'react';
import { PromotionFamily, Template, TemplateCopyOptions } from '../../types/builder';
import { Plus, Copy, Edit, Trash2, Image, Palette, Calendar, Eye } from 'lucide-react';

interface FamilyManagerProps {
  families: PromotionFamily[];
  onCreateFamily: (family: Omit<PromotionFamily, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => void;
  onEditFamily: (id: string, updates: Partial<PromotionFamily>) => void;
  onDeleteFamily: (id: string) => void;
  onCopyTemplate: (templateId: string, options: TemplateCopyOptions) => void;
  onSelectTemplate: (template: Template) => void;
}

const FamilyManager: React.FC<FamilyManagerProps> = ({
  families,
  onCreateFamily,
  onEditFamily,
  onDeleteFamily,
  onCopyTemplate,
  onSelectTemplate
}) => {
  const [isCreatingFamily, setIsCreatingFamily] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [copyingTemplate, setCopyingTemplate] = useState<Template | null>(null);
  const [newFamilyData, setNewFamilyData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    headerImage: ''
  });

  const handleCreateFamily = useCallback(() => {
    if (newFamilyData.name.trim()) {
      onCreateFamily({
        name: newFamilyData.name,
        description: newFamilyData.description,
        color: newFamilyData.color,
        headerImage: newFamilyData.headerImage,
        isActive: true
      });
      setNewFamilyData({ name: '', description: '', color: '#3b82f6', headerImage: '' });
      setIsCreatingFamily(false);
    }
  }, [newFamilyData, onCreateFamily]);

  const handleCopyTemplate = useCallback((template: Template, targetFamilyId: string) => {
    const options: TemplateCopyOptions = {
      replaceHeader: true,
      targetFamilyId,
      newTemplateName: `${template.name} (Copia)`,
      newHeaderImage: families.find(f => f.id === targetFamilyId)?.headerImage
    };
    onCopyTemplate(template.id, options);
    setCopyingTemplate(null);
  }, [families, onCopyTemplate]);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Gestión de Familias</h2>
          <button
            onClick={() => setIsCreatingFamily(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Familia
          </button>
        </div>
      </div>

      {/* Lista de Familias */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {families.map((family) => (
          <div
            key={family.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Header de la Familia */}
            <div 
              className="p-4 cursor-pointer"
              style={{ backgroundColor: family.color + '15' }}
              onClick={() => setSelectedFamily(selectedFamily === family.id ? null : family.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: family.color }}
                    />
                    <h3 className="text-lg font-medium text-gray-900">{family.name}</h3>
                    <span className="text-sm text-gray-500">
                      {family.templates.length} plantillas
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{family.description}</p>
                  {family.headerImage && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <Image className="w-4 h-4" />
                      Header configurado
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Lógica para editar familia
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFamily(family.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Plantillas de la Familia */}
            {selectedFamily === family.id && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Plantillas</h4>
                  {family.templates.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No hay plantillas en esta familia</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {family.templates.map((template) => (
                        <div
                          key={template.id}
                          className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">{template.name}</h5>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onSelectTemplate(template)}
                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                title="Ver plantilla"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setCopyingTemplate(template)}
                                className="p-1 text-gray-400 hover:text-green-600 rounded"
                                title="Copiar a otra familia"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{template.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>{template.posterSize}</span>
                            <span>{template.blocks.length} elementos</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal: Crear Nueva Familia */}
      {isCreatingFamily && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nueva Familia de Promociones</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Familia
                </label>
                <input
                  type="text"
                  value={newFamilyData.name}
                  onChange={(e) => setNewFamilyData({...newFamilyData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ej: Black Friday 2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newFamilyData.description}
                  onChange={(e) => setNewFamilyData({...newFamilyData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe el tipo de promociones de esta familia"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color de la Familia
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newFamilyData.color}
                    onChange={(e) => setNewFamilyData({...newFamilyData, color: e.target.value})}
                    className="w-12 h-10 border border-gray-300 rounded-md"
                  />
                  <span className="text-sm text-gray-500">Color para identificar visualmente</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Header Principal (opcional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    // Aquí manejarías la subida de imagen
                    const file = e.target.files?.[0];
                    if (file) {
                      // Simular URL de imagen
                      setNewFamilyData({...newFamilyData, headerImage: URL.createObjectURL(file)});
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Este header se aplicará automáticamente a las plantillas copiadas
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreatingFamily(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateFamily}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Crear Familia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Copiar Plantilla */}
      {copyingTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Copiar Plantilla</h3>
            <p className="text-sm text-gray-600 mb-4">
              Copiando: <strong>{copyingTemplate.name}</strong>
            </p>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Selecciona la familia de destino:
              </label>
              {families.filter(f => f.id !== copyingTemplate.familyId).map((family) => (
                <button
                  key={family.id}
                  onClick={() => handleCopyTemplate(copyingTemplate, family.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: family.color }}
                    />
                    <div>
                      <div className="font-medium">{family.name}</div>
                      <div className="text-xs text-gray-500">
                        {family.headerImage ? '✓ Con header propio' : 'Sin header'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCopyingTemplate(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManager; 