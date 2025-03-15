import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import {
  X, Edit3, Save, Download, Search, Wand2, Layout,
  Image, Type, Palette, ChevronRight, ArrowLeft,
  MousePointer2, Layers, Grid3X3, PenTool, ImagePlus,
  TextSelect, Palette as ColorPalette, Move, ZoomIn,
  MonitorPlay
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DetailedGuide {
  title: string;
  description: string;
  steps: {
    title: string;
    description: string;
    image?: string;
    tip?: string;
  }[];
  examples?: {
    title: string;
    image: string;
    description: string;
  }[];
  shortcuts?: {
    key: string;
    action: string;
  }[];
}

interface GuideItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  detailedGuide?: DetailedGuide;
}

interface GuideSection {
  title: string;
  items: GuideItem[];
}

export function GuideModal({ isOpen, onClose }: GuideModalProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showingDetails, setShowingDetails] = useState(false);

  const sections = [
    {
      title: 'Editor de Carteles',
      items: [
        {
          icon: <Layout className="w-5 h-5" />,
          title: 'Gestión de Carteles',
          description: 'Aprende a crear y gestionar carteles para tus promociones.',
          detailedGuide: {
            title: 'Guía del Editor de Carteles',
            description: 'Aprende a utilizar todas las funciones del editor de carteles para crear promociones efectivas.',
            steps: [
              {
                title: 'Selección de Empresa y Promoción',
                description: 'Comienza seleccionando la empresa y el tipo de promoción que deseas crear. Puedes filtrar promociones por categoría y banco.',
                tip: 'Usa los filtros de búsqueda para encontrar rápidamente la promoción deseada.'
              },
              {
                title: 'Configuración de Plantilla',
                description: 'Selecciona una plantilla prediseñada o personaliza una existente. Puedes agregar financiación y configurar diferentes aspectos visuales.',
                tip: 'Las plantillas se pueden personalizar con los colores de tu marca.'
              },
              {
                title: 'Selección de Productos',
                description: 'Agrega productos a tu cartel filtrando por categoría. Puedes seleccionar múltiples productos para crear carteles en lote.',
                tip: 'Usa la vista en lista para ver más detalles de los productos.'
              },
              {
                title: 'Personalización del Cartel',
                description: 'Ajusta el tamaño, orientación, zoom y escala del cartel. Controla la visibilidad del logo y otros elementos.',
                tip: 'Usa los controles de zoom para una vista más detallada.'
              },
              {
                title: 'Exportación y Guardado',
                description: 'Descarga tus carteles en formato PNG o guárdalos en el sistema para uso futuro. También puedes enviarlos directamente a las sucursales.',
                tip: 'Los carteles se guardan en alta resolución para impresión.'
              }
            ],
            shortcuts: [
              { key: '⌘/Ctrl + S', action: 'Guardar cartel' },
              { key: '⌘/Ctrl + E', action: 'Exportar cartel' },
              { key: '⌘/Ctrl + Z', action: 'Deshacer último cambio' }
            ]
          }
        },
        {
          icon: <MonitorPlay className="w-5 h-5" />,
          title: 'Cartelería Digital',
          description: 'Gestiona contenido digital para pantallas y dispositivos.',
          detailedGuide: {
            title: 'Guía de Cartelería Digital',
            description: 'Aprende a crear y gestionar contenido digital para diferentes dispositivos y pantallas.',
            steps: [
              {
                title: 'Creación de Playlist',
                description: 'Crea listas de reproducción con imágenes y videos. Configura la duración y orden de cada elemento.',
                tip: 'Puedes previsualizar la playlist antes de enviarla.'
              },
              {
                title: 'Selección de Dispositivos',
                description: 'Elige los dispositivos donde se mostrará el contenido: videowalls, pantallas de caja, kioscos digitales, etc.',
                tip: 'Cada dispositivo puede tener contenido específico.'
              },
              {
                title: 'Programación',
                description: 'Configura fechas y horarios de reproducción. Establece la duración de cada elemento en la playlist.',
                tip: 'Usa la programación para mostrar contenido en horarios específicos.'
              },
              {
                title: 'Distribución',
                description: 'Envía el contenido a las sucursales seleccionadas. Monitorea el estado del envío en tiempo real.',
                tip: 'Puedes enviar a múltiples sucursales simultáneamente.'
              }
            ]
          }
        },
        {
          icon: <PenTool className="w-5 h-5" />,
          title: 'Constructor de Diseños',
          description: 'Crea diseños personalizados con el constructor visual.',
          detailedGuide: {
            title: 'Guía del Constructor de Diseños',
            description: 'Aprende a utilizar el constructor visual para crear diseños personalizados.',
            steps: [
              {
                title: 'Bloques de Construcción',
                description: 'Utiliza diferentes tipos de bloques: contenedores, encabezados, imágenes, precios, etc. Arrastra y suelta para construir tu diseño.',
                tip: 'Los contenedores pueden anidar otros elementos.'
              },
              {
                title: 'Formato y Tamaño',
                description: 'Selecciona el formato de papel y orientación. Ajusta el zoom y escala para una edición precisa.',
                tip: 'Usa las guías para alinear elementos perfectamente.'
              },
              {
                title: 'Personalización',
                description: 'Modifica colores, fuentes, tamaños y posiciones. Agrega efectos y estilos a los elementos.',
                tip: 'Guarda tus diseños como plantillas para uso futuro.'
              },
              {
                title: 'Generación con IA',
                description: 'Utiliza la generación automática con IA para crear diseños rápidamente.',
                tip: 'La IA puede sugerir diferentes layouts basados en tu contenido.'
              },
              {
                title: 'Exportación',
                description: 'Exporta tus diseños en diferentes formatos: PNG, PDF, SVG. Configura la calidad y resolución.',
                tip: 'Usa la vista previa para verificar el resultado final.'
              }
            ],
            shortcuts: [
              { key: '⌘/Ctrl + D', action: 'Duplicar elemento' },
              { key: '⌘/Ctrl + G', action: 'Agrupar elementos' },
              { key: 'Delete', action: 'Eliminar elemento' },
              { key: 'Space + Drag', action: 'Mover vista' }
            ]
          }
        }
      ]
    },
    {
      title: 'Herramientas Avanzadas',
      items: [
        {
          icon: <Wand2 className="w-5 h-5" />,
          title: 'Generación con IA',
          description: 'Utiliza inteligencia artificial para generar diseños automáticamente.',
          detailedGuide: {
            title: 'Uso de IA en Diseños',
            description: 'Aprende a aprovechar la inteligencia artificial para crear diseños eficientes.',
            steps: [
              {
                title: 'Generación de Layouts',
                description: 'La IA puede generar diferentes layouts basados en tu contenido y requisitos.',
                tip: 'Especifica tus preferencias para mejores resultados.'
              },
              {
                title: 'Sugerencias de Diseño',
                description: 'Recibe sugerencias inteligentes para mejorar tus diseños.',
                tip: 'La IA aprende de tus preferencias anteriores.'
              }
            ]
          }
        },
        {
          icon: <Search className="w-5 h-5" />,
          title: 'Búsqueda Avanzada',
          description: 'Encuentra rápidamente plantillas y diseños guardados.',
          detailedGuide: {
            title: 'Búsqueda y Filtrado',
            description: 'Aprende a utilizar las funciones de búsqueda avanzada.',
            steps: [
              {
                title: 'Filtros de Búsqueda',
                description: 'Utiliza filtros por tipo, fecha, empresa o categoría.',
                tip: 'Combina filtros para búsquedas más precisas.'
              },
              {
                title: 'Guardado y Organización',
                description: 'Organiza tus diseños en carpetas y categorías.',
                tip: 'Usa etiquetas para una mejor organización.'
              }
            ]
          }
        }
      ]
    }
  ];

  const renderDetailedView = (guide: DetailedGuide) => (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">{guide.title}</h2>
        <p className="mt-2 text-gray-600">{guide.description}</p>
      </div>

      <div className="space-y-6">
        {guide.steps.map((step, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
                {step.tip && (
                  <div className="mt-3 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm">
                    💡 Tip: {step.tip}
                  </div>
                )}
                {step.image && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                    <img src={step.image} alt={step.title} className="w-full" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {guide.examples && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ejemplos</h3>
          <div className="grid grid-cols-2 gap-6">
            {guide.examples.map((example, index) => (
              <div key={index} className="rounded-lg overflow-hidden border border-gray-200">
                <img src={example.image} alt={example.title} className="w-full" />
                <div className="p-4">
                  <h4 className="font-medium text-gray-900">{example.title}</h4>
                  <p className="mt-1 text-sm text-gray-500">{example.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {guide.shortcuts && (
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Atajos de Teclado</h3>
          <div className="grid grid-cols-2 gap-4">
            {guide.shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <code className="px-2 py-1 bg-white border border-gray-200 rounded text-sm font-mono">
                  {shortcut.key}
                </code>
                <span className="text-sm text-gray-600">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              {showingDetails && (
                <button
                  onClick={() => setShowingDetails(false)}
                  className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <Dialog.Title className="text-xl font-semibold text-gray-900">
                {showingDetails ? selectedItem : '📖 Guía de Uso'}
              </Dialog.Title>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4">
            <AnimatePresence mode="wait">
              {!showingDetails ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {sections.map((section, index) => (
                    <div key={index} className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {section.items.map((item, itemIndex) => (
                          <motion.button
                            key={itemIndex}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setSelectedItem(item.title);
                              setShowingDetails(true);
                            }}
                            className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-all text-left w-full group"
                          >
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                              {item.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">
                                  {item.title}
                                </h4>
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                {item.description}
                              </p>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {sections.map(section =>
                    section.items.find(item => item.title === selectedItem)?.detailedGuide &&
                    renderDetailedView(section.items.find(item => item.title === selectedItem)!.detailedGuide!)
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Dialog>
  );
} 