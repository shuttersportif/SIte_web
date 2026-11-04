-- retire les galeries de démo (seedées dans 20261026000000_shop_schema.sql
-- avec des photos placeholder statiques) maintenant que les vraies galeries
-- sont créées depuis l'admin via Supabase Storage ; la suppression cascade
-- sur photos (photos.gallery_id ... on delete cascade)
delete from galleries where id in (
  'trophee-anjou-2026',
  'boucles-maine-2026',
  'cote-coteaux-2026',
  'gp-doutre-2026',
  'coupes-printemps-2026',
  'criterium-ponts-de-ce-2026',
  'prix-trelaze-2026',
  'endurance-hiver-2026'
);
