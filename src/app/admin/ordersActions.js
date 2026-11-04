"use server";

import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { getAdminUser } from "../../lib/requireAdmin";

// réservé à l'admin : vérifie que l'utilisateur a bien le rôle admin avant de
// lire/écrire via la clé service_role (qui ignore les RLS)
async function requireAdminSession() {
  const user = await getAdminUser();
  if (!user) throw new Error("Accès refusé");
}

export async function listOrders() {
  await requireAdminSession();

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("id, statut, sous_total, remise, total, created_at, user_id, order_items(id, qty, prix, photos(numero, galleries(nom)))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!orders?.length) return [];

  // orders.user_id référence auth.users, pas profiles directement : pas de
  // relation FK exploitable par un embed PostgREST, on fait le lien ici
  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", userIds);
  const byId = new Map((profiles || []).map((p) => [p.id, p]));

  return orders.map((o) => ({ ...o, client: byId.get(o.user_id) || null }));
}

export async function updateOrderStatus(orderId, statut) {
  await requireAdminSession();
  if (!["en_attente", "payee", "rembourse"].includes(statut)) {
    throw new Error("Statut invalide");
  }
  const { error } = await supabaseAdmin.from("orders").update({ statut }).eq("id", orderId);
  if (error) throw error;
}
