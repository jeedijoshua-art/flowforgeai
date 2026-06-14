-- Create workflows table
create table public.workflows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  nodes jsonb not null default '[]'::jsonb,
  edges jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.workflows enable row level security;

-- Policies for RLS
create policy "Users can read their own workflows"
  on public.workflows for select
  using (auth.uid() = user_id);

create policy "Users can create their own workflows"
  on public.workflows for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workflows"
  on public.workflows for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own workflows"
  on public.workflows for delete
  using (auth.uid() = user_id);

-- Trigger to automatically update updated_at
create or replace function public.handle_update_timestamp()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger set_workflows_updated_at
  before update on public.workflows
  for each row
  execute function public.handle_update_timestamp();
