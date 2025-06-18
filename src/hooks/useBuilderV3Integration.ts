// =====================================
// BUILDER V3 - SUPABASE INTEGRATION HOOK
// =====================================

import { useState, useEffect, useCallback } from 'react';
import { useBuilderV3 } from '../features/builderV3/hooks/useBuilderV3';
import { familiesV3Service, templatesV3Service } from '../services/builderV3Service';
import { FamilyV3, TemplateV3, ComponentTypeV3 } from '../features/builderV3/types';
import { toast } from 'react-hot-toast';

/**
 * Hook que extiende useBuilderV3 con integración real de Supabase
 * Mantiene compatibilidad con la infraestructura existente
 */
export const useBuilderV3Integration = () => {
  const builderCore = useBuilderV3();
  const [realFamilies, setRealFamilies] = useState<FamilyV3[]>([]);
  const [realTemplates, setRealTemplates] = useState<TemplateV3[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // =====================
  // INICIALIZACIÓN Y CONEXIÓN
  // =====================

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        console.log('🔌 Conectando con Supabase...');
        const families = await familiesV3Service.getAll();
        console.log('📦 Familias cargadas:', families.length);
        setRealFamilies(families);
        setIsConnected(true);
        toast.success('✅ Conectado a Supabase');
      } catch (error) {
        console.error('❌ Error conectando con Supabase:', error);
        setConnectionError(error instanceof Error ? error.message : 'Error de conexión');
        setIsConnected(false);
        setRealFamilies(builderCore.families);
        toast.error('⚠️ Usando datos offline');
      }
    };
    initializeConnection();
  }, [builderCore.families]);

  // =====================
  // OPERACIONES EXTENDIDAS CON SUPABASE
  // =====================

  const extendedOperations = {
    ...builderCore.operations,

    // ===== FAMILIAS CON SUPABASE =====
    loadFamily: useCallback(async (familyId: string) => {
      console.log('🔍 Cargando familia:', familyId);
      try {
        const family = await familiesV3Service.getById(familyId);
        if (family) {
          builderCore.operations.setFamilyDirect(family);
          
          // También cargar plantillas de la familia
          console.log('📋 Cargando plantillas de la familia...');
          const templates = await templatesV3Service.getByFamily(familyId);
          console.log('✅ Plantillas cargadas:', templates.length);
          setRealTemplates(templates);
          
          console.log('✅ Familia cargada:', family.displayName);
          return family;
        } else {
          throw new Error(`Familia ${familyId} no encontrada`);
        }
      } catch (error) {
        console.error('❌ Error cargando familia:', error);
        toast.error('Error al cargar familia');
        throw error;
      }
    }, [builderCore.operations]),

    createFamily: useCallback(async (family: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt' | 'templates'>) => {
      console.log('➕ Creando nueva familia:', family.displayName);
      try {
        const newFamily = await familiesV3Service.createFamily(family);
        setRealFamilies(prev => [...prev, newFamily]);
        toast.success('✅ Familia creada exitosamente');
        return newFamily;
      } catch (error) {
        console.error('❌ Error creando familia:', error);
        toast.error('Error al crear familia');
        throw error;
      }
    }, []),

    updateFamily: useCallback(async (familyId: string, updates: Partial<FamilyV3>) => {
      console.log('📝 Actualizando familia:', familyId, updates);
      try {
        const updatedFamily = await familiesV3Service.updateFamily(familyId, updates);
        setRealFamilies(prev => prev.map(f => f.id === familyId ? updatedFamily : f));
        toast.success('✅ Familia actualizada exitosamente');
        return updatedFamily;
      } catch (error) {
        console.error('❌ Error actualizando familia:', error);
        toast.error('Error al actualizar familia');
        throw error;
      }
    }, []),

    deleteFamily: useCallback(async (familyId: string) => {
      console.log('🗑️ Eliminando familia:', familyId);
      try {
        await familiesV3Service.deleteFamily(familyId);
        setRealFamilies(prev => prev.filter(f => f.id !== familyId));
        toast.success('✅ Familia eliminada exitosamente');
      } catch (error) {
        console.error('❌ Error eliminando familia:', error);
        toast.error('Error al eliminar familia');
        throw error;
      }
    }, []),

    // ===== PLANTILLAS CON SUPABASE =====
    loadTemplate: useCallback(async (templateId: string) => {
      console.log('🔍 Cargando plantilla:', templateId);
      try {
        const template = await templatesV3Service.getById(templateId);
        if (template) {
          builderCore.operations.loadTemplate(template.id);
          console.log('✅ Plantilla cargada:', template.name);
          return template as any;
        } else {
          throw new Error(`Plantilla ${templateId} no encontrada`);
        }
      } catch (error) {
        console.error('❌ Error cargando plantilla:', error);
        toast.error('Error al cargar plantilla');
        throw error;
      }
    }, [builderCore.operations]),

    saveTemplate: useCallback(async () => {
      if (!builderCore.state.currentTemplate) {
        console.warn('⚠️ No hay plantilla para guardar');
        return;
      }
      
      console.log('💾 Guardando plantilla:', builderCore.state.currentTemplate.name);
      try {
        // TODO: Implementar guardado real en Supabase
        await builderCore.operations.saveTemplate();
        toast.success('✅ Plantilla guardada');
      } catch (error) {
        console.error('❌ Error guardando plantilla:', error);
        toast.error('Error al guardar plantilla');
        throw error;
      }
    }, [builderCore.operations, builderCore.state]),

    createTemplate: useCallback(async (template: Omit<TemplateV3, 'id' | 'createdAt' | 'updatedAt'>) => {
      console.log('➕ Creando nueva plantilla:', template.name);
      try {
        const currentUser = getCurrentUser();
        
        // Verificar que tenemos una familia válida
        const familyId = template.familyType || builderCore.state.currentFamily?.id;
        if (!familyId) {
          throw new Error('No se puede crear plantilla sin familia seleccionada');
        }
        
        // Crear plantilla con valores predeterminados completos
        const templateData: Omit<TemplateV3, 'id' | 'createdAt' | 'updatedAt'> = {
          name: template.name || 'Nueva Plantilla Sin Título',
          familyType: familyId,
          description: template.description || 'Plantilla creada con BuilderV3',
          thumbnail: template.thumbnail || '',
          tags: template.tags || ['nueva', 'personalizada'],
          category: template.category || 'custom',
          canvas: template.canvas || {
            width: 1080,
            height: 1350,
            unit: 'px',
            dpi: 300,
            backgroundColor: '#ffffff'
          },
          defaultComponents: template.defaultComponents || [],
          familyConfig: template.familyConfig || builderCore.state.currentFamily?.defaultStyle || {
            brandColors: { primary: '#000000', secondary: '#666666', accent: '#0066cc', text: '#333333' },
            typography: { primaryFont: 'Inter', secondaryFont: 'Roboto', headerFont: 'Poppins' }
          },
          validationRules: template.validationRules || [],
          exportSettings: template.exportSettings || {
            defaultFormat: 'png',
            defaultQuality: 90,
            defaultDPI: 300,
            bleedArea: 0,
            cropMarks: false
          },
          isPublic: template.isPublic || false,
          isActive: template.isActive !== false,
          version: template.version || 1,
          createdBy: template.createdBy || currentUser.id
        };

        // Crear plantilla en Supabase
        const newTemplate = await templatesV3Service.create(templateData);
        setRealTemplates(prev => [...prev, newTemplate]);
        
        console.log('✅ Plantilla creada con ID:', newTemplate.id);
        toast.success('✅ Plantilla creada exitosamente');
        return newTemplate;
      } catch (error) {
        console.error('❌ Error creando plantilla:', error);
        toast.error('Error al crear plantilla');
        throw error;
      }
    }, [builderCore.state.currentFamily]),

    duplicateTemplate: useCallback(async (templateId: string, newName?: string) => {
      console.log('📋 Duplicando plantilla:', templateId, newName);
      try {
        // Duplicar plantilla en Supabase
        const duplicated = await templatesV3Service.duplicate(templateId, newName);
        setRealTemplates(prev => [...prev, duplicated]);
        
        console.log('✅ Plantilla duplicada con ID:', duplicated.id);
        toast.success('✅ Plantilla duplicada exitosamente');
        return duplicated;
      } catch (error) {
        console.error('❌ Error duplicando plantilla:', error);
        toast.error('Error al duplicar plantilla');
        throw error;
      }
    }, []),

    // ===== FAVORITOS CON SUPABASE ===== 
    // TODO: Implementar cuando estén definidas las operaciones en BuilderOperationsV3
    
    // ===== CONEXIONES EXTERNAS =====
    // TODO: Implementar cuando estén definidas las operaciones en BuilderOperationsV3
  };

  // =====================
  // UTILIDADES
  // =====================

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return { id: 'anonymous', email: 'anonymous@user.com', name: 'Usuario Anónimo' };
    }
    return JSON.parse(storedUser);
  };

  const refreshData = useCallback(async () => {
    if (isConnected) {
      try {
        console.log('🔄 Refrescando datos...');
        const families = await familiesV3Service.getAll();
        setRealFamilies(families);
        
        if (builderCore.state.currentFamily) {
          const templates = await templatesV3Service.getByFamily(builderCore.state.currentFamily.id);
          setRealTemplates(templates);
        }
        console.log('✅ Datos refrescados');
      } catch (error) {
        console.error('❌ Error refreshing data:', error);
      }
    }
  }, [isConnected, builderCore.state.currentFamily]);

  const getConnectionStatus = () => ({
    isConnected,
    error: connectionError,
    mode: isConnected ? 'online' : 'offline'
  });

  // =====================
  // RETORNO DEL HOOK
  // =====================

  return {
    // Estado combinado (hook core + datos reales)
    state: builderCore.state,
    
    // Operaciones extendidas con Supabase
    operations: extendedOperations as any,
    
    // Datos reales (si está conectado) o mock (si está offline)
    families: isConnected ? realFamilies : builderCore.families,
    templates: isConnected ? realTemplates : builderCore.templates,
    componentsLibrary: builderCore.componentsLibrary,
    
    // Estado de conexión
    connectionStatus: getConnectionStatus(),
    
    // Utilidades
    isReady: builderCore.isReady,
    refreshData,
    
    // Debug info
    debug: {
      coreState: builderCore.state,
      realFamilies,
      realTemplates,
      isConnected,
      connectionError
    }
  };
};

export default useBuilderV3Integration; 