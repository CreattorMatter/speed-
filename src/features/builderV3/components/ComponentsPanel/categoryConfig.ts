// =====================================
// CATEGORY CONFIGURATION - ComponentsPanel
// =====================================

import {
  Type,
  Image,
  FileImage,
  Monitor,
  QrCode,
  Calendar,
  Shapes,
  Box
} from 'lucide-react';
import { ComponentCategoryV3 } from '../../types';
import { CategoryConfig } from './types';

export const categoryConfig: Record<ComponentCategoryV3, CategoryConfig> = {
  'Texto y Datos': {
    icon: Type,
    color: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-200'
  },
  'Imagen de Header': {
    icon: Monitor,
    color: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200'
  },
  'Imagen de Footer': {
    icon: FileImage,
    color: 'bg-indigo-100 text-indigo-800',
    borderColor: 'border-indigo-200'
  },
  'Imagen de Fondo': {
    icon: Image,
    color: 'bg-emerald-100 text-emerald-800',
    borderColor: 'border-emerald-200'
  },
  'Imágenes y Media': {
    icon: Image,
    color: 'bg-pink-100 text-pink-800',
    borderColor: 'border-pink-200'
  },
  'QR y Enlaces': {
    icon: QrCode,
    color: 'bg-cyan-100 text-cyan-800',
    borderColor: 'border-cyan-200'
  },
  'Fechas y Períodos': {
    icon: Calendar,
    color: 'bg-orange-100 text-orange-800',
    borderColor: 'border-orange-200'
  },
  'Elementos Decorativos': {
    icon: Shapes,
    color: 'bg-teal-100 text-teal-800',
    borderColor: 'border-teal-200'
  },
  'Contenedores y Layout': {
    icon: Box,
    color: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-200'
  }
};

export const getComponentIcon = (componentType: string): string => {
  if (componentType.includes('text') || componentType.includes('field-product')) return '📝';
  if (componentType.includes('price') || componentType.includes('discount')) return '💰';
  if (componentType === 'image-header') return '🏷️';
  if (componentType === 'image-footer') return '📋';
  if (componentType === 'image-background') return '🌄';
  if (componentType.includes('image')) return '🖼️';
  if (componentType.includes('qr')) return '📱';
  if (componentType.includes('date')) return '📅';
  if (componentType.includes('financing') || componentType.includes('installment')) return '💳';
  if (componentType.includes('shape')) return '⬜';
  if (componentType.includes('container')) return '📦';
  return '🧩';
}; 