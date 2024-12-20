import { supabase } from './supabaseClient';

interface Template {
  name: string;
  description: string;
  image_data: string;
  canvas_settings: any;
  created_by: string;
  user_email: string;
  is_public: boolean;
  version: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive';
}

class BuilderService {
  private static instance: BuilderService;

  private constructor() {}

  public static getInstance(): BuilderService {
    if (!BuilderService.instance) {
      BuilderService.instance = new BuilderService();
    }
    return BuilderService.instance;
  }

  private async getCurrentUser(): Promise<User> {
    try {
      console.log('Obteniendo usuario actual...');
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        console.error('No se encontró usuario en localStorage');
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      const user = JSON.parse(storedUser);
      console.log('Usuario encontrado en localStorage:', user);
      return user;
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
      throw error;
    }
  }

  public async saveTemplate(templateData: Template) {
    try {
      console.log('Iniciando guardado de plantilla...');
      const user = await this.getCurrentUser();
      console.log('Usuario actual:', user);

      // Asegurarnos de que los campos requeridos estén presentes
      const template = {
        name: templateData.name || 'Sin nombre',
        description: templateData.description || '',
        image_data: templateData.image_data,
        canvas_settings: templateData.canvas_settings,
        created_by: user.email,
        user_email: user.email,
        is_public: templateData.is_public || false,
        version: templateData.version || '1.0',
        created_at: new Date().toISOString()
      };

      console.log('Insertando plantilla en la base de datos:', template);
      const { data, error } = await supabase
        .from('builder')
        .insert([template])
        .select();

      if (error) {
        console.error('Error al guardar la plantilla:', error);
        throw new Error(`Error al guardar la plantilla: ${error.message}`);
      }

      console.log('Plantilla guardada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error en saveTemplate:', error);
      throw error;
    }
  }

  public async getTemplates() {
    try {
      console.log('Iniciando obtención de plantillas...');
      const user = await this.getCurrentUser();
      console.log('Usuario actual:', user);

      console.log('Consultando plantillas en la base de datos...');
      const { data, error } = await supabase
        .from('builder')
        .select('*')
        .or(`user_email.eq."${user.email}",is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al obtener las plantillas:', error);
        throw new Error(`Error al obtener las plantillas: ${error.message}`);
      }

      console.log('Plantillas obtenidas:', data);
      return data;
    } catch (error) {
      console.error('Error en getTemplates:', error);
      throw error;
    }
  }

  public async getTemplateById(id: string) {
    try {
      console.log('Iniciando obtención de plantilla por ID:', id);
      const user = await this.getCurrentUser();
      console.log('Usuario actual:', user);

      console.log('Consultando plantilla en la base de datos...');
      const { data, error } = await supabase
        .from('builder')
        .select('*')
        .eq('id', id)
        .or(`user_email.eq."${user.email}",is_public.eq.true`)
        .single();

      if (error) {
        console.error('Error al obtener la plantilla:', error);
        throw new Error(`Error al obtener la plantilla: ${error.message}`);
      }

      console.log('Plantilla obtenida:', data);
      return data;
    } catch (error) {
      console.error('Error en getTemplateById:', error);
      throw error;
    }
  }
}

export const builderService = BuilderService.getInstance(); 