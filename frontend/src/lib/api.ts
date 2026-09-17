import examples from "./examples.json";
export type Circle = {
  id: string;
  name: string;
  description?: string;
  category: string;
  currency: string;
  target_minor: number;
  frequency: string;
  members: number;
  slots: number;
  trust_threshold: number;
  featured?: boolean;
  illustrative?: boolean;
  trust_label?: string;
  next_days?: number;
};
export async function catalogue(): Promise<Circle[]> {
  const response = await fetch("/api/v1/public/marketplace", {
    cache: "no-store",
  });
  if (!response.ok) throw Error("We couldn’t load circles. Please try again.");
  const circles: Circle[] = await response.json();
  if (circles.length) return circles;
  const health = await fetch("/health", { cache: "no-store" });
  return health.ok && (await health.json()).sandbox ? examples : circles;
}
export function amount(minor: number, currency: string) {
  return (
    ({ CAD: "CA$", USD: "US$", NGN: "₦", GBP: "£" }[currency] ||
      currency + " ") +
    new Intl.NumberFormat("en-CA", { maximumFractionDigits: 2 }).format(
      minor / 100,
    )
  );
}
export async function api(
  path: string,
  body?: unknown,
  method?: string,
): Promise<any> {
  let session = JSON.parse(sessionStorage.getItem("ajoSession") || "null");
  async function request() {
    return fetch("/api/v1" + path, {
      method: method || (body === undefined ? "GET" : "POST"),
      headers: {
        ...(session ? { Authorization: "Bearer " + session.access_token } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }
  let response = await request();
  if (response.status === 401 && session) {
    const refresh = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    if (refresh.ok) {
      session = await refresh.json();
      sessionStorage.setItem("ajoSession", JSON.stringify(session));
      response = await request();
    }
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw Error(
      typeof error.detail === "string"
        ? error.detail
        : "Please check your information and try again.",
    );
  }
  return response.json();
}
