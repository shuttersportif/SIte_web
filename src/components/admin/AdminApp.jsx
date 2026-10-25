"use client";

import { useEffect, useState } from "react";
import { buildAdminData, aggregate } from "../../lib/adminData";
import { createClient } from "../../lib/supabase/browserClient";
import { logout as logoutAction } from "../../app/admin/authActions";
import Login from "./Login";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import Orders from "./Orders";
import Clients from "./Clients";
import Galleries from "./Galleries";
import Stats from "./Stats";
import Settings from "./Settings";
import Content from "./Content";
import Legal from "./Legal";
import Drawer from "./Drawer";
import NewGalleryModal from "./NewGalleryModal";
import SendLinkModal from "./SendLinkModal";
import Toast from "./Toast";

export default function AdminApp({ initialContent }) {
  const [authed, setAuthed] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("dash");
  const [db, setDb] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [modal, setModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthed(true);
        setAdminEmail(session.user.email);
      }
      setReady(true);
      setDb(buildAdminData());
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session?.user);
      setAdminEmail(session?.user?.email ?? "");
    });

    return () => subscription.unsubscribe();
  }, []);

  const toast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toast._t);
    toast._t = setTimeout(() => setToastMsg(null), 2600);
  };

  const login = (email) => {
    setAuthed(true);
    setAdminEmail(email);
  };
  const logout = async () => {
    await logoutAction();
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthed(false);
  };

  const openOrder = (id) => setDrawer({ type: "order", id });
  const openClient = (idx) => setDrawer({ type: "client", id: idx });
  const closeDrawer = () => setDrawer(null);

  const refundOrder = (id) => {
    setDb((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, statut: "rembourse" } : o)) }));
  };
  const resendOrder = () => {};

  const togglePrivacy = (galId) => {
    setDb((d) => ({
      ...d,
      gals: d.gals.map((g) => (g.id === galId ? { ...g, vis: g.vis === "privee" ? "publique" : "privee" } : g)),
    }));
  };

  const createGallery = ({ nom, date, lieu, categorie, vis, files, coverIdx }) => {
    const id = nom
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const alpha = "abcdefghjkmnpqrstuvwxyz23456789";
    const token = Array.from({ length: 6 }, () => alpha[Math.floor(Math.random() * alpha.length)]).join("");
    const cover = files[coverIdx] || files[0];
    const ordered = [cover, ...files.filter((_, i) => i !== coverIdx)];
    const gal = {
      id: id || `galerie-${Date.now()}`,
      nom,
      categorie,
      lieu,
      date: date || new Date().toISOString().slice(0, 10),
      photos: ordered.map((f, i) => ({ n: i + 1, src: f.url })),
      vis,
      token,
      client: vis === "privee" ? null : null,
      peak: 0,
      visits: 0,
    };
    setDb((d) => ({ ...d, gals: [gal, ...d.gals] }));
    setModal(null);
    toast("Galerie créée.");
  };

  const sendLink = ({ msg }) => {
    setModal(null);
    toast("Lien envoyé au client.");
  };

  if (!ready) return null;
  if (!authed) return <Login onLogin={login} />;
  if (!db) return <div className="min-h-dvh bg-paper" />;

  const agg = aggregate(db);

  return (
    <div className="flex min-h-dvh bg-paper text-[#111111]">
      <Sidebar view={view} onNavigate={setView} adminEmail={adminEmail} onLogout={logout} />

      <main className="min-w-0 flex-1 p-5 sm:p-8">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-6">
          {view === "dash" && <Dashboard db={db} onOpenOrder={openOrder} onNavigate={setView} />}
          {view === "orders" && <Orders db={db} onOpenOrder={openOrder} />}
          {view === "clients" && <Clients db={db} onOpenClient={openClient} />}
          {view === "gals" && (
            <Galleries
              db={db}
              agg={agg}
              onTogglePrivacy={togglePrivacy}
              onOpenNew={() => setModal({ type: "new" })}
              onOpenSend={(galId) => setModal({ type: "send", galId })}
              toast={toast}
            />
          )}
          {view === "stats" && <Stats db={db} agg={agg} />}
          {view === "content" && <Content initialContent={initialContent} toast={toast} />}
          {view === "legal" && <Legal initialContent={initialContent} toast={toast} />}
          {view === "settings" && <Settings toast={toast} />}
        </div>
      </main>

      <Drawer
        db={db}
        drawer={drawer}
        onClose={closeDrawer}
        onOpenOrder={openOrder}
        onOpenClient={openClient}
        onRefund={refundOrder}
        onResend={resendOrder}
        toast={toast}
      />

      {modal?.type === "new" && <NewGalleryModal onClose={() => setModal(null)} onCreate={createGallery} />}
      {modal?.type === "send" && <SendLinkModal db={db} galId={modal.galId} onClose={() => setModal(null)} onSend={sendLink} />}

      <Toast message={toastMsg} />
    </div>
  );
}
