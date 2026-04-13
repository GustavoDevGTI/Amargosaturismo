create extension if not exists pgcrypto;

create table if not exists public.calendar_events (
    id uuid primary key default gen_random_uuid(),
    event_date date not null,
    title varchar(80) not null,
    event_time time null,
    description varchar(200) not null default '',
    categories text[] not null default '{}'::text[],
    access_type text not null default 'free',
    display_style text not null default 'dot',
    image_url text null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.calendar_events
    alter column description type varchar(200),
    add column if not exists image_url text null,
    add column if not exists access_type text not null default 'free',
    add column if not exists display_style text not null default 'dot';

alter table public.calendar_events
    drop constraint if exists calendar_events_access_type_check;

alter table public.calendar_events
    add constraint calendar_events_access_type_check check (access_type in ('free', 'paid'));

alter table public.calendar_events
    drop constraint if exists calendar_events_display_style_check;

alter table public.calendar_events
    add constraint calendar_events_display_style_check check (display_style in ('dot', 'bar'));

create or replace function public.set_calendar_events_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at
before update on public.calendar_events
for each row execute function public.set_calendar_events_updated_at();

alter table public.calendar_events enable row level security;

drop policy if exists calendar_events_public_read on public.calendar_events;
create policy calendar_events_public_read
on public.calendar_events
for select
to anon, authenticated
using (true);

drop policy if exists calendar_events_authenticated_write on public.calendar_events;
create policy calendar_events_authenticated_write
on public.calendar_events
for all
to authenticated
using ((auth.jwt() ->> 'email') = 'admincalendarioamargosa@gmail.com')
with check ((auth.jwt() ->> 'email') = 'admincalendarioamargosa@gmail.com');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'calendar-event-images',
    'calendar-event-images',
    true,
    4194304,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists calendar_event_images_public_read on storage.objects;
create policy calendar_event_images_public_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'calendar-event-images');

drop policy if exists calendar_event_images_authenticated_write on storage.objects;
create policy calendar_event_images_authenticated_write
on storage.objects
for all
to authenticated
using (
    bucket_id = 'calendar-event-images'
    and (auth.jwt() ->> 'email') = 'admincalendarioamargosa@gmail.com'
)
with check (
    bucket_id = 'calendar-event-images'
    and (auth.jwt() ->> 'email') = 'admincalendarioamargosa@gmail.com'
);
