import { backendOrigin } from "./backend-origin";
import type { MarketingContent } from "./cms-types";
export async function publishedContent(): Promise<MarketingContent> {
  const response = await fetch(backendOrigin() + "/api/v1/content/home", {
    cache: "no-store",
  });
  if (!response.ok) throw Error("Unable to load published website content");
  return (await response.json()).content;
}
