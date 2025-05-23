import React from 'react';

interface FinancingOption {
  logo: string;
  bank: string;
  cardName: string;
  plan: string;
}

interface FinancingInfoProps {
  financing?: FinancingOption[] | null;
  roundedFontStyle: React.CSSProperties;
}

export const FinancingInfo: React.FC<FinancingInfoProps> = ({
  financing,
  roundedFontStyle
}) => {
  if (!financing || financing.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg max-w-64">
      <h4 className="text-sm font-bold text-gray-800 mb-2" style={roundedFontStyle}>
        Financiación disponible:
      </h4>
      <div className="space-y-2">
        {financing.slice(0, 3).map((option, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <img
              src={option.logo}
              alt={option.bank}
              className="w-6 h-6 object-contain"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-800">{option.cardName}</div>
              <div className="text-gray-600">{option.plan}</div>
            </div>
          </div>
        ))}
        {financing.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{financing.length - 3} opciones más
          </div>
        )}
      </div>
    </div>
  );
}; 