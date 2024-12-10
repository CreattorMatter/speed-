// Función auxiliar para calcular el multiplicador basado en el rango de fechas
const getMultiplier = (startDate: Date, endDate: Date): number => {
  const diffMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    (endDate.getMonth() - startDate.getMonth());
  
  if (diffMonths >= 12) return 12;  // Año completo
  if (diffMonths >= 3) return 4;    // Trimestre
  return 1;                         // Mes
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

  return {
    salesData: [
      { 
        name: 'Easy', 
        value: Math.floor((Math.random() * 1000 + baseValues.easy) * multiplier), 
        color: '#6366f1',
        logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaiNrct47zvNoB19TpUqoe01LcuRmVJ6hEDg&s'
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
    ],
    monthlyData: getMonthlyData(startDate, endDate, multiplier),
    regionData: [
      { name: 'Buenos Aires', value: Math.floor((Math.random() * 2000 + 5000) * multiplier) },
      { name: 'Córdoba', value: Math.floor((Math.random() * 1000 + 3000) * multiplier) },
      { name: 'Santa Fe', value: Math.floor((Math.random() * 1000 + 2000) * multiplier) },
      { name: 'Mendoza', value: Math.floor((Math.random() * 800 + 1500) * multiplier) },
      { name: 'Tucumán', value: Math.floor((Math.random() * 500 + 1000) * multiplier) },
    ],
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