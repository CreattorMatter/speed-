// =====================================
// STEPS INDICATOR - CreateFamilyModal
// =====================================

import React from 'react';
import { StepsIndicatorProps } from './types';

export const StepsIndicator: React.FC<StepsIndicatorProps> = ({
  currentStep,
  enableCloning
}) => {
  
  const getStepNumber = (step: string) => {
    switch (step) {
      case 'basic': return 1;
      case 'clone': return 2;
      case 'confirm': return enableCloning ? 3 : 2;
      default: return 1;
    }
  };

  const isStepActive = (step: string) => currentStep === step;
  
  const getStepClasses = (step: string) => {
    const isActive = isStepActive(step);
    return `w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
      isActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
    }`;
  };

  const getTextClasses = (step: string) => {
    const isActive = isStepActive(step);
    return `flex items-center ${
      isActive ? 'text-blue-600' : 'text-gray-400'
    }`;
  };

  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {/* Step 1: Basic Info */}
        <div className={getTextClasses('basic')}>
          <div className={getStepClasses('basic')}>
            1
          </div>
          <span className="ml-2 text-sm font-medium">Información</span>
        </div>
        
        {/* Separator before clone step (only if cloning enabled) */}
        {enableCloning && (
          <>
            <div className="flex-1 h-px bg-gray-300"></div>
            
            {/* Step 2: Clone Templates */}
            <div className={getTextClasses('clone')}>
              <div className={getStepClasses('clone')}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Plantillas</span>
            </div>
          </>
        )}
        
        {/* Separator before confirm */}
        <div className="flex-1 h-px bg-gray-300"></div>
        
        {/* Final Step: Confirm */}
        <div className={getTextClasses('confirm')}>
          <div className={getStepClasses('confirm')}>
            {enableCloning ? '3' : '2'}
          </div>
          <span className="ml-2 text-sm font-medium">Confirmar</span>
        </div>
      </div>
    </div>
  );
}; 