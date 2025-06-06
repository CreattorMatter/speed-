import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';

// ====================================
// TIPOS Y INTERFACES
// ====================================

export interface AssetFile {
  id: string;
  name: string;
  originalName: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'logo' | 'icon' | 'font' | 'vector';
  format: string; // jpg, png, svg, woff, etc.
  size: number; // en bytes
  dimensions?: {
    width: number;
    height: number;
  };
  metadata: {
    colorProfile?: string;
    dpi?: number;
    hasTransparency?: boolean;
    dominantColors?: string[];
    tags?: string[];
  };
  category: string;
  isPublic: boolean;
  uploadedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  uploadedAt: number;
  lastUsed?: number;
  usageCount: number;
  license?: {
    type: 'free' | 'premium' | 'custom';
    attribution?: string;
    restrictions?: string[];
  };
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  type: AssetFile['type'];
  parentId?: string;
  order: number;
  isActive: boolean;
  assetCount: number;
}

export interface AssetCollection {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  assetIds: string[];
  isPublic: boolean;
  tags: string[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface AssetUpload {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  result?: AssetFile;
}

export interface AssetsState {
  assets: AssetFile[];
  categories: AssetCategory[];
  collections: AssetCollection[];
  uploads: AssetUpload[];
  favorites: string[];
  recentlyUsed: string[];
  
  // Filtros y búsqueda
  searchQuery: string;
  selectedCategory: string | null;
  selectedType: AssetFile['type'] | 'all';
  selectedTags: string[];
  sortBy: 'name' | 'date' | 'size' | 'usage' | 'recent';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'masonry';
  
  // Paginación
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  hasMore: boolean;
  
  // Estado
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  selectedAssets: string[];
  previewAsset: AssetFile | null;
  
  // Configuración
  uploadSettings: {
    maxFileSize: number;
    allowedFormats: string[];
    autoOptimize: boolean;
    generateThumbnails: boolean;
  };
  
  // Analytics
  storageUsed: number;
  storageLimit: number;
  popularAssets: { assetId: string; count: number }[];
  uploadStats: {
    totalUploaded: number;
    todayUploaded: number;
    weekUploaded: number;
  };
}

// ====================================
// ASYNC THUNKS
// ====================================

export const fetchAssets = createAsyncThunk(
  'assets/fetchAssets',
  async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    type?: string;
    search?: string;
    tags?: string[];
  }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data
    const mockAssets: AssetFile[] = [
      {
        id: nanoid(),
        name: 'Logo Supermercado',
        originalName: 'logo-super.svg',
        url: '/assets/logos/logo-super.svg',
        thumbnailUrl: '/assets/logos/thumb-logo-super.jpg',
        type: 'logo',
        format: 'svg',
        size: 15430,
        dimensions: { width: 200, height: 80 },
        metadata: {
          hasTransparency: true,
          dominantColors: ['#FF6B35', '#004E89'],
          tags: ['supermercado', 'marca', 'corporativo']
        },
        category: 'logos-corporativos',
        isPublic: true,
        uploadedBy: { id: '1', name: 'Admin', avatar: '/avatars/admin.jpg' },
        uploadedAt: Date.now() - 86400000 * 7,
        usageCount: 45,
        license: { type: 'free' }
      },
      {
        id: nanoid(),
        name: 'Frutas Frescas',
        originalName: 'frutas-mix.jpg',
        url: '/assets/images/frutas-mix.jpg',
        thumbnailUrl: '/assets/images/thumb-frutas-mix.jpg',
        type: 'image',
        format: 'jpg',
        size: 234567,
        dimensions: { width: 1920, height: 1080 },
        metadata: {
          dpi: 300,
          hasTransparency: false,
          dominantColors: ['#FF6B35', '#32CD32', '#FFD700'],
          tags: ['frutas', 'frescas', 'saludable', 'colorido']
        },
        category: 'alimentacion',
        isPublic: true,
        uploadedBy: { id: '1', name: 'Admin' },
        uploadedAt: Date.now() - 86400000 * 3,
        usageCount: 23,
        license: { type: 'free' }
      }
    ];
    
    return {
      assets: mockAssets,
      total: 150,
      hasMore: true
    };
  }
);

