// =====================================
// CREAR CARPETA THUMBNAILS - Assets Bucket
// =====================================

import { supabase } from '../lib/supabaseClient';

/**
 * 📁 CONFIGURAR CARPETA THUMBNAILS EN ASSETS
 * Verifica que el bucket assets esté listo para thumbnails
 */
export const createThumbnailsFolder = async (): Promise<boolean> => {
  try {
    console.log('📁 Configurando carpeta thumbnails en bucket assets...');

    // =====================
    // 1. VERIFICAR BUCKET ASSETS EXISTE
    // =====================
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error verificando buckets:', listError);
      return false;
    }

    const assetsBucket = buckets?.find(bucket => bucket.name === 'assets');
    
    if (!assetsBucket) {
      console.error('❌ Bucket assets no encontrado. Debe existir previamente.');
      console.log('💡 Crear el bucket assets manualmente en Supabase Dashboard');
      return false;
    }

    console.log('✅ Bucket assets encontrado');

    // =====================
    // 2. VERIFICAR/CREAR CARPETA THUMBNAILS
    // =====================
    
    // Crear un archivo marcador para que exista la carpeta
    const markerFileName = 'thumbnails/.gitkeep';
    const markerContent = '# Carpeta para thumbnails automáticos de plantillas BuilderV3';

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(markerFileName, markerContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error creando carpeta thumbnails:', uploadError);
      return false;
    }

    console.log('📁 Carpeta thumbnails configurada en assets/');

    // =====================
    // 3. PROBAR SUBIDA DE THUMBNAIL
    // =====================
    
    const testFileName = `thumbnails/test-${Date.now()}.jpg`;
    const testContent = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAAgACADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==';
    
    // Convertir data URL a blob
    const response = await fetch(testContent);
    const blob = await response.blob();

    const { error: testUploadError } = await supabase.storage
      .from('assets')
      .upload(testFileName, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (testUploadError) {
      console.error('❌ Error de permisos para subir thumbnails:', testUploadError);
      return false;
    }

    // Eliminar archivo de prueba
    await supabase.storage
      .from('assets')
      .remove([testFileName]);

    console.log('✅ Permisos de subida verificados');

    // =====================
    // 4. MOSTRAR ESTRUCTURA FINAL
    // =====================
    
    const { data: files, error: listFilesError } = await supabase.storage
      .from('assets')
      .list('', { limit: 100 });

    if (!listFilesError && files) {
      console.log('\n📂 Estructura actual del bucket assets:');
      files.forEach(file => {
        if (file.name) {
          console.log(`├── ${file.name}/`);
        }
      });
    }

    console.log('\n🎉 Sistema de thumbnails listo para usar!');
    console.log('📝 Los thumbnails se guardarán en: assets/thumbnails/');
    
    return true;

  } catch (error) {
    console.error('❌ Error configurando thumbnails:', error);
    return false;
  }
};

/**
 * 📊 VERIFICAR ESTADO DEL SISTEMA
 * Comprueba que todo esté listo para generar thumbnails
 */
export const verifyThumbnailSystem = async (): Promise<{
  assetsBucketExists: boolean;
  thumbnailsFolderExists: boolean;
  canUpload: boolean;
  currentThumbnails: number;
}> => {
  try {
    // Verificar bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    const assetsBucketExists = buckets?.some(bucket => bucket.name === 'assets') || false;

    // Verificar carpeta thumbnails
    const { data: folders } = await supabase.storage.from('assets').list('');
    const thumbnailsFolderExists = folders?.some(folder => folder.name === 'thumbnails') || false;

    // Contar thumbnails existentes
    const { data: thumbnails } = await supabase.storage.from('assets').list('thumbnails');
    const currentThumbnails = thumbnails?.length || 0;

    // Probar subida
    let canUpload = false;
    try {
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testName = `thumbnails/test-${Date.now()}.txt`;
      
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(testName, testBlob);
      
      if (!uploadError) {
        await supabase.storage.from('assets').remove([testName]);
        canUpload = true;
      }
    } catch (e) {
      canUpload = false;
    }

    return {
      assetsBucketExists,
      thumbnailsFolderExists,
      canUpload,
      currentThumbnails
    };

  } catch (error) {
    console.error('Error verificando sistema:', error);
    return {
      assetsBucketExists: false,
      thumbnailsFolderExists: false,
      canUpload: false,
      currentThumbnails: 0
    };
  }
};

// Ejecutar automáticamente cuando se importa
if (typeof window !== 'undefined') {
  createThumbnailsFolder().catch(console.error);
} 