import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables de entorno con fallbacks para desarrollo
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'placeholder-service-key';
const supabaseDbBranch = import.meta.env.VITE_SUPABASE_DB_BRANCH as string | undefined;

// Verificar si las variables están configuradas
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                            supabaseAnonKey !== 'placeholder-anon-key';

// Helper para crear o reutilizar singletons en el contexto global (evita duplicados en HMR/StrictMode)
const getGlobal = () => (globalThis as unknown as Record<string, any>);

// Cliente normal para uso general con persistencia de sesión
export const supabase: SupabaseClient = (() => {
  const g = getGlobal();
  if (g.__spid_supabase) return g.__spid_supabase as SupabaseClient;
  const client = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          // Nota: mantenemos el storageKey por defecto ('sb-') en el cliente de usuario
        },
        global: {
          headers: {
            ...(supabaseDbBranch ? { 'X-Connection-Branch': supabaseDbBranch } : {})
          }
        }
      })
    : ({} as SupabaseClient);
  g.__spid_supabase = client;
  return client;
})();

// Cliente admin para operaciones que requieren permisos elevados
// Se aísla el almacenamiento y se desactiva la persistencia de sesión para evitar
// conflictos con el cliente de usuario y la advertencia de múltiples GoTrueClient.
export const supabaseAdmin: SupabaseClient = (() => {
  const g = getGlobal();
  if (g.__spid_supabase_admin) return g.__spid_supabase_admin as SupabaseClient;
  const hasServiceKey = isSupabaseConfigured && !!supabaseServiceKey && supabaseServiceKey !== 'placeholder-service-key';
  const client = (hasServiceKey)
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          storageKey: 'sb-admin',
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            ...(supabaseDbBranch ? { 'X-Connection-Branch': supabaseDbBranch } : {})
          }
        }
      })
    : supabase;
  g.__spid_supabase_admin = client;
  return client;
})();

console.log('🔑 Supabase Admin Client Initialized:', (isSupabaseConfigured && supabaseServiceKey !== 'placeholder-service-key') ? 'con privilegios' : 'público');

// Configuración única para evitar múltiples instancias
export { supabaseUrl, supabaseAnonKey, supabaseServiceKey, isSupabaseConfigured, supabaseDbBranch };

// Log de estado para debugging
if (typeof window !== 'undefined') {
  if (isSupabaseConfigured) {
    console.log('✅ Supabase configurado correctamente');
  } else {
    console.warn('⚠️ Supabase NO configurado - usando placeholders');
    console.warn('💡 Crea un archivo .env.local con tus variables de Supabase');
  }
} 