export const uploadAsset = createAsyncThunk(
  'assets/uploadAsset',
  async (params: {
    file: File;
    category: string;
    tags?: string[];
    description?: string;
    isPublic?: boolean;
  }, { dispatch }) => {
    const { file, category, tags = [], description, isPublic = false } = params;
    
    // Crear upload entry
    const uploadId = nanoid();
    const upload: AssetUpload = {
      id: uploadId,
      file,
      progress: 0,
      status: 'pending'
    };
    
    dispatch(addUpload(upload));
    
    try {
      // Simular upload con progreso
      dispatch(updateUploadProgress({ id: uploadId, progress: 10, status: 'uploading' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch(updateUploadProgress({ id: uploadId, progress: 50, status: 'uploading' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      dispatch(updateUploadProgress({ id: uploadId, progress: 80, status: 'processing' }));
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Crear asset
      const newAsset: AssetFile = {
        id: nanoid(),
        name: file.name.split('.')[0],
        originalName: file.name,
        url: URL.createObjectURL(file),
        thumbnailUrl: URL.createObjectURL(file),
        type: getAssetTypeFromFile(file),
        format: file.name.split('.').pop()?.toLowerCase() || '',
        size: file.size,
        dimensions: await getImageDimensions(file),
        metadata: {
          tags,
          dominantColors: await extractDominantColors(file)
        },
        category,
        isPublic,
        uploadedBy: { id: 'current-user', name: 'Usuario Actual' },
        uploadedAt: Date.now(),
        usageCount: 0,
        license: { type: 'free' }
      };
      
      dispatch(updateUploadProgress({ 
        id: uploadId, 
        progress: 100, 
        status: 'completed',
        result: newAsset 
      }));
      
      return newAsset;
    } catch (error) {
      dispatch(updateUploadProgress({ 
        id: uploadId, 
        status: 'error', 
        error: 'Error al subir archivo' 
      }));
      throw error;
    }
  }
);

// Funciones auxiliares
function getAssetTypeFromFile(file: File): AssetFile['type'] {
  const type = file.type.split('/')[0];
  if (type === 'image') {
    if (file.name.toLowerCase().includes('logo')) return 'logo';
    if (file.name.toLowerCase().includes('icon')) return 'icon';
    return 'image';
  }
  if (file.type.includes('font')) return 'font';
  if (file.type.includes('svg')) return 'vector';
  return 'image';
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number } | undefined> {
  if (!file.type.startsWith('image/')) return undefined;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = () => resolve(undefined);
    img.src = URL.createObjectURL(file);
  });
}

async function extractDominantColors(file: File): Promise<string[]> {
  // En una implementación real, esto extraería los colores dominantes
  return ['#FF6B35', '#004E89', '#FFFFFF'];
}

// ====================================
// ESTADO INICIAL
// ====================================

const initialState: AssetsState = {
  assets: [],
  categories: [
    {
      id: 'logos-corporativos',
      name: 'Logos Corporativos',
      description: 'Logos de marcas y empresas',
      icon: '🏢',
      color: '#3B82F6',
      type: 'logo',
      order: 1,
      isActive: true,
      assetCount: 0
    },
    {
      id: 'alimentacion',
      name: 'Alimentación',
      description: 'Imágenes de productos alimentarios',
      icon: '🍎',
      color: '#22C55E',
      type: 'image',
      order: 2,
      isActive: true,
      assetCount: 0
    },
    {
      id: 'bebidas',
      name: 'Bebidas',
      description: 'Imágenes de bebidas y líquidos',
      icon: '🥤',
      color: '#06B6D4',
      type: 'image',
      order: 3,
      isActive: true,
      assetCount: 0
    },
    {
      id: 'iconos-ui',
      name: 'Iconos UI',
      description: 'Iconos para interfaz de usuario',
      icon: '⭐',
      color: '#F59E0B',
      type: 'icon',
      order: 4,
      isActive: true,
      assetCount: 0
    }
  ],
  collections: [],
  uploads: [],
  favorites: [],
  recentlyUsed: [],
  
  searchQuery: '',
  selectedCategory: null,
  selectedType: 'all',
  selectedTags: [],
  sortBy: 'date',
  sortOrder: 'desc',
  viewMode: 'grid',
  
  currentPage: 1,
  itemsPerPage: 20,
  totalItems: 0,
  hasMore: false,
  
  isLoading: false,
  isUploading: false,
  error: null,
  selectedAssets: [],
  previewAsset: null,
  
  uploadSettings: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'],
    autoOptimize: true,
    generateThumbnails: true
  },
  
  storageUsed: 0,
  storageLimit: 1024 * 1024 * 1024, // 1GB
  popularAssets: [],
  uploadStats: {
    totalUploaded: 0,
    todayUploaded: 0,
    weekUploaded: 0
  }
};

// ====================================
// SLICE
// ====================================

const assetsSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    // Búsqueda y filtros
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
      state.currentPage = 1;
    },
    
    setSelectedType: (state, action: PayloadAction<AssetFile['type'] | 'all'>) => {
      state.selectedType = action.payload;
      state.currentPage = 1;
    },
    
    toggleTag: (state, action: PayloadAction<string>) => {
      const tagId = action.payload;
      const index = state.selectedTags.indexOf(tagId);
      if (index > -1) {
        state.selectedTags.splice(index, 1);
      } else {
        state.selectedTags.push(tagId);
      }
      state.currentPage = 1;
    },
    
    setSortBy: (state, action: PayloadAction<AssetsState['sortBy']>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<AssetsState['sortOrder']>) => {
      state.sortOrder = action.payload;
    },
    
    setViewMode: (state, action: PayloadAction<AssetsState['viewMode']>) => {
      state.viewMode = action.payload;
    },
    
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // Favoritos y recientes
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const assetId = action.payload;
      const index = state.favorites.indexOf(assetId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(assetId);
      }
    },
    
    addToRecentlyUsed: (state, action: PayloadAction<string>) => {
      const assetId = action.payload;
      state.recentlyUsed = state.recentlyUsed.filter(id => id !== assetId);
      state.recentlyUsed.unshift(assetId);
      state.recentlyUsed = state.recentlyUsed.slice(0, 20);
      
      // Actualizar usage count
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        asset.usageCount += 1;
        asset.lastUsed = Date.now();
      }
    },
    
    // Selección
    selectAsset: (state, action: PayloadAction<string>) => {
      const assetId = action.payload;
      if (!state.selectedAssets.includes(assetId)) {
        state.selectedAssets.push(assetId);
      }
    },
    
    deselectAsset: (state, action: PayloadAction<string>) => {
      state.selectedAssets = state.selectedAssets.filter(id => id !== action.payload);
    },
    
    selectAllAssets: (state) => {
      state.selectedAssets = state.assets.map(a => a.id);
    },
    
    clearSelection: (state) => {
      state.selectedAssets = [];
    },
    
    // Preview
    setPreviewAsset: (state, action: PayloadAction<AssetFile | null>) => {
      state.previewAsset = action.payload;
    },
    
    // Uploads
    addUpload: (state, action: PayloadAction<AssetUpload>) => {
      state.uploads.push(action.payload);
      state.isUploading = true;
    },
    
    updateUploadProgress: (state, action: PayloadAction<{
      id: string;
      progress?: number;
      status?: AssetUpload['status'];
      error?: string;
      result?: AssetFile;
    }>) => {
      const upload = state.uploads.find(u => u.id === action.payload.id);
      if (upload) {
        if (action.payload.progress !== undefined) upload.progress = action.payload.progress;
        if (action.payload.status) upload.status = action.payload.status;
        if (action.payload.error) upload.error = action.payload.error;
        if (action.payload.result) upload.result = action.payload.result;
      }
      
      // Verificar si hay uploads activos
      state.isUploading = state.uploads.some(u => 
        u.status === 'pending' || u.status === 'uploading' || u.status === 'processing'
      );
    },
    
    removeUpload: (state, action: PayloadAction<string>) => {
      state.uploads = state.uploads.filter(u => u.id !== action.payload);
      state.isUploading = state.uploads.some(u => 
        u.status === 'pending' || u.status === 'uploading' || u.status === 'processing'
      );
    },
    
    clearCompletedUploads: (state) => {
      state.uploads = state.uploads.filter(u => 
        u.status !== 'completed' && u.status !== 'error'
      );
    },
    
    // Assets
    addAsset: (state, action: PayloadAction<AssetFile>) => {
      state.assets.unshift(action.payload);
      state.totalItems += 1;
      
      // Actualizar storage used
      state.storageUsed += action.payload.size;
      
      // Actualizar stats
      state.uploadStats.totalUploaded += 1;
      state.uploadStats.todayUploaded += 1;
      state.uploadStats.weekUploaded += 1;
    },
    
    updateAsset: (state, action: PayloadAction<{ id: string; updates: Partial<AssetFile> }>) => {
      const { id, updates } = action.payload;
      const asset = state.assets.find(a => a.id === id);
      if (asset) {
        Object.assign(asset, updates);
      }
    },
    
    deleteAsset: (state, action: PayloadAction<string>) => {
      const assetId = action.payload;
      const asset = state.assets.find(a => a.id === assetId);
      if (asset) {
        state.storageUsed -= asset.size;
      }
      state.assets = state.assets.filter(a => a.id !== assetId);
      state.totalItems -= 1;
      
      // Limpiar de favoritos y recientes
      state.favorites = state.favorites.filter(id => id !== assetId);
      state.recentlyUsed = state.recentlyUsed.filter(id => id !== assetId);
      state.selectedAssets = state.selectedAssets.filter(id => id !== assetId);
    },
    
    deleteSelectedAssets: (state) => {
      const deletedSize = state.selectedAssets.reduce((total, id) => {
        const asset = state.assets.find(a => a.id === id);
        return total + (asset?.size || 0);
      }, 0);
      
      state.storageUsed -= deletedSize;
      state.assets = state.assets.filter(a => !state.selectedAssets.includes(a.id));
      state.totalItems -= state.selectedAssets.length;
      
      // Limpiar referencias
      state.favorites = state.favorites.filter(id => !state.selectedAssets.includes(id));
      state.recentlyUsed = state.recentlyUsed.filter(id => !state.selectedAssets.includes(id));
      state.selectedAssets = [];
    },
    
    // Categorías
    addAssetCategory: (state, action: PayloadAction<Omit<AssetCategory, 'id' | 'assetCount'>>) => {
      const newCategory: AssetCategory = {
        ...action.payload,
        id: nanoid(),
        assetCount: 0
      };
      state.categories.push(newCategory);
    },
    
    updateAssetCategory: (state, action: PayloadAction<{ id: string; updates: Partial<AssetCategory> }>) => {
      const { id, updates } = action.payload;
      const category = state.categories.find(c => c.id === id);
      if (category) {
        Object.assign(category, updates);
      }
    },
    
    deleteAssetCategory: (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter(c => c.id !== action.payload);
    },
    
    // Colecciones
    createCollection: (state, action: PayloadAction<{
      name: string;
      description: string;
      assetIds: string[];
      tags?: string[];
      isPublic?: boolean;
    }>) => {
      const newCollection: AssetCollection = {
        id: nanoid(),
        name: action.payload.name,
        description: action.payload.description,
        assetIds: action.payload.assetIds,
        isPublic: action.payload.isPublic || false,
        tags: action.payload.tags || [],
        createdBy: { id: 'current-user', name: 'Usuario Actual' },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      state.collections.push(newCollection);
    },
    
    updateCollection: (state, action: PayloadAction<{ id: string; updates: Partial<AssetCollection> }>) => {
      const { id, updates } = action.payload;
      const collection = state.collections.find(c => c.id === id);
      if (collection) {
        Object.assign(collection, updates, { updatedAt: Date.now() });
      }
    },
    
    deleteCollection: (state, action: PayloadAction<string>) => {
      state.collections = state.collections.filter(c => c.id !== action.payload);
    },
    
    addAssetToCollection: (state, action: PayloadAction<{ collectionId: string; assetId: string }>) => {
      const { collectionId, assetId } = action.payload;
      const collection = state.collections.find(c => c.id === collectionId);
      if (collection && !collection.assetIds.includes(assetId)) {
        collection.assetIds.push(assetId);
        collection.updatedAt = Date.now();
      }
    },
    
    removeAssetFromCollection: (state, action: PayloadAction<{ collectionId: string; assetId: string }>) => {
      const { collectionId, assetId } = action.payload;
      const collection = state.collections.find(c => c.id === collectionId);
      if (collection) {
        collection.assetIds = collection.assetIds.filter(id => id !== assetId);
        collection.updatedAt = Date.now();
      }
    },
    
    // Configuración
    updateUploadSettings: (state, action: PayloadAction<Partial<AssetsState['uploadSettings']>>) => {
      state.uploadSettings = { ...state.uploadSettings, ...action.payload };
    },
    
    // Limpiar filtros
    clearFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = null;
      state.selectedType = 'all';
      state.selectedTags = [];
      state.currentPage = 1;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch assets
      .addCase(fetchAssets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentPage === 1) {
          state.assets = action.payload.assets;
        } else {
          state.assets.push(...action.payload.assets);
        }
        state.totalItems = action.payload.total;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar assets';
      })
      
      // Upload asset
      .addCase(uploadAsset.fulfilled, (state, action) => {
        state.assets.unshift(action.payload);
        state.totalItems += 1;
        state.storageUsed += action.payload.size;
      });
  }
});

