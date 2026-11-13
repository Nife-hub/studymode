  -- StudyMode's tables in Supabase (round 4, step R4-2).
  -- Paste all of this into Supabase → SQL Editor → New query, then click Run.
  -- Safe to run again: it only creates what's missing.

  -- 1. Past study sessions: one row per session, the whole session kept as JSON
  --    (name, date, score, every question and answer), exactly as history.js saves it.
  create table if not exists public.study_sessions (
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    id text not null,
    data jsonb not null,
    updated_at timestamptz not null default now(),
    primary key (user_id, id)
  );

  -- 2. Saved documents: an unfinished session's chunk texts, so it can be continued
  --    on any device. `size` is worked out by the database, for the 5 MB storage bar.
  create table if not exists public.saved_documents (
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    id text not null,
    chunks jsonb not null,
    size integer generated always as (octet_length(chunks::text)) stored,
    primary key (user_id, id)
  );

  -- 3. The lock: people can only ever see and change their own rows.
  alter table public.study_sessions enable row level security;
  alter table public.saved_documents enable row level security;

  drop policy if exists "Own sessions only" on public.study_sessions;
  create policy "Own sessions only" on public.study_sessions
    for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

  drop policy if exists "Own documents only" on public.saved_documents;
  create policy "Own documents only" on public.saved_documents
    for all to authenticated
    using (user_id = (select auth.uid()))
    with check (user_id = (select auth.uid()));

  revoke all on public.study_sessions, public.saved_documents from anon;
  grant select, insert, update, delete on public.study_sessions, public.saved_documents to authenticated;

  -- 4. Each account gets 5 MB for saved documents. The page checks this first;
  --    the database checks again so it can't be skipped.
  create or replace function public.check_document_space() returns trigger
  language plpgsql security definer set search_path = '' as $$
  begin
    if (select coalesce(sum(size), 0) from public.saved_documents
        where user_id = new.user_id and id <> new.id)
      + octet_length(new.chunks::text) > 5 * 1024 * 1024 then
      raise exception 'storage_full';
    end if;
    return new;
  end $$;

  drop trigger if exists document_space on public.saved_documents;
  create trigger document_space before insert or update on public.saved_documents
    for each row execute function public.check_document_space();

  -- 5. Delete account: removes the signed-in person and, through "on delete cascade",
  --    all their sessions and saved documents. Only works on your own account.
  create or replace function public.delete_my_account() returns void
  language sql security definer set search_path = '' as $$
    delete from auth.users where id = auth.uid();
  $$;

  revoke execute on function public.delete_my_account() from public, anon;
  grant execute on function public.delete_my_account() to authenticated;
