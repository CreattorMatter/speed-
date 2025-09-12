import { z } from 'zod';

// Schema for a single component within a template
const DraggableComponentV3Schema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  // Add other component properties as needed, making them optional if they might not exist
  content: z.any().optional(),
}).passthrough(); // Allow other properties not explicitly defined

// Schema for the main TemplateV3 object
export const TemplateV3Schema = z.object({
  id: z.string(),
  name: z.string(),
  canvas: z.object({
    width: z.number(),
    height: z.number(),
    backgroundColor: z.string(),
  }),
  defaultComponents: z.array(DraggableComponentV3Schema).optional(),
  // Allow other properties not explicitly defined
}).passthrough();

// Schema for the Product object (ProductoReal)
export const ProductSchema = z.object({
  id: z.string(),
  tienda: z.string(),
  sku: z.number(),
  ean: z.number(),
  descripcion: z.string(),
  // Making most fields optional as they might not always be present
  name: z.string().optional(), // For compatibility
  eanPrincipal: z.boolean().optional(),
  umvExt: z.string().optional(),
  precio: z.number().optional(),
  precioAnt: z.number().optional(),
  basePrice: z.number().optional(),
  ppum: z.number().optional(),
  unidadPpumExt: z.string().optional(),
  seccion: z.string().optional(),
  grupo: z.string().optional(),
  rubro: z.string().optional(),
  subRubro: z.string().optional(),
  origen: z.string().optional(),
  paisTexto: z.string().optional(),
  marcaTexto: z.string().optional(),
  stockDisponible: z.number().optional(),
  imageUrl: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  packageType: z.string().optional(),
  volume: z.string().optional(),
  price: z.number().optional(), // For compatibility
  // Add other product properties as needed
}).passthrough(); // Allow other properties not explicitly defined
