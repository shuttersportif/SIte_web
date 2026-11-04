-- ajoute un rôle à chaque profil ('client' par défaut, 'admin' pour accéder
-- à /admin) ; jusqu'ici n'importe quel compte Supabase Auth valide pouvait
-- se connecter à l'admin, il n'y avait aucune distinction de rôle
alter table profiles
  add column if not exists role text not null default 'client' check (role in ('client', 'admin'));

-- passe le compte historique de Théo en admin ; pour promouvoir quelqu'un
-- d'autre plus tard : update profiles set role = 'admin' where email = '...';
update profiles set role = 'admin' where email = 'theo@theo-photographe.fr';
