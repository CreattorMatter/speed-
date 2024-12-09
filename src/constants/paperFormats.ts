import { PaperFormat } from '../types/builder';

export const PAPER_FORMATS: PaperFormat[] = [
  { 
    id: 'A2', 
    width: '420mm', 
    height: '594mm', 
    name: 'A2 (420 × 594 mm)' 
  },
  { 
    id: 'A3', 
    width: '297mm', 
    height: '420mm', 
    name: 'A3 (297 × 420 mm)' 
  },
  { 
    id: 'A4', 
    width: '210mm', 
    height: '297mm', 
    name: 'A4 (210 × 297 mm)' 
  },
  { 
    id: 'letter', 
    width: '215.9mm', 
    height: '279.4mm', 
    name: 'Carta (215.9 × 279.4 mm)' 
  },
  { 
    id: 'legal', 
    width: '215.9mm', 
    height: '355.6mm', 
    name: 'Legal (215.9 × 355.6 mm)' 
  }
]; 