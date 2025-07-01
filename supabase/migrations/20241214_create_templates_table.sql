-- ===============================================
-- MIGRATION: Create templates table for Builder V3
-- ===============================================

-- Drop table if exists (clean slate)
DROP TABLE IF EXISTS templates CASCADE;

-- Create templates table
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
  created_by VARCHAR(255) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- INDEXES
-- ===============================================

-- Index for finding templates by family
CREATE INDEX idx_templates_family_id ON templates(family_id);

-- Index for finding active templates
CREATE INDEX idx_templates_active ON templates(is_active);

-- Index for finding public templates
CREATE INDEX idx_templates_public ON templates(is_public);

-- Index for finding templates by creator
CREATE INDEX idx_templates_created_by ON templates(created_by);

-- Index for finding templates by category
CREATE INDEX idx_templates_category ON templates(category);

-- Composite index for common queries
CREATE INDEX idx_templates_family_active ON templates(family_id, is_active);

-- ===============================================
-- RLS (Row Level Security)
-- ===============================================

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all active templates
CREATE POLICY "Users can view active templates" ON templates
  FOR SELECT USING (is_active = true);

-- Policy: Users can view their own templates (including inactive)
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (created_by = auth.email()::text);

-- Policy: Users can insert templates
CREATE POLICY "Users can create templates" ON templates
  FOR INSERT WITH CHECK (created_by = auth.email()::text);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (created_by = auth.email()::text);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (created_by = auth.email()::text);

-- ===============================================
-- TRIGGER FOR UPDATED_AT
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_templates_updated_at 
  BEFORE UPDATE ON templates 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- COMMENTS
-- ===============================================

COMMENT ON TABLE templates IS 'Stores Builder V3 templates with canvas configuration and components';
COMMENT ON COLUMN templates.family_id IS 'Reference to the family name (e.g., "Ladrillazos", "Hot Sale")';
COMMENT ON COLUMN templates.canvas_config IS 'Canvas configuration including dimensions, DPI, and background';
COMMENT ON COLUMN templates.default_components IS 'Array of default components included in the template';
COMMENT ON COLUMN templates.family_config IS 'Family-specific configuration like colors and typography';
COMMENT ON COLUMN templates.validation_rules IS 'Array of validation rules for the template';
COMMENT ON COLUMN templates.export_settings IS 'Default export settings for the template'; 