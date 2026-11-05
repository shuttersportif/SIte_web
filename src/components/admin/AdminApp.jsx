"use client";

import { useEffect, useState } from "react";
import { buildAdminData, aggregate } from "../../lib/adminData";
import { createClient } from "../../lib/supabase/browserClient";
import { logout as logoutAction } from "../../app/admin/authActions";
import {
  prepareGalleryUpload,
  finalizeGalleryPhotos,
  cancelGalleryUpload,
  listGalleries,
  toggleGalleryVisibility,
  regenerateGalleryToken,
} from "../../app/admin/galleriesActions";
import { uploadToSignedUrl } from "../../lib/uploadToSignedUrl";
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
import EditGalleryModal from "./EditGalleryModal";
import SendLinkModal from "./SendLinkModal";
import Toast from "./Toast";

export default function AdminApp({ initialContent }) {
  const [authed, setAuthed] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("dash");
  const [db, setDb] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const [modal, setModal] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    const checkAdmin = async (session) => {
      if (!session?.user) {
        setAuthed(false);
        setAdminEmail("");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (profile?.role !== "admin") {
        await supabase.auth.signOut();
        setAuthed(false);
        setAdminEmail("");
        return;
      }
      setAuthed(true);
      setAdminEmail(session.user.email);
      listGalleries().then((result) => {
        if (result.ok) setGalleries(result.galleries);
      });
    };

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await checkAdmin(session);
      setReady(true);
      setDb(buildAdminData());
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session);
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

  const loadGalleries = async () => {
    const result = await listGalleries();
    if (result.ok) setGalleries(result.galleries);
  };

  const togglePrivacy = async (galId) => {
    const current = galleries.find((g) => g.id === galId);
    if (!current) return;
    const previous = current.visibilite;
    const next = previous === "privee" ? "publique" : "privee";

    let pin = null;
    if (next === "privee") {
      pin = prompt("Code PIN à 4 chiffres pour cette galerie privée :", "");
      if (pin == null) return;
      if (!/^\d{4}$/.test(pin)) {
        toast("Le code PIN doit comporter 4 chiffres.");
        return;
      }
    }

    // optimiste : on bascule tout de suite dans l'UI, on revient en arrière
    // si l'appel serveur échoue
    setGalleries((gs) => gs.map((g) => (g.id === galId ? { ...g, visibilite: next } : g)));

    const result = await toggleGalleryVisibility(galId, next, pin);
    if (!result.ok) {
      toast(result.message);
      setGalleries((gs) => gs.map((g) => (g.id === galId ? { ...g, visibilite: previous } : g)));
      return;
    }
    setGalleries((gs) => gs.map((g) => (g.id === galId ? { ...g, token: result.token, pin } : g)));
  };

  const regenToken = async (galId) => {
    const result = await regenerateGalleryToken(galId);
    if (result.ok) {
      setGalleries((gs) => gs.map((g) => (g.id === galId ? { ...g, token: result.token } : g)));
    }
    return result;
  };

  const createGallery = async ({ nom, date, lieu, categorie, vis, pin, prix, files, coverIdx }) => {
    const cover = files[coverIdx] || files[0];
    const ordered = [cover, ...files.filter((_, i) => i !== coverIdx)];

    const prepared = await prepareGalleryUpload({ nom, date, lieu, categorie, vis, pin, photoCount: ordered.length });
    if (!prepared.ok) return prepared;

    try {
      // toutes les photos sont envoyées en parallèle plutôt qu'une par une
      await Promise.all(
        prepared.uploads.flatMap(({ path, webToken, originalToken }, i) => [
          uploadToSignedUrl("gallery-web", path, webToken, ordered[i].file),
          uploadToSignedUrl("gallery-originals", path, originalToken, ordered[i].file),
        ])
      );
    } catch (e) {
      await cancelGalleryUpload(prepared.galleryId);
      return { ok: false, message: "Échec de l'envoi des photos." };
    }

    const finalized = await finalizeGalleryPhotos({
      galleryId: prepared.galleryId,
      photos: prepared.uploads.map(({ numero, path }) => ({ numero, path })),
      prix,
    });
    if (!finalized.ok) {
      await cancelGalleryUpload(prepared.galleryId);
      return finalized;
    }

    setModal(null);
    toast("Galerie créée — visible sur /galerie.");
    await loadGalleries();
    return { ok: true };
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
          {view === "orders" && <Orders />}
          {view === "clients" && <Clients />}
          {view === "gals" && (
            <Galleries
              galleries={galleries}
              onTogglePrivacy={togglePrivacy}
              onOpenNew={() => setModal({ type: "new" })}
              onOpenSend={(galId) => setModal({ type: "send", galId })}
              onRegenToken={regenToken}
              onEdit={(galId) => setModal({ type: "edit", galId })}
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
      {modal?.type === "edit" && (
        <EditGalleryModal
          galleryId={modal.galId}
          onClose={() => setModal(null)}
          onSaved={async () => {
            setModal(null);
            toast("Galerie mise à jour.");
            await loadGalleries();
          }}
          onDeleted={async () => {
            setModal(null);
            toast("Galerie supprimée.");
            await loadGalleries();
          }}
        />
      )}
      {modal?.type === "send" && (
        <SendLinkModal
          gal={galleries.find((g) => g.id === modal.galId)}
          clients={db.clients}
          onClose={() => setModal(null)}
          onSend={sendLink}
        />
      )}

      <Toast message={toastMsg} />
    </div>
  );
}
