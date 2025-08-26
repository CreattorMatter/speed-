import { Seccion } from '../types/product';

// =====================================
// DATOS REALES DE SECCIONES DE PRODUCTOS
// =====================================

export const secciones: Seccion[] = [
  {
    numero: 1,
    seccion: "Almacén"
  },
  {
    numero: 2,
    seccion: "Bebidas"
  },
  {
    numero: 3,
    seccion: "Limpieza"
  },
  {
    numero: 4,
    seccion: "Perfumería"
  },
  {
    numero: 5,
    seccion: "Bazar"
  },
  {
    numero: 6,
    seccion: "Textil"
  },
  {
    numero: 7,
    seccion: "Calzado"
  },
  {
    numero: 8,
    seccion: "Deportes"
  },
  {
    numero: 9,
    seccion: "Juguetería"
  },
  {
    numero: 10,
    seccion: "Librería"
  },
  {
    numero: 11,
    seccion: "Tecnología"
  },
  {
    numero: 12,
    seccion: "Electrodomésticos"
  },
  {
    numero: 13,
    seccion: "Ferretería"
  },
  {
    numero: 14,
    seccion: "Construcción"
  },
  {
    numero: 15,
    seccion: "Jardinería"
  },
  {
    numero: 16,
    seccion: "Automotor"
  },
  {
    numero: 17,
    seccion: "Decoración"
  },
  {
    numero: 18,
    seccion: "Iluminación"
  },
  {
    numero: 19,
    seccion: "Seguridad"
  },
  {
    numero: 20,
    seccion: "Climatización"
  }
];

export const getSeccionByNumero = (numero: number): Seccion | undefined => {
  return secciones.find(seccion => seccion.numero === numero);
};

export const getSeccionesByCategoria = (categoria: 'Hogar' | 'Construcción' | 'Tecnología' | 'Consumo'): Seccion[] => {
  const categoriaMapping: Record<string, number[]> = {
    'Hogar': [1, 2, 3, 4, 5, 6, 7, 17, 18],
    'Construcción': [13, 14, 15, 16, 19, 20],
    'Tecnología': [11, 12],
    'Consumo': [8, 9, 10]
  };
  
  return secciones.filter(seccion => categoriaMapping[categoria]?.includes(seccion.numero));
}; 