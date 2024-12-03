import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Bank, banks } from '../../data/banks';

interface BankSelectorProps {
  selectedBanks: string[];
  onBankSelect: (bankId: string) => void;
}

export const BankSelector: React.FC<BankSelectorProps> = ({
  selectedBanks,
  onBankSelect
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {banks.map((bank) => (
        <motion.button
          key={bank.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onBankSelect(bank.id)}
          className={`relative p-4 bg-white/5 border rounded-lg flex flex-col items-center gap-2
                    ${selectedBanks.includes(bank.id) 
                      ? 'border-rose-500 bg-rose-500/10' 
                      : 'border-white/10 hover:border-white/20'}`}
        >
          <div className="h-12 w-24 relative">
            <img
              src={bank.logoUrl}
              alt={bank.name}
              className="h-full w-full object-contain filter brightness-0 invert opacity-80"
            />
          </div>
          <span className="text-sm text-white/80">{bank.name}</span>
          {selectedBanks.includes(bank.id) && (
            <div className="absolute top-2 right-2">
              <Check className="w-4 h-4 text-rose-400" />
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}; 