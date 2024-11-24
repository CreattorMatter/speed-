import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Undo, Redo } from 'lucide-react';

interface HistoryPanelProps {
  history: any[];
  currentIndex: number;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function HistoryPanel({
  history,
  currentIndex,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}: HistoryPanelProps) {
  return (
    <div className="w-64 bg-white border-l border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-500" />
          <h2 className="font-medium text-gray-900">Historial</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg ${
              canUndo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg ${
              canRedo ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {history.map((entry, index) => (
          <motion.div
            key={entry.timestamp}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-2 rounded-lg ${
              index === currentIndex ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'
            }`}
          >
            <p className="text-sm font-medium">{entry.description}</p>
            <p className="text-xs text-gray-500">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 