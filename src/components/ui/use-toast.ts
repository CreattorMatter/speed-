import { useState } from 'react';

interface Toast {
  variant: 'default' | 'destructive';
  title: string;
  description?: string;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== toast));
    }, 5000);
  };

  return { toast, toasts };
} 