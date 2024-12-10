export interface FinancingOption {
  bankId: string;
  bankName: string;
  bankLogo: string;
  cards: CardOption[];
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