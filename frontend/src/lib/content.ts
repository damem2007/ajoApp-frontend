import type { MarketingContent } from "./cms-types";
export async function publishedContent(): Promise<MarketingContent> {
  const response = await fetch(
    (process.env.AJO_API_ORIGIN || "http://127.0.0.1:8000") +
      "/api/v1/content/home",
    { cache: "no-store" },
  );
  if (!response.ok) throw Error("Unable to load published website content");
  return (await response.json()).content;
}
