-- Create study_blocks table for scheduling and email reminders
create table if not exists public.study_blocks (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz not null,
  remind_before_minutes integer not null default 10,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.study_blocks enable row level security;

-- RLS policies
create policy if not exists "Users can view their own study blocks"
  on public.study_blocks
  for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert their own study blocks"
  on public.study_blocks
  for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update their own study blocks"
  on public.study_blocks
  for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete their own study blocks"
  on public.study_blocks
  for delete
  using (auth.uid() = user_id);

-- Trigger to update updated_at
create trigger if not exists update_study_blocks_updated_at
before update on public.study_blocks
for each row
execute function public.update_updated_at_column();

-- Helpful indexes
create index if not exists idx_study_blocks_user_id on public.study_blocks(user_id);
create index if not exists idx_study_blocks_start_time on public.study_blocks(start_time);

-- Enable required extensions for scheduling HTTP calls
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Recreate cron schedule for sending reminders every minute
select cron.unschedule('send-study-reminders-every-minute') 
where exists (select 1 from cron.job where jobname = 'send-study-reminders-every-minute');

select
cron.schedule(
  'send-study-reminders-every-minute',
  '* * * * *',
  $$
  select
    net.http_post(
        url:='https://vhusihpuoxzdkrvutosm.supabase.co/functions/v1/send-study-reminders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodXNpaHB1b3h6ZGtydnV0b3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MTMwMDYsImV4cCI6MjA3MzE4OTAwNn0.1M7fuY4SEcCGvKqDahGZxgjm933NbVTtP0PwyYzSOe0"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
