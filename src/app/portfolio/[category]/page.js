import { Suspense } from "react";
import { notFound } from "next/navigation";
import PortfolioSelection from "../../../components/PortfolioSelection";
import { CATEGORIES } from "../../../lib/portfolioData";
import { getContent } from "../../../lib/getContent";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }) {
  const { category } = await params;
  if (!CATEGORIES[category]) return {};
  const content = await getContent();
  const text = content.portfolio[category];
  return {
    title: `Portfolio ${text.nom} — Théo, photographe de course`,
    description: text.intro1,
  };
}

async function PortfolioCategoryContent({ params }) {
  const { category } = await params;
  if (!CATEGORIES[category]) notFound();
  const content = await getContent();
  return <PortfolioSelection category={category} content={content.portfolio} />;
}

export default function PortfolioCategoryPage({ params }) {
  return (
    <Suspense fallback={null}>
      <PortfolioCategoryContent params={params} />
    </Suspense>
  );
}
