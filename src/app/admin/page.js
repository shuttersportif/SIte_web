import AdminApp from "../../components/admin/AdminApp";
import { getContent } from "../../lib/getContent";

export const metadata = {
  title: "Administration — Théo, photographe de course",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const content = await getContent();
  return <AdminApp initialContent={content} />;
}
