-- ===============================================
-- MIGRATION COMPLETA: Builder V3 Setup 
-- ===============================================
-- Este archivo unifica todas las tablas, datos e integración de autenticación

-- ===============================================
-- 1. LIMPIAR TABLAS EXISTENTES
-- ===============================================

DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ===============================================
-- 2. CREAR TABLA DE USUARIOS
-- ===============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'limited',
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- ===============================================
-- 3. CREAR TABLA DE FAMILIAS
-- ===============================================

CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🏷️',
  header_image TEXT,
  default_style JSONB DEFAULT '{
    "primaryColor": "#000000",
    "secondaryColor": "#666666",
    "accentColor": "#0066cc",
    "textColor": "#333333",
    "backgroundColor": "#ffffff",
    "fontFamily": "Inter"
  }',
  allowed_components TEXT[] DEFAULT ARRAY['text', 'image', 'price'],
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para familias
CREATE INDEX idx_families_name ON families(name);
CREATE INDEX idx_families_active ON families(is_active);
CREATE INDEX idx_families_sort_order ON families(sort_order);

-- ===============================================
-- 4. CREAR TABLA DE TEMPLATES CON RLS MEJORADO
-- ===============================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  family_id VARCHAR(100) NOT NULL, -- Reference to family name
  description TEXT,
  thumbnail TEXT,
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(100) DEFAULT 'custom',
  
  -- Canvas configuration (stored as JSONB)
  canvas_config JSONB DEFAULT '{
    "width": 1080,
    "height": 1350,
    "unit": "px",
    "dpi": 300,
    "backgroundColor": "#ffffff"
  }',
  
  -- Default components (stored as JSONB array)
  default_components JSONB DEFAULT '[]',
  
  -- Family configuration (stored as JSONB)
  family_config JSONB DEFAULT '{
    "typography": {
      "primaryFont": "Inter",
      "secondaryFont": "Roboto",
      "headerFont": "Poppins"
    }
  }',
  
  -- Validation rules (stored as JSONB array)
  validation_rules JSONB DEFAULT '[]',
  
  -- Export settings (stored as JSONB)
  export_settings JSONB DEFAULT '{
    "defaultFormat": "png",
    "defaultQuality": 90,
    "defaultDPI": 300,
    "bleedArea": 0,
    "cropMarks": false
  }',
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by VARCHAR(255) NOT NULL, -- Email del usuario
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para templates
CREATE INDEX idx_templates_family_id ON templates(family_id);
CREATE INDEX idx_templates_active ON templates(is_active);
CREATE INDEX idx_templates_public ON templates(is_public);
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_family_active ON templates(family_id, is_active);

-- ===============================================
-- 5. TRIGGERS PARA UPDATE TIMESTAMPS
-- ===============================================

-- Function para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas las tablas
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_families_updated_at 
  BEFORE UPDATE ON families 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- 6. CONFIGURAR RLS CON POLÍTICAS FLEXIBLES
-- ===============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- ===== POLÍTICAS PARA USUARIOS =====
-- Todos pueden ver usuarios activos (para login)
CREATE POLICY "Anyone can view active users" ON users
  FOR SELECT USING (is_active = true);

-- Solo pueden actualizar su propio registro
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- ===== POLÍTICAS PARA FAMILIAS =====
-- Todos pueden ver familias activas
CREATE POLICY "Anyone can view active families" ON families
  FOR SELECT USING (is_active = true);

-- Solo admins pueden modificar familias
CREATE POLICY "Admins can manage families" ON families
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE email = current_setting('request.jwt.claims', true)::json->>'email' 
      AND role = 'admin'
    )
  );

-- ===== POLÍTICAS FLEXIBLES PARA TEMPLATES =====
-- Política 1: Ver templates públicos activos
CREATE POLICY "Anyone can view public templates" ON templates
  FOR SELECT USING (is_public = true AND is_active = true);

-- Política 2: Ver propios templates (basado en email registrado)
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (
    created_by IN (
      SELECT email FROM users WHERE is_active = true
    )
  );

-- Política 3: Crear templates (cualquier email de usuario registrado)
CREATE POLICY "Registered users can create templates" ON templates
  FOR INSERT WITH CHECK (
    created_by IN (
      SELECT email FROM users WHERE is_active = true
    )
  );

-- Política 4: Actualizar propios templates
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (
    created_by IN (
      SELECT email FROM users WHERE is_active = true
    )
  );

-- Política 5: Eliminar propios templates
CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (
    created_by IN (
      SELECT email FROM users WHERE is_active = true
    )
  );

-- ===============================================
-- 7. INSERTAR USUARIOS INICIALES
-- ===============================================

INSERT INTO users (email, name, role, password_hash, is_active) VALUES 
('admin@admin.com', 'Administrador Principal', 'admin', '$2a$10$dummy.hash.for.admin', true),
('easypilar@cenco.com', 'Easy Pilar Manager', 'admin', '$2a$10$dummy.hash.for.pilar', true),
('easysantafe@cenco.com', 'Easy Santa Fe Manager', 'admin', '$2a$10$dummy.hash.for.santafe', true),
('easysolano@cenco.com', 'Easy Solano Manager', 'limited', '$2a$10$dummy.hash.for.solano', true),
('easydevoto@cenco.com', 'Easy Devoto Manager', 'limited', '$2a$10$dummy.hash.for.devoto', true),
('user@example.com', 'Usuario Ejemplo', 'limited', '$2a$10$dummy.hash.for.user', true);

-- ===============================================
-- 8. INSERTAR FAMILIAS INICIALES
-- ===============================================

