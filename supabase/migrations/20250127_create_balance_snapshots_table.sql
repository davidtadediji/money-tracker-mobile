-- Create the balance_snapshots table for historical net worth tracking
create table
  public.balance_snapshots (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    snapshot_date date not null,
    total_assets numeric not null default 0,
    total_liabilities numeric not null default 0,
    net_worth numeric not null default 0,
    notes text null,
    created_at timestamp with time zone not null default now(),
    constraint balance_snapshots_pkey primary key (id),
    constraint balance_snapshots_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint balance_snapshots_unique_user_date unique (user_id, snapshot_date)
  );

-- Add helpful comments
comment on table public.balance_snapshots is 'Historical snapshots of user net worth over time';
comment on column public.balance_snapshots.snapshot_date is 'Date of the snapshot';
comment on column public.balance_snapshots.total_assets is 'Sum of all assets on snapshot date';
comment on column public.balance_snapshots.total_liabilities is 'Sum of all liabilities on snapshot date';
comment on column public.balance_snapshots.net_worth is 'Net worth (assets - liabilities) on snapshot date';
comment on column public.balance_snapshots.notes is 'Optional notes about this snapshot';

-- Enable Row Level Security
alter table public.balance_snapshots enable row level security;

-- RLS Policies
create policy "Users can view their own balance snapshots." 
  on public.balance_snapshots 
  for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own balance snapshots." 
  on public.balance_snapshots 
  for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own balance snapshots." 
  on public.balance_snapshots 
  for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own balance snapshots." 
  on public.balance_snapshots 
  for delete 
  using (auth.uid() = user_id);

-- Indexes for performance
create index balance_snapshots_user_id_idx on public.balance_snapshots (user_id);
create index balance_snapshots_user_id_date_idx on public.balance_snapshots (user_id, snapshot_date desc);
create index balance_snapshots_snapshot_date_idx on public.balance_snapshots (snapshot_date desc);

-- Function to automatically calculate net worth
create or replace function calculate_net_worth()
returns trigger as $$
begin
    new.net_worth := new.total_assets - new.total_liabilities;
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically calculate net worth on insert/update
create trigger calculate_net_worth_trigger
  before insert or update on public.balance_snapshots
  for each row
  execute function calculate_net_worth();

-- Helper function to create a snapshot for a user
create or replace function create_balance_snapshot(
  p_user_id uuid,
  p_snapshot_date date default current_date
)
returns uuid as $$
declare
  v_total_assets numeric;
  v_total_liabilities numeric;
  v_snapshot_id uuid;
begin
  -- Calculate total assets
  select coalesce(sum(current_value), 0)
  into v_total_assets
  from public.assets
  where user_id = p_user_id;

  -- Calculate total liabilities
  select coalesce(sum(current_balance), 0)
  into v_total_liabilities
  from public.liabilities
  where user_id = p_user_id;

  -- Insert or update snapshot
  insert into public.balance_snapshots (
    user_id,
    snapshot_date,
    total_assets,
    total_liabilities
  )
  values (
    p_user_id,
    p_snapshot_date,
    v_total_assets,
    v_total_liabilities
  )
  on conflict (user_id, snapshot_date)
  do update set
    total_assets = excluded.total_assets,
    total_liabilities = excluded.total_liabilities
  returning id into v_snapshot_id;

  return v_snapshot_id;
end;
$$ language plpgsql security definer;

-- Grant execute permission on the helper function
grant execute on function create_balance_snapshot(uuid, date) to authenticated;

