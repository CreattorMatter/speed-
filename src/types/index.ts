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
  // 🆕 User Management System fields
  temporary_password?: string;
  first_login?: boolean;
  domain_type?: 'external' | 'cencosud' | 'easy';
  groups?: string[]; // Array of group IDs
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

// 🆕 Permission System
export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface UserPermissions {
  permissions: Array<{
    name: string;
    category: string;
    description: string;
  }>;
  groups: Array<{
    id: string;
    name: string;
  }>;
  hasPermission: (permissionName: string) => boolean;
}

export interface RoleWithPermissions extends Role {
  permissions: string[];
  userCount: number;
}

// 🆕 Groups Management System
export interface Group {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  created_by?: string; // User ID who created the group
  users?: string[]; // Array of user IDs
  // 🗑️ enabledCards removed - now using role-based permissions
}

// 🆕 Email Templates
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  type: 'welcome_external' | 'welcome_internal' | 'password_changed' | 'password_reset';
}

// 🆕 Authentication & Login Flow
export interface LoginAttempt {
  id: string;
  email: string;
  success: boolean;
  error_type?: 'invalid_credentials' | 'user_not_found' | 'domain_not_allowed' | 'first_login_required' | 'entraid_error';
  error_message?: string;
  timestamp: string;
  ip_address?: string;
}

export * from './admin'; 