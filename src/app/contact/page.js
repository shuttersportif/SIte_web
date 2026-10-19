import Contact from "../../components/Contact";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "Contact — Théo, photographe de course",
  description:
    "Une course à couvrir, un projet pour une équipe ou un pilote, un tirage : écrivez à Théo.",
};

export default async function ContactPage() {
  const content = await getContent();
  return <Contact content={content.contact} />;
}
