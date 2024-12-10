import React from 'react';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface DateRangeSelectorProps {
  startDate: Date;
  endDate: Date;
  onRangeChange: (start: Date, end: Date) => void;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onRangeChange
}) => {
  const handleLastMonth = () => {
    const end = new Date();
    const start = new Date();
    // Establecer el primer día del mes actual
    start.setDate(1);
    // Retroceder un mes
    start.setMonth(start.getMonth() - 1);
    // Establecer el último día del mes anterior
    end.setDate(0);
    onRangeChange(start, end);
  };

  const handleLastQuarter = () => {
    const end = new Date();
    const start = new Date();
    // Establecer el primer día del trimestre actual
    start.setDate(1);
    start.setMonth(Math.floor(start.getMonth() / 3) * 3);
    // Retroceder un trimestre
    start.setMonth(start.getMonth() - 3);
    // Establecer el último día del trimestre anterior
    end.setDate(0);
    onRangeChange(start, end);
  };

  const handleLastYear = () => {
    const end = new Date();
    const start = new Date();
    // Establecer el primer día del año anterior
    start.setFullYear(start.getFullYear() - 1);
    start.setMonth(0);
    start.setDate(1);
    // Establecer el último día del año anterior
    end.setFullYear(end.getFullYear() - 1);
    end.setMonth(11);
    end.setDate(31);
    onRangeChange(start, end);
  };

  // Función para verificar si el rango actual es anual
  const isAnnualRange = (start: Date, end: Date) => {
    return start.getFullYear() === end.getFullYear() &&
           start.getMonth() === 0 && start.getDate() === 1 &&
           end.getMonth() === 11 && end.getDate() === 31;
  };

  // Función para verificar si el rango actual es trimestral
  const isQuarterlyRange = (start: Date, end: Date) => {
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                     end.getMonth() - start.getMonth();
    return monthDiff === 2 && start.getDate() === 1;
  };

  // Función para verificar si el rango actual es mensual
  const isMonthlyRange = (start: Date, end: Date) => {
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                     end.getMonth() - start.getMonth();
    return monthDiff === 0 && start.getDate() === 1;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Rango de Fechas</h3>
            <p className="text-sm text-gray-500">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLastMonth}
            className={`px-3 py-1 text-sm ${
              isMonthlyRange(startDate, endDate)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-indigo-600 hover:bg-indigo-50'
            } rounded-lg`}
          >
            Último Mes
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLastQuarter}
            className={`px-3 py-1 text-sm ${
              isQuarterlyRange(startDate, endDate)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-indigo-600 hover:bg-indigo-50'
            } rounded-lg`}
          >
            Último Trimestre
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLastYear}
            className={`px-3 py-1 text-sm ${
              isAnnualRange(startDate, endDate)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-indigo-600 hover:bg-indigo-50'
            } rounded-lg font-medium`}
          >
            Último Año
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}; 