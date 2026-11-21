-- Tap-first review flow: structured answers, drafts, source tracking,
-- verification, voucher tracking and a per-step event log.
-- Paste into Supabase → SQL Editor → New query → Run. Safe to run more than once.
-- Run 20261116_reviews_instant.sql first if it has not been run yet.

-- 1. New columns on reviews ------------------------------------------------
alter table public.reviews
  add column if not exists board_slug text,
  add column if not exists listing_type text not null default 'job_board',
  add column if not exists would_use_again text,
  add column if not exists aspect_ratings jsonb not null default '{}'::jsonb,
  add column if not exists pros text[] not null default '{}',
  add column if not exists cons text[] not null default '{}',
  add column if not exists reviewer_role text,
  add column if not exists firm_type text,
  add column if not exists facts jsonb not null default '{}'::jsonb,
  add column if not exists specialties text[] not null default '{}',
  add column if not exists colleague_note text,
  add column if not exists draft_text text,
  add column if not exists draft_edited boolean not null default false,
  add column if not exists invite_source text not null default 'personal',
  add column if not exists invite_ref text,
  add column if not exists verification_method text,
  add column if not exists linkedin_url text,
  add column if not exists display_preference text,
  add column if not exists display_name text,
  add column if not exists consent_at timestamptz,
  add column if not exists draft_token uuid,
  add column if not exists confirm_token uuid,
  add column if not exists step_reached text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists published_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists voucher_status text not null default 'none';

-- review_text and rating are empty while a review is still a draft.
alter table public.reviews alter column review_text drop not null;
alter table public.reviews alter column rating drop not null;

-- 2. Status: draft / submitted / verified / published / rejected -----------
-- Old values: approved -> published. pending (guest reviews waiting under
-- the old rule) -> submitted, so they stay in the admin queue until you
-- publish or reject them.
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.reviews'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%status%'
  loop
    execute format('alter table public.reviews drop constraint %I', c.conname);
  end loop;
end $$;

update public.reviews set status = 'published', published_at = coalesce(published_at, created_at)
  where status = 'approved';
update public.reviews set status = 'submitted' where status = 'pending';

alter table public.reviews
  add constraint reviews_status_check
  check (status in ('draft', 'submitted', 'verified', 'published', 'rejected'));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_invite_source_check') then
    alter table public.reviews add constraint reviews_invite_source_check
      check (invite_source in ('personal', 'voucher', 'vendor'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_listing_type_check') then
    alter table public.reviews add constraint reviews_listing_type_check
      check (listing_type in ('job_board', 'ai_tool'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reviews_voucher_status_check') then
    alter table public.reviews add constraint reviews_voucher_status_check
      check (voucher_status in ('none', 'issued'));
  end if;
end $$;

-- 3. Existing reviews -> new model ------------------------------------------
-- Old reviews were signed-in members (confirmed account email) or guests.
update public.reviews
  set verification_method = 'signed_in', verified_at = coalesce(verified_at, created_at)
  where user_id is not null and verification_method is null and status = 'published';
update public.reviews
  set display_preference = 'role_firm'
  where display_preference is null and status <> 'draft';
-- Board pages still look reviews up by board_name, so old rows without a
-- board_slug keep working. New rows get both.
alter table public.reviews alter column status set default 'draft';

create index if not exists reviews_board_slug_status_idx on public.reviews (board_slug, status);
create index if not exists reviews_confirm_token_idx on public.reviews (confirm_token) where confirm_token is not null;

-- 4. Step events for the drop-off report ----------------------------------
create table if not exists public.review_events (
  id bigint generated always as identity primary key,
  review_id uuid,
  session_id text not null,
  board_slug text not null,
  step text not null,
  event text not null check (event in ('viewed', 'answered', 'abandoned')),
  src text not null default 'personal',
  created_at timestamptz not null default now()
);
create index if not exists review_events_created_idx on public.review_events (created_at);

-- Only the server (service key) reads or writes events.
alter table public.review_events enable row level security;

-- 5. Check: paste this result back to Claude.
select column_name, data_type, is_nullable from information_schema.columns
where table_schema = 'public' and table_name = 'reviews'
order by ordinal_position;
