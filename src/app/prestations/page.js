import Prestations from "../../components/Prestations";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "Prestations — Théo, photographe de course",
  description:
    "Couverture de courses, photos pour équipes et pilotes, images pour organisateurs, tirages et licences.",
};

export default async function PrestationsPage() {
  const content = await getContent();
  return <Prestations content={content.prestations} />;
}
