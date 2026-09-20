import { redirect } from "next/navigation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const view = query.view;
  redirect(
    view === "register"
      ? "/register"
      : ["content", "backoffice"].includes(view || "")
        ? query.module === "cms" || view === "content"
          ? "/backoffice/cms"
          : "/backoffice"
        : view === "marketplace"
          ? "/app/marketplace" +
            (query.q ? "?q=" + encodeURIComponent(query.q) : "")
          : "/app/circles",
  );
}
