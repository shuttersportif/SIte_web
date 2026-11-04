-- stocke les fichiers photo dans Supabase Storage (quota séparé de la base)
-- au lieu de /public : un bucket public pour les aperçus web affichés dans
-- la galerie, un bucket privé pour les originaux HD vendus, livrés via URL
-- signée temporaire après achat (consume_download)
insert into storage.buckets (id, name, public)
values
  ('gallery-web', 'gallery-web', true),
  ('gallery-originals', 'gallery-originals', false)
on conflict (id) do nothing;

-- lecture publique des aperçus web (le bucket est marqué public mais il
-- faut quand même une policy explicite pour le rôle anon)
create policy "gallery-web objects are publicly readable"
  on storage.objects for select
  using (bucket_id = 'gallery-web');

-- gallery-originals n'a aucune policy : seule la clé service_role
-- (src/lib/supabaseAdmin.js, qui ignore les RLS) peut y lire/écrire, pour
-- que les originaux ne soient jamais accessibles sans passer par
-- consume_download()

-- chemin du fichier HD dans gallery-originals, livré via URL signée après
-- achat (src reste l'URL publique de l'aperçu web, affichée librement)
alter table photos
  add column if not exists original_path text;

-- consume_download() servait jusqu'ici src (l'aperçu web) comme fichier
-- acheté ; bascule sur original_path (le fichier HD dans le bucket privé)
drop function if exists consume_download(uuid);

create or replace function consume_download(p_order_item_id uuid)
returns table (restants int, original_path text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_statut text;
  v_restants int;
  v_path text;
begin
  select o.user_id, o.statut, oi.telechargements_restants, p.original_path
    into v_user_id, v_statut, v_restants, v_path
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

  return query select v_restants, v_path;
end;
$$;

grant execute on function consume_download(uuid) to authenticated;
