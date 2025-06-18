import React from 'react';
import { motion } from 'framer-motion';

interface CardBrandIconProps {
  brand: string;
  selected: boolean;
}

export const CardBrandIcon: React.FC<CardBrandIconProps> = ({ brand, selected }) => {
  const getCardStyle = () => {
    switch (brand) {
      case 'VISA':
        return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'MASTERCARD':
        return 'bg-gradient-to-br from-orange-600 to-red-600';
      case 'AMEX':
        return 'bg-gradient-to-br from-cyan-600 to-blue-700';
      default:
        return 'bg-gradient-to-br from-gray-700 to-gray-900';
    }
  };

  return (
    <div className={`relative w-16 h-10 rounded-lg ${getCardStyle()} shadow-lg`}>
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
        {brand === 'VISA' && (
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
            VISA
          </div>
        )}
        {brand === 'MASTERCARD' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 bg-red-500 rounded-full opacity-80" />
            <div className="w-4 h-4 bg-yellow-500 rounded-full -ml-2 opacity-80" />
          </div>
        )}
        {brand === 'AMEX' && (
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">
            AMEX
          </div>
        )}
      </div>
      {selected && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
}; 