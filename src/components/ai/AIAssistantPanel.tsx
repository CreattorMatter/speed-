import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  EyeIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { useAIAssistant, useAISuggestions } from '../../hooks/useAIAssistant';

interface AIAssistantPanelProps {
  canvasData?: any;
  productData?: any;
  templateType?: string;
  className?: string;
  onApplySuggestion?: (suggestion: any) => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  canvasData,
  productData,
  templateType = 'ladrillazo',
  className = '',
  onApplySuggestion
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'visual' | 'pricing' | 'fields'>('all');

  const {
    feedback,
    isAnalyzing,
    hasErrors,
    hasWarnings,
    feedbackCount,
    requestAnalysis,
    clearFeedback,
    dismissFeedback,
    getFeedbackByType
  } = useAIAssistant({
    canvasData,
    productData,
    templateType,
    enableRealTimeAnalysis: true
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visual':
        return <EyeIcon className="w-4 h-4" />;
      case 'pricing':
        return <CurrencyDollarIcon className="w-4 h-4" />;
      case 'fields':
        return <DocumentCheckIcon className="w-4 h-4" />;
      default:
        return <SparklesIcon className="w-4 h-4" />;
    }
  };

  const filteredFeedback = activeTab === 'all' 
    ? feedback 
    : getFeedbackByType(activeTab as any);

  if (!isExpanded) {
    return (
      <div className={`fixed bottom-4 right-4 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg
            bg-gradient-to-r from-purple-600 to-blue-600 text-white
            hover:from-purple-700 hover:to-blue-700 transition-all
            ${hasErrors ? 'animate-pulse' : ''}
          `}
        >
          <SparklesIcon className="w-5 h-5" />
          <span>AI Assistant</span>
          {feedbackCount > 0 && (
            <span className="bg-white text-purple-600 rounded-full px-2 py-1 text-xs font-bold">
              {feedbackCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
          {isAnalyzing && (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={requestAnalysis}
            disabled={isAnalyzing}
            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
            title="Solicitar análisis"
          >
            <SparklesIcon className="w-4 h-4" />
          </button>
          <button
            onClick={clearFeedback}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Limpiar feedback"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {[
          { id: 'all', label: 'Todo', count: feedback.length },
          { id: 'visual', label: 'Visual', count: getFeedbackByType('visual').length },
          { id: 'pricing', label: 'Precios', count: getFeedbackByType('pricing').length },
          { id: 'fields', label: 'Campos', count: getFeedbackByType('fields').length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 px-3 py-2 text-sm font-medium transition-colors
              ${activeTab === tab.id 
                ? 'bg-white text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <div className="flex items-center justify-center gap-1">
              {getTypeIcon(tab.id)}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-gray-200 text-gray-700 rounded-full px-1.5 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredFeedback.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SparklesIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              {isAnalyzing 
                ? 'Analizando tu diseño...' 
                : 'No hay sugerencias disponibles'
              }
            </p>
            {!isAnalyzing && canvasData && productData && (
              <button
                onClick={requestAnalysis}
                className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Solicitar análisis
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeedback.map((item, index) => (
              <div
                key={`${item.type}-${index}`}
                className={`
                  p-3 rounded-lg border-l-4 bg-gray-50
                  ${item.severity === 'error' ? 'border-red-400' :
                    item.severity === 'warning' ? 'border-yellow-400' :
                    item.severity === 'success' ? 'border-green-400' :
                    'border-blue-400'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {getSeverityIcon(item.severity)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 leading-relaxed">
                        {item.message}
                      </p>
                      {item.suggestions && item.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {item.suggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-gray-600 bg-white p-2 rounded border"
                            >
                              • {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissFeedback(index)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Footer */}
      {(hasErrors || hasWarnings) && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {hasErrors && (
                <span className="flex items-center gap-1 text-red-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Errores detectados
                </span>
              )}
              {hasWarnings && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  Advertencias
                </span>
              )}
            </div>
            <span className="text-gray-500">
              {feedbackCount} sugerencia{feedbackCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantPanel; 