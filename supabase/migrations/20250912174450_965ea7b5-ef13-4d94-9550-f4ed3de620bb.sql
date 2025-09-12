-- Create study_blocks table for scheduling and email reminders
CREATE TABLE public.study_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  remind_before_minutes INTEGER NOT NULL DEFAULT 10,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own study blocks"
  ON public.study_blocks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study blocks"
  ON public.study_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study blocks"
  ON public.study_blocks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study blocks"
  ON public.study_blocks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_study_blocks_updated_at
  BEFORE UPDATE ON public.study_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX idx_study_blocks_user_id ON public.study_blocks(user_id);
CREATE INDEX idx_study_blocks_start_time ON public.study_blocks(start_time);

-- Enable required extensions for scheduling HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule cron job for sending reminders every minute
SELECT cron.schedule(
  'send-study-reminders-every-minute',
  '* * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://vhusihpuoxzdkrvutosm.supabase.co/functions/v1/send-study-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodXNpaHB1b3h6ZGtydnV0b3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTMwMDYsImV4cCI6MjA3MzE4OTAwNn0.1M7fuY4SEcCGvKqDahGZxgjm933NbVTtP0PwyYzSOe0"}'::jsonb,
        body:='{}'::jsonb
    ) AS request_id;
  $$
);