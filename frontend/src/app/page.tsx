import Home from "@/components/Home";
import { publishedContent } from "@/lib/content";
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  const c = await publishedContent();
  return { title: c.meta.title, description: c.meta.description };
}
export default async function Page() {
  return <Home content={await publishedContent()} />;
}
