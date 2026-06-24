-- EchoCampus
-- RLS Policies + Functions + Triggers (code-aligned)
-- Last updated: 2026-05-04

-- ---------------------------------------------------------------------------
-- ENABLE RLS
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.student_profiles enable row level security;
alter table public.faculty_profiles enable row level security;
alter table public.faculty_users enable row level security;
alter table public.directory enable row level security;
alter table public.announcements enable row level security;
alter table public.complaint_box enable row level security;
alter table public.complaint_upvotes enable row level security;
alter table public.marketplace enable row level security;
alter table public.lost_found enable row level security;

-- ---------------------------------------------------------------------------
-- PUBLIC HELPER FUNCTIONS
-- ---------------------------------------------------------------------------
create or replace function public.is_faculty_email(input_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.directory d
    where lower(trim(d.email)) = lower(trim(coalesce(input_email, '')))
  );
$$;

revoke all on function public.is_faculty_email(text) from public;
grant execute on function public.is_faculty_email(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- USERS / PROFILES
-- ---------------------------------------------------------------------------
drop policy if exists "Public Read Users" on public.users;
drop policy if exists users_select_own on public.users;
create policy users_select_own
on public.users for select
to authenticated
using (id = auth.uid());

drop policy if exists users_insert_self on public.users;
create policy users_insert_self
on public.users for insert
to authenticated
with check (
  id = auth.uid()
  and lower(trim(email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  and (
    role = 'student'
    or (
      role = 'faculty'
      and exists (
        select 1
        from public.directory d
        where lower(trim(d.email)) = lower(trim(email))
      )
    )
  )
);

-- Intentionally no direct client UPDATE policy on public.users.
-- Keeping role in this table makes self-service updates unsafe without an RPC or
-- a separate writable profile table.
drop policy if exists "Users Update Own Profile" on public.users;
drop policy if exists users_update_own_profile on public.users;
drop policy if exists users_update_self_safe on public.users;

drop policy if exists "Public Read Student Profiles" on public.student_profiles;
drop policy if exists student_profile_select_own on public.student_profiles;
drop policy if exists student_profiles_read_authenticated on public.student_profiles;
create policy student_profiles_read_authenticated
on public.student_profiles for select
to authenticated
using (true);

drop policy if exists "Users can create their own student profile" on public.student_profiles;
drop policy if exists student_profile_insert_own on public.student_profiles;
create policy student_profile_insert_own
on public.student_profiles for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update their own student profile" on public.student_profiles;
drop policy if exists student_profile_update_own on public.student_profiles;
create policy student_profile_update_own
on public.student_profiles for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Public Read Faculty Profiles" on public.faculty_profiles;
drop policy if exists faculty_profile_select_own on public.faculty_profiles;
create policy faculty_profile_select_own
on public.faculty_profiles for select
to authenticated
using (user_id = auth.uid());

drop policy if exists faculty_profile_insert_own on public.faculty_profiles;
create policy faculty_profile_insert_own
on public.faculty_profiles for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('faculty', 'admin')
  )
);

drop policy if exists faculty_profile_update_own on public.faculty_profiles;
create policy faculty_profile_update_own
on public.faculty_profiles for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('faculty', 'admin')
  )
);

drop policy if exists faculty_users_select_own on public.faculty_users;
create policy faculty_users_select_own
on public.faculty_users for select
to authenticated
using (user_id = auth.uid());

drop policy if exists faculty_users_insert_self_mapped on public.faculty_users;
create policy faculty_users_insert_self_mapped
on public.faculty_users for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role in ('faculty', 'admin')
  )
  and exists (
    select 1
    from public.users u
    join public.directory d
      on lower(trim(d.email)) = lower(trim(u.email))
    where u.id = auth.uid()
      and d.id = faculty_id
  )
);

-- ---------------------------------------------------------------------------
-- DIRECTORY / ANNOUNCEMENTS
-- ---------------------------------------------------------------------------
drop policy if exists directory_read_authenticated on public.directory;
create policy directory_read_authenticated
on public.directory for select
to authenticated
using (true);

drop policy if exists "Public View Announcements" on public.announcements;
drop policy if exists announcement_read_authenticated on public.announcements;
create policy announcement_read_authenticated
on public.announcements for select
to authenticated
using (true);

drop policy if exists "Faculty Post Announcements" on public.announcements;
drop policy if exists announcement_insert_faculty_only on public.announcements;
create policy announcement_insert_faculty_only
on public.announcements for insert
to authenticated
with check (
  exists (
    select 1
    from public.faculty_users fu
    where fu.user_id = auth.uid()
      and fu.faculty_id = author_id
  )
);

-- ---------------------------------------------------------------------------
-- COMPLAINTS
-- ---------------------------------------------------------------------------
drop policy if exists "Public View Complaints" on public.complaint_box;
drop policy if exists complaints_read_authenticated on public.complaint_box;
create policy complaints_read_authenticated
on public.complaint_box for select
to authenticated
using (true);

drop policy if exists "Students Submit Complaints" on public.complaint_box;
drop policy if exists complaints_insert_student_only on public.complaint_box;
create policy complaints_insert_student_only
on public.complaint_box for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'student'
  )
);

