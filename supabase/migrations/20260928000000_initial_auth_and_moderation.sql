create type public.app_role as enum ('user', 'reviewer', 'admin', 'owner');
create type public.submission_status as enum (
  'draft',
  'submitted',
  'in_review',
  'changes_requested',
  'resubmitted',
  'approved',
  'published',
  'declined'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create or replace function public.has_role(requested_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = requested_role
  );
$$;

create or replace function public.can_review_submissions()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_role('reviewer')
      or public.has_role('admin')
      or public.has_role('owner');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1))
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'user');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  proposed_question text not null check (char_length(proposed_question) between 5 and 300),
  status public.submission_status not null default 'draft',
  submitted_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submission_revisions (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  revision_number integer not null check (revision_number > 0),
  answer_body text not null check (char_length(answer_body) between 20 and 20000),
  author_note text check (char_length(author_note) <= 2000),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (submission_id, revision_number)
);

create table public.submission_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  revision_id uuid not null references public.submission_revisions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  decision public.submission_status not null check (decision in ('changes_requested', 'approved', 'declined')),
  internal_note text check (char_length(internal_note) <= 4000),
  user_message text not null check (char_length(user_message) between 3 and 4000),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_revisions enable row level security;
alter table public.submission_reviews enable row level security;

create policy "Users can read their profile"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.can_review_submissions());

create policy "Users can update their profile"
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "Users can read their roles"
on public.user_roles for select to authenticated
using (user_id = (select auth.uid()) or public.has_role('owner'));

create policy "Owners can grant roles"
on public.user_roles for insert to authenticated
with check (public.has_role('owner'));

create policy "Owners can revoke roles"
on public.user_roles for delete to authenticated
using (public.has_role('owner'));

create policy "Users can read their submissions"
on public.submissions for select to authenticated
using (author_id = (select auth.uid()) or public.can_review_submissions());

create policy "Users can create submissions"
on public.submissions for insert to authenticated
with check (author_id = (select auth.uid()));

create policy "Users can edit active submissions"
on public.submissions for update to authenticated
using (
  (author_id = (select auth.uid()) and status in ('draft', 'changes_requested'))
  or public.can_review_submissions()
)
with check (
  author_id = (select auth.uid())
  or public.can_review_submissions()
);

create policy "Users can read permitted revisions"
on public.submission_revisions for select to authenticated
using (
  exists (
    select 1 from public.submissions
    where submissions.id = submission_revisions.submission_id
      and (submissions.author_id = (select auth.uid()) or public.can_review_submissions())
  )
);

create policy "Users can add revisions to their submissions"
on public.submission_revisions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.submissions
    where submissions.id = submission_revisions.submission_id
      and submissions.author_id = (select auth.uid())
      and submissions.status in ('draft', 'changes_requested')
  )
);

create policy "Reviewers can read reviews"
on public.submission_reviews for select to authenticated
using (
  public.can_review_submissions()
  or exists (
    select 1 from public.submissions
    where submissions.id = submission_reviews.submission_id
      and submissions.author_id = (select auth.uid())
  )
);

create policy "Reviewers can create reviews"
on public.submission_reviews for insert to authenticated
with check (
  public.can_review_submissions()
  and reviewer_id = (select auth.uid())
);

grant select, update on public.profiles to authenticated;
grant select, insert, delete on public.user_roles to authenticated;
grant select, insert, update on public.submissions to authenticated;
grant select, insert on public.submission_revisions to authenticated;
grant select, insert on public.submission_reviews to authenticated;
grant execute on function public.has_role(public.app_role) to authenticated;
grant execute on function public.can_review_submissions() to authenticated;

create index submissions_author_id_idx on public.submissions(author_id);
create index submissions_status_idx on public.submissions(status);
create index submission_revisions_submission_id_idx on public.submission_revisions(submission_id);
create index submission_reviews_submission_id_idx on public.submission_reviews(submission_id);
