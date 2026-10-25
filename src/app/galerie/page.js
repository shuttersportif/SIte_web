import { Suspense } from "react";
import Galerie from "../../components/Galerie";

export const metadata = {
  title: "Galerie — Théo, photographe de course",
  description: "Les photos des dernières courses cyclistes et de sport mécanique, classées par catégorie et par date.",
};

async function GalerieWithCourse({ searchParams }) {
  const { course } = await searchParams;
  return <Galerie initialCourse={course} />;
}

export default function GaleriePage({ searchParams }) {
  return (
    <Suspense fallback={<Galerie initialCourse={undefined} />}>
      <GalerieWithCourse searchParams={searchParams} />
    </Suspense>
  );
}
