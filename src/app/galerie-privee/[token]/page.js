import PrivateGallery from "../../../components/PrivateGallery";

// page rendue à la demande (token inconnu au build, contenu sensible) ; le
// layout partagé utilise usePathname() sans Suspense, ce qui bloque le
// prérendu statique exigé par défaut sous Cache Components
export const instant = false;

export const metadata = {
  title: "Galerie privée — Théo, photographe de course",
  robots: { index: false, follow: false },
};

export default async function PrivateGalleryPage({ params }) {
  const { token } = await params;
  return <PrivateGallery token={token} />;
}
