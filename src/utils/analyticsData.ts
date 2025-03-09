// Función auxiliar para calcular el multiplicador basado en el rango de fechas
const getMultiplier = (startDate: Date, endDate: Date): number => {
  const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
  
  if (diffMonths >= 12) return 12;  // Año completo
  if (diffMonths >= 3) return 4;    // Trimestre
  return 1;                         // Mes
};

// Definir distribuciones base por empresa
const REGIONAL_DISTRIBUTIONS = {
  Easy: {
    'Buenos Aires': 0.35,  // 35% de las ventas
    'Córdoba': 0.25,      // 25% de las ventas
    'Santa Fe': 0.20,     // 20% de las ventas
    'Mendoza': 0.15,      // 15% de las ventas
    'Tucumán': 0.05       // 5% de las ventas
  },
  Jumbo: {
    'Buenos Aires': 0.45,
    'Córdoba': 0.20,
    'Santa Fe': 0.15,
    'Mendoza': 0.12,
    'Tucumán': 0.08
  },
  Disco: {
    'Buenos Aires': 0.40,
    'Córdoba': 0.22,
    'Santa Fe': 0.18,
    'Mendoza': 0.13,
    'Tucumán': 0.07
  },
  Vea: {
    'Buenos Aires': 0.30,
    'Córdoba': 0.28,
    'Santa Fe': 0.22,
    'Mendoza': 0.12,
    'Tucumán': 0.08
  }
};

// Definir productos top por empresa
const COMPANY_PRODUCTS = {
  Easy: [
    { name: 'Taladro Eléctrico', baseValue: 500 },
    { name: 'Pintura Interior', baseValue: 450 },
    { name: 'Set Herramientas', baseValue: 400 },
    { name: 'Lámparas LED', baseValue: 350 },
    { name: 'Cerraduras', baseValue: 300 }
  ],
  Jumbo: [
    { name: 'Coca Cola 2.25L', baseValue: 500 },
    { name: 'Cerveza Quilmes', baseValue: 450 },
    { name: 'Aceite Cocinero', baseValue: 400 },
    { name: 'Papel Higiénico', baseValue: 350 },
    { name: 'Arroz Gallo', baseValue: 300 }
  ],
  Disco: [
    { name: 'Leche La Serenísima', baseValue: 500 },
    { name: 'Pan Lactal', baseValue: 450 },
    { name: 'Yogur Yogurísimo', baseValue: 400 },
    { name: 'Queso Cremoso', baseValue: 350 },
    { name: 'Galletitas Oreo', baseValue: 300 }
  ],
  Vea: [
    { name: 'Fideos Matarazzo', baseValue: 500 },
    { name: 'Puré de Tomate', baseValue: 450 },
    { name: 'Jabón en Polvo', baseValue: 400 },
    { name: 'Gaseosa Manaos', baseValue: 350 },
    { name: 'Galletas Surtidas', baseValue: 300 }
  ]
};

// Modificar PROMOTION_DATA para incluir más promociones por empresa
const PROMOTION_DATA = {
  Easy: [
    { name: "2x1 Herramientas", conversion: 75, sales: 1200 },
    { name: "Descuento Pinturas", conversion: 65, sales: 980 },
    { name: "Oferta Jardín", conversion: 55, sales: 850 },
    { name: "Black Friday", conversion: 85, sales: 2100 },
    { name: "Cyber Week", conversion: 70, sales: 1500 },
    { name: "Liquidación Verano", conversion: 60, sales: 1100 },
    { name: "Ofertas Invierno", conversion: 72, sales: 1300 },
    { name: "Hot Sale Mayo", conversion: 68, sales: 1600 }
  ],
  Jumbo: [
    { name: "3x2 Lácteos", conversion: 80, sales: 1500 },
    { name: "Descuento Bebidas", conversion: 70, sales: 1100 },
    { name: "2x1 Limpieza", conversion: 60, sales: 900 },
    { name: "Cyber Monday", conversion: 90, sales: 2500 },
    { name: "Semana Fresh", conversion: 75, sales: 1800 },
    { name: "Ofertas Saludables", conversion: 82, sales: 1400 },
    { name: "Super Ahorro", conversion: 65, sales: 1200 },
    { name: "Festival Vinos", conversion: 78, sales: 2000 }
  ],
  Disco: [
    { name: "Descuento Carnes", conversion: 72, sales: 1300 },
    { name: "2x1 Congelados", conversion: 68, sales: 950 },
    { name: "Oferta Verduras", conversion: 58, sales: 780 },
    { name: "Hot Sale", conversion: 82, sales: 1900 },
    { name: "Promo Desayuno", conversion: 76, sales: 1600 },
    { name: "Semana Italiana", conversion: 70, sales: 1400 },
    { name: "Festival Quesos", conversion: 74, sales: 1700 },
    { name: "Mega Descuentos", conversion: 80, sales: 2200 }
  ],
  Vea: [
    { name: "3x2 Almacén", conversion: 70, sales: 1100 },
    { name: "Descuento Frutas", conversion: 63, sales: 890 },
    { name: "2x1 Bebidas", conversion: 59, sales: 820 },
    { name: "Super Ofertas", conversion: 80, sales: 1800 },
    { name: "Promo Limpieza", conversion: 67, sales: 1300 },
    { name: "Ofertas Semanales", conversion: 71, sales: 1500 },
    { name: "Festival Snacks", conversion: 69, sales: 1200 },
    { name: "Descuentos Express", conversion: 73, sales: 1600 }
  ]
};

