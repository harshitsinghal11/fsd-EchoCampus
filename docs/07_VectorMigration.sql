-- ==========================================
-- ECHOCAMPUS VECTOR SEARCH MIGRATION
-- ==========================================
-- This schema powers the E.C.H.O assistant's vector-search path.
--
-- Important implementation note:
-- The database schema below assumes a 768-dimension embedding vector.
-- Keep the ingestion model and the runtime query model aligned to the same
-- dimension before relying on this path in production.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.campus_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  metadata jsonb,
  embedding vector(768)
);

ALTER TABLE public.campus_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read campus knowledge"
  ON public.campus_knowledge
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Faculty-style users can manage campus knowledge"
  ON public.campus_knowledge
  FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE OR REPLACE FUNCTION match_campus_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    campus_knowledge.id,
    campus_knowledge.content,
    campus_knowledge.metadata,
    1 - (campus_knowledge.embedding <=> query_embedding) AS similarity
  FROM campus_knowledge
  WHERE 1 - (campus_knowledge.embedding <=> query_embedding) > match_threshold
  ORDER BY campus_knowledge.embedding <=> query_embedding
  LIMIT match_count;
$$;
