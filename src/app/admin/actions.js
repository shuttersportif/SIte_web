"use server";

import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { createClient } from "../../lib/supabase/serverClient";
import { updateTag } from "next/cache";

export async function saveContent(data) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Session expirée, reconnectez-vous." };
  }

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
