import Hero from "../components/Hero";
import { getContent } from "../lib/getContent";

export default async function Home() {
  const content = await getContent();
  return <Hero content={content.hero} />;
}
