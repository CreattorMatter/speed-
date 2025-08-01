import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export const useTheme = (forceDark?: boolean) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (forceDark) return 'dark';
    // Verificar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) return savedTheme;

    // Si no hay preferencia guardada, usar la preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // Actualizar la clase en el documento
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Guardar la preferencia
    localStorage.setItem('theme', theme);
    
    // Debug: verificar que se aplique
    console.log('🌙 [THEME] Tema cambiado a:', theme, 'HTML classes:', document.documentElement.className);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    console.log('🌙 [THEME] Cambiando tema de', theme, 'a', newTheme);
    setTheme(newTheme);
  };

  return { theme, toggleTheme };
}; 