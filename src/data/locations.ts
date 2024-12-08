export const REGIONS = [
  { id: 'todos', name: 'Todas las Regiones' },
  { id: 'centro', name: 'Buenos Aires Centro' },
  { id: 'norte', name: 'Buenos Aires Norte' },
  { id: 'sur', name: 'Buenos Aires Sur' }
];

export const LOCATIONS = [
  // Jumbo
  { 
    id: 'jumbo-once', 
    name: 'Jumbo Once', 
    region: 'centro',
    coordinates: [-58.4055, -34.6087] as [number, number],
    address: 'Av. Rivadavia 3050, CABA'
  },
  { 
    id: 'jumbo-palermo', 
    name: 'Jumbo Palermo', 
    region: 'centro',
    coordinates: [-58.4272, -34.5866] as [number, number],
    address: 'Av. Bullrich 345, CABA'
  },
  { 
    id: 'jumbo-almagro', 
    name: 'Jumbo Almagro', 
    region: 'centro',
    coordinates: [-58.4201, -34.6103] as [number, number],
    address: 'Av. Díaz Vélez 4580, CABA'
  },
  { 
    id: 'jumbo-flores', 
    name: 'Jumbo Flores', 
    region: 'centro',
    coordinates: [-58.4634, -34.6278] as [number, number],
    address: 'Av. Rivadavia 6900, CABA'
  },
  { 
    id: 'jumbo-devoto', 
    name: 'Jumbo Villa Devoto', 
    region: 'centro',
    coordinates: [-58.5134, -34.5989] as [number, number],
    address: 'Av. Francisco Beiró 5150, CABA'
  },

  // Disco
  { 
    id: 'disco-caballito', 
    name: 'Disco Caballito', 
    region: 'centro',
    coordinates: [-58.4401, -34.6190] as [number, number],
    address: 'Av. Rivadavia 4800, CABA'
  },
  { 
    id: 'disco-belgrano', 
    name: 'Disco Belgrano', 
    region: 'centro',
    coordinates: [-58.4566, -34.5579] as [number, number],
    address: 'Av. Cabildo 2280, CABA'
  },
  { 
    id: 'disco-nunez', 
    name: 'Disco Núñez', 
    region: 'centro',
    coordinates: [-58.4566, -34.5450] as [number, number],
    address: 'Av. Cabildo 3600, CABA'
  },
  { 
    id: 'disco-recoleta', 
    name: 'Disco Recoleta', 
    region: 'centro',
    coordinates: [-58.3876, -34.5875] as [number, number],
    address: 'Av. Santa Fe 1600, CABA'
  },
  { 
    id: 'disco-palermo', 
    name: 'Disco Palermo', 
    region: 'centro',
    coordinates: [-58.4302, -34.5876] as [number, number],
    address: 'Av. Santa Fe 3700, CABA'
  },

  // Vea
  { 
    id: 'vea-flores', 
    name: 'Vea Flores', 
    region: 'centro',
    coordinates: [-58.4634, -34.6278] as [number, number],
    address: 'Av. Rivadavia 7000, CABA'
  },
  { 
    id: 'vea-liniers', 
    name: 'Vea Liniers', 
    region: 'centro',
    coordinates: [-58.5234, -34.6378] as [number, number],
    address: 'Av. Rivadavia 11500, CABA'
  },
  { 
    id: 'vea-mataderos', 
    name: 'Vea Mataderos', 
    region: 'centro',
    coordinates: [-58.5034, -34.6578] as [number, number],
    address: 'Av. Eva Perón 5500, CABA'
  },
  { 
    id: 'vea-pompeya', 
    name: 'Vea Nueva Pompeya', 
    region: 'centro',
    coordinates: [-58.4134, -34.6478] as [number, number],
    address: 'Av. Sáenz 1200, CABA'
  },
  { 
    id: 'vea-soldati', 
    name: 'Vea Villa Soldati', 
    region: 'centro',
    coordinates: [-58.4334, -34.6678] as [number, number],
    address: 'Av. Roca 3000, CABA'
  },

  // Zona Norte
  { 
    id: 'jumbo-san-isidro', 
    name: 'Jumbo San Isidro', 
    region: 'norte',
    coordinates: [-58.5274, -34.4707] as [number, number],
    address: 'Paraná 3745, San Isidro'
  },
  { 
    id: 'jumbo-unicenter', 
    name: 'Jumbo Unicenter', 
    region: 'norte',
    coordinates: [-58.5274, -34.5107] as [number, number],
    address: 'Paraná 3600, Martínez'
  },
  { 
    id: 'jumbo-tigre', 
    name: 'Jumbo Tigre', 
    region: 'norte',
    coordinates: [-58.5796, -34.4265] as [number, number],
    address: 'Av. Cazón 1250, Tigre'
  },
  { 
    id: 'jumbo-pilar', 
    name: 'Jumbo Pilar', 
    region: 'norte',
    coordinates: [-58.9137, -34.4585] as [number, number],
    address: 'Au. Panamericana Km 50, Pilar'
  },
  { 
    id: 'jumbo-nordelta', 
    name: 'Jumbo Nordelta', 
    region: 'norte',
    coordinates: [-58.6396, -34.4065] as [number, number],
    address: 'Av. de los Lagos 7000, Nordelta'
  },

  // Zona Sur
  { 
    id: 'vea-lomas', 
    name: 'Vea Lomas de Zamora', 
    region: 'sur',
    coordinates: [-58.4066, -34.7611] as [number, number],
    address: 'Av. Hipólito Yrigoyen 8230, Lomas de Zamora'
  },
  { 
    id: 'jumbo-avellaneda', 
    name: 'Jumbo Avellaneda', 
    region: 'sur',
    coordinates: [-58.3669, -34.6606] as [number, number],
    address: 'Av. Mitre 639, Avellaneda'
  },
  { 
    id: 'disco-quilmes', 
    name: 'Disco Quilmes', 
    region: 'sur',
    coordinates: [-58.2529, -34.7207] as [number, number],
    address: 'Av. Calchaquí 3950, Quilmes'
  },
  { 
    id: 'vea-laplata', 
    name: 'Vea La Plata', 
    region: 'sur',
    coordinates: [-57.9544, -34.9214] as [number, number],
    address: 'Calle 13 entre 34 y 35, La Plata'
  },
  { 
    id: 'jumbo-laplata', 
    name: 'Jumbo La Plata', 
    region: 'sur',
    coordinates: [-57.9644, -34.9114] as [number, number],
    address: 'Av. 19 850, La Plata'
  },

  // Easy - Buenos Aires Centro
  { 
    id: 'easy-mdh-rivadavia', 
    name: 'Easy Rivadavia', 
    region: 'centro',
    coordinates: [-58.4198, -34.6152] as [number, number],
    address: 'Av. Rivadavia 3666, Buenos Aires'
  },
  { 
    id: 'easy-mdh-palermo', 
    name: 'Easy Palermo', 
    region: 'centro',
    coordinates: [-58.4272, -34.5866] as [number, number],
    address: 'Av. Bullrich 345, Buenos Aires'
  },
  { 
    id: 'easy-mdh-floresta', 
    name: 'Easy Floresta', 
    region: 'centro',
    coordinates: [-58.4689, -34.6289] as [number, number],
    address: 'Av. Rivadavia 5751, Floresta'
  },

  // Easy - Buenos Aires Norte
  { 
    id: 'easy-mdh-san-martin', 
    name: 'Easy San Martín', 
    region: 'norte',
    coordinates: [-58.5128, -34.5705] as [number, number],
    address: 'Av. de los Constituyentes 6020, San Martín'
  },
  { 
    id: 'easy-mdh-vicente-lopez', 
    name: 'Easy Vicente López', 
    region: 'norte',
    coordinates: [-58.4729, -34.5305] as [number, number],
    address: 'Av. Libertador 1201, Vicente López'
  },
  { 
    id: 'easy-mdh-unicenter', 
    name: 'Easy Unicenter', 
    region: 'norte',
    coordinates: [-58.5274, -34.5107] as [number, number],
    address: 'Paraná 3745, Martínez'
  },
  { 
    id: 'easy-mdh-pilar', 
    name: 'Easy Pilar', 
    region: 'norte',
    coordinates: [-58.9137, -34.4585] as [number, number],
    address: 'Au. Panamericana Km 50, Pilar'
  },

  // Easy - Buenos Aires Sur
  { 
    id: 'easy-mdh-fiorito', 
    name: 'Easy Fiorito', 
    region: 'sur',
    coordinates: [-58.4498, -34.6789] as [number, number],
    address: 'Av. Fernandez de la Cruz 4602, Fiorito'
  },
  { 
    id: 'easy-mdh-avellaneda', 
    name: 'Easy Avellaneda', 
    region: 'sur',
    coordinates: [-58.3669, -34.6606] as [number, number],
    address: 'Av. Mitre 639, Avellaneda'
  },
  { 
    id: 'easy-mdh-quilmes', 
    name: 'Easy Quilmes', 
    region: 'sur',
    coordinates: [-58.2529, -34.7207] as [number, number],
    address: 'Av. Calchaquí 3950, Quilmes'
  },

  // Jumbo - Buenos Aires Centro
  { 
    id: 'jumbo-caballito', 
    name: 'Jumbo Caballito', 
    region: 'centro',
    coordinates: [-58.4401, -34.6190] as [number, number],
    address: 'Av. Rivadavia 5108, Caballito, CABA'
  },
  { 
    id: 'jumbo-madero', 
    name: 'Jumbo Puerto Madero', 
    region: 'centro',
    coordinates: [-58.3636, -34.6161] as [number, number],
    address: 'Av. Alicia Moreau de Justo 1190, Puerto Madero, CABA'
  },

  // Jumbo - Zona Norte
  { 
    id: 'jumbo-san-fernando', 
    name: 'Jumbo San Fernando', 
    region: 'norte',
    coordinates: [-58.5563, -34.4441] as [number, number],
    address: 'Av. Presidente Perón 1950, San Fernando'
  },
  { 
    id: 'jumbo-pacheco', 
    name: 'Jumbo Pacheco', 
    region: 'norte',
    coordinates: [-58.6396, -34.4532] as [number, number],
    address: 'Av. Hipólito Yrigoyen 3636, General Pacheco'
  },
  { 
    id: 'jumbo-escobar', 
    name: 'Jumbo Escobar', 
    region: 'norte',
    coordinates: [-58.7921, -34.3485] as [number, number],
    address: 'Ruta 9 Km 45, Belén de Escobar'
  },

  // Jumbo - Zona Sur
  { 
    id: 'jumbo-lomas', 
    name: 'Jumbo Lomas de Zamora', 
    region: 'sur',
    coordinates: [-58.4066, -34.7611] as [number, number],
    address: 'Av. Antártida Argentina 1111, Lomas de Zamora'
  },
  { 
    id: 'jumbo-banfield', 
    name: 'Jumbo Banfield', 
    region: 'sur',
    coordinates: [-58.4027, -34.7428] as [number, number],
    address: 'Av. Hipólito Yrigoyen 7618, Banfield'
  },

  // Disco - Buenos Aires Centro (adicionales)
  { 
    id: 'disco-flores', 
    name: 'Disco Flores', 
    region: 'centro',
    coordinates: [-58.4634, -34.6278] as [number, number],
    address: 'Av. Rivadavia 6800, Flores, CABA'
  },
  { 
    id: 'disco-villa-crespo', 
    name: 'Disco Villa Crespo', 
    region: 'centro',
    coordinates: [-58.4401, -34.5990] as [number, number],
    address: 'Av. Corrientes 5200, Villa Crespo, CABA'
  },
  { 
    id: 'disco-almagro', 
    name: 'Disco Almagro', 
    region: 'centro',
    coordinates: [-58.4201, -34.6103] as [number, number],
    address: 'Av. Rivadavia 3800, Almagro, CABA'
  },

  // Disco - Zona Norte
  { 
    id: 'disco-vicente-lopez', 
    name: 'Disco Vicente López', 
    region: 'norte',
    coordinates: [-58.4729, -34.5305] as [number, number],
    address: 'Av. Maipú 1200, Vicente López'
  },
  { 
    id: 'disco-martinez', 
    name: 'Disco Martínez', 
    region: 'norte',
    coordinates: [-58.5274, -34.5107] as [number, number],
    address: 'Av. Santa Fe 2000, Martínez'
  },
  { 
    id: 'disco-san-isidro', 
    name: 'Disco San Isidro', 
    region: 'norte',
    coordinates: [-58.5274, -34.4707] as [number, number],
    address: 'Av. del Libertador 16.200, San Isidro'
  },

  // Disco - Zona Sur
  { 
    id: 'disco-lomas', 
    name: 'Disco Lomas de Zamora', 
    region: 'sur',
    coordinates: [-58.4066, -34.7611] as [number, number],
    address: 'Av. Hipólito Yrigoyen 8400, Lomas de Zamora'
  },
  { 
    id: 'disco-avellaneda', 
    name: 'Disco Avellaneda', 
    region: 'sur',
    coordinates: [-58.3669, -34.6606] as [number, number],
    address: 'Av. Mitre 500, Avellaneda'
  },
  { 
    id: 'disco-banfield', 
    name: 'Disco Banfield', 
    region: 'sur',
    coordinates: [-58.4027, -34.7428] as [number, number],
    address: 'Av. Hipólito Yrigoyen 7500, Banfield'
  }
]; 