"use server";

import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { updateTag } from "next/cache";

// TODO : tant qu'il n'y a pas de vraie authentification admin (voir
// AccountPanel/Login — actuellement une session de démo côté client), rien
// ici ne vérifie qui appelle cette action. À sécuriser avant la mise en
// production : vérifier une session serveur (ex. Supabase Auth) avant
// d'autoriser l'écriture.
export async function saveContent(data) {
  const { error } = await supabaseAdmin
    .from("site_content")
    .update({ data, updated_at: new Date().toISOString() })
    .eq("id", 1);

  if (error) {
    return { ok: false, message: error.message };
  }

  // les pages publiques (Accueil, Contact, À propos, Prestations, Portfolio)
  // lisent ce contenu via getContent(), mis en cache sous la balise
  // "site-content" : on l'invalide pour qu'elles reflètent immédiatement
  // les changements
  updateTag("site-content");

  return { ok: true };
}
