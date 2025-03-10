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

// Función para verificar que el bucket existe
export const checkBucket = async () => {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error al listar buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(b => b.name === 'posters');
    console.log('¿Existe el bucket posters?:', bucketExists);
    return bucketExists;
  } catch (error) {
    console.error('Error al verificar bucket:', error);
    return false;
  }
};

// Función para subir archivo al bucket
export const uploadToBucket = async (fileName: string, file: File | Blob) => {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('posters')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al subir archivo:', error);
    throw error;
  }
}; 