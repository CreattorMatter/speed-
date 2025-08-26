import { FamilyV3 } from '../features/builderV3/types';

/**
 * Simula la obtención de todas las familias de plantillas.
 * En el futuro, esto hará una llamada a Supabase o una API real.
 * @returns Una promesa que resuelve a un array de familias.
 */
export const getFamilies = async (): Promise<FamilyV3[]> => {
  console.log('⚠️ DEPRECATED: Este servicio será eliminado. Use familiesV3Service de builderV3Service.ts');
  
  // Redirigir al servicio real
  const { familiesV3Service } = await import('./builderV3Service');
  return familiesV3Service.getAll();
};

export const getFamilyById = async (id: string): Promise<FamilyV3 | undefined> => {
  console.log(`Fetching family with id ${id}... (returning undefined)`);
  await new Promise(resolve => setTimeout(resolve, 100));
  return undefined;
};

export const createFamily = async (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyV3> => {
  console.log('⚠️ DEPRECATED: Este servicio será eliminado. Use familiesV3Service de builderV3Service.ts');
  
  // Redirigir al servicio real
  const { familiesV3Service } = await import('./builderV3Service');
  return familiesV3Service.createFamily(familyData);
};

export const updateFamily = async (id: string, updates: Partial<FamilyV3>): Promise<FamilyV3> => {
  console.log(`Updating family ${id} with:`, updates);
  await new Promise(resolve => setTimeout(resolve, 300));
  // Simplemente devuelve un objeto que cumple con el tipo
  return {
    id,
    name: 'Familia Actualizada' as any,
    ...updates,
  } as FamilyV3;
};

export const deleteFamily = async (id: string): Promise<void> => {
  console.log(`Deleting family ${id}`);
  await new Promise(resolve => setTimeout(resolve, 300));
};

// Aquí se podrían añadir más funciones como:
// - getFamilyById
// - createFamily
// - updateFamily
// - deleteFamily 