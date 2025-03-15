import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Edit3, Save, Download, Search, Wand2, Layout, Image, Type, Palette } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const sections = [
    {
      title: 'Editor de Carteles',
      items: [
        {
          icon: <Layout className="w-5 h-5" />,
          title: 'Selección de Empresa y Promoción',
          description: 'Elige la empresa y la promoción que deseas editar desde los menús desplegables.'
        },
        {
          icon: <Image className="w-5 h-5" />,
          title: 'Plantillas',
          description: 'Explora y selecciona entre diferentes plantillas prediseñadas para tu cartel.'
        }
      ]
    },
    {
      title: 'Herramientas de Edición',
      items: [
        {
          icon: <Type className="w-5 h-5" />,
          title: 'Edición de Texto',
          description: 'Modifica el texto, tamaño, fuente y color de los elementos textuales.'
        },
        {
          icon: <Palette className="w-5 h-5" />,
          title: 'Personalización',
          description: 'Ajusta colores, imágenes y elementos visuales según tus necesidades.'
        },
        {
          icon: <Edit3 className="w-5 h-5" />,
          title: 'Edición Avanzada',
          description: 'Accede a opciones avanzadas de diseño y composición.'
        }
      ]
    },
    {
      title: 'Gestión de Carteles',
      items: [
        {
          icon: <Save className="w-5 h-5" />,
          title: 'Guardar',
          description: 'Guarda tu progreso en cualquier momento para continuar más tarde.'
        },
        {
          icon: <Download className="w-5 h-5" />,
          title: 'Descargar',
          description: 'Descarga tu cartel en formato PNG para uso local.'
        }
      ]
    },
    {
      title: 'Funciones Especiales',
      items: [
        {
          icon: <Search className="w-5 h-5" />,
          title: 'Búsqueda de Plantillas',
          description: 'Encuentra rápidamente la plantilla perfecta usando el buscador.'
        },
        {
          icon: <Wand2 className="w-5 h-5" />,
          title: 'Generación con IA',
          description: 'Utiliza la inteligencia artificial para generar variaciones y sugerencias.'
        }
      ]
    }
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              📖 Guía de Uso
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
} 