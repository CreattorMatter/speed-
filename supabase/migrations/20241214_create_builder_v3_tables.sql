-- =============================================
-- BUILDER V3 - DATABASE SCHEMA
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. FAMILIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    default_style JSONB NOT NULL DEFAULT '{}',
    default_dimensions JSONB NOT NULL DEFAULT '{"width": 1080, "height": 1350}',
    allowed_components TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL
);

-- =============================================
-- 2. TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    family_type TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    tags TEXT[] DEFAULT '{}',
    category TEXT NOT NULL DEFAULT 'custom',
    canvas JSONB NOT NULL,
    default_components JSONB NOT NULL DEFAULT '[]',
    family_config JSONB NOT NULL DEFAULT '{}',
    validation_rules JSONB NOT NULL DEFAULT '[]',
    export_settings JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT NOT NULL,
    FOREIGN KEY (family_type) REFERENCES families(name) ON UPDATE CASCADE
);

-- =============================================
-- 3. TEMPLATE_COMPONENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS template_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL,
    component_type TEXT NOT NULL,
    position JSONB NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}',
    content JSONB NOT NULL DEFAULT '{}',
    z_index INTEGER NOT NULL DEFAULT 1,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
);

-- =============================================
-- 4. USER_FAVORITES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    component_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_email, component_type)
);

-- =============================================
-- 5. SAP_CONNECTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sap_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id TEXT NOT NULL,
    base_url TEXT NOT NULL,
    token TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id)
);

-- =============================================
-- 6. PROMOTION_CONNECTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS promotion_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id TEXT NOT NULL,
    base_url TEXT NOT NULL,
    token TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(empresa_id)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_families_name ON families(name);
CREATE INDEX IF NOT EXISTS idx_families_active ON families(is_active);

CREATE INDEX IF NOT EXISTS idx_templates_family_type ON templates(family_type);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON templates(created_by);

CREATE INDEX IF NOT EXISTS idx_template_components_template_id ON template_components(template_id);
CREATE INDEX IF NOT EXISTS idx_template_components_type ON template_components(component_type);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_email ON user_favorites(user_email);
CREATE INDEX IF NOT EXISTS idx_user_favorites_component_type ON user_favorites(component_type);

CREATE INDEX IF NOT EXISTS idx_sap_connections_empresa_id ON sap_connections(empresa_id);
CREATE INDEX IF NOT EXISTS idx_promotion_connections_empresa_id ON promotion_connections(empresa_id);

-- =============================================
-- UPDATE TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_families_updated_at
    BEFORE UPDATE ON families
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_components_updated_at
    BEFORE UPDATE ON template_components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sap_connections_updated_at
    BEFORE UPDATE ON sap_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotion_connections_updated_at
    BEFORE UPDATE ON promotion_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sap_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_connections ENABLE ROW LEVEL SECURITY;

-- Policies for families
CREATE POLICY "Enable read access for all users" ON families
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON families
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON families
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON families
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for templates
CREATE POLICY "Enable read access for all users" ON templates
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON templates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON templates
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON templates
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for template_components
CREATE POLICY "Enable read access for all users" ON template_components
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON template_components
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON template_components
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON template_components
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for user_favorites
CREATE POLICY "Users can only see their own favorites" ON user_favorites
    FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Users can only insert their own favorites" ON user_favorites
    FOR INSERT WITH CHECK (auth.email() = user_email);

CREATE POLICY "Users can only delete their own favorites" ON user_favorites
    FOR DELETE USING (auth.email() = user_email);

-- Policies for connections (admin only)
CREATE POLICY "Enable all operations for authenticated users" ON sap_connections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON promotion_connections
    FOR ALL USING (auth.role() = 'authenticated'); 