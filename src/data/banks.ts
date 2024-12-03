export interface Bank {
  id: string;
  name: string;
  logoUrl: string;
}

const defaultBankImage = 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=500&auto=format&fit=crop&q=60';

export const banks: Bank[] = [
  {
    id: 'santander',
    name: 'Santander',
    logoUrl: defaultBankImage
  },
  {
    id: 'galicia',
    name: 'Banco Galicia',
    logoUrl: defaultBankImage
  },
  {
    id: 'bbva',
    name: 'BBVA',
    logoUrl: defaultBankImage
  },
  {
    id: 'macro',
    name: 'Banco Macro',
    logoUrl: defaultBankImage
  },
  {
    id: 'hsbc',
    name: 'HSBC',
    logoUrl: defaultBankImage
  },
  {
    id: 'icbc',
    name: 'ICBC',
    logoUrl: defaultBankImage
  },
  {
    id: 'ciudad',
    name: 'Banco Ciudad',
    logoUrl: defaultBankImage
  },
  {
    id: 'provincia',
    name: 'Banco Provincia',
    logoUrl: defaultBankImage
  },
  {
    id: 'nacion',
    name: 'Banco Nación',
    logoUrl: defaultBankImage
  },
  {
    id: 'supervielle',
    name: 'Banco Supervielle',
    logoUrl: defaultBankImage
  },
  {
    id: 'patagonia',
    name: 'Banco Patagonia',
    logoUrl: defaultBankImage
  },
  {
    id: 'comafi',
    name: 'Banco Comafi',
    logoUrl: defaultBankImage
  }
]; 