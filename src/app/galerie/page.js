import Galerie from "../../components/Galerie";

export const metadata = {
  title: "Galerie — Théo, photographe de course",
  description: "Les photos des dernières courses cyclistes et de sport mécanique, classées par catégorie et par date.",
};

export default async function GaleriePage({ searchParams }) {
  const { course } = await searchParams;
  return <Galerie initialCourse={course} />;
}
