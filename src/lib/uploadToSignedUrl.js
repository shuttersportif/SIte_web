"use client";

import { createClient } from "./supabase/browserClient";

// envoie un fichier directement au bucket Supabase Storage via une URL
// signée générée côté serveur (src/app/admin/galleriesActions.js) — le
// fichier ne passe jamais par le serveur Next.js
export async function uploadToSignedUrl(bucket, path, token, file) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file);
  if (error) throw error;
}
