-- Create the assets table for tracking user assets (cash, bank accounts, investments, property)
create table
  public.assets (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    name text not null,
    type text not null,
    current_value numeric not null default 0,
    currency text not null default 'USD'::text,
    description text null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint assets_pkey primary key (id),
    constraint assets_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint assets_type_check check (
      type in ('cash', 'bank', 'investment', 'property', 'other')
    ),
    constraint assets_current_value_check check (current_value >= 0)
  );

-- Add helpful comments
comment on table public.assets is 'User assets including cash, bank accounts, investments, and property';
comment on column public.assets.type is 'Type of asset: cash, bank, investment, property, or other';
comment on column public.assets.current_value is 'Current monetary value of the asset';
comment on column public.assets.currency is 'Currency code (ISO 4217) for the asset value';

-- Enable Row Level Security
alter table public.assets enable row level security;

-- RLS Policies
create policy "Users can view their own assets." 
  on public.assets 
  for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own assets." 
  on public.assets 
  for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own assets." 
  on public.assets 
  for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own assets." 
  on public.assets 
  for delete 
  using (auth.uid() = user_id);

-- Indexes for performance
create index assets_user_id_idx on public.assets (user_id);
create index assets_user_id_type_idx on public.assets (user_id, type);
create index assets_created_at_idx on public.assets (created_at desc);

-- Function to update updated_at timestamp
create or replace function update_assets_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_assets_updated_at_trigger
  before update on public.assets
  for each row
  execute function update_assets_updated_at();

