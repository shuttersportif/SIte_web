import { Geist } from "next/font/google";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../lib/fontawesome";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FlashOverlay from "../components/FlashOverlay";
import PageFlash from "../components/PageFlash";
import PageTransition from "../components/PageTransition";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Théo — Photographe de course à Angers",
  description:
    "Photographe de courses cyclistes et de sport mécanique basé à Angers : galeries des dernières courses, tirages d'art et prestations pour équipes, pilotes et organisateurs.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="flex min-h-dvh flex-col bg-ink text-foreground">
        <FlashOverlay />
        <PageFlash />
        <Navbar />
        <main className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
