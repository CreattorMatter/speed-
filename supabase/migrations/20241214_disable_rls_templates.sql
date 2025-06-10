-- ===============================================
-- MIGRATION: Disable RLS on templates table (temporary)
-- ===============================================

-- Disable RLS on templates table for development
ALTER TABLE templates DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view active templates" ON templates;
DROP POLICY IF EXISTS "Users can view own templates" ON templates;
DROP POLICY IF EXISTS "Users can create templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

-- Add comment
COMMENT ON TABLE templates IS 'Templates table with RLS disabled for development. Will be re-enabled with proper auth integration later.'; 