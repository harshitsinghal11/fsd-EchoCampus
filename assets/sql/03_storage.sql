-- ---------------------------------------------------------------------------
-- STORAGE CONFIGURATION
-- Create 'lost_found_images' bucket if not exists
-- NOTE: Requires pg_graphql and storage extensions, normally provided by Supabase
-- ---------------------------------------------------------------------------

-- 1. Create the bucket
insert into storage.buckets (id, name, public)
values ('lost_found_images', 'lost_found_images', true)
on conflict (id) do nothing;

-- 2. Storage Policies
-- Enable RLS (Already enabled by default in Supabase storage.objects, 
-- running ALTER TABLE requires superuser permissions which causes ERROR 42501)
-- alter table storage.objects enable row level security;

-- Policy: Anyone can read images
drop policy if exists "Public Read Access" on storage.objects;
create policy "Public Read Access"
on storage.objects for select
to public
using ( bucket_id = 'lost_found_images' );

-- Policy: Authenticated users can upload images
drop policy if exists "Authenticated Insert Access" on storage.objects;
create policy "Authenticated Insert Access"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'lost_found_images' );

-- Policy: Users can update their own uploads (optional)
drop policy if exists "Users Update Own Image" on storage.objects;
create policy "Users Update Own Image"
on storage.objects for update
to authenticated
using ( bucket_id = 'lost_found_images' and owner = auth.uid() );

-- Policy: Users can delete their own uploads (optional)
drop policy if exists "Users Delete Own Image" on storage.objects;
create policy "Users Delete Own Image"
on storage.objects for delete
to authenticated
using ( bucket_id = 'lost_found_images' and owner = auth.uid() );
