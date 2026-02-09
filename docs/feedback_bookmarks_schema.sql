-- Feedback bookmarks for mentee feedback archive
-- Run this in Supabase SQL editor once.

CREATE TABLE IF NOT EXISTS public.feedback_bookmarks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, feedback_key)
);

CREATE INDEX IF NOT EXISTS idx_feedback_bookmarks_user_id
  ON public.feedback_bookmarks (user_id);

ALTER TABLE public.feedback_bookmarks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feedback_bookmarks'
      AND policyname = 'feedback_bookmarks_select_own'
  ) THEN
    CREATE POLICY feedback_bookmarks_select_own
      ON public.feedback_bookmarks
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feedback_bookmarks'
      AND policyname = 'feedback_bookmarks_insert_own'
  ) THEN
    CREATE POLICY feedback_bookmarks_insert_own
      ON public.feedback_bookmarks
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feedback_bookmarks'
      AND policyname = 'feedback_bookmarks_delete_own'
  ) THEN
    CREATE POLICY feedback_bookmarks_delete_own
      ON public.feedback_bookmarks
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;
