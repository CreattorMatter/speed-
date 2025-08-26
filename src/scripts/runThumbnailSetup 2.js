#!/usr/bin/env node

// =====================================
// SCRIPT EJECUTABLE - Configurar Thumbnails
// =====================================

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (usar las variables de entorno)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gdssfsadvgyyuuomqjtlv.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ikdkc3Nmc2FkdmdseXV1b21xanRsdiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzI5NzIwOTY0LCJleHAiOjIwNDUyOTY5NjR9.K5TQ0T-8ZHZ0s7Ks8iMt1Fqe7pOrM-8HdVYYrYZYZYY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupThumbnailsFolder() {
  console.log('🚀 Configurando sistema de thumbnails para BuilderV3...\n');

  try {
    // 1. Verificar bucket assets
    console.log('1️⃣ Verificando bucket assets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error verificando buckets:', bucketsError.message);
      return false;
    }

    const assetsBucket = buckets?.find(bucket => bucket.name === 'assets');
    
    if (!assetsBucket) {
      console.error('❌ Bucket "assets" no encontrado.');
      console.log('💡 Debes crear el bucket "assets" primero en Supabase Dashboard.');
      console.log('   👉 Ve a Project > Storage > Create bucket > Nombre: "assets" > Public: true');
      return false;
    }
    
    console.log('✅ Bucket assets encontrado');

    // 2. Crear carpeta thumbnails
    console.log('\n2️⃣ Creando carpeta thumbnails...');
    
    const markerContent = '# Carpeta para thumbnails automáticos de BuilderV3\n# Este archivo permite que exista la carpeta en Supabase Storage';
    
    const { error: uploadError } = await supabase.storage
      .from('assets')
      .upload('thumbnails/.gitkeep', markerContent, {
        contentType: 'text/plain',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error creando carpeta thumbnails:', uploadError.message);
      return false;
    }
    
    console.log('✅ Carpeta thumbnails creada en assets/');

    // 3. Probar permisos de subida
    console.log('\n3️⃣ Probando permisos de subida...');
    
    const testFileName = `thumbnails/test-${Date.now()}.txt`;
    const testContent = 'Test de permisos para thumbnails';
    
    const { error: testUploadError } = await supabase.storage
      .from('assets')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      });

    if (testUploadError) {
      console.error('❌ Error de permisos:', testUploadError.message);
      console.log('💡 Revisa las políticas de storage en Supabase Dashboard:');
      console.log('   👉 Project > Storage > Policies > assets');
      return false;
    }

    // Limpiar archivo de prueba
    await supabase.storage.from('assets').remove([testFileName]);
    console.log('✅ Permisos de subida verificados');

    // 4. Mostrar estructura
    console.log('\n4️⃣ Verificando estructura...');
    
    const { data: folders, error: listError } = await supabase.storage
      .from('assets')
      .list('', { limit: 100 });

    if (!listError && folders) {
      console.log('\n📂 Estructura actual del bucket assets:');
      folders.forEach(folder => {
        if (folder.name) {
          console.log(`   ├── ${folder.name}/`);
        }
      });
    }

    // 5. Mensaje final
    console.log('\n🎉 ¡Sistema de thumbnails configurado exitosamente!');
    console.log('\n📋 Resumen:');
    console.log('   ✅ Bucket assets existe');
    console.log('   ✅ Carpeta thumbnails creada');
    console.log('   ✅ Permisos verificados');
    console.log('\n📝 Los thumbnails se guardarán automáticamente en:');
    console.log('   🗂️ assets/thumbnails/template-{id}-{timestamp}.jpg');
    console.log('\n🚀 ¡Ya puedes usar el sistema! Guarda una plantilla para ver el thumbnail.');

    return true;

  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message);
    return false;
  }
}

// Ejecutar el script
setupThumbnailsFolder()
  .then(success => {
    if (success) {
      console.log('\n✨ Script completado exitosamente');
      process.exit(0);
    } else {
      console.log('\n💥 Script falló');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Error ejecutando script:', error);
    process.exit(1);
  }); 