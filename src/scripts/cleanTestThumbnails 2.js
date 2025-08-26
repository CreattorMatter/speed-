#!/usr/bin/env node

// =====================================
// CLEAN TEST THUMBNAILS - Limpiar thumbnails de prueba
// =====================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gdsefadvgyyuuomqdjty.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ikdkc2VmYWR2Z3l5dXVvbXFkanR5IiwicmVsZSI6ImFub24iLCJpYXQiOjE3MzM5Njg4MTIsImV4cCI6MjA0OTU0NDgxMn0.KqCJRGHOqMxEL_jOPmzLGWBmfzUhQBeCBXq6mZISK2s';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanTestThumbnails() {
  try {
    console.log('🧹 Iniciando limpieza de thumbnails de prueba...\n');

    // Listar todos los archivos en la carpeta thumbnails
    const { data: files, error: listError } = await supabase.storage
      .from('assets')
      .list('thumbnails', { limit: 1000 });

    if (listError) {
      console.error('❌ Error listando archivos:', listError);
      return;
    }

    if (!files || files.length === 0) {
      console.log('📁 No se encontraron thumbnails para limpiar');
      return;
    }

    console.log(`📊 Se encontraron ${files.length} thumbnails`);

    // Filtrar archivos de prueba (que contengan 'debug', 'test', etc.)
    const testFiles = files.filter(file => 
      file.name.includes('debug') || 
      file.name.includes('test') || 
      file.name.includes('prueba') ||
      file.name.startsWith('template-debug-') ||
      file.name.startsWith('template-test-')
    );

    if (testFiles.length === 0) {
      console.log('✅ No se encontraron thumbnails de prueba para eliminar');
      return;
    }

    console.log(`🎯 Se encontraron ${testFiles.length} thumbnails de prueba:`);
    testFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.name} (${Math.round(file.metadata?.size / 1024) || '?'} KB)`);
    });

    // Eliminar archivos de prueba
    const filePaths = testFiles.map(file => `thumbnails/${file.name}`);
    
    console.log('\n🗑️ Eliminando thumbnails de prueba...');
    const { error: deleteError } = await supabase.storage
      .from('assets')
      .remove(filePaths);

    if (deleteError) {
      console.error('❌ Error eliminando archivos:', deleteError);
      return;
    }

    console.log(`✅ Se eliminaron ${testFiles.length} thumbnails de prueba exitosamente`);
    
    // Mostrar estadísticas finales
    const { data: remainingFiles } = await supabase.storage
      .from('assets')
      .list('thumbnails', { limit: 1000 });

    console.log(`📈 Thumbnails restantes: ${remainingFiles?.length || 0}`);
    
    console.log('\n🎉 Limpieza completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

cleanTestThumbnails(); 