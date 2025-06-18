import React from 'react';
import { motion } from 'framer-motion';

interface CardTypeIconProps {
  type: 'debit' | 'credit';
  selected: boolean;
}

export const CardTypeIcon: React.FC<CardTypeIconProps> = ({ type, selected }) => {
  const getCardStyle = () => {
    if (type === 'credit') {
      return 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 before:absolute before:inset-0 before:bg-gradient-to-t before:from-violet-500/20 before:to-transparent before:rounded-xl';
    }
    return 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 before:absolute before:inset-0 before:bg-gradient-to-t before:from-emerald-500/20 before:to-transparent before:rounded-xl';
  };

  return (
    <motion.div
      className={`relative w-[280px] h-[170px] rounded-xl ${getCardStyle()} shadow-2xl 
                  backdrop-blur-xl overflow-hidden group`}
      whileHover={{ 
        scale: 1.02,
        rotateY: 5,
        translateZ: 20
      }}
      initial={{ rotateX: -20, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 400,
        damping: 30
      }}
    >
      {/* Metallic effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.05] to-transparent opacity-50" />

      {/* Contactless icon */}
      <div className="absolute top-8 right-8">
        <motion.div 
          className="w-8 h-8"
          initial={false}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="absolute border-2 border-white/40 rounded-full"
              style={{
                width: `${100 - i * 25}%`,
                height: `${100 - i * 25}%`,
                left: `${i * 12.5}%`,
                top: `${i * 12.5}%`,
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Card number */}
      <div className="absolute bottom-20 left-8 right-8">
        <div className="flex justify-between">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="flex gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              {[...Array(4)].map((_, j) => (
                <motion.div
                  key={j}
                  className="w-1.5 h-1.5 bg-white/60 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.05 * (i * 4 + j) }}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Card type and validity */}
      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
        <div>
          <div className="text-white/50 text-xs mb-1">VÁLIDA HASTA</div>
          <div className="text-white/90 font-medium tracking-wider">
            {type === 'credit' ? '12/28' : '08/27'}
          </div>
        </div>
        <div className="text-white/90 font-medium tracking-wider text-right">
          {type === 'credit' ? 'CRÉDITO' : 'DÉBITO'}
        </div>
      </div>

      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full border-2 border-white 
                     flex items-center justify-center shadow-lg z-10"
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      )}

      {/* Premium shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          repeat: Infinity,
          duration: 3,
          repeatType: 'loop',
          ease: 'linear',
          delay: 1
        }}
      />
    </motion.div>
  );
}; 