import { FamilyV3 } from '../features/builderV3/types';

/**
 * Simula la obtención de todas las familias de plantillas.
 * En el futuro, esto hará una llamada a Supabase o una API real.
 * @returns Una promesa que resuelve a un array de familias.
 */
export const getFamilies = async (): Promise<FamilyV3[]> => {
  console.log('Fetching families...');
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Datos mock de familias por defecto si no hay datos de Supabase
  const mockFamilies = [
    {
      id: 'fam_ladrillazos',
      name: 'ladrillazos',
      displayName: 'Ladrillazos',
      description: 'Ofertas especiales en construcción y materiales',
      icon: '🧱',
      headerImage: '/images/headers/ladrillazos.png',
      templates: [],
      featuredTemplates: [],
      defaultStyle: {
        brandColors: {
          primary: '#d97706',
          secondary: '#fed7aa',
          accent: '#dc2626',
          text: '#ffffff',
          background: '#d97706'
        },
        typography: {
          primaryFont: 'Arial Black',
          secondaryFont: 'Arial',
          headerFont: 'Impact'
        },
        visualEffects: {
          headerStyle: {},
          priceStyle: {},
          footerStyle: {}
        }
      },
      recommendedComponents: ['text', 'image', 'price', 'discount'],
      migrationConfig: {
        allowMigrationFrom: [],
        headerReplacement: {
          replaceHeaderImages: false,
          replaceColors: false
        }
      },
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'fam_superprecio',
      name: 'superprecio',
      displayName: 'Superprecio',
      description: 'Precios especiales con descuentos destacados',
      icon: '💰',
      headerImage: '/images/headers/superprecio.png',
      templates: [],
      featuredTemplates: [],
      defaultStyle: {
        brandColors: {
          primary: '#0066cc',
          secondary: '#ffffff',
          accent: '#00aaff',
          text: '#ffffff',
          background: '#0066cc'
        },
        typography: {
          primaryFont: 'Roboto',
          secondaryFont: 'Open Sans',
          headerFont: 'Montserrat'
        },
        visualEffects: {
          headerStyle: {},
          priceStyle: {},
          footerStyle: {}
        }
      },
      recommendedComponents: ['text', 'image', 'price'],
      migrationConfig: {
        allowMigrationFrom: [],
        headerReplacement: {
          replaceHeaderImages: false,
          replaceColors: false
        }
      },
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 'fam_temporada',
      name: 'temporada',
      displayName: 'Temporada',
      description: 'Ofertas y promociones estacionales',
      icon: '🌟',
      headerImage: '/images/headers/temporada.png',
      templates: [],
      featuredTemplates: [],
      defaultStyle: {
        brandColors: {
          primary: '#ea580c',
          secondary: '#fed7aa',
          accent: '#fbbf24',
          text: '#ffffff',
          background: '#ea580c'
        },
        typography: {
          primaryFont: 'Montserrat',
          secondaryFont: 'Open Sans',
          headerFont: 'Bebas Neue'
        },
        visualEffects: {
          headerStyle: {},
          priceStyle: {},
          footerStyle: {}
        }
      },
      recommendedComponents: ['text', 'image', 'price'],
      migrationConfig: {
        allowMigrationFrom: [],
        headerReplacement: {
          replaceHeaderImages: false,
          replaceColors: false
        }
      },
      isActive: true,
      sortOrder: 3,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  ] as FamilyV3[];
  
  return mockFamilies;
};

export const getFamilyById = async (id: string): Promise<FamilyV3 | undefined> => {
  console.log(`Fetching family with id ${id}... (returning undefined)`);
  await new Promise(resolve => setTimeout(resolve, 100));
  return undefined;
};

export const createFamily = async (familyData: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyV3> => {
  const newFamily: FamilyV3 = {
    id: `fam_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...familyData,
    templates: [], // Asegurarse de que las propiedades requeridas estén
  } as FamilyV3;
  console.log('Creating new family (simulation):', newFamily);
  await new Promise(resolve => setTimeout(resolve, 300));
  return newFamily;
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