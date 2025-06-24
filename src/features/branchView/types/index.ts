// =====================================
// BRANCH VIEW - TYPES
// =====================================

/**
 * Representa un cartel que ha sido asignado a una sucursal específica.
 * Contiene la información esencial que el usuario de sucursal necesita.
 */
export interface AssignedPoster {
  id: string;              // ID único de la asignación
  templateId: string;      // ID de la plantilla original
  name: string;            // Nombre del cartel (ej: "Oferta Lácteos Semana 23")
  thumbnailUrl: string;    // URL de una imagen en miniatura para previsualización
  campaign: string;        // Nombre de la campaña a la que pertenece (ej: "Vuelta al Cole")
  assignedAt: string;      // Fecha (ISO string) en la que fue asignado
  assignedBy: string;      // Nombre o email del admin que lo asignó
  fileUrl: string;         // URL directa para descargar el archivo final (PDF/PNG)
  size: 'A4' | 'A3' | 'Oficio' | 'Personalizado'; // Tamaño del cartel
  orientation: 'vertical' | 'horizontal';
  pages: number;           // Número de páginas (generalmente 1)
  status: 'pending' | 'viewed' | 'printed'; // Estado del cartel en la sucursal
}

/**
 * Información del usuario de sucursal.
 */
export interface BranchUser {
  id: string;
  name: string;
  email: string;
  branchId: string;
  branchName: string;
} 