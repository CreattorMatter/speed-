import { FamilyV3, TemplateV3 } from '../features/builderV3/types';
import { familiesV3Service, templatesV3Service } from './builderV3Service';
import { Product } from '../data/products';

// Tipos específicos para el sistema de posters
export interface PosterTemplateData {
  id: string;
  name: string;
  familyId: string;
  familyName: string;
  description: string;
  thumbnail: string;
  template: TemplateV3;
}

export interface PosterFamilyData {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  headerImage: string;
  templates: PosterTemplateData[];
  defaultStyle: FamilyV3['defaultStyle'];
}

/**
 * Datos de ejemplo para rellenar las plantillas en la vista previa
 */
export const getExampleProduct = (): Product => ({
  id: 'example-product',
  name: 'Producto de Ejemplo',
  price: 99999,
  sku: 'EJ001',
  category: 'Ejemplo',
  description: 'Producto de ejemplo para vista previa',
  imageUrl: '/images/placeholder-product.jpg'
});

/**
 * Servicio principal para manejar plantillas de posters
 */
export const posterTemplateService = {
  /**
   * Obtiene todas las familias disponibles con sus plantillas
   */
  async getAllFamiliesWithTemplates(): Promise<PosterFamilyData[]> {
    try {
      console.log('📋 Obteniendo familias con plantillas...');
      
      // Obtener todas las familias
      const families = await familiesV3Service.getAll();
      console.log(`✅ ${families.length} familias encontradas`);
      
      // Para cada familia, obtener sus plantillas
      const familiesWithTemplates: PosterFamilyData[] = [];
      
      for (const family of families) {
        try {
          const templates = await templatesV3Service.getByFamily(family.id);
          console.log(`📝 Familia "${family.displayName}": ${templates.length} plantillas encontradas`);
          
          const posterTemplates: PosterTemplateData[] = templates.map(template => ({
            id: template.id,
            name: template.name,
            familyId: family.id,
            familyName: family.displayName,
            description: template.description,
            thumbnail: template.thumbnail,
            template: template
          }));
          
          const familyData: PosterFamilyData = {
            id: family.id,
            name: family.name,
            displayName: family.displayName,
            description: family.description,
            icon: family.icon,
            headerImage: family.headerImage,
            templates: posterTemplates,
            defaultStyle: family.defaultStyle
          };
          
          familiesWithTemplates.push(familyData);
        } catch (error) {
          console.error(`❌ Error obteniendo plantillas para familia ${family.displayName}:`, error);
          // Agregar familia sin plantillas
          familiesWithTemplates.push({
            id: family.id,
            name: family.name,
            displayName: family.displayName,
            description: family.description,
            icon: family.icon,
            headerImage: family.headerImage,
            templates: [],
            defaultStyle: family.defaultStyle
          });
        }
      }
      
      console.log(`✅ ${familiesWithTemplates.length} familias procesadas`);
      return familiesWithTemplates;
      
    } catch (error) {
      console.error('❌ Error obteniendo familias con plantillas:', error);
      return [];
    }
  },

  /**
   * Obtiene una familia específica con sus plantillas
   */
  async getFamilyWithTemplates(familyId: string): Promise<PosterFamilyData | null> {
    try {
      const family = await familiesV3Service.getById(familyId);
      if (!family) {
        console.warn(`⚠️ Familia con ID ${familyId} no encontrada`);
        return null;
      }
      
      const templates = await templatesV3Service.getByFamily(familyId);
      
      const posterTemplates: PosterTemplateData[] = templates.map(template => ({
        id: template.id,
        name: template.name,
        familyId: family.id,
        familyName: family.displayName,
        description: template.description,
        thumbnail: template.thumbnail,
        template: template
      }));
      
      return {
        id: family.id,
        name: family.name,
        displayName: family.displayName,
        description: family.description,
        icon: family.icon,
        headerImage: family.headerImage,
        templates: posterTemplates,
        defaultStyle: family.defaultStyle
      };
      
    } catch (error) {
      console.error(`❌ Error obteniendo familia ${familyId}:`, error);
      return null;
    }
  },

  /**
   * Obtiene una plantilla específica por ID
   */
  async getTemplateById(templateId: string): Promise<PosterTemplateData | null> {
    try {
      const template = await templatesV3Service.getById(templateId);
      if (!template) {
        console.warn(`⚠️ Plantilla con ID ${templateId} no encontrada`);
        return null;
      }
      
      const family = await familiesV3Service.getById(template.familyType);
      
      return {
        id: template.id,
        name: template.name,
        familyId: template.familyType,
        familyName: family?.displayName || template.familyType,
        description: template.description,
        thumbnail: template.thumbnail,
        template: template
      };
      
    } catch (error) {
      console.error(`❌ Error obteniendo plantilla ${templateId}:`, error);
      return null;
    }
  },

  /**
   * Filtra plantillas por familia
   */
  async getTemplatesByFamily(familyId: string): Promise<PosterTemplateData[]> {
    try {
      const familyData = await this.getFamilyWithTemplates(familyId);
      return familyData?.templates || [];
    } catch (error) {
      console.error(`❌ Error obteniendo plantillas de familia ${familyId}:`, error);
      return [];
    }
  },

  /**
   * Busca plantillas por nombre o descripción
   */
  async searchTemplates(query: string): Promise<PosterTemplateData[]> {
    try {
      const families = await this.getAllFamiliesWithTemplates();
      const allTemplates = families.flatMap(family => family.templates);
      
      const lowercaseQuery = query.toLowerCase();
      return allTemplates.filter(template => 
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.familyName.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('❌ Error buscando plantillas:', error);
      return [];
    }
  }
}; 