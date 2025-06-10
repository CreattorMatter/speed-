-- =============================================
-- BUILDER V3 - INITIAL FAMILIES DATA
-- =============================================

-- Insert initial families for Builder V3
INSERT INTO families (name, display_name, description, default_style, default_dimensions, allowed_components, created_by) VALUES

-- 1. LADRILLAZOS FAMILY
('ladrillazos', 'Ladrillazos', 'Familia promocional para ofertas tipo "ladrillazo" con descuentos especiales', 
 '{
   "primaryColor": "#FF0000",
   "secondaryColor": "#FFFF00", 
   "fontFamily": "Arial Black",
   "fontSize": 24,
   "fontWeight": "bold",
   "backgroundColor": "#FFFFFF"
 }',
 '{"width": 1080, "height": 1350}',
 ARRAY['text', 'image', 'price', 'discount', 'qr-code', 'logo'],
 'system'),

-- 2. SUPER PRECIO FAMILY  
('superprecio', 'Super Precio', 'Familia promocional para destacar precios especiales y ofertas imperdibles',
 '{
   "primaryColor": "#FF6600",
   "secondaryColor": "#FFFFFF",
   "fontFamily": "Impact", 
   "fontSize": 28,
   "fontWeight": "bold",
   "backgroundColor": "#FFF200"
 }',
 '{"width": 1080, "height": 1350}',
 ARRAY['text', 'image', 'price', 'discount', 'qr-code', 'logo', 'badge'],
 'system'),

-- 3. MUNDO EXPERTO FAMILY
('mundoexperto', 'Mundo Experto', 'Familia promocional para productos especializados y de alta calidad',
 '{
   "primaryColor": "#003366",
   "secondaryColor": "#FF6600",
   "fontFamily": "Roboto",
   "fontSize": 22,
   "fontWeight": "600", 
   "backgroundColor": "#F5F5F5"
 }',
 '{"width": 1080, "height": 1350}',
 ARRAY['text', 'image', 'price', 'specs', 'qr-code', 'logo', 'rating'],
 'system'),

-- 4. MULTIPRODUCTOS FAMILY
('multiproductos', 'Multi Productos', 'Familia para mostrar múltiples productos en una sola promoción',
 '{
   "primaryColor": "#00AA44", 
   "secondaryColor": "#FFFFFF",
   "fontFamily": "Open Sans",
   "fontSize": 20,
   "fontWeight": "600",
   "backgroundColor": "#FFFFFF"
 }',
 '{"width": 1080, "height": 1350}',
 ARRAY['text', 'image', 'price', 'grid', 'qr-code', 'logo', 'category'],
 'system'),

-- 5. FERIAS DE DESCUENTOS FAMILY
('feriasdesc', 'Ferias de Descuentos', 'Familia para eventos especiales con múltiples descuentos',
 '{
   "primaryColor": "#AA0066",
   "secondaryColor": "#FFDD00",
   "fontFamily": "Montserrat",
   "fontSize": 26,
   "fontWeight": "bold",
   "backgroundColor": "#FFFFFF"
 }',
 '{"width": 1080, "height": 1350}',
 ARRAY['text', 'image', 'price', 'discount', 'countdown', 'qr-code', 'logo', 'event'],
 'system'),

-- 6. CONSTRUCTOR PERSONALIZADO
('constructor', 'Constructor Personalizado', 'Familia flexible para crear diseños totalmente personalizados',
 '{
   "primaryColor": "#333333",
   "secondaryColor": "#666666", 
   "fontFamily": "Arial",
   "fontSize": 18,
   "fontWeight": "normal",
   "backgroundColor": "#FFFFFF"
 }',
 '{"width": 1080, "height": 1350}',
 ARRAY['text', 'image', 'price', 'discount', 'qr-code', 'logo', 'shape', 'line', 'button', 'table', 'chart'],
 'system')

ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  default_style = EXCLUDED.default_style,
  default_dimensions = EXCLUDED.default_dimensions,
  allowed_components = EXCLUDED.allowed_components,
  updated_at = CURRENT_TIMESTAMP; 