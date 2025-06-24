import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables de entorno con fallbacks para desarrollo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'placeholder-service-key';

// Verificar si las variables están configuradas
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                            supabaseAnonKey !== 'placeholder-anon-key';

// Cliente normal para uso general
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {} as SupabaseClient;

// Cliente admin para operaciones que requieren permisos elevados  
export const supabaseAdmin = 
  isSupabaseConfigured && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : supabase;

console.log('🔑 Supabase Admin Client Initialized:', isSupabaseConfigured && supabaseServiceKey ? 'con privilegios' : 'público');

// Configuración única para evitar múltiples instancias
export { supabaseUrl, supabaseAnonKey, supabaseServiceKey, isSupabaseConfigured };

// Log de estado para debugging
if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('✅ Supabase configurado correctamente');
  } else {
    console.warn('⚠️ Supabase NO configurado - usando placeholders');
    console.warn('💡 Crea un archivo .env.local con tus variables de Supabase');
  }
} 