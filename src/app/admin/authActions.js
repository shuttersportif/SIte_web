"use server";

import { createClient } from "../../lib/supabase/serverClient";

export async function login({ email, password }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: "E-mail ou mot de passe incorrect." };
  }

  return { ok: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
