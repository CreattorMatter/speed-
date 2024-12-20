import { supabase } from './supabaseClient';

interface Template {
  id?: number;
  name: string;
  description: string;
  image_data: string;
  image_url?: string;
  blocks?: string;
  canvas_settings: any;
  created_by: string;
  user_email: string;
  is_public: boolean;
  version: string;
  status?: 'active' | 'inactive';
  created_at?: string;
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
      
      // Obtener el usuario almacenado
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        console.error('No se encontró usuario en localStorage');
        throw new Error('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      }

      const user = JSON.parse(storedUser);
      console.log('Usuario encontrado:', user);

      // Verificar la sesión de Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Si no hay sesión, intentar recuperarla del localStorage
        const storedSession = localStorage.getItem('sb-session');
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            await supabase.auth.setSession({
              access_token: parsedSession.access_token,
              refresh_token: parsedSession.refresh_token
            });
          } catch (error) {
            console.error('Error al restaurar la sesión:', error);
            // No lanzar error aquí, intentaremos continuar con el usuario del localStorage
          }
        }
      }

      return user;
    } catch (error) {
      console.error('Error en getCurrentUser:', error);
      throw error;
    }
  }

  public async saveTemplate(templateData: Template) {
    try {
      console.log('Iniciando guardado de plantilla...', templateData);
      const user = await this.getCurrentUser();
      console.log('Usuario actual:', user);

      // Asegurarnos de que los campos requeridos estén presentes y con el formato correcto
      const template = {
        name: templateData.name || 'Sin nombre',
        description: templateData.description || '',
        image_data: templateData.image_data,
        image_url: templateData.image_data,
        blocks: typeof templateData.blocks === 'string' ? templateData.blocks : JSON.stringify(templateData.blocks || []),
        canvas_settings: typeof templateData.canvas_settings === 'string' 
          ? templateData.canvas_settings 
          : JSON.stringify(templateData.canvas_settings),
        created_by: user.email,
        user_email: user.email,
        is_public: templateData.is_public || false,
        version: templateData.version || '1.0',
        status: 'active',
        created_at: new Date().toISOString()
      };

      console.log('Datos de la plantilla a guardar:', template);

      // Intentar insertar la plantilla
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

  public async deleteTemplate(id: number) {
    try {
      console.log('Iniciando eliminación de plantilla:', id);
      const user = await this.getCurrentUser();
      console.log('Usuario actual:', user);

      const { data, error } = await supabase
        .from('builder')
        .delete()
        .eq('id', id)
        .eq('user_email', user.email); // Solo permitir eliminar plantillas propias

      if (error) {
        console.error('Error al eliminar la plantilla:', error);
        throw new Error(`Error al eliminar la plantilla: ${error.message}`);
      }

      console.log('Plantilla eliminada exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error en deleteTemplate:', error);
      throw error;
    }
  }

  public async deleteImage(imageName: string) {
    try {
      console.log('Iniciando eliminación de imagen:', imageName);
      
      // Obtener el usuario actual sin lanzar error si falla la sesión
      let user;
      try {
        user = await this.getCurrentUser();
        console.log('Usuario actual:', user);
      } catch (error) {
        console.warn('No se pudo obtener el usuario actual, continuando con la eliminación');
      }

      // Limpiar el nombre de la imagen
      let cleanImageName = imageName;
      if (imageName.includes('/')) {
        cleanImageName = imageName.split('/').pop() || imageName;
      }
      console.log('Nombre limpio de la imagen:', cleanImageName);

      // Intentar eliminar la imagen
      const { error: deleteError } = await supabase.storage
        .from('builder-images')
        .remove([`captures/${cleanImageName}`]);

      if (deleteError) {
        // Si hay un error de autenticación, intentar una vez más después de un breve retraso
        if (deleteError.message.includes('auth')) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const { error: retryError } = await supabase.storage
            .from('builder-images')
            .remove([`captures/${cleanImageName}`]);
          
          if (retryError) {
            console.error('Error al eliminar la imagen (segundo intento):', retryError);
            throw new Error(`Error al eliminar la imagen: ${retryError.message}`);
          }
        } else {
          console.error('Error al eliminar la imagen:', deleteError);
          throw new Error(`Error al eliminar la imagen: ${deleteError.message}`);
        }
      }

      console.log('Imagen eliminada exitosamente');
      return true;
    } catch (error) {
      console.error('Error en deleteImage:', error);
      throw error;
    }
  }
}

export const builderService = BuilderService.getInstance(); 