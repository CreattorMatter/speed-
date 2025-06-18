import { TemplateV3 } from '../features/builderV3/types';

/**
 * Simula la obtención de las plantillas de una familia.
 * @param familyId - El ID de la familia.
 * @returns Una promesa que resuelve a un array de plantillas.
 */
export const getTemplatesByFamily = async (familyId: string): Promise<TemplateV3[]> => {
  console.log(`Fetching templates for family ${familyId}... (returning empty array)`);
  await new Promise(resolve => setTimeout(resolve, 200));
  return [];
};

/**
 * Simula la creación de una nueva plantilla.
 * @param templateData - Los datos de la plantilla a crear.
 * @returns Una promesa que resuelve a la nueva plantilla creada.
 */
export const createTemplate = async (templateData: Partial<TemplateV3>): Promise<TemplateV3> => {
  const newTemplate: TemplateV3 = {
    id: `tpl_${Date.now()}`,
    name: 'Nueva Plantilla',
    ...templateData,
  } as TemplateV3;
  
  console.log('Creating new template (simulation):', newTemplate);
  await new Promise(resolve => setTimeout(resolve, 300));
  return newTemplate;
};

/**
 * Simula la actualización de una plantilla.
 * @param templateId - El ID de la plantilla a actualizar.
 * @param updates - Los campos a actualizar.
 */
export const updateTemplate = async (templateId: string, updates: Partial<TemplateV3>): Promise<TemplateV3> => {
  console.log(`Updating template ${templateId} with:`, updates);
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: templateId,
    name: 'Plantilla Actualizada',
    ...updates,
  } as TemplateV3;
};

/**
 * Simula la eliminación de una plantilla.
 * @param templateId - El ID de la plantilla a eliminar.
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  console.log(`Deleting template ${templateId}`);
  await new Promise(resolve => setTimeout(resolve, 300));
};

/**
 * Simula la duplicación de una plantilla.
 * @param templateId - El ID de la plantilla a duplicar.
 */
export const duplicateTemplate = async (templateId: string, newName?: string): Promise<TemplateV3> => {
    console.log(`Duplicating template ${templateId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
        id: `tpl_${Date.now()}`,
        name: newName || 'Plantilla Duplicada',
    } as TemplateV3;
};

/**
 * Simula la obtención de una plantilla por su ID.
 */
export const getTemplateById = async (templateId: string): Promise<TemplateV3 | undefined> => {
    console.log(`Fetching template ${templateId}`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return undefined;
} 