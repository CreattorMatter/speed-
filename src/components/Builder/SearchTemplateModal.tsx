import React, { useState, useEffect, useCallback, memo } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Search, Loader2, Camera, Trash2 } from 'lucide-react';
import { builderService } from '../../lib/builderService';
import { motion } from 'framer-motion';
import { Block } from '../../types/builder';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';

interface Template {
  id: number;
  name: string;
  description: string;
  image_data: string;
  blocks?: string;
  created_at: string;
  canvas_settings: {
    width: number;
    height: number;
    background: string;
  };
}

interface CapturedImage {
  name: string;
  url: string;
  created_at: string;
}

interface PosterImage {
  name: string;
  url: string;
  created_at: string;
}

interface SearchTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
  onSelectImage?: (imageUrl: string) => void;
}

const SearchTemplateModal = memo(({
  isOpen,
  onClose,
  onSelectTemplate,
  onSelectImage
}: SearchTemplateModalProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [posters, setPosters] = useState<PosterImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'images' | 'posters'>('templates');
  const [isDeleting, setIsDeleting] = useState(false);

  const getCurrentUser = useCallback(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('No hay sesión activa');
    }
    return JSON.parse(storedUser);
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = getCurrentUser();
      console.log('Usuario actual:', user);

      const data = await builderService.getTemplates();
      console.log('Plantillas cargadas:', data);
      setTemplates(data || []);
    } catch (error) {
      console.error('Error al cargar las plantillas:', error);
      toast.error('Error al cargar las plantillas');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  const loadCapturedImages = useCallback(async () => {
    try {
      setIsLoading(true);
      const user = getCurrentUser();
      console.log('Cargando imágenes para usuario:', user);

      const { data: imageList, error: listError } = await supabase.storage
        .from('builder-images')
        .list('captures/', {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        console.error('Error al listar imágenes:', listError);
        throw listError;
      }

      if (!imageList) {
        console.log('No se encontraron imágenes');
        setCapturedImages([]);
        return;
      }

      console.log('Imágenes encontradas:', imageList);

      const imagesWithUrls = await Promise.all(
        imageList.map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('builder-images')
            .getPublicUrl(`captures/${file.name}`);

          return {
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || new Date().toISOString()
          };
        })
      );

      console.log('Imágenes con URLs:', imagesWithUrls);
      setCapturedImages(imagesWithUrls);
    } catch (error) {
      console.error('Error al cargar las imágenes:', error);
      toast.error('Error al cargar las imágenes');
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUser]);

  const loadPosters = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: posterList, error: listError } = await supabase.storage
        .from('posters')
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        console.error('Error al listar carteles:', listError);
        throw listError;
      }

      if (!posterList) {
        console.log('No se encontraron carteles');
        setPosters([]);
        return;
      }

      console.log('Carteles encontrados:', posterList);

      const postersWithUrls = await Promise.all(
        posterList.map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('posters')
            .getPublicUrl(file.name);

          return {
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at || new Date().toISOString()
          };
        })
      );

      console.log('Carteles con URLs:', postersWithUrls);
      setPosters(postersWithUrls);
    } catch (error) {
      console.error('Error al cargar los carteles:', error);
      toast.error('Error al cargar los carteles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteTemplate = useCallback(async (template: Template) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta plantilla?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await builderService.deleteTemplate(template.id);
      toast.success('Plantilla eliminada correctamente');
      loadTemplates(); // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
      toast.error('Error al eliminar la plantilla');
    } finally {
      setIsDeleting(false);
    }
  }, [loadTemplates]);

  const handleDeleteImage = useCallback(async (image: CapturedImage) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta imagen?')) {
      return;
    }

    try {
      setIsDeleting(true);
      console.log('Intentando eliminar imagen:', image);
      
      await builderService.deleteImage(image.name);
      
      // Actualizar la lista de imágenes localmente
      setCapturedImages(prev => prev.filter(img => img.name !== image.name));
      
      toast.success('Imagen eliminada correctamente');
      
      // Esperar un tiempo más largo antes de recargar la lista
      setTimeout(async () => {
        try {
          const { data: imageList } = await supabase.storage
            .from('builder-images')
            .list('captures/', {
              sortBy: { column: 'created_at', order: 'desc' }
            });

          if (imageList) {
            const imagesWithUrls = await Promise.all(
              imageList
                .filter(file => file.name !== image.name) // Filtrar la imagen eliminada
                .map(async (file) => {
                  const { data: urlData } = supabase.storage
                    .from('builder-images')
                    .getPublicUrl(`captures/${file.name}`);

                  return {
                    name: file.name,
                    url: urlData.publicUrl,
                    created_at: file.created_at || new Date().toISOString()
                  };
                })
            );

            setCapturedImages(imagesWithUrls);
          }
        } catch (error) {
          console.error('Error al recargar las imágenes:', error);
        }
      }, 1000);
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      toast.error('Error al eliminar la imagen');
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const handleSelectTemplate = useCallback((template: Template) => {
    setSelectedTemplate(template);
    onSelectTemplate(template);
    onClose();
  }, [onSelectTemplate, onClose]);

  const handleSelectImage = useCallback((image: CapturedImage) => {
    setSelectedImage(image);
    if (onSelectImage) {
      onSelectImage(image.url);
    }
    onClose();
  }, [onSelectImage, onClose]);

  const handleImageClick = useCallback((image: CapturedImage) => {
    setSelectedImage(image);
  }, []);

  const handleTemplateClick = useCallback((template: Template) => {
    setSelectedTemplate(template);
  }, []);

  const handleSelectPoster = useCallback((poster: PosterImage) => {
    if (onSelectImage) {
      onSelectImage(poster.url);
    }
    onClose();
  }, [onSelectImage, onClose]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadCapturedImages();
      loadPosters();
    }
  }, [isOpen, loadTemplates, loadCapturedImages, loadPosters]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
      setSelectedImage(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredImages = capturedImages.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosters = posters.filter(poster =>
    poster.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

        <div className="relative bg-white rounded-lg w-full max-w-4xl mx-4 p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-semibold">
              Buscar Plantillas
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'templates'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Plantillas
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'images'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Imágenes
            </button>
            <button
              onClick={() => setActiveTab('posters')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'posters'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Carteles
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeTab === 'templates' && filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`relative group cursor-pointer ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-indigo-500'
                      : ''
                  }`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <img
                    src={template.image_data}
                    alt={template.name}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm">{template.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isDeleting}
                    aria-label="Eliminar plantilla"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {activeTab === 'images' && filteredImages.map((image) => (
                <div
                  key={image.name}
                  className={`relative group cursor-pointer ${
                    selectedImage?.name === image.name
                      ? 'ring-2 ring-indigo-500'
                      : ''
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm truncate">{image.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(image);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isDeleting}
                    aria-label="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {activeTab === 'posters' && filteredPosters.map((poster) => (
                <div
                  key={poster.name}
                  className="relative group cursor-pointer"
                  onClick={() => handleSelectPoster(poster)}
                >
                  <img
                    src={poster.url}
                    alt={poster.name}
                    className="w-full h-48 object-cover rounded-lg"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm truncate">{poster.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            {activeTab === 'templates' && selectedTemplate && (
              <button
                onClick={() => handleSelectTemplate(selectedTemplate)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Seleccionar
              </button>
            )}
            {activeTab === 'images' && selectedImage && (
              <button
                onClick={() => handleSelectImage(selectedImage)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                Seleccionar
              </button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
});

SearchTemplateModal.displayName = 'SearchTemplateModal';

export { SearchTemplateModal }; 