import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const DigitalCarouselEditor = () => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [availableImages, setAvailableImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleImageSelection = (image) => {
    // Implement the logic to handle image selection
  };

  const updateImageDuration = (name, duration) => {
    // Implement the logic to update image duration
  };

  const ImageModal = () => (
    <AnimatePresence>
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Seleccionar Imágenes</h3>
              <div className="flex items-center gap-4">
                {/* Toggle de vista */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-white shadow-sm' 
                        : 'hover:bg-gray-200'
                    }`}
                    title="Vista en cuadrícula"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-white shadow-sm' 
                        : 'hover:bg-gray-200'
                    }`}
                    title="Vista en lista"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className={`p-4 overflow-auto ${viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-2'}`}>
              {availableImages.map((image) => (
                viewMode === 'grid' ? (
                  <div
                    key={image.name}
                    className="relative rounded-lg overflow-hidden border-2"
                  >
                    <div
                      className={`cursor-pointer ${
                        selectedImages.some(i => i.name === image.name) 
                          ? 'border-blue-500' 
                          : 'border-transparent'
                      }`}
                      onClick={() => handleImageSelection(image)}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    {selectedImages.some(i => i.name === image.name) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-white p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Duración:</span>
                          <select
                            value={selectedImages.find(i => i.name === image.name)?.duration || 3}
                            onChange={(e) => updateImageDuration(image.name, Number(e.target.value))}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[2, 3, 5, 8, 10, 15, 20, 30].map(value => (
                              <option key={value} value={value}>{value} segundos</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    key={image.name}
                    className={`relative group rounded-lg border p-3 transition-colors cursor-pointer
                      ${selectedImages.some(i => i.name === image.name)
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    onClick={() => handleImageSelection(image)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{image.name}</div>
                          <div className="text-sm text-gray-500">
                            {selectedImages.some(i => i.name === image.name)
                              ? `Duración: ${selectedImages.find(i => i.name === image.name)?.duration || 3}s`
                              : 'No seleccionada'}
                          </div>
                        </div>
                      </div>
                      {selectedImages.some(i => i.name === image.name) && (
                        <select
                          value={selectedImages.find(i => i.name === image.name)?.duration || 3}
                          onChange={(e) => updateImageDuration(image.name, Number(e.target.value))}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {[2, 3, 5, 8, 10, 15, 20, 30].map(value => (
                            <option key={value} value={value}>{value} segundos</option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Preview en hover */}
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-64 h-48 object-contain bg-gray-100 rounded"
                        />
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div>
      {/* Rest of the component code */}
    </div>
  );
};

export default DigitalCarouselEditor; 