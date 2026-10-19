import { createClient } from "@supabase/supabase-js";

// clé de service : ne jamais importer ce fichier depuis un composant client
// ("use client") — réservé aux Server Actions et Route Handlers
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