// ====================================
// SELECTORES
// ====================================

export const selectAssets = (state: { assets: AssetsState }) => state.assets.assets;

export const selectFilteredAssets = (state: { assets: AssetsState }) => {
  let filtered = state.assets.assets;
  
  // Filtro por tipo
  if (state.assets.selectedType !== 'all') {
    filtered = filtered.filter(a => a.type === state.assets.selectedType);
  }
  
  // Filtro por categoría
  if (state.assets.selectedCategory) {
    filtered = filtered.filter(a => a.category === state.assets.selectedCategory);
  }
  
  // Filtro por tags
  if (state.assets.selectedTags.length > 0) {
    filtered = filtered.filter(a => 
      state.assets.selectedTags.some(tag => a.metadata.tags?.includes(tag))
    );
  }
  
  // Filtro por búsqueda
  if (state.assets.searchQuery) {
    const query = state.assets.searchQuery.toLowerCase();
    filtered = filtered.filter(a => 
      a.name.toLowerCase().includes(query) ||
      a.description?.toLowerCase().includes(query) ||
      a.metadata.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  return filtered;
};

export const selectAssetCategories = (state: { assets: AssetsState }) => state.assets.categories;
export const selectAssetCollections = (state: { assets: AssetsState }) => state.assets.collections;
export const selectFavoriteAssets = (state: { assets: AssetsState }) => 
  state.assets.assets.filter(a => state.assets.favorites.includes(a.id));
export const selectRecentAssets = (state: { assets: AssetsState }) =>
  state.assets.recentlyUsed
    .map(id => state.assets.assets.find(a => a.id === id))
    .filter(Boolean) as AssetFile[];
export const selectSelectedAssets = (state: { assets: AssetsState }) =>
  state.assets.assets.filter(a => state.assets.selectedAssets.includes(a.id));
export const selectUploadProgress = (state: { assets: AssetsState }) => state.assets.uploads;
export const selectStorageInfo = (state: { assets: AssetsState }) => ({
  used: state.assets.storageUsed,
  limit: state.assets.storageLimit,
  percentage: (state.assets.storageUsed / state.assets.storageLimit) * 100
});

// ====================================
// ACTIONS
// ====================================

export const {
  setSearchQuery,
  setSelectedCategory,
  setSelectedType,
  toggleTag,
  setSortBy,
  setSortOrder,
  setViewMode,
  setCurrentPage,
  toggleFavorite,
  addToRecentlyUsed,
  selectAsset,
  deselectAsset,
  selectAllAssets,
  clearSelection,
  setPreviewAsset,
  addUpload,
  updateUploadProgress,
  removeUpload,
  clearCompletedUploads,
  addAsset,
  updateAsset,
  deleteAsset,
  deleteSelectedAssets,
  addAssetCategory,
  updateAssetCategory,
  deleteAssetCategory,
  createCollection,
  updateCollection,
  deleteCollection,
  addAssetToCollection,
  removeAssetFromCollection,
  updateUploadSettings,
  clearFilters
} = assetsSlice.actions;

export default assetsSlice.reducer; 