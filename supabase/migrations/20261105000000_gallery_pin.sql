-- code PIN à 4 chiffres requis pour consulter une galerie privée via son
-- lien (en plus du token déjà dans l'URL) ; choisi manuellement par l'admin
alter table galleries
  add column if not exists pin text;