const STORE_SLA_DATA = {
  Easy: [
    { store: "Easy San Isidro", sla: 95, printTime: 45 },
    { store: "Easy Quilmes", sla: 88, printTime: 52 },
    { store: "Easy Palermo", sla: 92, printTime: 48 },
    { store: "Easy Caballito", sla: 85, printTime: 55 },
    { store: "Easy Belgrano", sla: 91, printTime: 49 },
    { store: "Easy Flores", sla: 87, printTime: 53 },
    { store: "Easy Núñez", sla: 94, printTime: 46 },
    { store: "Easy Devoto", sla: 89, printTime: 51 },
    { store: "Easy Liniers", sla: 86, printTime: 54 },
    { store: "Easy Pompeya", sla: 90, printTime: 50 }
  ],
  Jumbo: [
    { store: "Jumbo Unicenter", sla: 93, printTime: 47 },
    { store: "Jumbo Pilar", sla: 89, printTime: 51 },
    { store: "Jumbo Lomas", sla: 91, printTime: 49 },
    { store: "Jumbo Nordelta", sla: 96, printTime: 44 },
    { store: "Jumbo Martinez", sla: 88, printTime: 52 },
    { store: "Jumbo Escobar", sla: 92, printTime: 48 },
    { store: "Jumbo Pacheco", sla: 87, printTime: 53 },
    { store: "Jumbo San Martin", sla: 90, printTime: 50 },
    { store: "Jumbo Tigre", sla: 94, printTime: 46 },
    { store: "Jumbo San Miguel", sla: 86, printTime: 54 }
  ],
  Disco: [
    { store: "Disco Recoleta", sla: 94, printTime: 46 },
    { store: "Disco Barrio Norte", sla: 92, printTime: 48 },
    { store: "Disco Belgrano", sla: 89, printTime: 51 },
    { store: "Disco Palermo", sla: 95, printTime: 45 },
    { store: "Disco Caballito", sla: 88, printTime: 52 },
    { store: "Disco Almagro", sla: 91, printTime: 49 },
    { store: "Disco Colegiales", sla: 93, printTime: 47 },
    { store: "Disco Núñez", sla: 87, printTime: 53 },
    { store: "Disco Villa Urquiza", sla: 90, printTime: 50 },
    { store: "Disco Villa Crespo", sla: 86, printTime: 54 }
  ],
  Vea: [
    { store: "Vea Flores", sla: 88, printTime: 52 },
    { store: "Vea Pompeya", sla: 85, printTime: 55 },
    { store: "Vea Mataderos", sla: 89, printTime: 51 },
    { store: "Vea Lugano", sla: 87, printTime: 53 },
    { store: "Vea Soldati", sla: 86, printTime: 54 },
    { store: "Vea Liniers", sla: 90, printTime: 50 },
    { store: "Vea Floresta", sla: 84, printTime: 56 },
    { store: "Vea Villa Luro", sla: 88, printTime: 52 },
    { store: "Vea Versalles", sla: 85, printTime: 55 },
    { store: "Vea Monte Castro", sla: 87, printTime: 53 }
  ]
};

interface TopProduct {
  name: string;
  value: number;
  company?: string; // Opcional, para cuando mostramos todos los productos
}

// Modificar la generación de datos de promociones
const generatePromotionData = (company: string | null, multiplier: number) => {
  const basePromos = company 
    ? PROMOTION_DATA[company as keyof typeof PROMOTION_DATA]
    : Object.entries(PROMOTION_DATA).flatMap(([company, promos]) =>
        promos.map(promo => ({ ...promo, company }))
      );

  // Generar variaciones aleatorias de las promociones base
  return basePromos.flatMap(promo => {
    const variations = [];
    // Crear 4 variaciones por cada promoción base
    for (let i = 0; i < 4; i++) {
      const salesVariation = (Math.random() * 0.6 - 0.3); // ±30%
      const conversionVariation = (Math.random() * 30 - 15); // ±15%
      
      // Agregar un pequeño retraso aleatorio para la animación
      const delay = Math.random() * 0.5;
      
      variations.push({
        ...promo,
        sales: Math.floor(promo.sales * (1 + salesVariation) * multiplier),
        conversion: Math.max(0, Math.min(100, promo.conversion + conversionVariation)),
        animationDelay: delay // Agregar delay para animación
      });
    }
    return variations;
  });
};

