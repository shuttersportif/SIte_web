-- stocke tout le contenu éditable du site (voir src/lib/content.js) dans
-- une seule ligne JSON, modifiable depuis l'onglet "Contenu" du panel admin
create table if not exists site_content (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint site_content_single_row check (id = 1)
);

insert into site_content (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- la lecture doit être publique (le site affiche ce contenu à tout visiteur) ;
-- l'écriture sera réservée à l'admin une fois l'authentification branchée
alter table site_content enable row level security;

create policy "site_content is readable by everyone"
  on site_content for select
  using (true);
