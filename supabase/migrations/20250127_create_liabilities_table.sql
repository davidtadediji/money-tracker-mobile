-- Create the liabilities table for tracking user debts (credit cards, loans, mortgages)
create table
  public.liabilities (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null,
    name text not null,
    type text not null,
    current_balance numeric not null default 0,
    interest_rate numeric null,
    currency text not null default 'USD'::text,
    description text null,
    due_date date null,
    minimum_payment numeric null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint liabilities_pkey primary key (id),
    constraint liabilities_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
    constraint liabilities_type_check check (
      type in ('credit_card', 'loan', 'mortgage', 'other')
    ),
    constraint liabilities_current_balance_check check (current_balance >= 0),
    constraint liabilities_interest_rate_check check (
      interest_rate is null or (interest_rate >= 0 and interest_rate <= 100)
    )
  );

-- Add helpful comments
comment on table public.liabilities is 'User liabilities including credit cards, loans, and mortgages';
comment on column public.liabilities.type is 'Type of liability: credit_card, loan, mortgage, or other';
comment on column public.liabilities.current_balance is 'Current outstanding balance';
comment on column public.liabilities.interest_rate is 'Annual interest rate as a percentage (e.g., 5.5 for 5.5%)';
comment on column public.liabilities.currency is 'Currency code (ISO 4217) for the balance';
comment on column public.liabilities.due_date is 'Next payment due date';
comment on column public.liabilities.minimum_payment is 'Minimum payment amount due';

-- Enable Row Level Security
alter table public.liabilities enable row level security;

-- RLS Policies
create policy "Users can view their own liabilities." 
  on public.liabilities 
  for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own liabilities." 
  on public.liabilities 
  for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own liabilities." 
  on public.liabilities 
  for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own liabilities." 
  on public.liabilities 
  for delete 
  using (auth.uid() = user_id);

-- Indexes for performance
create index liabilities_user_id_idx on public.liabilities (user_id);
create index liabilities_user_id_type_idx on public.liabilities (user_id, type);
create index liabilities_due_date_idx on public.liabilities (due_date) where due_date is not null;
create index liabilities_created_at_idx on public.liabilities (created_at desc);

-- Function to update updated_at timestamp
create or replace function update_liabilities_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_liabilities_updated_at_trigger
  before update on public.liabilities
  for each row
  execute function update_liabilities_updated_at();

