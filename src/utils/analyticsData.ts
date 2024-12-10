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

export const generateRandomData = (startDate: Date, endDate: Date) => {
  const multiplier = getMultiplier(startDate, endDate);
  const baseValues = {
    easy: 2000,
    jumbo: 1800,
    disco: 1500,
    vea: 1200,
    products: {
      cocaCola: 500,
      cerveza: 400,
      aceite: 300,
      papel: 200,
      arroz: 100
    }
  };

  // Generar datos de ventas por empresa primero
  const salesData = [
    { 
      name: 'Easy', 
      value: Math.floor((Math.random() * 1000 + baseValues.easy) * multiplier), 
      color: '#6366f1',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Easy-Logo.svg'
    },
    { 
      name: 'Jumbo', 
      value: Math.floor((Math.random() * 800 + baseValues.jumbo) * multiplier), 
      color: '#8b5cf6',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Logo_Jumbo_Cencosud.png'
    },
    { 
      name: 'Disco', 
      value: Math.floor((Math.random() * 600 + baseValues.disco) * multiplier), 
      color: '#ec4899',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Disco-Supermarket-Logo.svg/2048px-Disco-Supermarket-Logo.svg.png'
    },
    { 
      name: 'Vea', 
      value: Math.floor((Math.random() * 400 + baseValues.vea) * multiplier), 
      color: '#f43f5e',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Logo-VEA-Supermercados.png'
    },
  ];

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

  return {
    salesData,
    monthlyData: getMonthlyData(startDate, endDate, multiplier),
    regionData: regionData.map(({ name, value, byCompany }) => ({
      name,
      value,
      byCompany
    })),
    topProducts: [
      { name: 'Coca Cola 2.25L', value: Math.floor((Math.random() * 200 + baseValues.products.cocaCola) * multiplier) },
      { name: 'Cerveza Quilmes', value: Math.floor((Math.random() * 180 + baseValues.products.cerveza) * multiplier) },
      { name: 'Aceite Cocinero', value: Math.floor((Math.random() * 150 + baseValues.products.aceite) * multiplier) },
      { name: 'Papel Higiénico', value: Math.floor((Math.random() * 120 + baseValues.products.papel) * multiplier) },
      { name: 'Arroz Gallo', value: Math.floor((Math.random() * 100 + baseValues.products.arroz) * multiplier) },
    ],
    stats: {
      totalSales: `$${((Math.random() * 2 + 8) * multiplier).toFixed(1)}M`,
      regions: Math.floor(Math.random() * 5 + 20),
      products: `${Math.floor((Math.random() * 200 + 1000) * multiplier)}`,
      trends: {
        sales: `+${(Math.random() * 5 + 10).toFixed(1)}%`,
        regions: `+${Math.floor(Math.random() * 3 + 2)}`,
        products: `+${Math.floor((Math.random() * 50 + 50) * multiplier)}`
      }
    }
  };
};

function getMonthlyData(startDate: Date, endDate: Date, multiplier: number) {
  const months = [];
  const currentDate = new Date(startDate);
  const baseValues = {
    easy: 2000,
    jumbo: 1800,
    disco: 1500
  };
  
  while (currentDate <= endDate) {
    months.push({
      name: currentDate.toLocaleString('default', { month: 'short' }),
      Easy: Math.floor((Math.random() * 1000 + baseValues.easy) * multiplier),
      Jumbo: Math.floor((Math.random() * 800 + baseValues.jumbo) * multiplier),
      Disco: Math.floor((Math.random() * 600 + baseValues.disco) * multiplier),
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return months;
} 