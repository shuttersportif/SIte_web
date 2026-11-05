"use server";

import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { getAdminUser } from "../../lib/requireAdmin";

export async function listClients() {
  const admin = await getAdminUser();
  if (!admin) return [];

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, first_name, last_name, email, phone, email_confirmed_at, created_at")
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("orders").select("user_id, total, statut"),
  ]);

  const byUser = {};
  (orders || []).forEach((o) => {
    if (o.statut === "rembourse") return;
    const row = (byUser[o.user_id] ||= { count: 0, total: 0 });
    row.count += 1;
    row.total += Number(o.total) || 0;
  });

  return (profiles || []).map((p) => ({
    id: p.id,
    nom: `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email || "—",
    email: p.email,
    phone: p.phone,
    confirmed: !!p.email_confirmed_at,
    createdAt: p.created_at,
    orderCount: byUser[p.id]?.count || 0,
    total: byUser[p.id]?.total || 0,
  }));
}
