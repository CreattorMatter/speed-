export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  pricePerUnit: string;
  points: string;
  origin: string;
  barcode: string;
  brand: string;
  packUnit: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: string;
  imageUrl: string;
  category: 'Bancaria' | 'Especial' | 'Categoría';
  conditions: string[];
  startDate: string;
  endDate: string;
  bank?: string;
  cardType?: string;
  type?: 'percentage' | '2x1' | '3x2' | 'second-70';
  isActive?: boolean;
  selectedBanks?: string[];
  cardOptions?: string[];
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
}

export interface PaperFormat {
  id: string;
  width: string;
  height: string;
  name: string;
}

export interface ProductoParaImprimir {
  idUnico: string;
  idProductoOriginal: string;
  idModeloPlantilla: string;
  plantillaHTML: string;
  estilosCSS: string;
  datosPersonalizados?: Record<string, any>;
  dimensionesFisicas: {
    ancho: number;
    alto: number;
    unidad: string;
  };
  plantillaSeleccionada?: string;
  comboSeleccionado?: string;
  modeloSeleccionado?: string;
  formatoSeleccionado?: string;
  financing?: any;
  product: Product;
  empresa?: Company;
  promotion?: Promotion;
}

export interface PreviewSettings {
  showMiniatures: boolean;
  scaleToFit: boolean;
  maxItemsPerRow: number;
  aspectRatioMode: 'original' | 'square' | 'custom';
}

export interface PrintSettings {
  pageBreakBetweenProducts: boolean;
  includeProductInfo: boolean;
  pageSize: 'A4' | 'A3' | 'Letter' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  created_at?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export * from './admin'; 