drop policy if exists "Public can view upvotes" on public.complaint_upvotes;
drop policy if exists complaint_upvotes_read_authenticated on public.complaint_upvotes;
create policy complaint_upvotes_read_authenticated
on public.complaint_upvotes for select
to authenticated
using (true);

drop policy if exists "Students can upvote" on public.complaint_upvotes;
drop policy if exists complaint_upvotes_insert_student_only on public.complaint_upvotes;
create policy complaint_upvotes_insert_student_only
on public.complaint_upvotes for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'student'
  )
);

drop policy if exists "Students can un-vote" on public.complaint_upvotes;
drop policy if exists complaint_upvotes_delete_own on public.complaint_upvotes;
create policy complaint_upvotes_delete_own
on public.complaint_upvotes for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- MARKETPLACE
-- ---------------------------------------------------------------------------
drop policy if exists "Students View Market" on public.marketplace;
drop policy if exists marketplace_read_student_only on public.marketplace;
create policy marketplace_read_student_only
on public.marketplace for select
to authenticated
using (
  exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'student'
  )
);

drop policy if exists "Students Sell Market" on public.marketplace;
drop policy if exists marketplace_insert_student_owner on public.marketplace;
create policy marketplace_insert_student_owner
on public.marketplace for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'student'
  )
);

drop policy if exists "Owner Manage Market" on public.marketplace;
drop policy if exists marketplace_update_owner_only on public.marketplace;
create policy marketplace_update_owner_only
on public.marketplace for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- LOST + FOUND
-- ---------------------------------------------------------------------------
drop policy if exists "Public View LostFound" on public.lost_found;
drop policy if exists lost_found_read_authenticated on public.lost_found;
create policy lost_found_read_authenticated
on public.lost_found for select
to authenticated
using (true);

drop policy if exists "Authorized Post LostFound" on public.lost_found;
drop policy if exists lost_found_insert_owner on public.lost_found;
create policy lost_found_insert_owner
on public.lost_found for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Owner Delete LostFound" on public.lost_found;
drop policy if exists lost_found_delete_owner on public.lost_found;
create policy lost_found_delete_owner
on public.lost_found for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- FUNCTIONS + TRIGGERS: USAGE LIMITS
-- ---------------------------------------------------------------------------
create or replace function public.check_lost_found_limit()
returns trigger
language plpgsql
as $$
declare
  post_count integer;
begin
  select count(*) into post_count
  from public.lost_found
  where user_id = new.user_id
    and created_at > (now() - interval '24 hours');

  if post_count >= 2 then
    raise exception 'Daily limit reached! You can only post 2 items every 24 hours.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_lost_found_limit on public.lost_found;
create trigger enforce_lost_found_limit
before insert on public.lost_found
for each row execute function public.check_lost_found_limit();

create or replace function public.check_complaint_limit()
returns trigger
language plpgsql
as $$
declare
  complaint_count integer;
begin
  select count(*) into complaint_count
  from public.complaint_box
  where user_id = new.user_id
    and created_at > (now() - interval '7 days');

  if complaint_count >= 1 then
    raise exception 'Weekly limit reached! You can only submit 1 complaint per week.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_complaint_limit on public.complaint_box;
create trigger enforce_complaint_limit
before insert on public.complaint_box
for each row execute function public.check_complaint_limit();

create or replace function public.check_marketplace_limit()
returns trigger
language plpgsql
as $$
declare
  listing_count integer;
begin
  select count(*) into listing_count
  from public.marketplace
  where owner_id = new.owner_id
    and created_at > (now() - interval '3 days');

  if listing_count >= 1 then
    raise exception 'Limit reached! You can only list 1 item every 3 days.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_marketplace_limit on public.marketplace;
create trigger enforce_marketplace_limit
before insert on public.marketplace
for each row execute function public.check_marketplace_limit();

-- ---------------------------------------------------------------------------
-- OPTIONAL BOOTSTRAP: keep public.users in sync with auth.users
-- (recommended to avoid "User profile not found" during app login flow)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_directory public.directory%rowtype;
begin
  select *
  into matched_directory
  from public.directory d
  where lower(trim(d.email)) = lower(trim(new.email))
  limit 1;

  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      matched_directory.name,
      new.raw_user_meta_data ->> 'full_name',
      split_part(new.email, '@', 1)
    ),
    case
      when matched_directory.id is not null then 'faculty'
      else 'student'
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = case
          when public.users.role = 'admin' then public.users.role
          else excluded.role
        end;

  if matched_directory.id is not null then
    insert into public.faculty_profiles (
      user_id,
      department,
      phone_no,
      cabin_no,
      experience_years
    )
    values (
      new.id,
      matched_directory.department,
      matched_directory.phone_no,
      matched_directory.cabin_no,
      matched_directory.experience
    )
    on conflict (user_id) do update
      set department = excluded.department,
          phone_no = excluded.phone_no,
          cabin_no = excluded.cabin_no,
          experience_years = excluded.experience_years;

    insert into public.faculty_users (user_id, faculty_id)
    values (new.id, matched_directory.id)
    on conflict (user_id) do update
      set faculty_id = excluded.faculty_id;
  end if;

  -- Inject role into auth.users metadata for JWT read
  update auth.users
  set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', case when matched_directory.id is not null then 'faculty' else 'student' end)
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.handle_auth_user_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set email = new.email
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row execute function public.handle_auth_user_email_update();
