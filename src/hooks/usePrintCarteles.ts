import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  selectSelectedProducts,
  selectFormatoSeleccionado,
  selectPlantillaSeleccionada,
  selectComboSeleccionado,
  selectSelectedFinancing,
  selectModeloSeleccionado,
  selectHasAnyChanges,
  selectProductChanges,
  setPrintInProgress,
  setPrintConfiguration
} from '../store/features/poster/posterSlice';
import { PrintService, PrintConfiguration } from '../services/printService';
import { products } from '../data/products';
import { Product } from '../data/products';

export interface UsePrintCartelesReturn {
  printCarteles: () => Promise<void>;
  printCartelesWithConfig: (config: PrintConfiguration) => Promise<void>;
  isPrintInProgress: boolean;
  hasChanges: boolean;
}

export const usePrintCarteles = (
  templateComponents: Record<string, React.ComponentType<any>>,
  getCurrentProductValue: (product: Product, field: string) => any
): UsePrintCartelesReturn => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectores Redux
  const selectedProductIds = useSelector(selectSelectedProducts);
  const formatoSeleccionado = useSelector(selectFormatoSeleccionado);
  const plantillaSeleccionada = useSelector(selectPlantillaSeleccionada);
  const comboSeleccionado = useSelector(selectComboSeleccionado);
  const selectedFinancing = useSelector(selectSelectedFinancing);
  const modeloSeleccionado = useSelector(selectModeloSeleccionado);
  const hasChanges = useSelector(selectHasAnyChanges);
  const productChanges = useSelector(selectProductChanges);
  const isPrintInProgress = useSelector((state: RootState) => state.poster.printInProgress);

  // Convertir IDs a objetos Product
  const selectedProducts = selectedProductIds
    .map(id => products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  /**
   * Generar configuración de impresión desde Redux
   */
  const generatePrintConfiguration = useCallback((): PrintConfiguration => {
    return {
      selectedProducts,
      formatoSeleccionado,
      plantillaFamily: plantillaSeleccionada?.value || 'Ladrillazos',
      plantillaType: comboSeleccionado?.value || 'precio_lleno',
      selectedFinancing,
      modeloSeleccionado,
      templateComponents,
      getCurrentProductValue
    };
  }, [
    selectedProducts,
    formatoSeleccionado,
    plantillaSeleccionada,
    comboSeleccionado,
    selectedFinancing,
    modeloSeleccionado,
    templateComponents,
    getCurrentProductValue
  ]);

  /**
   * Imprimir carteles usando la configuración completa
   */
  const printCarteles = useCallback(async (): Promise<void> => {
    try {
      dispatch(setPrintInProgress(true));
      
      if (selectedProducts.length === 0) {
        throw new Error('No hay productos seleccionados para imprimir');
      }

      if (!plantillaSeleccionada) {
        throw new Error('No hay plantilla seleccionada');
      }

      if (!modeloSeleccionado) {
        throw new Error('No hay modelo de plantilla seleccionado');
      }

      console.log('🖨️ Iniciando impresión con configuración completa...');
      
      // Generar configuración de impresión
      const config = generatePrintConfiguration();
      
      console.log('📋 Configuración de impresión:', {
        productos: config.selectedProducts.length,
        plantilla: config.plantillaFamily,
        tipo: config.plantillaType,
        modelo: config.modeloSeleccionado,
        formato: config.formatoSeleccionado?.label
      });
      
      // Usar el servicio de impresión con configuración completa
      await PrintService.printCarteles(config);
      
      console.log('✅ Impresión completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error durante la impresión:', error);
      
      // Si hay error con la impresión completa, intentar impresión directa como fallback
      console.log('🔄 Intentando impresión directa como fallback...');
      try {
        await PrintService.printDirect();
        console.log('✅ Impresión directa completada como fallback');
      } catch (fallbackError) {
        console.error('❌ Error en impresión directa fallback:', fallbackError);
        throw error; // Lanzar el error original
      }
    } finally {
      dispatch(setPrintInProgress(false));
    }
  }, [dispatch, selectedProducts, plantillaSeleccionada, modeloSeleccionado, generatePrintConfiguration]);

  /**
   * Imprimir carteles con una configuración específica
   */
  const printCartelesWithConfig = useCallback(async (config: PrintConfiguration): Promise<void> => {
    try {
      dispatch(setPrintInProgress(true));

      console.log('🖨️ Iniciando impresión con configuración personalizada:', config);
      
      await PrintService.printCarteles(config);
      
      console.log('✅ Impresión con configuración personalizada completada');
      
    } catch (error) {
      console.error('❌ Error durante la impresión personalizada:', error);
      throw error;
    } finally {
      dispatch(setPrintInProgress(false));
    }
  }, [dispatch]);

  return {
    printCarteles,
    printCartelesWithConfig,
    isPrintInProgress,
    hasChanges
  };
}; 