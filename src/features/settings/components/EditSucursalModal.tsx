import React from 'react';
import { X, Save } from 'lucide-react';

interface EditSucursalModalProps {
  onClose: () => void;
  onSave: () => void;
}

const EditSucursalModal: React.FC<EditSucursalModalProps> = ({ onClose, onSave }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-medium mb-4">Editar Sucursal</h3>
        <form className="space-y-4">
          {/* Aquí van los campos del formulario */}
          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <button type="button" onClick={onSave} className="p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
              <Save className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSucursalModal; 