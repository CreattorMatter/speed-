export interface FinancingOption {
  bank: string;
  logo: string;
  cardName: string;
  cardImage: string;
  plan: string;
}

export interface CardOption {
  type: 'visa' | 'mastercard' | 'amex';
  installments: InstallmentOption[];
}

export interface InstallmentOption {
  quantity: number;
  interest: number; // 0 para sin interés
  minAmount?: number;
  maxAmount?: number;
  description?: string;
} 