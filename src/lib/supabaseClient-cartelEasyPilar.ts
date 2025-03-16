import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

// Cliente con privilegios elevados para operaciones de almacenamiento
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Función para obtener la URL de un cartel de Easy
export const getPosterUrl = async (activityId: string) => {
  try {
    // Listamos todos los archivos que comiencen con easy_mdh_
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('posters')
      .list('', {
        search: 'easy_mdh_',
        sortBy: { column: 'name', order: 'desc' }
      });

    if (listError) throw listError;
    
    if (!files || files.length === 0) {
      throw new Error('No se encontraron carteles de Easy');
    }

    // Usamos el ID de la actividad para seleccionar un cartel específico
    // Esto asegura que la misma actividad siempre muestre el mismo cartel
    const index = parseInt(activityId) % files.length;
    const selectedFile = files[index];

    // Obtenemos la URL firmada para el archivo
    const { data: signedUrl, error: signError } = await supabaseAdmin.storage
      .from('posters')
      .createSignedUrl(selectedFile.name, 300); // URL válida por 5 minutos

    if (signError) throw signError;
    return signedUrl.signedUrl;
  } catch (error) {
    console.error('Error al obtener la URL del cartel:', error);
    throw error;
  }
};

// Función para verificar si existe el cartel
export const checkPosterExists = async (categoryName: string) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('posters')
      .list('', {
        search: `easy_mdh_${categoryName.toLowerCase()}`
      });

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('Error al verificar el cartel:', error);
    return false;
  }
}; 