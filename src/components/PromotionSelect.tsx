interface PromotionSelectProps {
  value: string;
  onChange: (value: string) => void;
  promotions: Promotion[];
  className?: string;
} 