import About from "../../components/About";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "À propos — Théo, photographe de course à Angers",
  description: "Théo, photographe basé à Angers, suit les courses cyclistes et les épreuves de sport mécanique.",
};

export default async function AProposPage() {
  const content = await getContent();
  return <About content={content.about} />;
}
