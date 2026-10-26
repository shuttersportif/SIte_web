import { Suspense } from "react";
import Galerie from "../../components/Galerie";
import { getPublicCourses } from "../../lib/getPublicCourses";

export const metadata = {
  title: "Galerie — Théo, photographe de course",
  description: "Les photos des dernières courses cyclistes et de sport mécanique, classées par catégorie et par date.",
};

async function GalerieWithCourse({ searchParams }) {
  const { course } = await searchParams;
  const courses = await getPublicCourses();
  return <Galerie initialCourse={course} courses={courses} />;
}

export default function GaleriePage({ searchParams }) {
  return (
    <Suspense fallback={<Galerie initialCourse={undefined} courses={[]} />}>
      <GalerieWithCourse searchParams={searchParams} />
    </Suspense>
  );
}
