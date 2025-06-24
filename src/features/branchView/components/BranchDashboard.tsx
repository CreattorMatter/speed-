// =====================================
// BRANCH VIEW - MAIN DASHBOARD COMPONENT
// =====================================

import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LayoutGrid, List, AlertTriangle, RefreshCw } from 'lucide-react';
import { useBranchData } from '../hooks/useBranchData';
import { PosterCard } from './PosterCard';
import { AssignedPoster } from '../types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'; 
import { Header } from '@/components/shared/Header'; 

type ViewMode = 'grid' | 'list';

export const BranchDashboard: React.FC = () => {
  const { user, posters, isLoading, error, actions, refreshData } = useBranchData();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedPoster, setSelectedPoster] = useState<AssignedPoster | null>(null);

  const handlePreview = (poster: AssignedPoster) => {
    setSelectedPoster(poster);
    // En una implementación real, se podría marcar como 'viewed' aquí.
  };

  const handleClosePreview = () => {
    setSelectedPoster(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center text-red-600">
          <AlertTriangle className="w-16 h-16 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error al Cargar Datos</h2>
          <p className="max-w-md mb-6">{error}</p>
          <button
            onClick={refreshData}
            className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      );
    }

    if (posters.length === 0) {
      return (
        <div className="flex flex-col justify-center items-center h-full text-center text-gray-500">
          <List className="w-24 h-24 mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold mb-2 text-gray-700">No hay carteles asignados</h2>
          <p className="max-w-md">Por el momento, no tienes nuevos carteles para descargar o imprimir.</p>
        </div>
      );
    }

    return (
      <AnimatePresence>
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6" 
          : "space-y-4"
        }>
          {posters.map(poster => (
            <PosterCard 
              key={poster.id}
              poster={poster}
              onPreview={handlePreview}
              onDownload={actions.downloadPosterFile}
              onMarkAsPrinted={actions.markAsPrinted}
            />
          ))}
        </div>
      </AnimatePresence>
    );
  };

  // TODO: Crear un modal de previsualización real
  const renderPreviewModal = () => {
    if (!selectedPoster) return null;
    return (
      <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
        onClick={handleClosePreview}
      >
        <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-4">{selectedPoster.name}</h2>
          <img 
            src={selectedPoster.thumbnailUrl.replace('_thumb.jpg', '.jpg')} // Asumimos una imagen más grande
            alt={`Vista previa de ${selectedPoster.name}`}
            className="w-full h-auto object-contain max-h-[75vh]"
          />
           <button 
             onClick={handleClosePreview}
             className="absolute top-4 right-4 bg-white/80 rounded-full p-2"
           >
            X
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 font-sans">
      <Header 
        userName={user?.name || ''}
        onLogout={() => { /* Lógica de logout */ }}
        onBack={() => { /* Lógica para volver, si es necesaria */ }}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-screen-2xl mx-auto">
          {/* Cabecera del Dashboard */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Carteles para {user?.branchName || 'Sucursal'}
              </h1>
              <p className="mt-1 text-gray-600">
                Aquí encontrarás los últimos carteles asignados a tu sucursal.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Refrescar datos"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} transition-colors`}
                  title="Vista de cuadrícula"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'} transition-colors`}
                  title="Vista de lista"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Contenido principal */}
          <div className="min-h-[60vh]">
            {renderContent()}
          </div>
        </div>
      </main>
      {renderPreviewModal()}
    </div>
  );
}; 