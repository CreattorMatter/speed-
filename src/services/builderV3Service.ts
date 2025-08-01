// ===============================================
// BUILDER V3 - SUPABASE SERVICE (SIMPLE VERSION)
// ===============================================

import { supabase, supabaseAdmin, isSupabaseConfigured } from '../lib/supabaseClient';
import { FamilyV3, TemplateV3, ComponentsLibraryV3, ComponentDefinitionV3, ComponentCategoryV3, FamilyTypeV3 } from '../features/builderV3/types';
import { componentsLibrary } from '../features/builderV3/data/componentsLibrary';
import { UnitConverter } from '../features/builderV3/utils/unitConverter';

// ===============================================
// COMPONENTS V3 SERVICE
// ===============================================

export const componentsV3Service = {
  /**
   * Obtiene la librería completa de componentes desde el código.
   * ✅ SIMPLE Y EFICIENTE: Sin llamadas HTTP, sin dependencias externas
   */
  async getLibrary(): Promise<ComponentsLibraryV3> {
    console.log('📦 Cargando componentes desde código (import estático)');
    
    try {
      // Usar import estático para evitar problemas de dynamic import
      if (!componentsLibrary) {
        throw new Error('componentsLibrary no encontrado en el módulo');
      }
      
      // Obtener estadísticas
      const totalComponents = Object.values(componentsLibrary)
        .reduce((total, category) => total + (category?.length || 0), 0);
      const categoriesCount = Object.keys(componentsLibrary).length;
      
      console.log(`📊 Librería cargada: ${totalComponents} componentes en ${categoriesCount} categorías`);
      return componentsLibrary;
    } catch (error) {
      console.error('❌ Error loading components library:', error);
      // Fallback: devolver librería vacía pero válida
      return {
        basicos: [],
        texto: [],
        imagenes: [],
        formas: [],
        layout: []
      } as ComponentsLibraryV3;
    }

  },

  /**
   * Obtener componente por tipo (función helper adicional)
   */
  async getComponentByType(type: string) {
    const library = await this.getLibrary();
    for (const category of Object.values(library)) {
      const component = category?.find(comp => comp.type === type);
      if (component) return component;
    }
    return undefined;
  },

  /**
   * Obtener estadísticas de la librería
   */
  async getLibraryStats() {
    const library = await this.getLibrary();
    const totalComponents = Object.values(library)
      .reduce((total, category) => total + (category?.length || 0), 0);
    
    const categoriesCount = Object.keys(library).length;
    
    return {
      totalComponents,
      categoriesCount,
      componentsByCategory: Object.entries(library)
        .map(([category, components]) => ({
          category,
          count: components?.length || 0
        }))
    };
  }
};

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
      
      // 🚀 NUEVO: Cargar plantillas para cada familia
      const families = data?.map(item => this.mapToV3Family(item)) || this.getDefaultFamilies();
      
      console.log(`📋 Cargando plantillas para ${families.length} familias...`);
      const familiesWithTemplates: FamilyV3[] = [];
      
      for (const family of families) {
        try {
          const templates = await templatesV3Service.getByFamily(family.id);
          console.log(`📝 Familia "${family.displayName}": ${templates.length} plantillas encontradas`);
          
          const familyWithTemplates: FamilyV3 = {
            ...family,
            templates: templates
          };
          
          familiesWithTemplates.push(familyWithTemplates);
        } catch (error) {
          console.error(`❌ Error obteniendo plantillas para familia ${family.displayName}:`, error);
          // Agregar familia sin plantillas en caso de error
          familiesWithTemplates.push(family);
        }
      }
      
      console.log(`✅ ${familiesWithTemplates.length} familias procesadas con sus plantillas`);
      return familiesWithTemplates;
      
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
          typography: { primaryFont: 'Inter', secondaryFont: 'Roboto', headerFont: 'Poppins' },
          visualEffects: { headerStyle: {}, priceStyle: {}, footerStyle: {} }
        };
      }

      // Si ya tiene la estructura correcta, devolverla tal como está
      if (style.typography && style.visualEffects) {
        return style;
      }

      // Transformar estructura de Supabase a estructura esperada
      return {
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
          sort_order: family.sortOrder
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
      if (updates.thumbnail) updateData.thumbnail = updates.thumbnail; // 🖼️ THUMBNAIL URL
      if (updates.canvas) updateData.canvas_config = updates.canvas;
      if (updates.defaultComponents) updateData.default_components = updates.defaultComponents; // ¡COMPONENTES!
      if (updates.familyConfig) updateData.family_config = updates.familyConfig;
      if (updates.validationRules) updateData.validation_rules = updates.validationRules;
      if (updates.exportSettings) updateData.export_settings = updates.exportSettings;
      if (typeof updates.isPublic === 'boolean') updateData.is_public = updates.isPublic;
      if (typeof updates.isActive === 'boolean') updateData.is_active = updates.isActive;
      if (updates.version) updateData.version = updates.version;
      
      // Siempre actualizar timestamp
      updateData.updated_at = new Date().toISOString();
      
      console.log('🔑 Usando cliente admin para actualizar plantilla (bypass RLS)');
      console.log('📦 Datos a actualizar:', {
        id,
        componentsCount: updates.defaultComponents?.length || 0,
        fieldsToUpdate: Object.keys(updateData)
      });
      
      const { data, error } = await supabaseAdmin
        .from('templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Plantilla actualizada en Supabase con admin client:', data.name);
      console.log('📦 Componentes guardados:', data.default_components?.length || 0);
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

  async delete(templateId: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando plantilla de Supabase:', templateId);
      
      // Primero verificar que la plantilla existe
      const template = await this.getById(templateId);
      if (!template) {
        throw new Error('Plantilla no encontrada');
      }

      console.log('🔑 Usando cliente admin para eliminar plantilla (bypass RLS)');
      const { error } = await supabaseAdmin
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('❌ Error eliminando plantilla:', error);
        throw error;
      }

      console.log('✅ Plantilla eliminada exitosamente:', template.name);
    } catch (error) {
      console.error('❌ Error eliminando plantilla en Supabase:', error);
      throw error;
    }
  },

  async cloneTemplates(templateIds: string[], targetFamilyId: string, options?: {
    replaceHeaders?: boolean;
    headerImageUrl?: string;
  }): Promise<TemplateV3[]> {
    try {
      console.log(`🔄 Clonando ${templateIds.length} plantillas a familia ${targetFamilyId}`);
      
      const clonedTemplates: TemplateV3[] = [];
      
      for (const templateId of templateIds) {
        try {
          // Obtener plantilla original
          const original = await this.getById(templateId);
          if (!original) {
            console.warn(`⚠️ Plantilla ${templateId} no encontrada, saltando...`);
            continue;
          }

          // Preparar datos para la copia
          let clonedComponents = original.defaultComponents ? [...original.defaultComponents] : [];
          
          // Si se debe reemplazar headers y se proporciona una URL
          if (options?.replaceHeaders && options.headerImageUrl) {
            clonedComponents = clonedComponents.map(component => {
              if (component.type === 'image-header' && component.content) {
                return {
                  ...component,
                  content: {
                    ...component.content,
                    imageUrl: options.headerImageUrl,
                    imageAlt: 'Header personalizado'
                  }
                };
              }
              return component;
            });
          }

          // Crear copia con nueva familia
          const cloned = await this.create({
            ...original,
            name: `${original.name} (Copia)`,
            familyType: targetFamilyId as FamilyTypeV3,
            defaultComponents: clonedComponents,
            version: 1
          });

          clonedTemplates.push(cloned);
          console.log(`✅ Plantilla clonada: ${original.name} → ${cloned.name}`);
        } catch (error) {
          console.error(`❌ Error clonando plantilla ${templateId}:`, error);
          // Continuar con el siguiente template si hay error
        }
      }

      console.log(`✅ ${clonedTemplates.length} plantillas clonadas exitosamente`);
      return clonedTemplates;
    } catch (error) {
      console.error('❌ Error en proceso de clonación:', error);
      throw error;
    }
  },

  mapToV3Template(data: any): TemplateV3 {
    let canvasConfig = data.canvas_config || {
      width: 1080,
      height: 1350,
      unit: 'px',
      dpi: 300,
      backgroundColor: '#ffffff'
    };

    // --- INICIO DE LA LÓGICA DE MIGRACIÓN AL VUELO ---
    const LEGACY_DIMENSION_THRESHOLD = 500; // Si el ancho es menor a esto, asumimos que son mm
    if (canvasConfig.width < LEGACY_DIMENSION_THRESHOLD) {
      console.warn(
        `🎨 Plantilla "${data.name}" (ID: ${data.id}) detectada con dimensiones legadas. ` +
        `Realizando migración al vuelo de mm a px.`
      );
      canvasConfig = {
        ...canvasConfig,
        width: canvasConfig.width * UnitConverter.MM_TO_PX,
        height: canvasConfig.height * UnitConverter.MM_TO_PX,
      };
      console.log(
        `   Dimensiones corregidas: ${Math.round(canvasConfig.width)}px x ${Math.round(canvasConfig.height)}px`
      );
    }
    // --- FIN DE LA LÓGICA DE MIGRACIÓN AL VUELO ---

    return {
      id: data.id,
      name: data.name,
      familyType: data.family_id,
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      tags: data.tags || [],
      category: data.category || 'custom',
      canvas: canvasConfig, // Usar la configuración potencialmente corregida
      defaultComponents: data.default_components || [],
      familyConfig: data.family_config || {
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
// IMAGE UPLOAD SERVICE
// ===============================================

export const imageUploadService = {
  async uploadImage(file: File, bucket: string = 'assets', folder: string = 'headers'): Promise<string> {
    if (!isSupabaseConfigured) {
      console.log('📷 Mock: Imagen subida (Supabase no configurado)');
      return URL.createObjectURL(file);
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('📷 Subiendo imagen a Supabase Storage:', fileName);

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Error subiendo imagen:', error);
        throw error;
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log('✅ Imagen subida exitosamente:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('❌ Error en upload de imagen:', error);
      throw error;
    }
  },

  async deleteImage(url: string, bucket: string = 'assets'): Promise<void> {
    if (!isSupabaseConfigured || !url.includes('supabase')) {
      console.log('📷 Mock: Imagen eliminada');
      return;
    }

    try {
      // Extraer path del archivo de la URL
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderPath = urlParts.slice(-2, -1)[0];
      const filePath = `${folderPath}/${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('❌ Error eliminando imagen:', error);
        throw error;
      }

      console.log('✅ Imagen eliminada exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
      // No re-throw para evitar fallar operaciones principales
    }
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
  promotionConnection: promotionConnectionV3Service,
  imageUpload: imageUploadService
};

export default builderV3Service; 