// server-only : lit la table site_content (une seule ligne, id=1) et
// fusionne son contenu par-dessus les valeurs par défaut ; si la base est
// indisponible ou vide, le site continue de fonctionner avec DEFAULT_CONTENT
//
// mis en cache (pas de revalidation programmée : le contenu ne change que
// via l'admin, qui invalide la balise "site-content" à chaque enregistrement)

import { cacheLife, cacheTag } from "next/cache";
import { DEFAULT_CONTENT, mergeDefaults } from "./content";

export async function getContent() {
  "use cache";
  cacheLife("max");
  cacheTag("site-content");

  try {
    const { supabase } = await import("./supabaseClient");
    const { data, error } = await supabase.from("site_content").select("data").eq("id", 1).single();
    if (error || !data) return DEFAULT_CONTENT;
    return mergeDefaults(DEFAULT_CONTENT, data.data);
  } catch {
    return DEFAULT_CONTENT;
  }
}
