import React, { useState, useEffect } from 'react';
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

export function SearchTemplateModal({
  isOpen,
  onClose,
  onSelectTemplate,
  onSelectImage
}: SearchTemplateModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [posters, setPosters] = useState<PosterImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'images' | 'posters'>('templates');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadCapturedImages();
      loadPosters();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTemplate(null);
      setSelectedImage(null);
      setSearchTerm('');
    }
  }, [isOpen]);

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('No hay sesión activa');
    }
    return JSON.parse(storedUser);
  };

  const loadTemplates = async () => {
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
  };

  const loadCapturedImages = async () => {
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
  };

  const loadPosters = async () => {
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
  };

  const handleDeleteTemplate = async (template: Template) => {
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
  };

  const handleDeleteImage = async (image: CapturedImage) => {
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
          console.error('Error al recargar la lista de imágenes:', error);
        }
      }, 2000); // Esperar 2 segundos antes de recargar
      
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la imagen');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredImages = capturedImages.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosters = posters.filter(poster =>
    poster.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectTemplate = (template: Template) => {
    try {
      console.log('Seleccionando plantilla:', template);
      setSelectedTemplate(template);
      onSelectTemplate(template);
      onClose();
    } catch (error) {
      console.error('Error al seleccionar la plantilla:', error);
      toast.error('Error al seleccionar la plantilla');
    }
  };

  const handleSelectImage = (image: CapturedImage) => {
    try {
      console.log('Seleccionando imagen:', image);
      setSelectedImage(image);
      if (onSelectImage) {
        onSelectImage(image.url);
      }
      onClose();
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      toast.error('Error al seleccionar la imagen');
    }
  };

  const handleImageClick = (image: CapturedImage) => {
    try {
      console.log('Click en imagen:', image);
      if (isDeleting) return;

      // Asegurarnos de que la imagen tenga una URL válida
      if (!image.url) {
        console.error('La imagen no tiene URL:', image);
        toast.error('Error al cargar la imagen');
        return;
      }

      console.log('Seleccionando imagen:', image);
      setSelectedImage(image);
      if (onSelectImage) {
        onSelectImage(image.url);
        toast.success('Imagen seleccionada correctamente');
      }
      onClose();
    } catch (error) {
      console.error('Error al seleccionar la imagen:', error);
      toast.error('Error al seleccionar la imagen');
    }
  };

  const handleTemplateClick = (template: Template) => {
    try {
      console.log('Click en plantilla:', template);
      if (isDeleting) return;

      // Asegurarnos de que la plantilla tenga todos los campos necesarios
      if (!template.id || !template.image_data || !template.canvas_settings) {
        console.error('La plantilla no tiene todos los campos necesarios:', template);
        toast.error('Error al cargar la plantilla');
        return;
      }

      console.log('Seleccionando plantilla:', template);
      setSelectedTemplate(template);
      onSelectTemplate(template);
      toast.success('Plantilla seleccionada correctamente');
      onClose();
    } catch (error) {
      console.error('Error al seleccionar la plantilla:', error);
      toast.error('Error al seleccionar la plantilla');
    }
  };

  const handleSelectPoster = (poster: PosterImage) => {
    try {
      console.log('Seleccionando cartel:', poster);
      if (onSelectImage) {
        onSelectImage(poster.url);
      }
      onClose();
    } catch (error) {
      console.error('Error al seleccionar el cartel:', error);
      toast.error('Error al seleccionar el cartel');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg w-full max-w-4xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>

          <div className="mb-6">
            <div className="flex space-x-4 mb-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'templates'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('templates')}
              >
                Plantillas
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'images'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('images')}
              >
                Imágenes
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  activeTab === 'posters'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setActiveTab('posters')}
              >
                Carteles
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg pl-10"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-4">
              {activeTab === 'templates' && filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="relative cursor-pointer group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                    <img
                      src={template.image_data}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => handleTemplateClick(template)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform transition-all hover:scale-105"
                        >
                          Utilizar
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white text-sm font-medium truncate">
                          {template.name}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template);
                      }}
                      disabled={isDeleting}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {activeTab === 'images' && filteredImages.map((image) => (
                <motion.div
                  key={image.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="relative cursor-pointer group"
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button
                          onClick={() => handleImageClick(image)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform transition-all hover:scale-105"
                        >
                          Utilizar
                        </button>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white text-sm font-medium truncate">
                          {image.name}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image);
                      }}
                      disabled={isDeleting}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}

              {activeTab === 'posters' && filteredPosters.map((poster) => (
                <motion.div
                  key={poster.name}
                  className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSelectPoster(poster)}
                >
                  <img
                    src={poster.url}
                    alt={poster.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200">
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-black bg-opacity-50 text-white text-sm truncate">
                      {poster.name}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
} 