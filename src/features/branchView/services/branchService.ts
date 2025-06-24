// =====================================
// BRANCH VIEW - SERVICES
// =====================================

import { AssignedPoster, BranchUser } from "../types";

// Simulación de una base de datos de carteles asignados
const mockAssignedPosters: AssignedPoster[] = [
  {
    id: 'assign_001',
    templateId: 'tpl_ladrillazos_1',
    name: 'Ladrillazos Oferta Semanal',
    thumbnailUrl: '/images/thumbnails/ladrillazos_thumb.jpg',
    campaign: 'Construcción Verano 2024',
    assignedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: 'admin@spid.com',
    fileUrl: '/path/to/poster1.pdf',
    size: 'A3',
    orientation: 'vertical',
    pages: 1,
    status: 'pending',
  },
  {
    id: 'assign_002',
    templateId: 'tpl_superprecio_5',
    name: 'Supermercado Fin de Semana',
    thumbnailUrl: '/images/thumbnails/superprecio_thumb.jpg',
    campaign: 'Ofertas Frescura',
    assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: 'admin@spid.com',
    fileUrl: '/path/to/poster2.pdf',
    size: 'A4',
    orientation: 'vertical',
    pages: 2,
    status: 'viewed',
  },
  {
    id: 'assign_003',
    templateId: 'tpl_hotsale_3',
    name: 'Hot Sale Exclusivo Online',
    thumbnailUrl: '/images/thumbnails/hotsale_thumb.jpg',
    campaign: 'Hot Sale 2024',
    assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    assignedBy: 'jefe.marketing@spid.com',
    fileUrl: '/path/to/poster3.pdf',
    size: 'Personalizado',
    orientation: 'horizontal',
    pages: 1,
    status: 'printed',
  },
];

/**
 * Simula la obtención de los datos de un usuario de sucursal.
 * En una implementación real, esto vendría de un contexto de autenticación.
 */
const getMockBranchUser = (): BranchUser => ({
  id: 'user_branch_123',
  name: 'Juan Pérez',
  email: 'jperez@suc_pilar.com',
  branchId: 'branch_pilar_01',
  branchName: 'Easy Pilar',
});

/**
 * Simula una llamada a la API para obtener los carteles asignados a una sucursal.
 * @param branchId El ID de la sucursal del usuario.
 */
const getAssignedPostersForBranch = async (branchId: string): Promise<AssignedPoster[]> => {
  console.log(`Buscando carteles para la sucursal: ${branchId}`);
  
  // Simular un retraso de red
  await new Promise(resolve => setTimeout(resolve, 500));

  // En una implementación real, aquí habría una llamada a Supabase o a un endpoint de la API.
  // ej: const { data, error } = await supabase.from('assigned_posters').select('*').eq('branch_id', branchId);
  
  return mockAssignedPosters;
};

/**
 * Simula una llamada a la API para actualizar el estado de un cartel.
 * @param posterId El ID del cartel asignado.
 * @param status El nuevo estado.
 */
const updatePosterStatus = async (posterId: string, status: 'viewed' | 'printed'): Promise<boolean> => {
  console.log(`Actualizando estado del cartel ${posterId} a ${status}`);

  await new Promise(resolve => setTimeout(resolve, 300));
  
  const posterIndex = mockAssignedPosters.findIndex(p => p.id === posterId);
  if (posterIndex !== -1) {
    mockAssignedPosters[posterIndex].status = status;
    return true;
  }
  
  return false;
};


export const branchService = {
  getMockBranchUser,
  getAssignedPostersForBranch,
  updatePosterStatus,
}; 