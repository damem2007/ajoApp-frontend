import Legal from "@/components/Legal";
import { publishedContent } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function Page() {
  const c = await publishedContent();
  return <Legal title={c.legal.terms_title} body={c.legal.terms_body} />;
}
