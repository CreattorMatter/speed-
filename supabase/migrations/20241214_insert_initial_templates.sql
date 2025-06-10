-- ===============================================
-- MIGRATION: Insert initial templates for Builder V3
-- ===============================================

-- Insert templates for Ladrillazos family
INSERT INTO templates (
  name,
  family_id,
  description,
  thumbnail,
  tags,
  category,
  canvas_config,
  family_config,
  default_components,
  is_public,
  is_active,
  created_by
) VALUES 
(
  'Ladrillazo Básico',
  'ladrillazos',
  'Plantilla básica para ofertas tipo ladrillazo con precio destacado',
  '/images/templates/ladrillazo-basico.png',
  ARRAY['ladrillazo', 'oferta', 'basico'],
  'promotional',
  '{
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "dpi": 300,
    "backgroundColor": "#ff0000"
  }',
  '{
    "brandColors": {
      "primary": "#ff0000",
      "secondary": "#ffff00",
      "accent": "#ff6600",
      "text": "#ffffff",
      "background": "#ff0000"
    },
    "typography": {
      "primaryFont": "Arial Black",
      "secondaryFont": "Arial",
      "headerFont": "Impact"
    }
  }',
  '[]',
  true,
  true,
  'admin@admin.com'
),
(
  'Ladrillazo Premium',
  'ladrillazos',
  'Plantilla premium con múltiples productos y diseño avanzado',
  '/images/templates/ladrillazo-premium.png',
  ARRAY['ladrillazo', 'premium', 'multiproducto'],
  'promotional',
  '{
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "dpi": 300,
    "backgroundColor": "#ff0000"
  }',
  '{
    "brandColors": {
      "primary": "#ff0000",
      "secondary": "#ffff00",
      "accent": "#ff6600",
      "text": "#ffffff",
      "background": "#ff0000"
    },
    "typography": {
      "primaryFont": "Arial Black",
      "secondaryFont": "Arial",
      "headerFont": "Impact"
    }
  }',
  '[]',
  true,
  true,
  'admin@admin.com'
),
(
  'Ladrillazo Express',
  'ladrillazos',
  'Plantilla rápida para ofertas urgentes con diseño impactante',
  '/images/templates/ladrillazo-express.png',
  ARRAY['ladrillazo', 'express', 'urgente'],
  'promotional',
  '{
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "dpi": 300,
    "backgroundColor": "#ff0000"
  }',
  '{
    "brandColors": {
      "primary": "#ff0000",
      "secondary": "#ffff00",
      "accent": "#ff6600",
      "text": "#ffffff",
      "background": "#ff0000"
    },
    "typography": {
      "primaryFont": "Arial Black",
      "secondaryFont": "Arial",
      "headerFont": "Impact"
    }
  }',
  '[]',
  true,
  true,
  'admin@admin.com'
);

-- Insert templates for Hot Sale family
INSERT INTO templates (
  name,
  family_id,
  description,
  thumbnail,
  tags,
  category,
  canvas_config,
  family_config,
  default_components,
  is_public,
  is_active,
  created_by
) VALUES 
(
  'Hot Sale Clásico',
  'hot-sale',
  'Plantilla clásica para eventos Hot Sale con diseño tradicional',
  '/images/templates/hot-sale-clasico.png',
  ARRAY['hotsale', 'clasico', 'evento'],
  'seasonal',
  '{
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "dpi": 300,
    "backgroundColor": "#ff6600"
  }',
  '{
    "brandColors": {
      "primary": "#ff6600",
      "secondary": "#ffffff",
      "accent": "#ffcc00",
      "text": "#000000",
      "background": "#ff6600"
    },
    "typography": {
      "primaryFont": "Poppins",
      "secondaryFont": "Inter",
      "headerFont": "Bebas Neue"
    }
  }',
  '[]',
  true,
  true,
  'admin@admin.com'
),
(
  'Hot Sale Digital',
  'hot-sale',
  'Plantilla moderna para Hot Sale con elementos digitales',
  '/images/templates/hot-sale-digital.png',
  ARRAY['hotsale', 'digital', 'moderno'],
  'seasonal',
  '{
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "dpi": 300,
    "backgroundColor": "#ff6600"
  }',
  '{
    "brandColors": {
      "primary": "#ff6600",
      "secondary": "#ffffff",
      "accent": "#ffcc00",
      "text": "#000000",
      "background": "#ff6600"
    },
    "typography": {
      "primaryFont": "Poppins",
      "secondaryFont": "Inter",
      "headerFont": "Bebas Neue"
    }
  }',
  '[]',
  true,
  true,
  'admin@admin.com'
);

-- Insert templates for Superprecio family
INSERT INTO templates (
  name,
  family_id,
  description,
  thumbnail,
  tags,
  category,
  canvas_config,
  family_config,
  default_components,
  is_public,
  is_active,
  created_by
) VALUES 
(
  'Superprecio Estándar',
  'superprecio',
  'Plantilla estándar para ofertas superprecio con precio destacado',
  '/images/templates/superprecio-estandar.png',
  ARRAY['superprecio', 'estandar', 'precio'],
  'pricing',
  '{
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "dpi": 300,
    "backgroundColor": "#0066cc"
  }',
  '{
    "brandColors": {
      "primary": "#0066cc",
      "secondary": "#ffffff",
      "accent": "#00aaff",
      "text": "#ffffff",
      "background": "#0066cc"
    },
    "typography": {
      "primaryFont": "Roboto",
      "secondaryFont": "Open Sans",
      "headerFont": "Montserrat"
    }
  }',
  '[]',
  true,
  true,
  'admin@admin.com'
);

-- ===============================================
-- COMMENTS
-- ===============================================

COMMENT ON TABLE templates IS 'Initial template data loaded for Builder V3 families'; 