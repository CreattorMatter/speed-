-- ===============================================
-- Templates read policy to avoid empty results due to RLS
-- ===============================================

-- Ensure RLS is enabled so policies apply (safe if already enabled)
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Allow read for all authenticated users (and anon if used without auth)
DROP POLICY IF EXISTS "read templates public" ON public.templates;
CREATE POLICY "read templates public"
  ON public.templates
  FOR SELECT
  USING (true);

-- Allow write operations for authenticated users
DROP POLICY IF EXISTS "write templates authenticated" ON public.templates;
CREATE POLICY "write templates authenticated"
  ON public.templates
  FOR ALL
  USING (auth.uid() IS NOT NULL);


