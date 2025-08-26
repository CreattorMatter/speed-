// =====================================
// SETUP SUPABASE STORAGE - Configuración automática
// =====================================

import { supabase } from '../lib/supabaseClient';

/**
 * 🗂️ CONFIGURAR STORAGE PARA THUMBNAILS
 * Crea el bucket necesario si no existe
 */
export const setupSupabaseStorage = async (): Promise<boolean> => {
  try {
    console.log('🔧 Configurando Supabase Storage para thumbnails...');

    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error verificando buckets:', listError);
      return false;
    }

    const assetsBucket = buckets?.find(bucket => bucket.name === 'assets');

    if (!assetsBucket) {
      // Crear el bucket si no existe
      console.log('📁 Creando bucket assets...');
      
      const { error: createError } = await supabase.storage.createBucket('assets', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('❌ Error creando bucket:', createError);
        return false;
      }

      console.log('✅ Bucket assets creado exitosamente');
    } else {
      console.log('✅ Bucket assets ya existe');
    }

    // Verificar que se pueden subir archivos
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = 'Test thumbnail system';
    
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(`thumbnails/${testFileName}`, testContent, {
        contentType: 'text/plain'
      });

    if (uploadError) {
      console.error('❌ Error de permisos de subida:', uploadError);
      return false;
    }

    // Eliminar archivo de prueba
    await supabase.storage
      .from('assets')
      .remove([`thumbnails/${testFileName}`]);

    console.log('🎉 Supabase Storage configurado correctamente para thumbnails');
    return true;

  } catch (error) {
    console.error('❌ Error configurando Supabase Storage:', error);
    return false;
  }
};

/**
 * 🧹 LIMPIAR THUMBNAILS ANTIGUOS
 * Elimina thumbnails de más de 30 días
 */
export const cleanupOldThumbnails = async (): Promise<number> => {
  try {
    console.log('🧹 Limpiando thumbnails antiguos...');

    const { data: files, error } = await supabase.storage
      .from('assets')
      .list('thumbnails', {
        limit: 1000
      });

    if (error) {
      console.error('❌ Error listando thumbnails:', error);
      return 0;
    }

    if (!files || files.length === 0) {
      console.log('📁 No hay thumbnails para limpiar');
      return 0;
    }

    // Filtrar archivos antiguos (más de 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldFiles = files.filter(file => {
      if (!file.updated_at) return false;
      const fileDate = new Date(file.updated_at);
      return fileDate < thirtyDaysAgo;
    });

    if (oldFiles.length === 0) {
      console.log('📁 No hay thumbnails antiguos para eliminar');
      return 0;
    }

    // Eliminar archivos antiguos
    const filesToDelete = oldFiles.map(file => `thumbnails/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from('assets')
      .remove(filesToDelete);

    if (deleteError) {
      console.error('❌ Error eliminando thumbnails antiguos:', deleteError);
      return 0;
    }

    console.log(`🗑️ ${oldFiles.length} thumbnails antiguos eliminados`);
    return oldFiles.length;

  } catch (error) {
    console.error('❌ Error en limpieza de thumbnails:', error);
    return 0;
  }
};

/**
 * 📊 ESTADÍSTICAS DE STORAGE
 * Muestra información sobre el uso del storage
 */
export const getStorageStats = async (): Promise<{
  thumbnailCount: number;
  totalSize: number;
  oldestFile: string | null;
  newestFile: string | null;
} | null> => {
  try {
    const { data: files, error } = await supabase.storage
      .from('assets')
      .list('thumbnails', {
        limit: 1000
      });

    if (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }

    if (!files || files.length === 0) {
      return {
        thumbnailCount: 0,
        totalSize: 0,
        oldestFile: null,
        newestFile: null
      };
    }

    const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    
    const sortedByDate = files
      .filter(file => file.updated_at)
      .sort((a, b) => new Date(a.updated_at!).getTime() - new Date(b.updated_at!).getTime());

    return {
      thumbnailCount: files.length,
      totalSize,
      oldestFile: sortedByDate[0]?.name || null,
      newestFile: sortedByDate[sortedByDate.length - 1]?.name || null
    };

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return null;
  }
};

// Auto-configurar storage al importar este módulo
setupSupabaseStorage().catch(console.error); 