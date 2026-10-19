import LegalPage from "../../components/LegalPage";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "Mentions légales — Théo, photographe de course",
};

export default async function MentionsLegalesPage() {
  const content = await getContent();
  const doc = content.legal.mentionsLegales;
  return <LegalPage title="Mentions légales" intro={doc.intro} lastUpdated={doc.lastUpdated} sections={doc.sections} />;
}