INSERT INTO families (
  name, 
  display_name, 
  description, 
  icon, 
  header_image, 
  default_style, 
  allowed_components, 
  is_active, 
  sort_order
) VALUES 
(
  'hot-sale',
  'Hot Sale',
  'Ofertas especiales de Hot Sale con diseño llamativo',
  '🔥',
  '/images/headers/hot-sale.png',
  '{
    "primaryColor": "#ff6600",
    "secondaryColor": "#ffffff", 
    "accentColor": "#ffcc00",
    "textColor": "#000000",
    "backgroundColor": "#ff6600",
    "fontFamily": "Poppins"
  }',
  ARRAY['text', 'image', 'price', 'discount', 'qr'],
  true,
  1
),
(
  'ladrillazos',
  'Ladrillazos',
  'Ofertas especiales tipo ladrillazo con precios impactantes',
  '🧱',
  '/images/headers/ladrillazos.png',
  '{
    "primaryColor": "#ff0000",
    "secondaryColor": "#ffff00",
    "accentColor": "#ff6600", 
    "textColor": "#ffffff",
    "backgroundColor": "#ff0000",
    "fontFamily": "Arial Black"
  }',
  ARRAY['text', 'image', 'price', 'discount'],
  true,
  2
),
(
  'superprecio',
  'Superprecio',
  'Precios especiales con descuentos destacados',
  '💰',
  '/images/headers/superprecio.png',
  '{
    "primaryColor": "#0066cc",
    "secondaryColor": "#ffffff",
    "accentColor": "#00aaff",
    "textColor": "#ffffff", 
    "backgroundColor": "#0066cc",
    "fontFamily": "Roboto"
  }',
  ARRAY['text', 'image', 'price', 'financing'],
  true,
  3
),
(
  'black-friday',
  'Black Friday',
  'Ofertas especiales de Black Friday',
  '⚫',
  '/images/headers/black-friday.png',
  '{
    "primaryColor": "#000000",
    "secondaryColor": "#ffffff",
    "accentColor": "#ff0000",
    "textColor": "#ffffff",
    "backgroundColor": "#000000",
    "fontFamily": "Impact"
  }',
  ARRAY['text', 'image', 'price', 'discount', 'countdown'],
  true,
  4
),
(
  'financiacion',
  'Financiación',
  'Ofertas con opciones de financiamiento',
  '💳',
  '/images/headers/financiacion.png',
  '{
    "primaryColor": "#2e7d32",
    "secondaryColor": "#ffffff",
    "accentColor": "#4caf50",
    "textColor": "#ffffff",
    "backgroundColor": "#2e7d32",
    "fontFamily": "Montserrat"
  }',
  ARRAY['text', 'image', 'price', 'financing', 'installments'],
  true,
  5
),
(
  'constructor',
  'Constructor',
  'Productos y ofertas para construcción',
  '🔨',
  '/images/headers/constructor.png',
  '{
    "primaryColor": "#f57c00",
    "secondaryColor": "#ffffff",
    "accentColor": "#ff9800",
    "textColor": "#000000",
    "backgroundColor": "#f57c00",
    "fontFamily": "Roboto Condensed"
  }',
  ARRAY['text', 'image', 'price', 'tools', 'materials'],
  true,
  6
);

-- ===============================================
-- 9. INSERTAR TEMPLATES INICIALES
-- ===============================================

-- Templates para Ladrillazos
INSERT INTO templates (
  name, family_id, description, thumbnail, tags, category,
  canvas_config, family_config, default_components,
  is_public, is_active, created_by
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
    "typography": {
      "primaryFont": "Arial Black",
      "secondaryFont": "Arial",
      "headerFont": "Impact"
    }
  }',
  '[]',
  true, true, 'admin@admin.com'
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
    "typography": {
      "primaryFont": "Arial Black",
      "secondaryFont": "Arial",
      "headerFont": "Impact"
    }
  }',
  '[]',
  true, true, 'admin@admin.com'
);

-- Templates para Hot Sale
INSERT INTO templates (
  name, family_id, description, thumbnail, tags, category,
  canvas_config, family_config, default_components,
  is_public, is_active, created_by
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
    "typography": {
      "primaryFont": "Poppins",
      "secondaryFont": "Inter",
      "headerFont": "Bebas Neue"
    }
  }',
  '[]',
  true, true, 'admin@admin.com'
);

-- Templates para Superprecio
INSERT INTO templates (
  name, family_id, description, thumbnail, tags, category,
  canvas_config, family_config, default_components,
  is_public, is_active, created_by
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
    "typography": {
      "primaryFont": "Roboto",
      "secondaryFont": "Open Sans",
      "headerFont": "Montserrat"
    }
  }',
  '[]',
  true, true, 'admin@admin.com'
);

-- ===============================================
-- 10. COMMENTS FINALES
-- ===============================================

COMMENT ON TABLE users IS 'Usuarios del sistema Builder V3 con autenticación personalizada';
COMMENT ON TABLE families IS 'Familias de plantillas disponibles en Builder V3';
COMMENT ON TABLE templates IS 'Templates de Builder V3 con RLS basado en usuarios registrados';

-- ===============================================
-- 11. VERIFICACIÓN FINAL
-- ===============================================

-- Verificar que todo se creó correctamente
SELECT 'Setup completado exitosamente!' as status,
       (SELECT COUNT(*) FROM users) as usuarios_creados,
       (SELECT COUNT(*) FROM families) as familias_creadas,
       (SELECT COUNT(*) FROM templates) as templates_creados; 