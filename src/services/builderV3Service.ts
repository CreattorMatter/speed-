// ===============================================
// BUILDER V3 - SUPABASE SERVICE (SIMPLE VERSION)
// ===============================================

import { supabase, supabaseAdmin, isSupabaseConfigured } from '../lib/supabaseClient';
import { FamilyV3, TemplateV3 } from '../features/builderV3/types';

// ===============================================
// SIMPLE FAMILIES SERVICE
// ===============================================

export const familiesV3Service = {
  async getAll(): Promise<FamilyV3[]> {
    // Si Supabase no está configurado, usar datos mock directamente
    if (!isSupabaseConfigured) {
      console.log('📦 Usando familias mock (Supabase no configurado)');
      return this.getDefaultFamilies();
    }

    try {
      // Intentar obtener de tabla V3 first usando admin client
      console.log('🔑 Usando cliente admin para leer familias (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('families')
        .select('*')
        .eq('is_active', true);

      if (error && error.code === '42P01') {
        // Si no existe la tabla, usar familias mock por defecto
        console.log('⚠️ Tabla families no existe, usando datos mock');
        return this.getDefaultFamilies();
      }

      if (error) throw error;
      
      return data?.map(item => this.mapToV3Family(item)) || this.getDefaultFamilies();
    } catch (error) {
      console.warn('Error obteniendo familias, usando mock:', error);
      return this.getDefaultFamilies();
    }
  },

  getDefaultFamilies(): FamilyV3[] {
    return [
      {
        id: 'family-hot-sale',
        name: 'Hot Sale',
        displayName: 'Hot Sale',
        description: 'Descuentos especiales de Hot Sale',
        icon: '🔥',
        headerImage: '/images/headers/hot-sale.png',
        templates: [],
        featuredTemplates: [],
        defaultStyle: {
          brandColors: {
            primary: '#ff6b35',
            secondary: '#f7931e',
            accent: '#ffaa00',
            text: '#ffffff',
            background: '#ff6b35'
          },
          typography: {
            primaryFont: 'Inter',
            secondaryFont: 'Roboto',
            headerFont: 'Poppins'
          },
          visualEffects: {
            headerStyle: {},
            priceStyle: {},
            footerStyle: {}
          }
        },
        recommendedComponents: [],
        migrationConfig: {
          allowMigrationFrom: [],
          headerReplacement: { replaceHeaderImages: false, replaceColors: false }
        },
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'family-ladrillazos',
        name: 'Ladrillazos',
        displayName: 'Ladrillazos',
        description: 'Ofertas especiales tipo ladrillazo',
        icon: '🧱',
        headerImage: '/images/headers/hot-sale.png', // Placeholder temporal
        templates: [],
        featuredTemplates: [],
        defaultStyle: {
          brandColors: {
            primary: '#ff0000',
            secondary: '#ffff00',
            accent: '#ff6600',
            text: '#ffffff',
            background: '#ff0000'
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
        recommendedComponents: [],
        migrationConfig: {
          allowMigrationFrom: [],
          headerReplacement: { replaceHeaderImages: false, replaceColors: false }
        },
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  },

  mapToV3Family(data: any): FamilyV3 {
    // Transformar el defaultStyle de Supabase a la estructura esperada
    const transformDefaultStyle = (style: any) => {
      if (!style) {
        return {
          brandColors: { primary: '#000000', secondary: '#666666', accent: '#0066cc', text: '#333333', background: '#ffffff' },
          typography: { primaryFont: 'Inter', secondaryFont: 'Roboto', headerFont: 'Poppins' },
          visualEffects: { headerStyle: {}, priceStyle: {}, footerStyle: {} }
        };
      }

      // Si ya tiene la estructura correcta, devolverla tal como está
      if (style.brandColors) {
        return style;
      }

      // Transformar estructura de Supabase a estructura esperada
      return {
        brandColors: {
          primary: style.primaryColor || style.primary || '#000000',
          secondary: style.secondaryColor || style.secondary || '#666666',
          accent: style.accentColor || style.accent || '#0066cc',
          text: style.textColor || style.text || '#333333',
          background: style.backgroundColor || style.background || '#ffffff'
        },
        typography: {
          primaryFont: style.fontFamily || style.primaryFont || 'Inter',
          secondaryFont: style.secondaryFont || 'Roboto',
          headerFont: style.headerFont || style.fontFamily || 'Poppins'
        },
        visualEffects: {
          headerStyle: style.headerStyle || {},
          priceStyle: style.priceStyle || {},
          footerStyle: style.footerStyle || {}
        }
      };
    };

    return {
      id: data.id,
      name: data.name || data.display_name,
      displayName: data.display_name || data.name,
      description: data.description || '',
      icon: '🏷️',
      headerImage: data.header_image || '',
      templates: [],
      featuredTemplates: [],
      defaultStyle: transformDefaultStyle(data.default_style),
      recommendedComponents: data.allowed_components || [],
      migrationConfig: {
        allowMigrationFrom: [],
        headerReplacement: { replaceHeaderImages: false, replaceColors: false }
      },
      isActive: data.is_active !== false,
      sortOrder: data.sort_order || 0,
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  },

  async getById(id: string): Promise<FamilyV3 | null> {
    const families = await this.getAll();
    const found = families.find(f => f.id === id);
    console.log('🔍 getById search:', { searchId: id, found: found ? `${found.name} (${found.id})` : 'null', availableIds: families.map(f => f.id) });
    return found || null;
  },

  async getByName(name: string): Promise<FamilyV3 | null> {
    const families = await this.getAll();
    const found = families.find(f => f.name === name);
    console.log('🔍 getByName search:', { searchName: name, found: found ? `${found.name} (${found.id})` : 'null', availableNames: families.map(f => f.name) });
    return found || null;
  },

  async createFamily(family: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>): Promise<FamilyV3> {
    if (!isSupabaseConfigured) {
      console.log('📝 Simulando creación de familia (Supabase no configurado)');
      const newFamily: FamilyV3 = {
        ...family,
        id: `family-${Date.now()}`,
        templates: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      return newFamily;
    }

    try {
      console.log('➕ Creando familia en Supabase:', family.displayName);
      
      console.log('🔑 Usando cliente admin para crear familia (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('families')
        .insert({
          name: family.name,
          display_name: family.displayName,
          description: family.description,
          icon: family.icon,
          header_image: family.headerImage,
          default_style: JSON.stringify(family.defaultStyle),
          allowed_components: family.recommendedComponents,
          is_active: family.isActive,
          sort_order: family.sortOrder,
          created_by: 'system'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error insertando familia:', error);
        throw error;
      }

      return this.mapToV3Family(data);
    } catch (error) {
      console.error('❌ Error creando familia:', error);
      throw error;
    }
  },

  async updateFamily(familyId: string, updates: Partial<FamilyV3>): Promise<FamilyV3> {
    if (!isSupabaseConfigured) {
      console.log('📝 Simulando actualización de familia');
      const families = this.getDefaultFamilies();
      const family = families.find(f => f.id === familyId) || families[0];
      return { ...family, ...updates };
    }

    try {
      console.log('📝 Actualizando familia en Supabase:', familyId);
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.displayName) updateData.display_name = updates.displayName;
      if (updates.description) updateData.description = updates.description;
      if (updates.icon) updateData.icon = updates.icon;
      if (updates.headerImage) updateData.header_image = updates.headerImage;
      if (updates.defaultStyle) updateData.default_style = JSON.stringify(updates.defaultStyle);
      if (updates.recommendedComponents) updateData.allowed_components = updates.recommendedComponents;
      if (typeof updates.isActive === 'boolean') updateData.is_active = updates.isActive;
      if (updates.sortOrder) updateData.sort_order = updates.sortOrder;

      console.log('🔑 Usando cliente admin para actualizar familia (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('families')
        .update(updateData)
        .eq('id', familyId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error actualizando familia:', error);
        throw error;
      }

      return this.mapToV3Family(data);
    } catch (error) {
      console.error('❌ Error actualizando familia:', error);
      throw error;
    }
  },

  async deleteFamily(familyId: string): Promise<void> {
    if (!isSupabaseConfigured) {
      console.log('🗑️ Simulando eliminación de familia');
      return;
    }

    try {
      console.log('🗑️ Eliminando familia de Supabase:', familyId);
      
      console.log('🔑 Usando cliente admin para eliminar familia (bypass RLS)');
      const { error } = await supabaseAdmin
        .from('families')
        .delete()
        .eq('id', familyId);

      if (error) {
        console.error('❌ Error eliminando familia:', error);
        throw error;
      }

      console.log('✅ Familia eliminada exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando familia:', error);
      throw error;
    }
  }
};

// ===============================================
// TEMPLATES SERVICE CON SUPABASE
// ===============================================

export const templatesV3Service = {
  async getAll(): Promise<TemplateV3[]> {
    try {
      console.log('🔑 Usando cliente admin para leer todas las plantillas (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(this.mapToV3Template);
    } catch (error) {
      console.warn('⚠️ Error obteniendo plantillas, usando datos mock:', error);
      return [];
    }
  },

  async getByFamily(familyId: string): Promise<TemplateV3[]> {
    try {
      console.log('🔑 Usando cliente admin para leer plantillas de familia (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('family_id', familyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(this.mapToV3Template);
    } catch (error) {
      console.warn('⚠️ Error obteniendo plantillas de familia, usando datos mock:', error);
      return [];
    }
  },

  async getById(id: string): Promise<TemplateV3 | null> {
    try {
      console.log('🔑 Usando cliente admin para leer plantilla (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return data ? this.mapToV3Template(data) : null;
    } catch (error) {
      console.warn('⚠️ Error obteniendo plantilla:', error);
      return null;
    }
  },

  async create(template: Omit<TemplateV3, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplateV3> {
    try {
      const templateData = {
        name: template.name,
        family_id: template.familyType, // Usar familyType como family_id
        description: template.description,
        thumbnail: template.thumbnail,
        tags: template.tags,
        category: template.category,
        canvas_config: template.canvas,
        default_components: template.defaultComponents,
        family_config: template.familyConfig,
        validation_rules: template.validationRules,
        export_settings: template.exportSettings,
        is_public: template.isPublic,
        is_active: template.isActive,
        version: template.version,
        created_by: template.createdBy
      };

      console.log('🔑 Usando cliente admin para crear plantilla (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('templates')
        .insert([templateData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Plantilla creada en Supabase con admin client:', data.name);
      return this.mapToV3Template(data);
    } catch (error) {
      console.error('❌ Error creando plantilla en Supabase:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<TemplateV3>): Promise<TemplateV3> {
    try {
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.canvas) updateData.canvas_config = updates.canvas;
      if (updates.familyConfig) updateData.family_config = updates.familyConfig;
      
      console.log('🔑 Usando cliente admin para actualizar plantilla (bypass RLS)');
      const { data, error } = await supabaseAdmin
        .from('templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Plantilla actualizada en Supabase con admin client:', data.name);
      return this.mapToV3Template(data);
    } catch (error) {
      console.error('❌ Error actualizando plantilla en Supabase:', error);
      throw error;
    }
  },

  async duplicate(templateId: string, newName?: string): Promise<TemplateV3> {
    try {
      // Obtener plantilla original
      const original = await this.getById(templateId);
      if (!original) throw new Error('Plantilla no encontrada');

      // Crear copia con nuevo nombre
      const duplicated = await this.create({
        ...original,
        name: newName || `${original.name} (Copia)`,
        version: 1
      });

      console.log('✅ Plantilla duplicada en Supabase:', duplicated.name);
      return duplicated;
    } catch (error) {
      console.error('❌ Error duplicando plantilla en Supabase:', error);
      throw error;
    }
  },

  mapToV3Template(data: any): TemplateV3 {
    return {
      id: data.id,
      name: data.name,
      familyType: data.family_id,
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      tags: data.tags || [],
      category: data.category || 'custom',
      canvas: data.canvas_config || {
        width: 1080,
        height: 1350,
        unit: 'px',
        dpi: 300,
        backgroundColor: '#ffffff'
      },
      defaultComponents: data.default_components || [],
      familyConfig: data.family_config || {
        brandColors: { primary: '#000000', secondary: '#666666', accent: '#0066cc', text: '#333333' },
        typography: { primaryFont: 'Inter', secondaryFont: 'Roboto', headerFont: 'Poppins' }
      },
      validationRules: data.validation_rules || [],
      exportSettings: data.export_settings || {
        defaultFormat: 'png',
        defaultQuality: 90,
        defaultDPI: 300,
        bleedArea: 0,
        cropMarks: false
      },
      isPublic: data.is_public || false,
      isActive: data.is_active !== false,
      version: data.version || 1,
      createdBy: data.created_by || 'user',
      createdAt: new Date(data.created_at || Date.now()),
      updatedAt: new Date(data.updated_at || Date.now())
    };
  }
};

// ===============================================
// MOCK SERVICES PARA EVITAR ERRORES
// ===============================================

export const componentsV3Service = {
  async saveTemplateComponents(): Promise<void> {
    console.log('💾 Mock: Componentes guardados');
  },

  async getTemplateComponents(): Promise<any[]> {
    return [];
  }
};

export const favoritesV3Service = {
  async addToFavorites(): Promise<void> {
    console.log('⭐ Mock: Agregado a favoritos');
  },

  async removeFromFavorites(): Promise<void> {
    console.log('⭐ Mock: Removido de favoritos');
  }
};

export const sapConnectionV3Service = {
  async saveConnection(): Promise<void> {
    console.log('🔗 Mock: Conexión SAP guardada');
  },

  async getConnection(): Promise<null> {
    return null;
  }
};

export const promotionConnectionV3Service = {
  async saveConnection(): Promise<void> {
    console.log('🔗 Mock: Conexión promociones guardada');
  },

  async getConnection(): Promise<null> {
    return null;
  }
};

// ===============================================
// EXPORT PRINCIPAL
// ===============================================

export const builderV3Service = {
  families: familiesV3Service,
  templates: templatesV3Service,
  components: componentsV3Service,
  favorites: favoritesV3Service,
  sapConnection: sapConnectionV3Service,
  promotionConnection: promotionConnectionV3Service
};

export default builderV3Service; 