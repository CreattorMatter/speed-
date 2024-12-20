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
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedImage, setSelectedImage] = useState<CapturedImage | null>(null);
  const [activeTab, setActiveTab] = useState<'templates' | 'images'>('templates');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadCapturedImages();
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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex justify-between items-start p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              {activeTab === 'templates' ? 'Buscar plantilla' : 'Imágenes capturadas'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Plantillas
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'images'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Imágenes
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : activeTab === 'templates' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {filteredTemplates.map((template) => (
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
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {filteredImages.map((image) => (
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
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 