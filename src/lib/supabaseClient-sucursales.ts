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
  direccion: string;
  telefono: string;
  email: string;
  sitio_web: string;
  fecha_creacion: string;
  estado: string;
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
  latitud: number;
  longitud: number;
  mapa: string;
}

// Función para obtener todas las empresas activas
export const getEmpresas = async (): Promise<Empresa[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('estado', 'activo');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    throw error;
  }
};

// Función para obtener una empresa específica
export const getEmpresa = async (id: number): Promise<Empresa | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('empresas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    throw error;
  }
};

// Función para obtener todas las sucursales de una empresa
export const getSucursalesPorEmpresa = async (empresaId: number): Promise<Sucursal[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sucursales')
      .select('*')
      .eq('empresa_id', empresaId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    throw error;
  }
};

// Función para obtener sucursales por múltiples empresas
export const getSucursalesPorEmpresas = async (empresaIds: number[]): Promise<Sucursal[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sucursales')
      .select('*')
      .in('empresa_id', empresaIds);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    throw error;
  }
};

// Función para obtener una sucursal específica
export const getSucursal = async (id: number): Promise<Sucursal | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sucursales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener sucursal:', error);
    throw error;
  }
};

// Función para obtener sucursales con información de la empresa
export const getSucursalesConEmpresa = async (): Promise<(Sucursal & { empresa: Empresa })[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('sucursales')
      .select(`
        *,
        empresa:empresas(*)
      `);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener sucursales con empresa:', error);
    throw error;
  }
}; 