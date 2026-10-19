import LegalPage from "../../components/LegalPage";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "CGV — Théo, photographe de course",
};

export default async function CgvPage() {
  const content = await getContent();
  const doc = content.legal.cgv;
  return (
    <LegalPage title="Conditions générales de vente" intro={doc.intro} lastUpdated={doc.lastUpdated} sections={doc.sections} />
  );
}
