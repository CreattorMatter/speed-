import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';

// ====================================
// TIPOS Y INTERFACES
// ====================================

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TemplateTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  usageCount: number;
  createdAt: number;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  categoryId: string;
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
  isTemplate: boolean;
  downloadCount: number;
  rating: number;
  ratingCount: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  dimensions: {
    width: number;
    height: number;
    format: string;
  };
  createdAt: number;
  updatedAt: number;
  lastUsed?: number;
  version: string;
  comments?: TemplateComment[];
}

export interface TemplateComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating?: number;
  createdAt: number;
  replies?: TemplateComment[];
}

export interface TemplateData {
  metadata: TemplateMetadata;
  elements: any[];
  canvasConfig: any;
  assets: string[];
}

export interface TemplateLibraryState {
  categories: TemplateCategory[];
  tags: TemplateTag[];
  templates: TemplateData[];
  favorites: string[];
  recentlyUsed: string[];
  searchQuery: string;
  selectedCategory: string | null;
  selectedTags: string[];
  sortBy: 'name' | 'date' | 'rating' | 'downloads' | 'recent';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'detailed';
  isLoading: boolean;
  error: string | null;
  currentTemplate: TemplateData | null;
  templateHistory: any[];
  analytics: {
    totalTemplates: number;
    totalDownloads: number;
    averageRating: number;
    popularCategories: { categoryId: string; count: number }[];
    trendingTags: { tagId: string; count: number }[];
  };
}

// ====================================
// ASYNC THUNKS
// ====================================

export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (filters?: {
    category?: string;
    tags?: string[];
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data con templates predefinidos para supermercado
    return {
      templates: [
        {
          metadata: {
            id: nanoid(),
            name: 'Oferta de Carnes',
            description: 'Template para promociones de carnicería',
            thumbnail: '/templates/carne-oferta.jpg',
            categoryId: 'alimentacion',
            tags: ['carnes', 'descuento', 'promocion'],
            isPublic: true,
            isFavorite: false,
            isTemplate: true,
            downloadCount: 245,
            rating: 4.7,
            ratingCount: 23,
            author: { id: '1', name: 'Diseñador Pro', avatar: '/avatars/user1.jpg' },
            dimensions: { width: 1000, height: 1400, format: 'A4' },
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
            version: '1.0'
          },
          elements: [],
          canvasConfig: {},
          assets: []
        }
      ],
      total: 50,
      hasMore: true
    };
  }
);

