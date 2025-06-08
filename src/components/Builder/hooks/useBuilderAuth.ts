import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export const useBuilderAuth = () => {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Verificar sesión actual
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setSession(user);
    }

    // Suscribirse a cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('No hay sesión activa');
    }
    return JSON.parse(storedUser);
  };

  return {
    session,
    getCurrentUser
  };
}; 