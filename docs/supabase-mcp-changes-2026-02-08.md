# Supabase MCP Changes (2026-02-08)

## Project
- Name: `monguri-seoul_study`
- Project ID: `wstkmtyjduknttlptxgg`

## Change Summary
Enabled Realtime for additional tables used by mentee pages.

## SQL Applied (DDL)
```
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'mentor_tasks'
  ) then
    alter publication supabase_realtime add table public.mentor_tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'planner_tasks'
  ) then
    alter publication supabase_realtime add table public.planner_tasks;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'weekly_schedule_events'
  ) then
    alter publication supabase_realtime add table public.weekly_schedule_events;
  end if;
end $$;
```

## Tables Added to `supabase_realtime`
- `public.mentor_tasks`
- `public.planner_tasks`
- `public.weekly_schedule_events`

## Update (Daily Records)
Added `public.daily_records` to `supabase_realtime` for calendar realtime updates.

## SQL Applied (DDL) - Daily Records
```
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'daily_records'
  ) then
    alter publication supabase_realtime add table public.daily_records;
  end if;
end $$;
```

## Update (Task Submissions)
Added `public.task_submissions` to `supabase_realtime` for feedback realtime updates.

## SQL Applied (DDL) - Task Submissions
```
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'task_submissions'
  ) then
    alter publication supabase_realtime add table public.task_submissions;
  end if;
end $$;
```

## Notes
- No data changes or schema changes were made beyond publication updates.
- Change applied via Supabase MCP migration tool.