export const saveTemplate = createAsyncThunk(
  'templates/saveTemplate',
  async (templateData: Omit<TemplateData, 'metadata'> & { 
    name: string; 
    description: string; 
    categoryId: string; 
    tags: string[];
    isPublic?: boolean;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTemplate: TemplateData = {
      metadata: {
        id: nanoid(),
        name: templateData.name,
        description: templateData.description,
        thumbnail: await generateThumbnail(templateData.elements),
        categoryId: templateData.categoryId,
        tags: templateData.tags,
        isPublic: templateData.isPublic || false,
        isFavorite: false,
        isTemplate: true,
        downloadCount: 0,
        rating: 0,
        ratingCount: 0,
        author: { id: 'current-user', name: 'Usuario Actual' },
        dimensions: { width: 1000, height: 1400, format: 'A4' },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: '1.0'
      },
      elements: templateData.elements,
      canvasConfig: templateData.canvasConfig,
      assets: templateData.assets
    };
    
    return newTemplate;
  }
);

// Función auxiliar para generar thumbnail
async function generateThumbnail(elements: any[]): Promise<string> {
  // En una implementación real, esto generaría un thumbnail real
  return `/thumbnails/${nanoid()}.jpg`;
}

// ====================================
// ESTADO INICIAL
// ====================================

const initialState: TemplateLibraryState = {
  categories: [
    {
      id: 'alimentacion',
      name: 'Alimentación',
      description: 'Templates para productos alimentarios',
      icon: '🍎',
      color: '#22C55E',
      order: 1,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      description: 'Templates para bebidas y líquidos',
      icon: '🥤',
      color: '#3B82F6',
      order: 2,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'limpieza',
      name: 'Limpieza',
      description: 'Templates para productos de limpieza',
      icon: '🧽',
      color: '#8B5CF6',
      order: 3,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'electrodomesticos',
      name: 'Electrodomésticos',
      description: 'Templates para electrodomésticos',
      icon: '📱',
      color: '#F59E0B',
      order: 4,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'general',
      name: 'General',
      description: 'Templates de uso general',
      icon: '📋',
      color: '#6B7280',
      order: 5,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  tags: [
    { id: 'descuento', name: 'Descuento', color: '#DC2626', usageCount: 45, createdAt: Date.now() },
    { id: 'oferta', name: 'Oferta', color: '#EF4444', usageCount: 38, createdAt: Date.now() },
    { id: 'promocion', name: 'Promoción', color: '#F97316', usageCount: 32, createdAt: Date.now() },
    { id: 'nuevo', name: 'Nuevo', color: '#10B981', usageCount: 28, createdAt: Date.now() },
    { id: 'temporada', name: 'Temporada', color: '#8B5CF6', usageCount: 22, createdAt: Date.now() },
    { id: 'premium', name: 'Premium', color: '#D946EF', usageCount: 15, createdAt: Date.now() }
  ],
  templates: [],
  favorites: [],
  recentlyUsed: [],
  searchQuery: '',
  selectedCategory: null,
  selectedTags: [],
  sortBy: 'date',
  sortOrder: 'desc',
  viewMode: 'grid',
  isLoading: false,
  error: null,
  currentTemplate: null,
  templateHistory: [],
  analytics: {
    totalTemplates: 0,
    totalDownloads: 0,
    averageRating: 0,
    popularCategories: [],
    trendingTags: []
  }
};

// ====================================
// SLICE
// ====================================

const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    // Búsqueda y filtros
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    
    toggleTag: (state, action: PayloadAction<string>) => {
      const tagId = action.payload;
      const index = state.selectedTags.indexOf(tagId);
      if (index > -1) {
        state.selectedTags.splice(index, 1);
      } else {
        state.selectedTags.push(tagId);
      }
    },
    
    setSortBy: (state, action: PayloadAction<TemplateLibraryState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<TemplateLibraryState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<TemplateLibraryState['viewMode']>) => {
      state.viewMode = action.payload;
    },
    
    // Favoritos
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const templateId = action.payload;
      const index = state.favorites.indexOf(templateId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(templateId);
      }
      
      // Actualizar en el template también
      const template = state.templates.find(t => t.metadata.id === templateId);
      if (template) {
        template.metadata.isFavorite = !template.metadata.isFavorite;
      }
    },
    
    // Historial de uso
    addToRecentlyUsed: (state, action: PayloadAction<string>) => {
      const templateId = action.payload;
      state.recentlyUsed = state.recentlyUsed.filter(id => id !== templateId);
      state.recentlyUsed.unshift(templateId);
      state.recentlyUsed = state.recentlyUsed.slice(0, 10); // Mantener solo los últimos 10
      
      // Actualizar lastUsed en el template
      const template = state.templates.find(t => t.metadata.id === templateId);
      if (template) {
        template.metadata.lastUsed = Date.now();
      }
    },
    
    // Gestión de categorías
    addCategory: (state, action: PayloadAction<Omit<TemplateCategory, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const newCategory: TemplateCategory = {
        ...action.payload,
        id: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      state.categories.push(newCategory);
    },
    
    updateCategory: (state, action: PayloadAction<{ id: string; updates: Partial<TemplateCategory> }>) => {
      const { id, updates } = action.payload;
      const category = state.categories.find(c => c.id === id);
      if (category) {
        Object.assign(category, updates, { updatedAt: Date.now() });
      }
    },
    
    deleteCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    
    // Gestión de tags
    addTag: (state, action: PayloadAction<Omit<TemplateTag, 'id' | 'usageCount' | 'createdAt'>>) => {
      const newTag: TemplateTag = {
        ...action.payload,
        id: nanoid(),
        usageCount: 0,
        createdAt: Date.now()
      };
      state.tags.push(newTag);
    },
    
    updateTag: (state, action: PayloadAction<{ id: string; updates: Partial<TemplateTag> }>) => {
      const { id, updates } = action.payload;
      const tag = state.tags.find(t => t.id === id);
      if (tag) {
        Object.assign(tag, updates);
      }
    },
    
    deleteTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(t => t.id !== action.payload);
    },
    
    // Rating y comentarios
    rateTemplate: (state, action: PayloadAction<{ templateId: string; rating: number }>) => {
      const { templateId, rating } = action.payload;
      const template = state.templates.find(t => t.metadata.id === templateId);
      if (template) {
        const currentTotal = template.metadata.rating * template.metadata.ratingCount;
        template.metadata.ratingCount += 1;
        template.metadata.rating = (currentTotal + rating) / template.metadata.ratingCount;
      }
    },
    
    addComment: (state, action: PayloadAction<{ templateId: string; comment: Omit<TemplateComment, 'id' | 'createdAt'> }>) => {
      const { templateId, comment } = action.payload;
      const template = state.templates.find(t => t.metadata.id === templateId);
      if (template) {
        const newComment: TemplateComment = {
          ...comment,
          id: nanoid(),
          createdAt: Date.now()
        };
        template.metadata.comments = template.metadata.comments || [];
        template.metadata.comments.push(newComment);
      }
    },
    
    // Template actual
    setCurrentTemplate: (state, action: PayloadAction<TemplateData | null>) => {
      state.currentTemplate = action.payload;
    },
    
    // Limpiar filtros
    clearFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = null;
      state.selectedTags = [];
    },
    
    // Analytics
    updateAnalytics: (state, action: PayloadAction<Partial<TemplateLibraryState['analytics']>>) => {
      state.analytics = { ...state.analytics, ...action.payload };
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch templates
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload.templates;
        state.analytics.totalTemplates = action.payload.total;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar templates';
      })
      
      // Save template
      .addCase(saveTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates.unshift(action.payload);
        state.analytics.totalTemplates += 1;
      })
      .addCase(saveTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al guardar template';
      });
  }
});