// Generar datos de SLA con variaciones aleatorias
const generateStoreSLAData = (company: string | null) => {
  const baseStores = company 
    ? STORE_SLA_DATA[company as keyof typeof STORE_SLA_DATA]
    : Object.entries(STORE_SLA_DATA).flatMap(([company, stores]) =>
        stores.map(store => ({ ...store, company }))
      );

  return baseStores.map(store => ({
    ...store,
    sla: Math.max(0, Math.min(100, store.sla + (Math.random() * 10 - 5))), // ±5%
    printTime: Math.max(0, store.printTime + (Math.random() * 10 - 5)) // ±5 minutos
  }));
};

export const generateRandomData = (startDate: Date, endDate: Date) => {
  const multiplier = getMultiplier(startDate, endDate);
  
  // Definir salesData primero para poder usarlo después
  const salesData = [
    { 
      name: 'Easy', 
      value: Math.floor((Math.random() * 1000 + 2000) * multiplier), 
      color: '#D64045',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Easy-Logo.svg'
    },
    { 
      name: 'Jumbo', 
      value: Math.floor((Math.random() * 800 + 1800) * multiplier), 
      color: '#7EC9AC',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png'
    },
    { 
      name: 'Disco', 
      value: Math.floor((Math.random() * 600 + 1500) * multiplier), 
      color: '#FF9B9B',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png'
    },
    { 
      name: 'Vea', 
      value: Math.floor((Math.random() * 400 + 1200) * multiplier), 
      color: '#FFE5A5',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Logo_Vea_Cencosud.png'
    },
  ];

  // Actualizar la generación de datos de promociones
  const promotionData = generatePromotionData(
    salesData.length === 1 ? salesData[0].name : null,
    multiplier
  );

  // Generar datos regionales basados en las ventas de cada empresa
  const regionData = Object.keys(REGIONAL_DISTRIBUTIONS.Easy).map(region => ({
    name: region,
    value: 0, // Inicializar en 0
    byCompany: {} as Record<string, number> // Guardar valores por empresa
  }));

  // Calcular valores regionales para cada empresa
  salesData.forEach(company => {
    const distribution = REGIONAL_DISTRIBUTIONS[company.name as keyof typeof REGIONAL_DISTRIBUTIONS];
    Object.entries(distribution).forEach(([region, percentage]) => {
      const regionValue = Math.floor(company.value * percentage);
      const regionIndex = regionData.findIndex(r => r.name === region);
      regionData[regionIndex].value += regionValue;
      regionData[regionIndex].byCompany[company.name] = regionValue;
    });
  });

  // Generar productos top por empresa
  const topProductsByCompany = {} as Record<string, TopProduct[]>;
  
  salesData.forEach(company => {
    const products = COMPANY_PRODUCTS[company.name as keyof typeof COMPANY_PRODUCTS];
    if (products) {
      topProductsByCompany[company.name] = products.map(product => ({
        name: product.name,
        value: Math.floor((Math.random() * 200 + product.baseValue) * multiplier)
      }));
    }
  });

  console.log('Generated topProducts:', topProductsByCompany); // Para debug

  // Generar datos de SLA con variaciones aleatorias
  const storeSLAData = generateStoreSLAData(
    salesData.length === 1 ? salesData[0].name : null
  );

  return {
    salesData,
    monthlyData: getMonthlyData(startDate, endDate, multiplier),
    regionData: regionData.map(({ name, value, byCompany }) => ({
      name,
      value,
      byCompany
    })),
    topProducts: topProductsByCompany,
    stats: {
      totalSales: `$${((Math.random() * 2 + 8) * multiplier).toFixed(1)}M`,
      regions: Math.floor(Math.random() * 5 + 20),
      products: `${Math.floor((Math.random() * 200 + 1000) * multiplier)}`,
      trends: {
        sales: `+${(Math.random() * 5 + 10).toFixed(1)}%`,
        regions: `+${Math.floor(Math.random() * 3 + 2)}`,
        products: `+${Math.floor((Math.random() * 50 + 50) * multiplier)}`
      }
    },
    promotionData,
    storeSLAData,
  };
};

function getMonthlyData(startDate: Date, endDate: Date, multiplier: number) {
  const months = [];
  const currentDate = new Date(startDate);
  const baseValues = {
    easy: 2000,
    jumbo: 1800,
    disco: 1500,
    vea: 1200
  };
  
  while (currentDate <= endDate) {
    months.push({
      name: currentDate.toLocaleString('default', { month: 'short' }),
      Easy: Math.floor((Math.random() * 1000 + baseValues.easy) * multiplier),
      Jumbo: Math.floor((Math.random() * 800 + baseValues.jumbo) * multiplier),
      Disco: Math.floor((Math.random() * 600 + baseValues.disco) * multiplier),
      Vea: Math.floor((Math.random() * 400 + baseValues.vea) * multiplier)
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
} 