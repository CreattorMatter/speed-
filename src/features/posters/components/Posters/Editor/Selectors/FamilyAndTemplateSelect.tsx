import React from 'react';
import { FamilyV3, TemplateV3 } from '../../../../features/builderV3/types'; // Ajusta la ruta según sea necesario

interface FamilyAndTemplateSelectProps {
  families: FamilyV3[];
  selectedFamily: FamilyV3 | null;
  onFamilyChange: (family: FamilyV3 | null) => void;
  
  templates: TemplateV3[];
  selectedTemplate: TemplateV3 | null;
  onTemplateChange: (template: TemplateV3 | null) => void;

  disabled?: boolean;
}

export const FamilyAndTemplateSelect: React.FC<FamilyAndTemplateSelectProps> = ({
  families,
  selectedFamily,
  onFamilyChange,
  templates,
  selectedTemplate,
  onTemplateChange,
  disabled = false
}) => {
  const handleFamilySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const familyId = e.target.value;
    const family = families.find(f => f.id === familyId) || null;
    onFamilyChange(family);
  };

  const handleTemplateSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId) || null;
    onTemplateChange(template);
  };

  return (
    <div className="space-y-4">
      {/* Selector de Familia */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Familia
        </label>
        <select
          value={selectedFamily?.id || ''}
          onChange={handleFamilySelection}
          disabled={disabled || families.length === 0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>-- Selecciona una familia --</option>
          {families.map(family => (
            <option key={family.id} value={family.id}>
              {family.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Selector de Plantilla */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plantilla
        </label>
        <select
          value={selectedTemplate?.id || ''}
          onChange={handleTemplateSelection}
          disabled={!selectedFamily || templates.length === 0}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>-- Selecciona una plantilla --</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {!selectedFamily && (
            <p className="text-xs text-gray-500 mt-1">Selecciona una familia para ver sus plantillas.</p>
        )}
      </div>
    </div>
  );
}; 