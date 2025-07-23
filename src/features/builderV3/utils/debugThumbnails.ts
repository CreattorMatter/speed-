// =====================================
// DEBUG THUMBNAILS - Helper de Debugging
// =====================================

/**
 * 🔍 DEBUG HELPER PARA THUMBNAILS
 * Ejecuta desde la consola del navegador: window.debugThumbnails()
 */
export const debugThumbnails = () => {
  console.log('🔍 =================================');
  console.log('🔍 DEBUG THUMBNAILS - BuilderV3');
  console.log('🔍 =================================\n');

  // 1. Verificar si estamos en BuilderV3
  const canvas = document.querySelector('[data-canvas="builderv3"]') as HTMLElement;
  
  if (!canvas) {
    console.error('❌ No se encontró canvas de BuilderV3');
    console.log('💡 Asegúrate de estar en el editor de canvas');
    return;
  }

  console.log('✅ Canvas encontrado:', canvas);

  // 2. Verificar dimensiones
  const rect = canvas.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(canvas);
  
  console.log('📐 Dimensiones del canvas:');
  console.log('   • getBoundingClientRect:', { width: rect.width, height: rect.height });
  console.log('   • style.width/height:', { width: computedStyle.width, height: computedStyle.height });
  console.log('   • innerHTML length:', canvas.innerHTML.length);

  // 3. Verificar componentes
  const components = canvas.querySelectorAll('[data-component-id]');
  console.log(`📦 Componentes encontrados: ${components.length}`);
  
  if (components.length > 0) {
    console.log('📋 Lista de componentes:');
    components.forEach((comp, index) => {
      const rect = comp.getBoundingClientRect();
      console.log(`   ${index + 1}. ${comp.getAttribute('data-component-type')} (${rect.width}x${rect.height})`);
    });
  }

  // 4. Verificar estilos de transformación
  console.log('🎨 Estilos de transformación:');
  console.log('   • transform:', computedStyle.transform);
  console.log('   • scale:', computedStyle.scale);
  console.log('   • zoom:', computedStyle.zoom);

  // 5. Función para generar thumbnail de prueba
  const testThumbnail = async () => {
    try {
      console.log('\n🧪 Generando thumbnail de prueba...');
      
      // Importar dinámicamente la función
      const { generateThumbnailAutomatic } = await import('./thumbnailGenerator');
      
      const result = await generateThumbnailAutomatic('debug-test', {
        width: 800,         // 🎯 ANCHURA AUMENTADA A 800px
        height: 500,        // 🎯 ALTURA MANTENIDA EN 500px
        quality: 0.8
      });

      if (result) {
        console.log('✅ Thumbnail generado exitosamente!');
        console.log('🔗 URL:', result.url);
        console.log('📏 Dimensiones:', { width: result.width, height: result.height });
        console.log('💾 Tamaño:', Math.round(result.size / 1024) + ' KB');
        
        // Mostrar thumbnail en consola (si el navegador lo soporta)
        console.log('🖼️ Preview:');
        console.log('%c ', `
          background-image: url(${result.url}); 
          background-size: contain; 
          background-repeat: no-repeat; 
          padding: 50px 100px; 
          border: 1px solid #ccc;
        `);
      } else {
        console.error('❌ No se pudo generar el thumbnail');
      }
    } catch (error) {
      console.error('❌ Error generando thumbnail:', error);
    }
  };

  // 6. Función para test completo del sistema
  const testFullSystem = async () => {
    try {
      console.log('\n🔬 INICIANDO TEST COMPLETO DEL SISTEMA DE THUMBNAILS');
      console.log('======================================================\n');

      // 1. Verificar canvas
      if (!canvas) {
        console.error('❌ FALLO: No se encontró canvas');
        return false;
      }
      console.log('✅ PASO 1: Canvas encontrado');

      // 2. Verificar dimensiones
      const templateWidth = canvas.getAttribute('data-template-width');
      const templateHeight = canvas.getAttribute('data-template-height');
      console.log('📐 PASO 2: Dimensiones del template:', {
        width: templateWidth,
        height: templateHeight,
        canvasStyle: {
          width: canvas.style.width,
          height: canvas.style.height
        }
      });

      // 3. Generar thumbnail
      console.log('🎨 PASO 3: Generando thumbnail...');
      const { generateThumbnailAutomatic } = await import('./thumbnailGenerator');
      const result = await generateThumbnailAutomatic('test-complete-system', {
        width: 800,         // 🎯 ANCHURA ACTUALIZADA A 800px
        height: 500,        // 🎯 ALTURA MANTENIDA EN 500px
        quality: 0.9
      });

      if (!result) {
        console.error('❌ FALLO: No se pudo generar thumbnail');
        return false;
      }

      console.log('✅ PASO 3: Thumbnail generado exitosamente');
      console.log('📊 Resultado:', {
        url: result.url,
        size: `${Math.round(result.size / 1024)} KB`,
        dimensions: `${result.width}x${result.height}`
      });

      // 4. Verificar acceso a la imagen
      console.log('🔍 PASO 4: Verificando acceso a la imagen...');
      const testImg = new Image();
      const imageLoadPromise = new Promise((resolve, reject) => {
        testImg.onload = () => resolve(true);
        testImg.onerror = () => reject(new Error('No se pudo cargar la imagen'));
        setTimeout(() => reject(new Error('Timeout cargando imagen')), 10000);
      });
      
      testImg.src = result.url;
      
      try {
        await imageLoadPromise;
        console.log('✅ PASO 4: Imagen accesible desde el navegador');
      } catch (error) {
        console.error('❌ FALLO: Error accediendo a la imagen:', error);
        return false;
      }

      // 5. Test completo exitoso
      console.log('\n🎉 ¡TEST COMPLETO EXITOSO!');
      console.log('✅ Sistema de thumbnails funcionando correctamente');
      console.log('🔗 URL del thumbnail de prueba:', result.url);
      
      return true;

    } catch (error) {
      console.error('❌ FALLO EN TEST COMPLETO:', error);
      return false;
    }
  };

  // 7. Mostrar funciones disponibles
  console.log('\n🛠️ Funciones disponibles:');
  console.log('   • debugThumbnails.testThumbnail() - Generar thumbnail de prueba');
  console.log('   • debugThumbnails.testFullSystem() - Test completo del sistema');
  console.log('   • debugThumbnails.analyzeCanvas() - Analizar canvas actual');
  console.log('   • debugThumbnails.showTemplates() - Mostrar plantillas disponibles');

  // Agregar funciones al objeto global
  (window as any).debugThumbnails = {
    testThumbnail,
    testFullSystem,
    analyzeCanvas: debugThumbnails,
    showTemplates: () => {
      // Buscar plantillas en localStorage o store
      const templates = document.querySelectorAll('[data-testid="template-card"]');
      console.log(`📋 Plantillas encontradas en UI: ${templates.length}`);
      
      templates.forEach((template, index) => {
        const img = template.querySelector('img');
        const title = template.querySelector('h3')?.textContent;
        console.log(`   ${index + 1}. ${title} - Thumbnail: ${img ? '✅' : '❌'}`);
        if (img) {
          console.log(`      URL: ${img.src}`);
        }
      });
    }
  };

  console.log('\n💡 Ejecuta window.debugThumbnails.testFullSystem() para test completo');
  console.log('💡 O window.debugThumbnails.testThumbnail() para test básico');
};

// Hacer disponible globalmente en desarrollo
if (typeof window !== 'undefined') {
  (window as any).debugThumbnails = debugThumbnails;
} 