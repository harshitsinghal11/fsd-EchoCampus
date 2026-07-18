-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the campus_knowledge table
CREATE TABLE IF NOT EXISTS public.campus_knowledge (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb,
  embedding vector(768) -- Google's text-embedding-004 output dimension is 768
);

-- Enable RLS (Optional but good practice)
ALTER TABLE public.campus_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow public read access"
  ON public.campus_knowledge
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role / admin to insert/update (since ingestion runs in backend/scripts)
CREATE POLICY "Allow admin insert/update"
  ON public.campus_knowledge
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin' );

-- Create a function to search for similarity
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
LANGUAGE sql STABLE
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
