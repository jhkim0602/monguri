-- Notifications table for mentor/mentee inbox (MVP: RLS disabled)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  recipient_role user_role not null default 'mentee'::user_role,
  type text not null,
  ref_type text,
  ref_id uuid,
  title text not null,
  message text not null,
  action_url text,
  actor_id uuid references public.profiles(id),
  avatar_url text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_recipient_id_idx
  on public.notifications (recipient_id);

create index if not exists notifications_recipient_read_idx
  on public.notifications (recipient_id, read_at);

create index if not exists notifications_created_at_idx
  on public.notifications (created_at desc);
