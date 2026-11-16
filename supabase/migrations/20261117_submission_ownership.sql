-- Listing claims: who claimed it, and whether their email domain matches the
-- board's website. Paste into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

alter table public.board_submissions
  add column if not exists user_id uuid,
  add column if not exists owner_verification text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'board_submissions_owner_verification_check') then
    alter table public.board_submissions
      add constraint board_submissions_owner_verification_check
      check (owner_verification is null or owner_verification in ('domain_match', 'needs_verification'));
  end if;
end $$;

-- Paste this result back to Claude: board submissions hold contact names
-- and emails, so the public key must not be able to read them.
select policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public' and tablename = 'board_submissions';
