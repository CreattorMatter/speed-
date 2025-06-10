import { useState, useEffect, useCallback } from 'react';
import { SpeedAIOrchestrator } from '../ai/agents';

interface AIFeedback {
  type: 'visual' | 'pricing' | 'fields' | 'general';
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  suggestions?: string[];
  timestamp: string;
}

interface UseAIAssistantProps {
  canvasData?: any;
  productData?: any;
  templateType?: string;
  enableRealTimeAnalysis?: boolean;
}

export const useAIAssistant = ({
  canvasData,
  productData,
  templateType = 'ladrillazo',
  enableRealTimeAnalysis = true
}: UseAIAssistantProps) => {
  const [orchestrator] = useState(() => new SpeedAIOrchestrator());
  const [feedback, setFeedback] = useState<AIFeedback[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  // Análisis en tiempo real cuando cambian los datos
  const analyzeCurrentState = useCallback(async () => {
    if (!canvasData || !productData || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const analysis = await orchestrator.processCanvasChange(
        canvasData,
        productData,
        templateType
      );

      if (analysis) {
        setLastAnalysis(analysis);
        
        // Convertir análisis a feedback estructurado
        const newFeedback: AIFeedback[] = [];
        
        if (analysis.visual) {
          newFeedback.push({
            type: 'visual',
            message: analysis.visual,
            severity: 'info',
            timestamp: analysis.timestamp
          });
        }
        
        if (analysis.pricing) {
          newFeedback.push({
            type: 'pricing',
            message: analysis.pricing,
            severity: 'warning',
            timestamp: analysis.timestamp
          });
        }
        
        if (analysis.fields && !analysis.fields.valid) {
          newFeedback.push({
            type: 'fields',
            message: `Campos faltantes: ${analysis.fields.missingFields.join(', ')}`,
            severity: 'error',
            suggestions: analysis.fields.errors,
            timestamp: analysis.timestamp
          });
        }

        setFeedback(newFeedback);
      }
    } catch (error) {
      console.error('Error en análisis IA:', error);
      setFeedback([{
        type: 'general',
        message: 'Error en el análisis automático. Intenta nuevamente.',
        severity: 'error',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsAnalyzing(false);
    }
  }, [canvasData, productData, templateType, orchestrator, isAnalyzing]);

  // Análisis manual triggered por el usuario
  const requestAnalysis = useCallback(async () => {
    await analyzeCurrentState();
  }, [analyzeCurrentState]);

  // Auto-análisis con debounce
  useEffect(() => {
    if (!enableRealTimeAnalysis) return;

    const debounceTimer = setTimeout(() => {
      analyzeCurrentState();
    }, 2000); // 2 segundos de debounce

    return () => clearTimeout(debounceTimer);
  }, [canvasData, productData, enableRealTimeAnalysis, analyzeCurrentState]);

  // Funciones de utilidad
  const clearFeedback = useCallback(() => {
    setFeedback([]);
  }, []);

  const dismissFeedback = useCallback((index: number) => {
    setFeedback(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getFeedbackByType = useCallback((type: AIFeedback['type']) => {
    return feedback.filter(f => f.type === type);
  }, [feedback]);

  const hasErrors = feedback.some(f => f.severity === 'error');
  const hasWarnings = feedback.some(f => f.severity === 'warning');
  const hasInfo = feedback.some(f => f.severity === 'info');

  return {
    // Estado
    feedback,
    isAnalyzing,
    lastAnalysis,
    
    // Contadores
    hasErrors,
    hasWarnings,
    hasInfo,
    feedbackCount: feedback.length,
    
    // Acciones
    requestAnalysis,
    clearFeedback,
    dismissFeedback,
    getFeedbackByType,
    
    // Configuración
    enableRealTimeAnalysis
  };
};

// Hook adicional para sugerencias contextuales
export const useAISuggestions = (currentField: string, productData: any) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const getSuggestions = useCallback(async (fieldName: string, context: any) => {
    setIsLoadingSuggestions(true);
    
    // Simulación de sugerencias inteligentes
    const suggestionMap: Record<string, string[]> = {
      name: [
        `${context.category || 'Producto'} Premium`,
        `${context.brand || 'Marca'} Especial`,
        'Oferta Limitada'
      ],
      price: [
        '$' + Math.round((context.basePrice || 100) * 0.9),
        '$' + Math.round((context.basePrice || 100) * 0.85),
        '$' + Math.round((context.basePrice || 100) * 0.8)
      ],
      description: [
        'Calidad premium garantizada',
        'Ideal para toda la familia',
        'Aprovecha esta oportunidad única'
      ]
    };

    setTimeout(() => {
      setSuggestions(suggestionMap[fieldName] || []);
      setIsLoadingSuggestions(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (currentField && productData) {
      getSuggestions(currentField, productData);
    }
  }, [currentField, productData, getSuggestions]);

  return {
    suggestions,
    isLoadingSuggestions,
    getSuggestions
  };
}; 