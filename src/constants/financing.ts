import { FinancingOption } from '../types/financing';

export const FINANCING_OPTIONS: FinancingOption[] = [
  {
    bankId: 'bna',
    bankName: 'Banco Nación',
    bankLogo: '/banks/bna.png',
    cards: [
      {
        type: 'visa',
        installments: [
          { quantity: 18, interest: 0, description: 'Hasta 18 cuotas sin interés en productos seleccionados.' }
        ]
      }
    ]
  },
  {
    bankId: 'amex',
    bankName: 'American Express',
    bankLogo: '/banks/amex.png',
    cards: [
      {
        type: 'amex',
        installments: [
          { quantity: 1, interest: 0, description: 'Comprá cuando quieras y programá tu entrega los días Jueves.' }
        ]
      }
    ]
  },
  {
    bankId: 'naranja',
    bankName: 'Naranja',
    bankLogo: '/banks/naranja.png',
    cards: [
      {
        type: 'visa',
        installments: [
          { quantity: 1, interest: 0, description: 'Comprá el Miércoles 11/12 y programá tu entrega para el día que quieras.' }
        ]
      }
    ]
  }
]; 