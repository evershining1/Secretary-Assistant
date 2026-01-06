-- Create calendar_events table
create table if not exists public.calendar_events (
    id uuid default gen_random_uuid() primary key,
    event_id text unique not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    provider text not null, -- 'google' | 'outlook' | 'apple'
    provider_event_id text,
    title text not null,
    description text,
    start_time timestamptz not null,
    end_time timestamptz not null,
    timezone text,
    is_all_day boolean default false,
    recurrence_rule text,
    recurrence_exceptions text[],
    location text,
    availability text, -- 'busy' | 'free' | 'tentative'
    event_type text,   -- 'fixed' | 'flexible'
    last_modified timestamptz,
    sync_status text default 'synced',
    linked_task_id text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.calendar_events enable row level security;

-- Create policy for users to see only their own events
create policy "Users can view their own calendar events"
    on public.calendar_events for select
    using ( auth.uid() = user_id );

create policy "Users can insert their own calendar events"
    on public.calendar_events for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own calendar events"
    on public.calendar_events for update
    using ( auth.uid() = user_id );

create policy "Users can delete their own calendar events"
    on public.calendar_events for delete
    using ( auth.uid() = user_id );

-- Create index for faster sync
create index if not exists calendar_events_user_id_idx on public.calendar_events (user_id);
create index if not exists calendar_events_event_id_idx on public.calendar_events (event_id);
