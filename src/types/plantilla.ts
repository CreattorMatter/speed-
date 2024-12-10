export interface PlantillaReciente {
  id: string;
  nombre: string;
  tipo: 'envio' | 'edicion' | 'impresion';
  tiempoAtras: string;
  sucursal?: string;
  cantidad?: number;
  estado: 'impreso' | 'no_impreso';
  empresa: {
    nombre: string;
    logo: string;
  };
} 