// ====================================
// SELECTORES
// ====================================

export const selectTemplateCategories = (state: { templates: TemplateLibraryState }) => 
  state.templates.categories;

export const selectTemplateTags = (state: { templates: TemplateLibraryState }) => 
  state.templates.tags;

export const selectTemplates = (state: { templates: TemplateLibraryState }) => 
  state.templates.templates;

export const selectFilteredTemplates = (state: { templates: TemplateLibraryState }) => {
  let filtered = state.templates.templates;
  
  // Filtro por categoría
  if (state.templates.selectedCategory) {
    filtered = filtered.filter(t => t.metadata.categoryId === state.templates.selectedCategory);
  }
  
  // Filtro por tags
  if (state.templates.selectedTags.length > 0) {
    filtered = filtered.filter(t => 
      state.templates.selectedTags.every(tagId => t.metadata.tags.includes(tagId))
    );
  }
  
  // Filtro por búsqueda
  if (state.templates.searchQuery) {
    const query = state.templates.searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.metadata.name.toLowerCase().includes(query) ||
      t.metadata.description.toLowerCase().includes(query) ||
      t.metadata.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Ordenamiento
  filtered.sort((a, b) => {
    let aValue, bValue;
    
    switch (state.templates.sortBy) {
      case 'name':
        aValue = a.metadata.name;
        bValue = b.metadata.name;
        break;
      case 'date':
        aValue = a.metadata.updatedAt;
        bValue = b.metadata.updatedAt;
        break;
      case 'rating':
        aValue = a.metadata.rating;
        bValue = b.metadata.rating;
        break;
      case 'downloads':
        aValue = a.metadata.downloadCount;
        bValue = b.metadata.downloadCount;
        break;
      case 'recent':
        aValue = a.metadata.lastUsed || 0;
        bValue = b.metadata.lastUsed || 0;
        break;
      default:
        return 0;
    }
    
    if (state.templates.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return filtered;
};

export const selectFavoriteTemplates = (state: { templates: TemplateLibraryState }) =>
  state.templates.templates.filter(t => state.templates.favorites.includes(t.metadata.id));

export const selectRecentTemplates = (state: { templates: TemplateLibraryState }) =>
  state.templates.recentlyUsed
    .map(id => state.templates.templates.find(t => t.metadata.id === id))
    .filter(Boolean) as TemplateData[];

export const selectTemplateAnalytics = (state: { templates: TemplateLibraryState }) =>
  state.templates.analytics;

export const selectCurrentTemplate = (state: { templates: TemplateLibraryState }) =>
  state.templates.currentTemplate;

export const selectTemplatesLoading = (state: { templates: TemplateLibraryState }) =>
  state.templates.isLoading;

export const selectTemplatesError = (state: { templates: TemplateLibraryState }) =>
  state.templates.error;

// ====================================
// ACTIONS
// ====================================

export const {
  setSearchQuery,
  setSelectedCategory,
  toggleTag,
  setSortBy,
  setSortOrder,
  setViewMode,
  toggleFavorite,
  addToRecentlyUsed,
  addCategory,
  updateCategory,
  deleteCategory,
  addTag,
  updateTag,
  deleteTag,
  rateTemplate,
  addComment,
  setCurrentTemplate,
  clearFilters,
  updateAnalytics
} = templatesSlice.actions;

export default templatesSlice.reducer; 