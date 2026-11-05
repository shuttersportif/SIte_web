-- copie la date de confirmation d'e-mail depuis auth.users (null tant que
-- le lien reçu par e-mail n'a pas été cliqué), pour que l'admin puisse voir
-- le statut de confirmation de chaque compte sans accès direct au schéma auth
alter table profiles
  add column if not exists email_confirmed_at timestamptz;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email, email_confirmed_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email,
    new.email_confirmed_at
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- synchronise profiles.email_confirmed_at à chaque confirmation (ou
-- changement d'e-mail re-déclenchant une confirmation)
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email_confirmed_at = new.email_confirmed_at where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_confirmed();

-- rattrape les comptes déjà créés avant cette migration
update public.profiles p
set email_confirmed_at = u.email_confirmed_at
from auth.users u
where u.id = p.id;
