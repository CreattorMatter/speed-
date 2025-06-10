// =====================================
// BUILDER V3 - SUPABASE INTEGRATION HOOK
// =====================================

import { useState, useEffect, useCallback } from 'react';
import { useBuilderV3 } from './useBuilderV3';
import { builderV3Service } from '../services/builderV3Service';
import { FamilyV3, TemplateV3, DraggableComponentV3 } from '../types/builder-v3';
import { toast } from 'react-hot-toast';

/**
 * Hook que extiende useBuilderV3 con integración real de Supabase
 * Mantiene compatibilidad con la infraestructura existente
 */
export const useBuilderV3Integration = () => {
  const builderCore = useBuilderV3();
  const [realFamilies, setRealFamilies] = useState<FamilyV3[]>([]);
  const [realTemplates, setRealTemplates] = useState<TemplateV3[]>([]);
  const [isConnectedToSupabase, setIsConnectedToSupabase] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // =====================
  // INICIALIZACIÓN Y CONEXIÓN
  // =====================

  useEffect(() => {
    initializeSupabaseConnection();
  }, []);

  const initializeSupabaseConnection = async () => {
    try {
      // Verificar conexión a Supabase
      const families = await builderV3Service.families.getAll();
      setRealFamilies(families);
      setIsConnectedToSupabase(true);
      setConnectionError(null);
      
      toast.success('✅ Conectado a Supabase');
      console.log('✅ Builder V3 conectado a Supabase con éxito');
    } catch (error) {
      console.warn('⚠️ Error conectando a Supabase, usando datos mock:', error);
      setConnectionError(error instanceof Error ? error.message : 'Error de conexión');
      setIsConnectedToSupabase(false);
      
      // Usar familias mock del hook original
      setRealFamilies(builderCore.families);
      toast.error('⚠️ Usando datos offline');
    }
  };

  // =====================
  // OPERACIONES EXTENDIDAS CON SUPABASE
  // =====================

  const extendedOperations = {
    ...builderCore.operations,

    // ===== FAMILIAS CON SUPABASE =====
    loadFamily: useCallback(async (familyId: string) => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.loadFamily(familyId);
      }

      try {
        const family = await builderV3Service.families.getById(familyId);
        if (!family) throw new Error('Familia no encontrada en Supabase');
        
        console.log('✅ Familia encontrada en Supabase:', family.displayName);
        
        // ✅ Actualizar estado del builder directamente con la función especial
        builderCore.operations.setFamilyDirect(family);
        
        console.log('✅ Estado del builder actualizado con familia de Supabase');
        
        return family;
      } catch (error) {
        console.error('❌ Error en loadFamily:', error);
        toast.error('Error cargando familia');
        throw error;
      }
    }, [isConnectedToSupabase, builderCore.operations]),

    createFamily: useCallback(async (family: Omit<FamilyV3, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.createFamily(family);
      }

      try {
        const newFamily = await builderV3Service.families.create(family);
        setRealFamilies(prev => [...prev, newFamily]);
        toast.success('Familia creada correctamente');
        return newFamily;
      } catch (error) {
        toast.error('Error creando familia');
        throw error;
      }
    }, [isConnectedToSupabase, builderCore.operations]),

    updateFamily: useCallback(async (familyId: string, updates: Partial<FamilyV3>) => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.updateFamily(familyId, updates);
      }

      try {
        const updatedFamily = await builderV3Service.families.update(familyId, updates);
        setRealFamilies(prev => prev.map(f => f.id === familyId ? updatedFamily : f));
        toast.success('Familia actualizada correctamente');
        return updatedFamily;
      } catch (error) {
        toast.error('Error actualizando familia');
        throw error;
      }
    }, [isConnectedToSupabase, builderCore.operations]),

    deleteFamily: useCallback(async (familyId: string) => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.deleteFamily(familyId);
      }

      try {
        await builderV3Service.families.delete(familyId);
        setRealFamilies(prev => prev.filter(f => f.id !== familyId));
        toast.success('Familia eliminada correctamente');
      } catch (error) {
        toast.error('Error eliminando familia');
        throw error;
      }
    }, [isConnectedToSupabase, builderCore.operations]),

    // ===== PLANTILLAS CON SUPABASE =====
    loadTemplate: useCallback(async (templateId: string) => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.loadTemplate(templateId);
      }

      try {
        const template = await builderV3Service.templates.getById(templateId);
        if (!template) throw new Error('Plantilla no encontrada');
        
        // Cargar componentes de la plantilla
        const components = await builderV3Service.components.getTemplateComponents(templateId);
        
        // Actualizar estado del hook core
        await builderCore.operations.loadTemplate(templateId);
        
        return { ...template, defaultComponents: components };
      } catch (error) {
        toast.error('Error cargando plantilla');
        throw error;
      }
    }, [isConnectedToSupabase, builderCore.operations]),

    saveTemplate: useCallback(async () => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.saveTemplate();
      }

      if (!builderCore.state.currentTemplate) {
        toast.error('No hay plantilla para guardar');
        return;
      }

      try {
        // Actualizar plantilla en Supabase
        await builderV3Service.templates.update(
          builderCore.state.currentTemplate.id,
          {
            name: builderCore.state.currentTemplate.name,
            description: builderCore.state.currentTemplate.description,
            canvas: builderCore.state.currentTemplate.canvas,
            familyConfig: builderCore.state.currentTemplate.familyConfig
          }
        );

        // Guardar componentes
        await builderV3Service.components.saveTemplateComponents(
          builderCore.state.currentTemplate.id,
          builderCore.state.components
        );

        // Actualizar estado core
        await builderCore.operations.saveTemplate();
        
        toast.success('Plantilla guardada en Supabase');
      } catch (error) {
        toast.error('Error guardando plantilla');
        console.error('Error saving to Supabase:', error);
        
        // Fallback a guardado local
        await builderCore.operations.saveTemplate();
      }
    }, [isConnectedToSupabase, builderCore.operations, builderCore.state]),

    createTemplate: useCallback(async (template: Omit<TemplateV3, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.createTemplate(template);
      }

      try {
        const newTemplate = await builderV3Service.templates.create(template);
        setRealTemplates(prev => [...prev, newTemplate]);
        toast.success('Plantilla creada correctamente');
        return newTemplate;
      } catch (error) {
        toast.error('Error creando plantilla');
        throw error;
      }
    }, [isConnectedToSupabase, builderCore.operations]),

    duplicateTemplate: useCallback(async (templateId: string, newName?: string) => {
      if (!isConnectedToSupabase) {
        return builderCore.operations.duplicateTemplate(templateId, newName);
      }

      try {
        const duplicated = await builderV3Service.templates.duplicate(templateId, newName);
        setRealTemplates(prev => [...prev, duplicated]);
        toast.success('Plantilla duplicada correctamente');
        return duplicated;
      } catch (error) {
        toast.error('Error duplicando plantilla');
        throw error;
      }
    }, [isConnectedToSupabase, builderCore.operations]),

    // ===== FAVORITOS CON SUPABASE =====
    addToFavorites: useCallback(async (componentType: string) => {
      if (!isConnectedToSupabase) {
        console.log('Favoritos guardados localmente:', componentType);
        return;
      }

      try {
        const currentUser = getCurrentUser();
        await builderV3Service.favorites.addToFavorites(currentUser.id, componentType as any);
        toast.success('Agregado a favoritos');
      } catch (error) {
        toast.error('Error agregando a favoritos');
        console.error('Error adding to favorites:', error);
      }
    }, [isConnectedToSupabase]),

    removeFromFavorites: useCallback(async (componentType: string) => {
      if (!isConnectedToSupabase) {
        console.log('Favorito removido localmente:', componentType);
        return;
      }

      try {
        const currentUser = getCurrentUser();
        await builderV3Service.favorites.removeFromFavorites(currentUser.id, componentType as any);
        toast.success('Removido de favoritos');
      } catch (error) {
        toast.error('Error removiendo de favoritos');
        console.error('Error removing from favorites:', error);
      }
    }, [isConnectedToSupabase]),

    // ===== CONEXIONES EXTERNAS =====
    connectToSAP: useCallback(async (config: { baseUrl: string; token: string }) => {
      const success = await builderCore.operations.connectToSAP(config);
      
      if (success && isConnectedToSupabase) {
        try {
          const currentUser = getCurrentUser();
          await builderV3Service.sapConnection.saveConnection({
            ...config,
            userId: currentUser.id
          });
          toast.success('Configuración SAP guardada');
        } catch (error) {
          console.error('Error saving SAP config to Supabase:', error);
        }
      }
      
      return success;
    }, [isConnectedToSupabase, builderCore.operations]),

    connectToPromotions: useCallback(async (config: { baseUrl: string; token: string }) => {
      const success = await builderCore.operations.connectToPromotions(config);
      
      if (success && isConnectedToSupabase) {
        try {
          const currentUser = getCurrentUser();
          await builderV3Service.promotionConnection.saveConnection({
            ...config,
            userId: currentUser.id
          });
          toast.success('Configuración de promociones guardada');
        } catch (error) {
          console.error('Error saving promotion config to Supabase:', error);
        }
      }
      
      return success;
    }, [isConnectedToSupabase, builderCore.operations])
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
    if (isConnectedToSupabase) {
      try {
        const families = await builderV3Service.families.getAll();
        setRealFamilies(families);
        
        if (builderCore.state.currentFamily) {
          const templates = await builderV3Service.templates.getByFamily(builderCore.state.currentFamily.id);
          setRealTemplates(templates);
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }
  }, [isConnectedToSupabase, builderCore.state.currentFamily]);

  const getConnectionStatus = () => ({
    isConnected: isConnectedToSupabase,
    error: connectionError,
    mode: isConnectedToSupabase ? 'online' : 'offline'
  });

  // =====================
  // RETORNO DEL HOOK
  // =====================

  return {
    // Estado combinado (hook core + datos reales)
    state: builderCore.state,
    
    // Operaciones extendidas con Supabase
    operations: extendedOperations,
    
    // Datos reales (si está conectado) o mock (si está offline)
    families: isConnectedToSupabase ? realFamilies : builderCore.families,
    templates: isConnectedToSupabase ? realTemplates : builderCore.templates,
    componentsLibrary: builderCore.componentsLibrary,
    
    // Estado de conexión
    connectionStatus: getConnectionStatus(),
    
    // Utilidades
    isReady: builderCore.isReady && (isConnectedToSupabase || connectionError !== null),
    refreshData,
    
    // Debug info
    debug: {
      coreState: builderCore.state,
      realFamilies,
      realTemplates,
      isConnectedToSupabase,
      connectionError
    }
  };
};

export default useBuilderV3Integration; 