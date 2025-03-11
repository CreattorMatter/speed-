import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Faltan las variables de entorno de Supabase');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export interface Empresa {
  id: number;
  nombre: string;
  logo: string;
}

export interface Sucursal {
  id: number;
  empresa_id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horario: string;
}

// Función para obtener todas las empresas activas
export const getChatbotEmpresas = async (): Promise<Empresa[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('id, nombre, logo')
      .eq('estado', 'activo');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw error;
  }
};

// Función para obtener todas las sucursales de una empresa
export const getChatbotSucursales = async (empresaId: number): Promise<Sucursal[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sucursales')
      .select('id, empresa_id, nombre, direccion, telefono, email, horario')
      .eq('empresa_id', empresaId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    throw error;
  }
}; 