-- Reviews: instant publishing for signed-in members, guest reviews, one per board.
-- Paste into Supabase → SQL Editor → New query → Run. Safe to run more than once.

-- 1. New columns
alter table public.reviews
  add column if not exists reviewer_email text,
  add column if not exists is_work_email boolean not null default false,
  add column if not exists source text not null default 'member';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reviews_source_check') then
    alter table public.reviews
      add constraint reviews_source_check check (source in ('member', 'guest'));
  end if;
end $$;

-- 2. One review per person per board
create unique index if not exists reviews_one_per_member_per_board
  on public.reviews (user_id, board_name)
  where user_id is not null;

create unique index if not exists reviews_one_per_guest_per_board
  on public.reviews (lower(reviewer_email), board_name)
  where user_id is null and reviewer_email is not null;

-- Faster board-page lookups
create index if not exists reviews_board_status_idx
  on public.reviews (board_name, status);

-- 3. Access rules. The site reads and writes reviews with the server-side
--    service key, which bypasses these. They only govern the public key
--    used in the browser.
alter table public.reviews enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'reviews'
      and policyname = 'Members read their own reviews'
  ) then
    create policy "Members read their own reviews"
      on public.reviews for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;

-- 4. Show every policy on reviews. Paste this result back to Claude: any
--    policy letting "anon" or "public" SELECT all rows would expose pending
--    reviews and reviewer emails.
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename = 'reviews';
