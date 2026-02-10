# Supabase MCP Changes (2026-02-10)

## Project
- Name: `monguri-seoul_study`
- Project ID: `wstkmtyjduknttlptxgg`

## Change Summary
Added time range columns for mentor tasks so mentor-assigned tasks can persist planned start/end times.

## SQL Applied (DDL)
```sql
alter table public.mentor_tasks
  add column if not exists start_time text,
  add column if not exists end_time text;
```

## Rollback SQL
```sql
alter table public.mentor_tasks
  drop column if exists start_time,
  drop column if exists end_time;
```

## Notes
- Existing rows remain valid (`NULL` allowed).
- Applied via Supabase MCP migration tool.
