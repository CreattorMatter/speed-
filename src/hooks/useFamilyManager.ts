import { useState, useCallback } from 'react';
import { PromotionFamily, Template, TemplateCopyOptions, Block } from '../types/builder';

// ⚠️ DEPRECATED: Este hook será eliminado. Use useBuilderV3Integration para gestión de familias
export const useFamilyManager = () => {
  const [families, setFamilies] = useState<PromotionFamily[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const createFamily = useCallback((familyData: Omit<PromotionFamily, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => {
    const newFamily: PromotionFamily = {
      ...familyData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      templates: []
    };
    
    setFamilies(prev => [...prev, newFamily]);
  }, []);

  const editFamily = useCallback((id: string, updates: Partial<PromotionFamily>) => {
    setFamilies(prev => prev.map(family => 
      family.id === id 
        ? { ...family, ...updates, updatedAt: new Date() }
        : family
    ));
  }, []);

  const deleteFamily = useCallback((id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta familia y todas sus plantillas?')) {
      setFamilies(prev => prev.filter(family => family.id !== id));
    }
  }, []);

  const saveTemplate = useCallback((templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: Template = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setFamilies(prev => prev.map(family => 
      family.id === templateData.familyId
        ? { 
            ...family, 
            templates: [...family.templates, newTemplate],
            updatedAt: new Date()
          }
        : family
    ));

    return newTemplate;
  }, []);

  const copyTemplate = useCallback((templateId: string, options: TemplateCopyOptions) => {
    // Encontrar la plantilla original
    let originalTemplate: Template | null = null;
    for (const family of families) {
      const template = family.templates.find(t => t.id === templateId);
      if (template) {
        originalTemplate = template;
        break;
      }
    }

    if (!originalTemplate) {
      console.error('Plantilla no encontrada');
      return;
    }

    // Crear una copia de los bloques
    let copiedBlocks = [...originalTemplate.blocks];

    // Si se debe reemplazar el header
    if (options.replaceHeader && options.newHeaderImage) {
      copiedBlocks = copiedBlocks.map(block => {
        if (block.type === 'header') {
          return {
            ...block,
            content: {
              ...block.content,
              imageUrl: options.newHeaderImage
            }
          };
        }
        return block;
      });
    }

    // Crear la nueva plantilla
    const newTemplate: Template = {
      ...originalTemplate,
      id: Date.now().toString(),
      name: options.newTemplateName,
      familyId: options.targetFamilyId,
      blocks: copiedBlocks,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Agregar la plantilla a la familia destino
    setFamilies(prev => prev.map(family => 
      family.id === options.targetFamilyId
        ? { 
            ...family, 
            templates: [...family.templates, newTemplate],
            updatedAt: new Date()
          }
        : family
    ));

    console.log(`Plantilla "${originalTemplate.name}" copiada a familia ${options.targetFamilyId} como "${options.newTemplateName}"`);
  }, [families]);

  const updateTemplate = useCallback((templateId: string, updates: Partial<Template>) => {
    setFamilies(prev => prev.map(family => ({
      ...family,
      templates: family.templates.map(template => 
        template.id === templateId
          ? { ...template, ...updates, updatedAt: new Date() }
          : template
      ),
      updatedAt: family.templates.some(t => t.id === templateId) ? new Date() : family.updatedAt
    })));
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      setFamilies(prev => prev.map(family => ({
        ...family,
        templates: family.templates.filter(template => template.id !== templateId),
        updatedAt: family.templates.some(t => t.id === templateId) ? new Date() : family.updatedAt
      })));
    }
  }, []);

  const selectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  const getFamilyById = useCallback((id: string) => {
    return families.find(family => family.id === id);
  }, [families]);

  const getTemplateById = useCallback((id: string) => {
    for (const family of families) {
      const template = family.templates.find(t => t.id === id);
      if (template) return template;
    }
    return null;
  }, [families]);

  return {
    families,
    selectedTemplate,
    createFamily,
    editFamily,
    deleteFamily,
    saveTemplate,
    copyTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    getFamilyById,
    getTemplateById
  };
}; 