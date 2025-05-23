import { Promotion } from "../../types/promotion";

export const PROMOTIONS: Promotion[] = [
    {
      id: "1",
      title: "American Express 25% OFF",
      description: "Comprá cuando quieras y programá tu entrega los días Jueves.",
      discount: "25% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1580828343064-fde4fc206bc6?w=500&auto=format&fit=crop&q=60",
      category: "Bancaria",
      conditions: ["Tope de reintegro $2000", "Válido solo los jueves"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      bank: "American Express",
      cardType: "Todas las tarjetas",
      isActive: true,
      selectedBanks: ["American Express"],
      cardOptions: ["Todas las tarjetas"],
    },
    {
      id: "2",
      title: "Hasta 40% OFF en Especiales de la semana",
      description: "Descuentos especiales en productos seleccionados",
      discount: "Hasta 40% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop&q=60",
      category: "Especial",
      conditions: ["Válido solo los jueves"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      isActive: true,
      selectedBanks: [],
      cardOptions: [],
    },
    {
      id: "3",
      title: "Tarjeta Cencosud 20% OFF",
      description: "Realizá tus compras los días Miércoles",
      discount: "20% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=500&auto=format&fit=crop&q=60",
      category: "Bancaria",
      conditions: ["Válido solo los miércoles"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      bank: "Cencosud",
      isActive: true,
      selectedBanks: ["Cencosud"],
      cardOptions: ["Todas las tarjetas"],
    },
    {
      id: "4",
      title: "2do al 70% en Almacén, Bebidas y más",
      description: "En la segunda unidad de productos seleccionados",
      discount: "70% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=500&auto=format&fit=crop&q=60",
      category: "Especial",
      conditions: [
        "Valido solo comprando dos productos iguales el segundo al 70%",
      ],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      isActive: true,
      selectedBanks: [],
      cardOptions: [],
    },
    {
      id: "5",
      title: "Hasta 35% y Hasta 12 CSI",
      description:
        "Descuentos especiales en productos seleccionados con cuotas sin interés",
      discount: "35% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=500&auto=format&fit=crop&q=60",
      category: "Bancaria",
      conditions: ["Válido solo los jueves"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      bank: "Banco Nación",
      isActive: true,
      selectedBanks: ["Banco Nación"],
      cardOptions: ["Todas las tarjetas"],
    },
    {
      id: "6",
      title: "Santander 30% OFF",
      description: "Todos los días con Tarjetas Santander",
      discount: "30% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=500&auto=format&fit=crop&q=60",
      category: "Bancaria",
      conditions: ["Válido solo los días"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      bank: "Santander",
      isActive: true,
      selectedBanks: ["Santander"],
      cardOptions: ["Todas las tarjetas"],
    },
    {
      id: "7",
      title: "BBVA 25% OFF",
      description: "Descuentos exclusivos para clientes BBVA",
      discount: "25% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=500&auto=format&fit=crop&q=60",
      category: "Bancaria",
      conditions: ["Válido solo los jueves"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      bank: "BBVA",
      isActive: true,
      selectedBanks: ["BBVA"],
      cardOptions: ["Todas las tarjetas"],
    },
    {
      id: "8",
      title: "Banco Provincia 30% OFF",
      description: "Miércoles y Sábados con Banco Provincia",
      discount: "30% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=500&auto=format&fit=crop&q=60",
      category: "Bancaria",
      conditions: ["Válido solo los miércoles y sábados"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      bank: "Banco Provincia",
      isActive: true,
      selectedBanks: ["Banco Provincia"],
      cardOptions: ["Todas las tarjetas"],
    },
    {
      id: "9",
      title: "Banco Nación 25% OFF",
      description: "Descuentos especiales con Banco Nación",
      discount: "25% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1556742205-e7530469f4eb?w=500&auto=format&fit=crop&q=60",
      category: "Bancaria",
      conditions: ["Válido solo los jueves"],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      bank: "Banco Nación",
      isActive: true,
      selectedBanks: ["Banco Nación"],
      cardOptions: ["Todas las tarjetas"],
    },
    {
      id: "10",
      title: "2da Unidad 70% OFF",
      description: "En la segunda unidad de productos seleccionados",
      discount: "70% OFF",
      imageUrl:
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500&auto=format&fit=crop&q=60",
      category: "Especial",
      conditions: [
        "Válido en la compra de dos unidades iguales",
        "Productos seleccionados",
      ],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      type: "second-70",
      isActive: true,
      selectedBanks: [],
      cardOptions: [],
    },
    {
      id: "11",
      title: "2x1 en Productos Seleccionados",
      description: "Llevá 2 y pagá 1 en productos seleccionados",
      discount: "2x1",
      imageUrl:
        "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60",
      category: "Especial",
      conditions: [
        "Válido en productos seleccionados",
        "Llevando dos unidades iguales",
      ],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      type: "2x1",
      isActive: true,
      selectedBanks: [],
      cardOptions: [],
    },
    {
      id: "12",
      title: "3x2 en Productos Seleccionados",
      description: "Llevá 3 y pagá 2 en productos seleccionados",
      discount: "3x2",
      imageUrl:
        "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60",
      category: "Especial",
      conditions: [
        "Válido en productos seleccionados",
        "Llevando tres unidades iguales",
      ],
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      type: "3x2",
      isActive: true,
      selectedBanks: [],
      cardOptions: [],
    },
  ];