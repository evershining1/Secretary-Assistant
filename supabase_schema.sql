-- Create Profiles table (linked to Auth)
create table profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Learn React / Task Table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  completed boolean default false,
  date timestamp with time zone default now(),
  priority text,
  type text, -- 'task' or 'event'
  location text, -- New Location field
  duration int,
  goal_id uuid, -- Link to goals
  created_at timestamp with time zone default now()
);

-- Goals Table
create table goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  type text, -- 'yearly', 'monthly', 'daily'
  progress int default 0,
  color text,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table tasks enable row level security;
alter table goals enable row level security;

-- Policies (Users can only see/edit their own data)
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

create policy "Users can view own tasks." on tasks for select using ( auth.uid() = user_id );
create policy "Users can insert own tasks." on tasks for insert with check ( auth.uid() = user_id );
create policy "Users can update own tasks." on tasks for update using ( auth.uid() = user_id );
create policy "Users can delete own tasks." on tasks for delete using ( auth.uid() = user_id );

create policy "Users can view own goals." on goals for select using ( auth.uid() = user_id );
create policy "Users can insert own goals." on goals for insert with check ( auth.uid() = user_id );
create policy "Users can update own goals." on goals for update using ( auth.uid() = user_id );
create policy "Users can delete own goals." on goals for delete using ( auth.uid() = user_id );
-- OAuth Tokens Table for Calendar Integration
CREATE TABLE IF NOT EXISTS oauth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'apple')),
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tokens
CREATE POLICY "Users manage own OAuth tokens" ON oauth_tokens
    FOR ALL USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_provider ON oauth_tokens(user_id, provider);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_oauth_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS oauth_tokens_updated_at ON oauth_tokens;
CREATE TRIGGER oauth_tokens_updated_at
    BEFORE UPDATE ON oauth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_oauth_tokens_updated_at();
