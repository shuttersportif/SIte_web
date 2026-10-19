import Portfolio from "../../components/Portfolio";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "Portfolio — Théo, photographe de course",
  description: "Une sélection de photos de course en cyclisme et en sport mécanique, en noir et blanc.",
};

export default async function PortfolioPage() {
  const content = await getContent();
  return <Portfolio content={content.portfolio} />;
}
