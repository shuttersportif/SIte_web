import { createClient } from "./supabase/serverClient";

// renvoie l'utilisateur Supabase courant s'il a le rôle "admin" dans
// profiles, sinon null — à appeler dans chaque Server Action réservée à
// l'admin (le simple fait d'avoir une session valide ne suffit plus)
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;

  return user;
}
