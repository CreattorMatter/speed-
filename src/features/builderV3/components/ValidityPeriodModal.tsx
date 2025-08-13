// =====================================
// VALIDITY PERIOD MODAL - BuilderV3
// =====================================

import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

interface ValidityPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (validityPeriod: { startDate: string; endDate: string; enabled: boolean }) => void;
  currentValidityPeriod?: { startDate: string; endDate: string; enabled: boolean };
}

export const ValidityPeriodModal: React.FC<ValidityPeriodModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentValidityPeriod
}) => {
  const [enabled, setEnabled] = useState(currentValidityPeriod?.enabled || false);
  const [startDate, setStartDate] = useState(currentValidityPeriod?.startDate || '');
  const [endDate, setEndDate] = useState(currentValidityPeriod?.endDate || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentValidityPeriod) {
      setEnabled(currentValidityPeriod.enabled);
      setStartDate(currentValidityPeriod.startDate);
      setEndDate(currentValidityPeriod.endDate);
    } else {
      // Set default dates if none provided
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      setStartDate(today);
      setEndDate(nextMonthStr);
      setEnabled(false);
    }
    setError('');
  }, [currentValidityPeriod, isOpen]);

  const validateDates = (): boolean => {
    if (!enabled) return true;
    
    if (!startDate || !endDate) {
      setError('Debes seleccionar fechas de inicio y fin');
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return false;
    }

    setError('');
    return true;
  };

  const handleConfirm = () => {
    if (!validateDates()) return;

    onConfirm({
      startDate,
      endDate,
      enabled
    });
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Configurar Fecha de Vigencia
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>📅 Fecha de Vigencia:</strong> Controla cuándo se puede imprimir esta plantilla. 
              Si está habilitada, solo se permitirá la impresión dentro del rango de fechas especificado.
            </p>
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <span className="text-sm font-medium text-gray-900">Habilitar validación de vigencia</span>
              <p className="text-xs text-gray-600">
                {enabled ? 'La plantilla solo se podrá imprimir en las fechas especificadas' : 'No hay restricciones de fecha para imprimir'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer ${enabled ? 'bg-blue-600' : 'bg-gray-300'} transition-colors`}>
                <div className={`dot absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition ${enabled ? 'transform translate-x-full' : ''}`}></div>
              </div>
            </label>
          </div>

          {/* Date Inputs */}
          {enabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
