import { PaperFormat } from '../types/builder';

// Función para convertir mm a píxeles (asumiendo 96 DPI)
const mmToPx = (mm: number) => Math.round(mm * 3.7795275591);

export const PAPER_FORMATS: PaperFormat[] = [
  { 
    id: 'A2', 
    width: mmToPx(420),
    height: mmToPx(594),
    name: 'A2',
    originalSize: '420mm × 594mm'
  },
  { 
    id: 'A3', 
    width: mmToPx(297),
    height: mmToPx(420),
    name: 'A3',
    originalSize: '297mm × 420mm'
  },
  { 
    id: 'A4', 
    width: mmToPx(210),
    height: mmToPx(297),
    name: 'A4',
    originalSize: '210mm × 297mm'
  },
  { 
    id: 'letter', 
    width: mmToPx(215.9),
    height: mmToPx(279.4),
    name: 'Carta',
    originalSize: '215.9mm × 279.4mm'
  },
  { 
    id: 'legal', 
    width: mmToPx(215.9),
    height: mmToPx(355.6),
    name: 'Legal',
    originalSize: '215.9mm × 355.6mm'
  },
  { 
    id: 'executive', 
    width: mmToPx(184.1),
    height: mmToPx(266.7),
    name: 'Ejecutivo',
    originalSize: '184.1mm × 266.7mm'
  },
  { 
    id: 'tabloid', 
    width: mmToPx(279.4),
    height: mmToPx(431.8),
    name: 'Tabloide',
    originalSize: '279.4mm × 431.8mm'
  },
  { 
    id: 'A5', 
    width: mmToPx(148),
    height: mmToPx(210),
    name: 'A5',
    originalSize: '148mm × 210mm'
  }
]; 