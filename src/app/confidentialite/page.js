import LegalPage from "../../components/LegalPage";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "Politique de confidentialité — Théo, photographe de course",
};

export default async function ConfidentialitePage() {
  const content = await getContent();
  const doc = content.legal.confidentialite;
  return (
    <LegalPage title="Politique de confidentialité" intro={doc.intro} lastUpdated={doc.lastUpdated} sections={doc.sections} />
  );
}
