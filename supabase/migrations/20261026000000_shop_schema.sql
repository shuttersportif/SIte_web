-- profil utilisateur (prénom/nom/e-mail/tél), une ligne par compte Supabase
-- Auth ; créée automatiquement à l'inscription par le trigger plus bas
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are readable by their owner"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles are updatable by their owner"
  on profiles for update
  using (auth.uid() = id);

-- copie prénom/nom (envoyés par AccountPanel via user_metadata à l'inscription)
-- et e-mail dans profiles dès la création du compte Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- catalogue : une course/événement, publique (visible de tous) ou privée
-- (visible seulement par son propriétaire, une fois le lien distribué par
-- l'admin — fonctionnalité pas encore câblée côté admin)
create table if not exists galleries (
  id text primary key,
  nom text not null,
  categorie text not null,
  lieu text not null,
  date date not null,
  visibilite text not null default 'publique' check (visibilite in ('publique', 'privee')),
  owner_id uuid references auth.users (id),
  token text unique,
  created_at timestamptz not null default now()
);

alter table galleries enable row level security;

create policy "galleries are readable when public or owned"
  on galleries for select
  using (visibilite = 'publique' or owner_id = auth.uid());

-- une photo en vente au sein d'une galerie, avec son prix
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  gallery_id text not null references galleries (id) on delete cascade,
  numero int not null,
  src text not null,
  prix numeric(10, 2) not null default 15,
  created_at timestamptz not null default now(),
  unique (gallery_id, numero)
);

alter table photos enable row level security;

create policy "photos are readable via their gallery"
  on photos for select
  using (
    exists (
      select 1 from galleries g
      where g.id = photos.gallery_id
        and (g.visibilite = 'publique' or g.owner_id = auth.uid())
    )
  );

-- commande d'un client, créée via la fonction create_order() ci-dessous.
-- aucune policy d'insert/update pour les clients : seule cette fonction
-- (security definer, propriétaire = postgres donc hors RLS) peut écrire,
-- afin que prix et quantités ne soient jamais ceux envoyés par le navigateur.
-- l'admin modifie le statut via src/lib/supabaseAdmin.js (clé service_role).
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'payee', 'rembourse')),
  sous_total numeric(10, 2) not null default 0,
  remise numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "orders are readable by their owner"
  on orders for select
  using (user_id = auth.uid());

-- une ligne de commande = une photo achetée, avec son quota de
-- téléchargements (décrémenté par consume_download())
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  photo_id uuid not null references photos (id),
  qty int not null default 1,
  prix numeric(10, 2) not null,
  telechargements_max int not null default 3,
  telechargements_restants int not null default 3,
  unique (order_id, photo_id)
);

alter table order_items enable row level security;

create policy "order_items are readable via their order"
  on order_items for select
  using (exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid()));

