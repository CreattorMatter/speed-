import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

// =====================
// TIPOS Y CONFIGURACIÓN
// =====================

interface UseImageUploadV3Props {
  onUpload: (imageData: ImageUploadResult) => void;
  onError?: (error: Error) => void;
  maxSize?: number; // en bytes
  allowedTypes?: string[];
  quality?: number; // 0.1 a 1.0 para compresión
  maxWidth?: number;
  maxHeight?: number;
}

interface ImageUploadResult {
  url: string;
  file: File;
  dimensions: {
    width: number;
    height: number;
  };
  size: number;
  type: string;
  name: string;
}

interface UseImageUploadV3Return {
  isUploading: boolean;
  progress: number;
  uploadImageFile: (file: File) => Promise<void>;
  uploadFromUrl: (url: string) => Promise<void>;
  openFileDialog: () => void;
  isDragging: boolean;
  dragHandlers: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  fileInputRef: React.RefObject<HTMLInputElement>;
}

// =====================
// CONFIGURACIÓN POR DEFECTO
// =====================

const DEFAULT_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  quality: 0.9,
  maxWidth: 2048,
  maxHeight: 2048
};

// =====================
// HOOK PRINCIPAL
// =====================

export const useImageUploadV3 = ({
  onUpload,
  onError,
  maxSize = DEFAULT_CONFIG.maxSize,
  allowedTypes = DEFAULT_CONFIG.allowedTypes,
  quality = DEFAULT_CONFIG.quality,
  maxWidth = DEFAULT_CONFIG.maxWidth,
  maxHeight = DEFAULT_CONFIG.maxHeight
}: UseImageUploadV3Props): UseImageUploadV3Return => {
  
  // =====================
  // ESTADO
  // =====================
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // =====================
  // VALIDACIONES
  // =====================

  const validateFile = useCallback((file: File): void => {
    // Validar tipo de archivo
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Tipo de archivo no soportado. Solo se permiten: ${allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}`);
    }

    // Validar tamaño
    if (file.size > maxSize) {
      throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Validar que sea realmente una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo seleccionado no es una imagen válida');
    }
  }, [allowedTypes, maxSize]);

  // =====================
  // UTILIDADES DE IMAGEN
  // =====================

  const getImageDimensions = useCallback((file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar la imagen'));
      };
      
      img.src = url;
    });
  }, []);

  const compressImage = useCallback((file: File, targetQuality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir a blob con compresión
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Error al comprimir la imagen'));
            }
          },
          file.type,
          targetQuality
        );
      };
      
      img.onerror = () => reject(new Error('Error al procesar la imagen'));
      img.src = URL.createObjectURL(file);
    });
  }, [maxWidth, maxHeight]);

  // =====================
  // PROCESAMIENTO DE ARCHIVOS
  // =====================

  const processImageFile = useCallback(async (file: File): Promise<ImageUploadResult> => {
    // Validar archivo
    validateFile(file);

    // Comprimir si es necesario
    const processedFile = file.size > 1024 * 1024 ? await compressImage(file, quality) : file;

    // Obtener dimensiones
    const dimensions = await getImageDimensions(processedFile);

    // Crear URL local
    const url = URL.createObjectURL(processedFile);

    return {
      url,
      file: processedFile,
      dimensions,
      size: processedFile.size,
      type: processedFile.type,
      name: processedFile.name
    };
  }, [validateFile, compressImage, quality, getImageDimensions]);

  // =====================
  // FUNCIONES DE UPLOAD
  // =====================

  const uploadImageFile = useCallback(async (file: File): Promise<void> => {
    try {
      setIsUploading(true);
      setProgress(0);

      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 15, 85));
      }, 100);

      // Procesar imagen
      const result = await processImageFile(file);

      // Completar progreso
      clearInterval(progressInterval);
      setProgress(100);

      // Notificar éxito
      onUpload(result);
      toast.success(`Imagen subida: ${file.name}`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al subir la imagen';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [processImageFile, onUpload, onError]);

  const uploadFromUrl = useCallback(async (url: string): Promise<void> => {
    try {
      setIsUploading(true);
      setProgress(0);

      // Validar URL
      if (!url.startsWith('http')) {
        throw new Error('URL no válida');
      }

      // Simular descarga
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 150);

      // Crear resultado simulado (en un caso real, descargarías la imagen)
      const result: ImageUploadResult = {
        url,
        file: new File([], 'imagen-externa.jpg', { type: 'image/jpeg' }),
        dimensions: { width: 800, height: 600 },
        size: 1024 * 1024, // 1MB simulado
        type: 'image/jpeg',
        name: 'imagen-externa.jpg'
      };

      clearInterval(progressInterval);
      setProgress(100);

      onUpload(result);
      toast.success('Imagen cargada desde URL');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar imagen desde URL';
      toast.error(errorMessage);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      }
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [onUpload, onError]);

  // =====================
  // MANEJO DE ARCHIVOS
  // =====================

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // =====================
  // DRAG & DROP HANDLERS
  // =====================

  const dragHandlers = {
    onDragEnter: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []),

    onDragLeave: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []),

    onDragOver: useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []),

    onDrop: useCallback(async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find(file => file.type.startsWith('image/'));

      if (imageFile) {
        await uploadImageFile(imageFile);
      } else {
        toast.error('Por favor, arrastra un archivo de imagen válido');
      }
    }, [uploadImageFile])
  };

  // =====================
  // RETURN
  // =====================

  return {
    isUploading,
    progress,
    uploadImageFile,
    uploadFromUrl,
    openFileDialog,
    isDragging,
    dragHandlers,
    fileInputRef
  };
};

// =====================
// UTILIDADES EXPORTADAS
// =====================

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getImageTypeIcon = (type: string): string => {
  switch (type) {
    case 'image/jpeg':
    case 'image/jpg':
      return '🖼️';
    case 'image/png':
      return '🎨';
    case 'image/webp':
      return '🌐';
    default:
      return '📷';
  }
}; 