# Backend Pattern (Next.js + Prisma + Supabase)

## Goal
Maximize Prisma's strengths while keeping the codebase highly predictable for AI-assisted development. The chosen structure must be common, well-referenced, and role-separated.

## Recommended Architecture (Pattern A)
Layered structure:

1) Route Handlers (HTTP only)
- Location: `app/api/**/route.ts`
- Responsibilities:
  - Parse request
  - Call service
  - Return response
- No business logic, no direct DB access

2) Services (business logic)
- Location: `src/services/**`
- Responsibilities:
  - Orchestrate use cases
  - Validate permissions
  - Compose repository calls

3) Repositories (Prisma only)
- Location: `src/repositories/**`
- Responsibilities:
  - Prisma queries and transactions
  - No HTTP, no request context

4) Shared Libraries
- `src/lib/prisma.ts`: PrismaClient singleton
- `src/lib/validators/**`: Zod schemas for input validation

## Why This Pattern
- Clear role boundaries reduce AI confusion.
- Prisma is used in one consistent place (repositories).
- Testing is straightforward: services for logic, repositories for data, routes for integration.
- Strong reference base in the ecosystem (common backend layering).

## Supabase Realtime Compatibility
This architecture works with Supabase Realtime without changes to the core structure.

Principle:
- CRUD uses Prisma (repositories/services).
- Realtime uses Supabase JS client to subscribe to DB changes.
- Supabase Realtime listens to Postgres changes, so Prisma writes still trigger events.

## Minimal Realtime Readiness (Do This Early)
These are the only changes worth planning ahead to avoid later schema rewrites:

1) RLS (Row-Level Security)
- Realtime respects RLS.
- Plan RLS policies early so subscriptions are secure.

2) Ownership Keys
- Ensure tables include `user_id` or `tenant_id` for filtering.

3) Timestamps
- Add `created_at` and `updated_at` for ordering and sync.

4) Indexes
- Add indexes on columns used for subscription filters.

5) Optional: Replica Identity
- If updates need previous row values, set `REPLICA IDENTITY FULL`.

## Summary
- Start with Pattern A now.
- Add Supabase Realtime later by attaching Supabase JS client.
- Only minimal schema and RLS planning is needed up front.

