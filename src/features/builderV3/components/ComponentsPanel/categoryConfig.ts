// =====================================
// CATEGORY CONFIGURATION - ComponentsPanel
// =====================================

import {
  Type,
  Image,
  FileImage,
  Monitor,
  Shapes,
  CreditCard
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
  'Financiación': {
    icon: CreditCard,
    color: 'bg-green-100 text-green-800',
    borderColor: 'border-green-200'
  },
  'Elementos Decorativos': {
    icon: Shapes,
    color: 'bg-teal-100 text-teal-800',
    borderColor: 'border-teal-200'
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