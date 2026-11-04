"use server";

import { createClient } from "../../lib/supabase/serverClient";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

// consume_download() vérifie côté base que l'appelant est bien propriétaire
// de la commande payée et décrémente son quota ; elle renvoie le chemin du
// fichier HD dans le bucket privé gallery-originals, qu'on transforme ici
// en URL signée de courte durée (le bucket n'est jamais public)
export async function consumeDownload(orderItemId) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_download", { p_order_item_id: orderItemId });

  if (error) {
    return { ok: false, message: "Ce téléchargement n'est pas disponible." };
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.original_path) {
    return { ok: false, message: "Fichier introuvable." };
  }

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from("gallery-originals")
    .createSignedUrl(result.original_path, 60);

  if (signError) {
    return { ok: false, message: "Erreur lors de la génération du lien." };
  }

  return { ok: true, url: signed.signedUrl, restants: result.restants };
}
