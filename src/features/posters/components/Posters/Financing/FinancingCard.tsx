import React from 'react';
import { Check } from 'lucide-react';

interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  plan: string;
}

interface FinancingCardProps {
  bank: string;
  logo: string;
  cards: Array<{
    name: string;
    image: string;
    plans: string[];
  }>;
  selectedOptions: FinancingOption[];
  onSelect: (bank: string, logo: string, card: { name: string; image: string; plans: string[] }, plan: string) => void;
}

export const FinancingCard: React.FC<FinancingCardProps> = ({
  bank,
  logo,
  cards,
  selectedOptions,
  onSelect
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <img 
          src={logo} 
          alt={bank}
          className="h-8 object-contain"
        />
        <h3 className="text-lg font-medium text-gray-900">{bank}</h3>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {cards[0].plans.map((plan) => {
          const isSelected = selectedOptions.some(opt => 
            opt.bank === bank && 
            opt.cardName === cards[0].name && 
            opt.plan === plan
          );

          return (
            <div 
              key={plan}
              onClick={() => onSelect(bank, logo, cards[0], plan)}
              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all
                ${isSelected 
                  ? 'bg-indigo-100 border border-indigo-300' 
                  : 'hover:bg-gray-100 border border-transparent'
                }
              `}
            >
              <span className="text-sm text-gray-700">{plan}</span>
              {isSelected && (
                <Check className="w-4 h-4 text-indigo-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 