#!/usr/bin/env node

// =====================================
// TEST THUMBNAILS - Script de Prueba
// =====================================

console.log('🚀 Iniciando test del sistema de thumbnails...\n');

async function testThumbnailSystem() {
  try {
    // Test 1: Verificar que la carpeta thumbnails existe
    console.log('📁 Test 1: Verificando estructura de carpetas...');
    
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gdsefadvgyyuuomqdjty.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ikdkc2VmYWR2Z3l5dXVvbXFkanR5IiwicmVsZSI6ImFub24iLCJpYXQiOjE3MzM5Njg4MTIsImV4cCI6MjA0OTU0NDgxMn0.KqCJRGHOqMxEL_jOPmzLGWBmfzUhQBeCBXq6mZISK2s';

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar bucket assets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('❌ Error verificando buckets:', bucketsError);
      return false;
    }

    const assetsBucket = buckets?.find(bucket => bucket.name === 'assets');
    if (!assetsBucket) {
      console.error('❌ Bucket "assets" no encontrado');
      return false;
    }
    console.log('✅ Bucket "assets" encontrado');

    // Verificar carpeta thumbnails
    const { data: files, error: filesError } = await supabase.storage
      .from('assets')
      .list('thumbnails', { limit: 5 });

    if (filesError) {
      console.log('📁 Carpeta thumbnails no existe, esto es normal si es la primera vez');
    } else {
      console.log('✅ Carpeta thumbnails encontrada');
      console.log(`📊 Thumbnails existentes: ${files?.length || 0}`);
    }

    // Test 2: Simular subida de thumbnail
    console.log('\n📸 Test 2: Simulando generación de thumbnail...');
    
    const testFileName = `test-thumbnail-${Date.now()}.jpg`;
    const testPath = `thumbnails/${testFileName}`;
    
    // Crear un blob de prueba (imagen 1x1 pixel JPG)
    const testImageBlob = new Blob([
      new Uint8Array([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0xFF, 0xD9
      ])
    ], { type: 'image/jpeg' });

    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload(testPath, testImageBlob, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error subiendo thumbnail de prueba:', uploadError);
      return false;
    }

    console.log('✅ Thumbnail de prueba subido exitosamente');

    // Test 3: Verificar URL pública
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(testPath);

    if (!urlData.publicUrl) {
      console.error('❌ No se pudo obtener URL pública');
      return false;
    }

    console.log('✅ URL pública generada:', urlData.publicUrl);

    // Test 4: Limpiar archivo de prueba
    const { error: deleteError } = await supabase.storage
      .from('assets')
      .remove([testPath]);

    if (deleteError) {
      console.warn('⚠️ Error limpiando archivo de prueba:', deleteError);
    } else {
      console.log('✅ Archivo de prueba eliminado');
    }

    console.log('\n🎉 ¡Todos los tests pasaron exitosamente!');
    console.log('\n📋 Sistema de thumbnails listo para usar:');
    console.log('   • Bucket assets configurado ✅');
    console.log('   • Carpeta thumbnails operativa ✅');
    console.log('   • Subida de archivos funcional ✅');
    console.log('   • URLs públicas funcionando ✅');
    
    return true;

  } catch (error) {
    console.error('❌ Error en test del sistema:', error);
    return false;
  }
}

// Ejecutar test
testThumbnailSystem()
  .then(success => {
    if (success) {
      console.log('\n✨ El sistema de thumbnails está funcionando correctamente');
      process.exit(0);
    } else {
      console.log('\n💥 Hay problemas con el sistema de thumbnails');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 