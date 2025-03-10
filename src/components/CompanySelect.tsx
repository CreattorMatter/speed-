interface CompanySelectProps {
  value: string;
  onChange: (value: string) => void;
  companies: Company[];
  className?: string;
} 