-- crée une commande à partir du panier : p_items = [{photo_id, qty}, ...].
-- relit les vrais prix en base (jamais ceux du client), applique la même
-- remise de 20 % à partir de 3 photos différentes que l'ancienne démo admin.
create or replace function create_order(p_items jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_sous_total numeric(10, 2) := 0;
  v_remise numeric(10, 2) := 0;
  v_item jsonb;
  v_prix numeric(10, 2);
  v_photo_id uuid;
  v_qty int;
begin
  if auth.uid() is null then
    raise exception 'Authentification requise';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Panier vide';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select prix into v_prix from photos where id = (v_item ->> 'photo_id')::uuid;
    if v_prix is null then
      raise exception 'Photo inconnue : %', v_item ->> 'photo_id';
    end if;
    v_qty := greatest(1, coalesce((v_item ->> 'qty')::int, 1));
    v_sous_total := v_sous_total + v_prix * v_qty;
  end loop;

  if jsonb_array_length(p_items) >= 3 then
    v_remise := round(v_sous_total * 0.2, 2);
  end if;

  insert into orders (user_id, statut, sous_total, remise, total)
  values (auth.uid(), 'en_attente', v_sous_total, v_remise, v_sous_total - v_remise)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_photo_id := (v_item ->> 'photo_id')::uuid;
    select prix into v_prix from photos where id = v_photo_id;
    v_qty := greatest(1, coalesce((v_item ->> 'qty')::int, 1));
    insert into order_items (order_id, photo_id, qty, prix)
    values (v_order_id, v_photo_id, v_qty, v_prix);
  end loop;

  return v_order_id;
end;
$$;

grant execute on function create_order(jsonb) to authenticated;

-- décrémente le quota de téléchargements d'une ligne de commande, après
-- vérification que l'appelant en est bien le propriétaire et que la
-- commande est payée. retourne le compteur restant + le fichier à servir.
create or replace function consume_download(p_order_item_id uuid)
returns table (restants int, src text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_statut text;
  v_restants int;
  v_src text;
begin
  select o.user_id, o.statut, oi.telechargements_restants, p.src
    into v_user_id, v_statut, v_restants, v_src
  from order_items oi
  join orders o on o.id = oi.order_id
  join photos p on p.id = oi.photo_id
  where oi.id = p_order_item_id;

  if v_user_id is null then
    raise exception 'Téléchargement introuvable';
  end if;
  if v_user_id <> auth.uid() then
    raise exception 'Accès refusé';
  end if;
  if v_statut <> 'payee' then
    raise exception 'Commande non payée';
  end if;
  if v_restants <= 0 then
    raise exception 'Téléchargements épuisés';
  end if;

  update order_items set telechargements_restants = telechargements_restants - 1
  where id = p_order_item_id
  returning telechargements_restants into v_restants;

  return query select v_restants, v_src;
end;
$$;

grant execute on function consume_download(uuid) to authenticated;

-- seed : reprend le catalogue actuellement codé en dur dans
-- src/lib/galleryData.js, pour ne pas repartir d'une boutique vide
insert into galleries (id, nom, categorie, lieu, date, visibilite) values
  ('trophee-anjou-2026', 'Trophée de l''Anjou', 'motorsport', 'Circuit de l''Anjou', '2026-10-04', 'publique'),
  ('boucles-maine-2026', 'Boucles de la Maine', 'cyclisme', 'Angers', '2026-09-27', 'publique'),
  ('cote-coteaux-2026', 'Course de côte des Coteaux', 'motorsport', 'Saumur', '2026-07-19', 'publique'),
  ('gp-doutre-2026', 'Grand Prix de la Doutre', 'cyclisme', 'Angers', '2026-06-14', 'publique'),
  ('coupes-printemps-2026', 'Coupes de printemps', 'motorsport', 'Circuit du Val', '2026-05-03', 'publique'),
  ('criterium-ponts-de-ce-2026', 'Critérium des Ponts-de-Cé', 'cyclisme', 'Les Ponts-de-Cé', '2026-04-19', 'publique'),
  ('prix-trelaze-2026', 'Prix de Trélazé', 'cyclisme', 'Trélazé', '2026-03-08', 'publique'),
  ('endurance-hiver-2026', 'Endurance d''hiver', 'motorsport', 'Circuit du Val', '2026-02-15', 'publique')
on conflict (id) do nothing;

insert into photos (gallery_id, numero, src, prix)
select g.id, n, case g.categorie when 'cyclisme' then '/Photo/voiture.png' else '/Photo/voiture2.png' end, 15
from (values
  ('trophee-anjou-2026', 6),
  ('boucles-maine-2026', 6),
  ('cote-coteaux-2026', 5),
  ('gp-doutre-2026', 5),
  ('coupes-printemps-2026', 5),
  ('criterium-ponts-de-ce-2026', 5),
  ('prix-trelaze-2026', 4),
  ('endurance-hiver-2026', 4)
) as counts(id, photo_count)
join galleries g on g.id = counts.id
cross join lateral generate_series(1, counts.photo_count) as n
on conflict (gallery_id, numero) do nothing;
