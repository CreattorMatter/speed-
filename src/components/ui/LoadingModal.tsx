import React from 'react';

interface LoadingModalProps {
  isOpen: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-96 space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-violet-500"></div>
          <div className="text-white space-y-2 text-center">
            <p>Obteniendo promociones desde:</p>
            <p className="font-semibold text-violet-400">Digital Promotion</p>
            <p className="mt-4">Obteniendo Productos desde:</p>
            <div className="flex justify-center">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/SAP_2011_logo.svg/2560px-SAP_2011_logo.svg.png"
                alt="SAP Logo"
                className="h-8 mt-2"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 