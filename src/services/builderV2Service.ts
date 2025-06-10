// ===============================================
// BUILDER V2 - SUPABASE SERVICE
// ===============================================

import { supabase } from '../lib/supabaseClient';
import {
  FamilyConfig,
  TemplateConfig,
  DraggableElement,
  BuilderState,
  HistoryAction,
  FamilyType,
  TemplateType
} from '../types/builder-v2';

// ===============================================
// FAMILIES SERVICE
// ===============================================

export const familiesService = {
  async getAll(): Promise<FamilyConfig[]> {
    const { data, error } = await supabase
      .from('builder_families')
      .select('*')
      .eq('isActive', true)
      .order('sortOrder');

    if (error) throw error;
    
    return data?.map(item => ({
      ...item,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    })) || [];
  },

  async getById(id: string): Promise<FamilyConfig | null> {
    const { data, error } = await supabase
      .from('builder_families')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async create(family: Omit<FamilyConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<FamilyConfig> {
    const { data, error } = await supabase
      .from('builder_families')
      .insert({
        ...family,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async update(id: string, updates: Partial<FamilyConfig>): Promise<FamilyConfig> {
    const { data, error } = await supabase
      .from('builder_families')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('builder_families')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ===============================================
// TEMPLATES SERVICE
// ===============================================

export const templatesService = {
  async getAll(familyId?: string): Promise<TemplateConfig[]> {
    let query = supabase
      .from('builder_templates')
      .select('*')
      .eq('isActive', true);

    if (familyId) {
      query = query.eq('familyId', familyId);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    
    return data?.map(item => ({
      ...item,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    })) || [];
  },

  async getById(id: string): Promise<TemplateConfig | null> {
    const { data, error } = await supabase
      .from('builder_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async create(template: Omit<TemplateConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<TemplateConfig> {
    const { data, error } = await supabase
      .from('builder_templates')
      .insert({
        ...template,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async update(id: string, updates: Partial<TemplateConfig>): Promise<TemplateConfig> {
    const { data, error } = await supabase
      .from('builder_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async duplicate(id: string, newName?: string): Promise<TemplateConfig> {
    const original = await this.getById(id);
    if (!original) throw new Error('Template not found');

    const { id: _, createdAt: __, updatedAt: ___, ...templateData } = original;
    
    return this.create({
      ...templateData,
      name: newName || `${original.name} (Copia)`,
      isPublic: false // Las copias son privadas por defecto
    });
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('builder_templates')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ===============================================
// PROJECTS SERVICE
// ===============================================

export const projectsService = {
  async getAll(userId?: string): Promise<any[]> {
    let query = supabase
      .from('builder_projects')
      .select(`
        *,
        builder_families(name, displayName, color),
        builder_templates(name, type)
      `)
      .order('updated_at', { ascending: false });

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return data?.map(item => ({
      ...item,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    })) || [];
  },

  async getById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('builder_projects')
      .select(`
        *,
        builder_families(*),
        builder_templates(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async create(project: {
    name: string;
    familyId: string;
    templateId: string;
    elements: DraggableElement[];
    canvasState: any;
    metadata?: any;
    createdBy: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('builder_projects')
      .insert({
        ...project,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async update(id: string, updates: {
    name?: string;
    elements?: DraggableElement[];
    canvasState?: any;
    metadata?: any;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('builder_projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('builder_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async saveState(projectId: string, state: BuilderState): Promise<void> {
    await this.update(projectId, {
      elements: state.elements,
      canvasState: state.canvas,
      metadata: {
        exportConfig: state.exportConfig,
        errors: state.errors,
        lastSaved: new Date().toISOString()
      }
    });
  }
};

// ===============================================
// HISTORY SERVICE (para undo/redo)
// ===============================================

export const historyService = {
  async saveAction(projectId: string, action: HistoryAction): Promise<void> {
    const { error } = await supabase
      .from('builder_history')
      .insert({
        project_id: projectId,
        action_type: action.type,
        element_id: action.elementId,
        previous_state: action.previousState,
        new_state: action.newState,
        timestamp: action.timestamp.toISOString(),
        created_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  async getProjectHistory(projectId: string, limit: number = 50): Promise<HistoryAction[]> {
    const { data, error } = await supabase
      .from('builder_history')
      .select('*')
      .eq('project_id', projectId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    
    return data?.map(item => ({
      id: item.id,
      type: item.action_type,
      elementId: item.element_id,
      previousState: item.previous_state,
      newState: item.new_state,
      timestamp: new Date(item.timestamp)
    })) || [];
  },

  async clearHistory(projectId: string): Promise<void> {
    const { error } = await supabase
      .from('builder_history')
      .delete()
      .eq('project_id', projectId);

    if (error) throw error;
  }
};

// ===============================================
// ASSETS SERVICE (para imágenes y recursos)
// ===============================================

export const assetsService = {
  async uploadImage(file: File, folder: string = 'builder'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteImage(url: string): Promise<void> {
    // Extraer path de la URL
    const path = url.split('/').slice(-2).join('/');
    
    const { error } = await supabase.storage
      .from('assets')
      .remove([path]);

    if (error) throw error;
  },

  async getAssets(folder: string = 'builder'): Promise<any[]> {
    const { data, error } = await supabase.storage
      .from('assets')
      .list(folder);

    if (error) throw error;
    
    return data || [];
  }
};

// ===============================================
// EXPORT SERVICE
// ===============================================

export const exportService = {
  async generatePNG(elements: DraggableElement[], canvasSize: any, options: any = {}): Promise<Blob> {
    // Implementación de exportación a PNG
    // Por ahora mock, implementar con html2canvas o similar
    return new Blob(['mock png'], { type: 'image/png' });
  },

  async generateJPG(elements: DraggableElement[], canvasSize: any, options: any = {}): Promise<Blob> {
    // Implementación de exportación a JPG
    return new Blob(['mock jpg'], { type: 'image/jpeg' });
  },

  async generatePDF(elements: DraggableElement[], canvasSize: any, options: any = {}): Promise<Blob> {
    // Implementación de exportación a PDF
    return new Blob(['mock pdf'], { type: 'application/pdf' });
  },

  async generateSVG(elements: DraggableElement[], canvasSize: any, options: any = {}): Promise<Blob> {
    // Implementación de exportación a SVG
    return new Blob(['mock svg'], { type: 'image/svg+xml' });
  },

  async saveExport(projectId: string, format: string, blob: Blob): Promise<string> {
    const fileName = `export-${projectId}-${Date.now()}.${format}`;
    const filePath = `exports/${fileName}`;

    const { error } = await supabase.storage
      .from('assets')
      .upload(filePath, blob);

    if (error) throw error;

    const { data } = supabase.storage
      .from('assets')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};

// ===============================================
// MAIN BUILDER SERVICE
// ===============================================

export const builderV2Service = {
  families: familiesService,
  templates: templatesService,
  projects: projectsService,
  history: historyService,
  assets: assetsService,
  export: exportService,

  // Métodos de conveniencia
  async initializeProject(familyType: FamilyType, templateType: TemplateType, userId: string): Promise<any> {
    const families = await this.families.getAll();
    const family = families.find(f => f.name === familyType);
    
    if (!family) throw new Error('Family not found');
    
    const templates = await this.templates.getAll(family.id);
    const template = templates.find(t => t.type === templateType);
    
    if (!template) throw new Error('Template not found');
    
    return this.projects.create({
      name: `${family.displayName} - ${template.name}`,
      familyId: family.id,
      templateId: template.id,
      elements: template.defaultElements || [],
      canvasState: {
        zoom: 1,
        panX: 0,
        panY: 0,
        activeTool: 'select',
        selectedElementIds: [],
        showGrid: true,
        showRulers: false,
        showGuides: true,
        snapToGrid: true,
        snapToGuides: true,
        canUndo: false,
        canRedo: false,
        historyIndex: 0
      },
      createdBy: userId
    });
  }
}; 