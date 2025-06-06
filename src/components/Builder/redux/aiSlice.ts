import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';
import { CartelElement } from './builderSlice';

// ====================================
// TIPOS Y INTERFACES
// ====================================

export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'image' | 'layout' | 'color' | 'multimodal';
  provider: 'openai' | 'anthropic' | 'local' | 'custom';
  version: string;
  capabilities: string[];
  isActive: boolean;
  cost: {
    input: number; // costo por token/request
    output: number;
    currency: 'USD' | 'credits';
  };
  limits: {
    requestsPerHour: number;
    tokensPerRequest: number;
  };
}

export interface AIPrompt {
  id: string;
  name: string;
  description: string;
  category: 'generation' | 'optimization' | 'analysis' | 'translation';
  type: 'template' | 'content' | 'layout' | 'style';
  template: string;
  variables: {
    name: string;
    type: 'text' | 'number' | 'select' | 'boolean';
    required: boolean;
    options?: string[];
    defaultValue?: any;
  }[];
  modelId: string;
  isPublic: boolean;
  usageCount: number;
  rating: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIGeneration {
  id: string;
  type: 'template' | 'content' | 'image' | 'optimization' | 'translation';
  status: 'pending' | 'processing' | 'completed' | 'error' | 'cancelled';
  prompt: string;
  parameters: Record<string, any>;
  modelId: string;
  input: {
    text?: string;
    image?: string;
    elements?: CartelElement[];
    context?: Record<string, any>;
  };
  output: {
    text?: string;
    image?: string;
    elements?: CartelElement[];
    suggestions?: AISuggestion[];
    metadata?: Record<string, any>;
  };
  metadata: {
    tokensUsed: number;
    processingTime: number;
    cost: number;
    quality: number;
  };
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export interface AISuggestion {
  id: string;
  type: 'layout' | 'color' | 'typography' | 'content' | 'element' | 'optimization';
  title: string;
  description: string;
  confidence: number; // 0-1
  impact: 'low' | 'medium' | 'high';
  category: string;
  before?: any;
  after?: any;
  reasoning: string;
  action: {
    type: 'replace' | 'modify' | 'add' | 'remove' | 'rearrange';
    target?: string;
    data?: any;
  };
  isApplied: boolean;
  appliedAt?: number;
}

export interface AIWorkflow {
  id: string;
  name: string;
  description: string;
  steps: AIWorkflowStep[];
  triggers: {
    type: 'manual' | 'schedule' | 'event' | 'webhook';
    config: Record<string, any>;
  }[];
  status: 'active' | 'inactive' | 'error';
  lastRun?: number;
  nextRun?: number;
  runCount: number;
  successRate: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIWorkflowStep {
  id: string;
  name: string;
  type: 'ai_generation' | 'data_fetch' | 'transform' | 'validate' | 'export' | 'notify';
  config: Record<string, any>;
  order: number;
  isEnabled: boolean;
  dependencies: string[];
}

export interface SmartTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  industrySpecific: string[];
  productTypes: string[];
  aiRules: {
    contentGeneration: {
      enabled: boolean;
      prompts: string[];
      fallbacks: string[];
    };
    layoutOptimization: {
      enabled: boolean;
      constraints: Record<string, any>;
      preferences: Record<string, any>;
    };
    colorHarmony: {
      enabled: boolean;
      scheme: 'monochromatic' | 'complementary' | 'triadic' | 'analogous' | 'custom';
      baseColor?: string;
    };
    responsiveAdaptation: {
      enabled: boolean;
      breakpoints: { name: string; width: number; height: number }[];
      adaptationRules: Record<string, any>;
    };
  };
  elements: CartelElement[];
  variables: {
    name: string;
    type: 'product' | 'price' | 'text' | 'image' | 'color';
    mappings: { elementId: string; property: string }[];
  }[];
  performance: {
    conversionRate: number;
    engagementScore: number;
    usageCount: number;
  };
  createdAt: number;
  updatedAt: number;
}

export interface AIAnalytics {
  usage: {
    totalGenerations: number;
    successRate: number;
    averageProcessingTime: number;
    tokensUsed: number;
    costSpent: number;
  };
  models: {
    modelId: string;
    usage: number;
    performance: number;
    avgCost: number;
  }[];
  trends: {
    date: string;
    generations: number;
    successRate: number;
    avgTime: number;
  }[];
  topPrompts: {
    promptId: string;
    usage: number;
    rating: number;
  }[];
  recommendations: {
    type: 'model' | 'prompt' | 'workflow' | 'optimization';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }[];
}

export interface AIState {
  // Modelos disponibles
  models: AIModel[];
  selectedModel: string | null;
  
  // Prompts y templates
  prompts: AIPrompt[];
  customPrompts: AIPrompt[];
  smartTemplates: SmartTemplate[];
  
  // Generaciones activas
  generations: AIGeneration[];
  currentGeneration: AIGeneration | null;
  
  // Sugerencias
  suggestions: AISuggestion[];
  suggestionHistory: AISuggestion[];
  autoApplySettings: {
    enabled: boolean;
    confidenceThreshold: number;
    approvedTypes: string[];
  };
  
  // Workflows
  workflows: AIWorkflow[];
  activeWorkflows: string[];
  
  // Configuración
  settings: {
    enableAI: boolean;
    autoGenerateContent: boolean;
    autoOptimizeLayout: boolean;
    autoSuggestImprovements: boolean;
    enableSmartTemplates: boolean;
    language: string;
    industry: string;
    brandVoice: 'professional' | 'friendly' | 'energetic' | 'elegant' | 'custom';
    customVoice?: string;
  };
  
  // Estado
  isLoading: boolean;
  error: string | null;
  
  // Analytics
  analytics: AIAnalytics;
  
  // Filtros
  filters: {
    generationType: string | null;
    status: AIGeneration['status'] | 'all';
    dateRange: {
      start: number | null;
      end: number | null;
    };
  };
}

// ====================================
// ASYNC THUNKS
// ====================================

export const generateContent = createAsyncThunk(
  'ai/generateContent',
  async (params: {
    type: 'template' | 'content' | 'image' | 'optimization';
    prompt: string;
    context?: Record<string, any>;
    modelId?: string;
    elements?: CartelElement[];
  }) => {
    const generationId = nanoid();
    
    // Simular llamada a API de IA
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    const generation: AIGeneration = {
      id: generationId,
      type: params.type,
      status: 'completed',
      prompt: params.prompt,
      parameters: params.context || {},
      modelId: params.modelId || 'gpt-4',
      input: {
        text: params.prompt,
        elements: params.elements,
        context: params.context
      },
      output: await generateMockOutput(params),
      metadata: {
        tokensUsed: Math.floor(Math.random() * 1000) + 500,
        processingTime: Math.floor(Math.random() * 5000) + 1000,
        cost: Math.random() * 0.1,
        quality: 0.7 + Math.random() * 0.3
      },
      createdAt: Date.now(),
      completedAt: Date.now()
    };
    
    return generation;
  }
);

export const analyzeTemplate = createAsyncThunk(
  'ai/analyzeTemplate',
  async (params: {
    elements: CartelElement[];
    context?: Record<string, any>;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generar sugerencias mock
    const suggestions: AISuggestion[] = [
      {
        id: nanoid(),
        type: 'layout',
        title: 'Mejorar jerarquía visual',
        description: 'El precio podría ser más prominente para aumentar la conversión',
        confidence: 0.87,
        impact: 'high',
        category: 'conversion',
        reasoning: 'Análisis de patrones de eye-tracking sugiere que precios más grandes aumentan la atención en un 34%',
        action: {
          type: 'modify',
          target: 'precio-element',
          data: { fontSize: 48, fontWeight: 'bold' }
        },
        isApplied: false
      },
      {
        id: nanoid(),
        type: 'color',
        title: 'Optimizar contraste',
        description: 'Algunos textos no cumplen con estándares de accesibilidad',
        confidence: 0.92,
        impact: 'medium',
        category: 'accessibility',
        reasoning: 'WCAG 2.1 requiere un contraste mínimo de 4.5:1 para texto normal',
        action: {
          type: 'modify',
          target: 'texto-secondary',
          data: { color: '#2D3748' }
        },
        isApplied: false
      }
    ];
    
    return suggestions;
  }
);

export const createSmartTemplate = createAsyncThunk(
  'ai/createSmartTemplate',
  async (params: {
    name: string;
    description: string;
    category: string;
    industrySpecific: string[];
    productData: Record<string, any>;
    preferences?: Record<string, any>;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const smartTemplate: SmartTemplate = {
      id: nanoid(),
      name: params.name,
      description: params.description,
      category: params.category,
      industrySpecific: params.industrySpecific,
      productTypes: ['alimentacion', 'bebidas'],
      aiRules: {
        contentGeneration: {
          enabled: true,
          prompts: [
            'Generar texto promocional atractivo para {productType}',
            'Crear eslogan pegadizo para {productName}'
          ],
          fallbacks: ['¡Oferta especial!', 'No te lo pierdas']
        },
        layoutOptimization: {
          enabled: true,
          constraints: { maxElements: 8, minFontSize: 12 },
          preferences: { emphasizePrice: true, highlightDiscount: true }
        },
        colorHarmony: {
          enabled: true,
          scheme: 'complementary',
          baseColor: '#E53E3E'
        },
        responsiveAdaptation: {
          enabled: true,
          breakpoints: [
            { name: 'mobile', width: 320, height: 568 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'desktop', width: 1200, height: 1600 }
          ],
          adaptationRules: {
            mobile: { fontSize: 0.8, spacing: 0.7 },
            tablet: { fontSize: 0.9, spacing: 0.85 },
            desktop: { fontSize: 1.0, spacing: 1.0 }
          }
        }
      },
      elements: await generateSmartElements(params),
      variables: [
        { name: 'productName', type: 'product', mappings: [{ elementId: 'product-title', property: 'content.nombre' }] },
        { name: 'price', type: 'price', mappings: [{ elementId: 'price-main', property: 'content.precio' }] },
        { name: 'discount', type: 'text', mappings: [{ elementId: 'discount-badge', property: 'content.porcentaje' }] }
      ],
      performance: {
        conversionRate: 0,
        engagementScore: 0,
        usageCount: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    return smartTemplate;
  }
);

export const runAIWorkflow = createAsyncThunk(
  'ai/runAIWorkflow',
  async (workflowId: string, { getState }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular ejecución de workflow
    const result = {
      workflowId,
      status: 'completed' as const,
      output: {
        generatedElements: 3,
        optimizedElements: 5,
        suggestionsCreated: 7,
        processingTime: 1847,
        quality: 0.89
      },
      executedAt: Date.now()
    };
    
    return result;
  }
);

// ====================================
// FUNCIONES AUXILIARES
// ====================================

async function generateMockOutput(params: any): Promise<AIGeneration['output']> {
  switch (params.type) {
    case 'template':
      return {
        elements: [
          {
            id: nanoid(),
            type: 'precio',
            content: { precio: 15.99, moneda: '$', decimales: 2 },
            position: { x: 50, y: 100 },
            size: { width: 120, height: 60 },
            style: { fontSize: 24, fontWeight: 'bold', color: '#000' },
            zIndex: 1,
            locked: false,
            visible: true,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        ] as CartelElement[],
        metadata: { templateType: 'oferta', confidence: 0.89 }
      };
      
    case 'content':
      return {
        text: '¡Oferta imperdible! Aprovecha estos precios únicos por tiempo limitado',
        metadata: { tone: 'energetic', sentiment: 'positive' }
      };
      
    case 'image':
      return {
        image: '/ai-generated/mock-image-' + nanoid() + '.jpg',
        metadata: { style: 'modern', colors: ['#E53E3E', '#FFF'] }
      };
      
    case 'optimization':
      return {
        suggestions: [
          {
            id: nanoid(),
            type: 'layout',
            title: 'Reorganizar elementos',
            description: 'Mejorar flujo visual de izquierda a derecha',
            confidence: 0.84,
            impact: 'medium',
            category: 'layout',
            reasoning: 'Análisis de heatmap sugiere mejor distribución',
            action: { type: 'rearrange', data: {} },
            isApplied: false
          }
        ]
      };
      
    default:
      return {};
  }
}

async function generateSmartElements(params: any): Promise<CartelElement[]> {
  // Generar elementos inteligentes basados en el contexto
  return [
    {
      id: nanoid(),
      type: 'producto',
      content: { nombre: params.productData.name || 'Producto', marca: '', descripcion: '', categoria: '' },
      position: { x: 20, y: 20 },
      size: { width: 200, height: 60 },
      style: { fontSize: 24, fontWeight: 'bold' },
      zIndex: 1,
      locked: false,
      visible: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ] as CartelElement[];
}

// ====================================
// ESTADO INICIAL
// ====================================

const initialState: AIState = {
  models: [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Modelo de lenguaje avanzado para generación de contenido',
      type: 'text',
      provider: 'openai',
      version: '4.0',
      capabilities: ['text-generation', 'translation', 'analysis'],
      isActive: true,
      cost: { input: 0.03, output: 0.06, currency: 'USD' },
      limits: { requestsPerHour: 100, tokensPerRequest: 8000 }
    },
    {
      id: 'dall-e-3',
      name: 'DALL-E 3',
      description: 'Generación de imágenes con IA',
      type: 'image',
      provider: 'openai',
      version: '3.0',
      capabilities: ['image-generation', 'image-editing'],
      isActive: true,
      cost: { input: 0.04, output: 0, currency: 'USD' },
      limits: { requestsPerHour: 50, tokensPerRequest: 1000 }
    },
    {
      id: 'layout-optimizer',
      name: 'Layout Optimizer',
      description: 'IA especializada en optimización de diseño',
      type: 'layout',
      provider: 'custom',
      version: '1.2',
      capabilities: ['layout-optimization', 'responsive-design'],
      isActive: true,
      cost: { input: 0.01, output: 0.02, currency: 'credits' },
      limits: { requestsPerHour: 200, tokensPerRequest: 2000 }
    }
  ],
  selectedModel: 'gpt-4',
  
  prompts: [],
  customPrompts: [],
  smartTemplates: [],
  
  generations: [],
  currentGeneration: null,
  
  suggestions: [],
  suggestionHistory: [],
  autoApplySettings: {
    enabled: false,
    confidenceThreshold: 0.8,
    approvedTypes: ['color', 'typography']
  },
  
  workflows: [],
  activeWorkflows: [],
  
  settings: {
    enableAI: true,
    autoGenerateContent: false,
    autoOptimizeLayout: false,
    autoSuggestImprovements: true,
    enableSmartTemplates: true,
    language: 'es',
    industry: 'retail',
    brandVoice: 'friendly'
  },
  
  isLoading: false,
  error: null,
  
  analytics: {
    usage: {
      totalGenerations: 0,
      successRate: 0,
      averageProcessingTime: 0,
      tokensUsed: 0,
      costSpent: 0
    },
    models: [],
    trends: [],
    topPrompts: [],
    recommendations: []
  },
  
  filters: {
    generationType: null,
    status: 'all',
    dateRange: { start: null, end: null }
  }
};

// ====================================
// SLICE
// ====================================

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    // Configuración
    updateSettings: (state, action: PayloadAction<Partial<AIState['settings']>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    
    setSelectedModel: (state, action: PayloadAction<string>) => {
      state.selectedModel = action.payload;
    },
    
    // Sugerencias
    applySuggestion: (state, action: PayloadAction<string>) => {
      const suggestion = state.suggestions.find(s => s.id === action.payload);
      if (suggestion && !suggestion.isApplied) {
        suggestion.isApplied = true;
        suggestion.appliedAt = Date.now();
        
        // Mover a historial
        state.suggestionHistory.unshift(suggestion);
        state.suggestions = state.suggestions.filter(s => s.id !== action.payload);
      }
    },
    
    dismissSuggestion: (state, action: PayloadAction<string>) => {
      state.suggestions = state.suggestions.filter(s => s.id !== action.payload);
    },
    
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
    
    updateAutoApplySettings: (state, action: PayloadAction<Partial<AIState['autoApplySettings']>>) => {
      state.autoApplySettings = { ...state.autoApplySettings, ...action.payload };
    },
    
    // Prompts
    addCustomPrompt: (state, action: PayloadAction<Omit<AIPrompt, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newPrompt: AIPrompt = {
        ...action.payload,
        id: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      state.customPrompts.push(newPrompt);
    },
    
    updateCustomPrompt: (state, action: PayloadAction<{ id: string; updates: Partial<AIPrompt> }>) => {
      const { id, updates } = action.payload;
      const prompt = state.customPrompts.find(p => p.id === id);
      if (prompt) {
        Object.assign(prompt, updates, { updatedAt: Date.now() });
      }
    },
    
    deleteCustomPrompt: (state, action: PayloadAction<string>) => {
      state.customPrompts = state.customPrompts.filter(p => p.id !== action.payload);
    },
    
    // Workflows
    createWorkflow: (state, action: PayloadAction<Omit<AIWorkflow, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newWorkflow: AIWorkflow = {
        ...action.payload,
        id: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      state.workflows.push(newWorkflow);
    },
    
    updateWorkflow: (state, action: PayloadAction<{ id: string; updates: Partial<AIWorkflow> }>) => {
      const { id, updates } = action.payload;
      const workflow = state.workflows.find(w => w.id === id);
      if (workflow) {
        Object.assign(workflow, updates, { updatedAt: Date.now() });
      }
    },
    
    toggleWorkflow: (state, action: PayloadAction<string>) => {
      const workflowId = action.payload;
      const workflow = state.workflows.find(w => w.id === workflowId);
      if (workflow) {
        workflow.status = workflow.status === 'active' ? 'inactive' : 'active';
        
        if (workflow.status === 'active') {
          if (!state.activeWorkflows.includes(workflowId)) {
            state.activeWorkflows.push(workflowId);
          }
        } else {
          state.activeWorkflows = state.activeWorkflows.filter(id => id !== workflowId);
        }
      }
    },
    
    // Smart Templates
    updateSmartTemplate: (state, action: PayloadAction<{ id: string; updates: Partial<SmartTemplate> }>) => {
      const { id, updates } = action.payload;
      const template = state.smartTemplates.find(t => t.id === id);
      if (template) {
        Object.assign(template, updates, { updatedAt: Date.now() });
      }
    },
    
    incrementTemplateUsage: (state, action: PayloadAction<string>) => {
      const template = state.smartTemplates.find(t => t.id === action.payload);
      if (template) {
        template.performance.usageCount += 1;
      }
    },
    
    // Filtros
    setFilters: (state, action: PayloadAction<Partial<AIState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearFilters: (state) => {
      state.filters = {
        generationType: null,
        status: 'all',
        dateRange: { start: null, end: null }
      };
    },
    
    // Generaciones
    cancelGeneration: (state, action: PayloadAction<string>) => {
      const generation = state.generations.find(g => g.id === action.payload);
      if (generation && generation.status === 'processing') {
        generation.status = 'cancelled';
        generation.completedAt = Date.now();
      }
    },
    
    removeGeneration: (state, action: PayloadAction<string>) => {
      state.generations = state.generations.filter(g => g.id !== action.payload);
    },
    
    clearGenerationHistory: (state) => {
      state.generations = state.generations.filter(g => 
        g.status === 'processing' || g.status === 'pending'
      );
    },
    
    // Analytics
    updateAnalytics: (state, action: PayloadAction<Partial<AIAnalytics>>) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    
    incrementUsageStats: (state, action: PayloadAction<{ 
      tokensUsed: number; 
      cost: number; 
      processingTime: number; 
      success: boolean;
      modelId: string;
    }>) => {
      const { tokensUsed, cost, processingTime, success, modelId } = action.payload;
      
      // Actualizar estadísticas generales
      state.analytics.usage.totalGenerations += 1;
      state.analytics.usage.tokensUsed += tokensUsed;
      state.analytics.usage.costSpent += cost;
      
      // Calcular nuevos promedios
      const total = state.analytics.usage.totalGenerations;
      const successCount = success ? 1 : 0;
      state.analytics.usage.successRate = 
        ((state.analytics.usage.successRate * (total - 1)) + successCount) / total;
      state.analytics.usage.averageProcessingTime = 
        ((state.analytics.usage.averageProcessingTime * (total - 1)) + processingTime) / total;
      
      // Actualizar estadísticas por modelo
      let modelStats = state.analytics.models.find(m => m.modelId === modelId);
      if (!modelStats) {
        modelStats = { modelId, usage: 0, performance: 0, avgCost: 0 };
        state.analytics.models.push(modelStats);
      }
      
      modelStats.usage += 1;
      modelStats.avgCost = ((modelStats.avgCost * (modelStats.usage - 1)) + cost) / modelStats.usage;
      modelStats.performance = success ? 
        ((modelStats.performance * (modelStats.usage - 1)) + 1) / modelStats.usage :
        (modelStats.performance * (modelStats.usage - 1)) / modelStats.usage;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Generate content
      .addCase(generateContent.pending, (state, action) => {
        const pendingGeneration: AIGeneration = {
          id: action.meta.requestId,
          type: action.meta.arg.type,
          status: 'processing',
          prompt: action.meta.arg.prompt,
          parameters: action.meta.arg.context || {},
          modelId: action.meta.arg.modelId || state.selectedModel || 'gpt-4',
          input: {
            text: action.meta.arg.prompt,
            elements: action.meta.arg.elements,
            context: action.meta.arg.context
          },
          output: {},
          metadata: { tokensUsed: 0, processingTime: 0, cost: 0, quality: 0 },
          createdAt: Date.now()
        };
        
        state.generations.unshift(pendingGeneration);
        state.currentGeneration = pendingGeneration;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateContent.fulfilled, (state, action) => {
        const generation = state.generations.find(g => g.id === action.payload.id);
        if (generation) {
          Object.assign(generation, action.payload);
        } else {
          state.generations.unshift(action.payload);
        }
        
        state.currentGeneration = action.payload;
        state.isLoading = false;
        
        // Actualizar analytics
        aiSlice.caseReducers.incrementUsageStats(state, {
          type: 'ai/incrementUsageStats',
          payload: {
            tokensUsed: action.payload.metadata.tokensUsed,
            cost: action.payload.metadata.cost,
            processingTime: action.payload.metadata.processingTime,
            success: action.payload.status === 'completed',
            modelId: action.payload.modelId
          }
        });
      })
      .addCase(generateContent.rejected, (state, action) => {
        const generation = state.generations.find(g => g.id === action.meta.requestId);
        if (generation) {
          generation.status = 'error';
          generation.error = action.error.message || 'Error en la generación';
          generation.completedAt = Date.now();
        }
        
        state.isLoading = false;
        state.error = action.error.message || 'Error en la generación de contenido';
      })
      
      // Analyze template
      .addCase(analyzeTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(analyzeTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suggestions = [...action.payload, ...state.suggestions];
        
        // Auto-aplicar sugerencias si está habilitado
        if (state.autoApplySettings.enabled) {
          action.payload.forEach(suggestion => {
            if (suggestion.confidence >= state.autoApplySettings.confidenceThreshold &&
                state.autoApplySettings.approvedTypes.includes(suggestion.type)) {
              aiSlice.caseReducers.applySuggestion(state, {
                type: 'ai/applySuggestion',
                payload: suggestion.id
              });
            }
          });
        }
      })
      .addCase(analyzeTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error en el análisis';
      })
      
      // Create smart template
      .addCase(createSmartTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSmartTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.smartTemplates.push(action.payload);
      })
      .addCase(createSmartTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al crear smart template';
      })
      
      // Run AI workflow
      .addCase(runAIWorkflow.fulfilled, (state, action) => {
        const workflow = state.workflows.find(w => w.id === action.payload.workflowId);
        if (workflow) {
          workflow.lastRun = action.payload.executedAt;
          workflow.runCount += 1;
          workflow.successRate = ((workflow.successRate * (workflow.runCount - 1)) + 1) / workflow.runCount;
        }
      });
  }
});

// ====================================
// SELECTORES
// ====================================

export const selectAIModels = (state: { ai: AIState }) => state.ai.models;
export const selectSelectedModel = (state: { ai: AIState }) => state.ai.selectedModel;
export const selectAISettings = (state: { ai: AIState }) => state.ai.settings;
export const selectGenerations = (state: { ai: AIState }) => state.ai.generations;
export const selectCurrentGeneration = (state: { ai: AIState }) => state.ai.currentGeneration;
export const selectSuggestions = (state: { ai: AIState }) => state.ai.suggestions;
export const selectSmartTemplates = (state: { ai: AIState }) => state.ai.smartTemplates;
export const selectAIWorkflows = (state: { ai: AIState }) => state.ai.workflows;
export const selectAIAnalytics = (state: { ai: AIState }) => state.ai.analytics;

export const selectFilteredGenerations = (state: { ai: AIState }) => {
  let filtered = state.ai.generations;
  const filters = state.ai.filters;
  
  if (filters.generationType) {
    filtered = filtered.filter(g => g.type === filters.generationType);
  }
  
  if (filters.status !== 'all') {
    filtered = filtered.filter(g => g.status === filters.status);
  }
  
  if (filters.dateRange.start) {
    filtered = filtered.filter(g => g.createdAt >= filters.dateRange.start!);
  }
  
  if (filters.dateRange.end) {
    filtered = filtered.filter(g => g.createdAt <= filters.dateRange.end!);
  }
  
  return filtered;
};

export const selectActiveWorkflows = (state: { ai: AIState }) =>
  state.ai.workflows.filter(w => state.ai.activeWorkflows.includes(w.id));

export const selectIsAIEnabled = (state: { ai: AIState }) => state.ai.settings.enableAI;

// ====================================
// ACTIONS
// ====================================

export const {
  updateSettings,
  setSelectedModel,
  applySuggestion,
  dismissSuggestion,
  clearSuggestions,
  updateAutoApplySettings,
  addCustomPrompt,
  updateCustomPrompt,
  deleteCustomPrompt,
  createWorkflow,
  updateWorkflow,
  toggleWorkflow,
  updateSmartTemplate,
  incrementTemplateUsage,
  setFilters,
  clearFilters,
  cancelGeneration,
  removeGeneration,
  clearGenerationHistory,
  updateAnalytics,
  incrementUsageStats
} = aiSlice.actions;

export default aiSlice.reducer; 