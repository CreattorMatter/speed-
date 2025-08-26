import { Tienda } from '../types/product';

// =====================================
// DATOS REALES DE TIENDAS EASY
// =====================================

export const tiendas: Tienda[] = [
  {
    numero: "E000",
    tienda: "Easy Casa Central"
  },
  {
    numero: "E001", 
    tienda: "Easy Pilar"
  },
  {
    numero: "E002",
    tienda: "Easy San Isidro"
  },
  {
    numero: "E003",
    tienda: "Easy Palermo"
  },
  {
    numero: "E004",
    tienda: "Easy Quilmes"
  },
  {
    numero: "E005",
    tienda: "Easy Morón"
  },
  {
    numero: "E006",
    tienda: "Easy Tigre"
  },
  {
    numero: "E007",
    tienda: "Easy Martínez"
  },
  {
    numero: "E008",
    tienda: "Easy Belgrano"
  },
  {
    numero: "E009",
    tienda: "Easy San Martín"
  },
  {
    numero: "E010",
    tienda: "Easy Lomas de Zamora"
  },
  {
    numero: "E011",
    tienda: "Easy Temperley"
  },
  {
    numero: "E012",
    tienda: "Easy Avellaneda"
  },
  {
    numero: "E013",
    tienda: "Easy Lanús"
  },
  {
    numero: "E014",
    tienda: "Easy Vicente López"
  },
  {
    numero: "E015",
    tienda: "Easy Caballito"
  }
];

export const getTiendaByNumero = (numero: string): Tienda | undefined => {
  return tiendas.find(tienda => tienda.numero === numero);
};

export const getTiendasByRegion = (region: 'Norte' | 'Sur' | 'Oeste' | 'Capital'): Tienda[] => {
  const regionMapping: Record<string, string[]> = {
    'Norte': ['E001', 'E002', 'E006', 'E007', 'E009', 'E014'],
    'Sur': ['E004', 'E010', 'E011', 'E012', 'E013'],
    'Oeste': ['E005'],
    'Capital': ['E000', 'E003', 'E008', 'E015']
  };
  
  return tiendas.filter(tienda => regionMapping[region]?.includes(tienda.numero));
}; 