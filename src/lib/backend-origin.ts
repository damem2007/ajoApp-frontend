/** Validated server-side upstream. No deployment address is embedded in code. */
export function backendOrigin(): string {
  const configured =
    process.env.AJO_API_ORIGIN || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!configured) {
    throw new Error(
      "Set AJO_API_ORIGIN or NEXT_PUBLIC_API_BASE_URL in frontend/.env.local or the process environment.",
    );
  }
  try {
    const url = new URL(configured);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !["", "/", "/api/v1", "/api/v1/"].includes(url.pathname)
    ) {
      throw new Error("Invalid origin");
    }
    return url.origin;
  } catch {
    throw new Error(
      "Configure the API base URL as an HTTP(S) origin, optionally ending in /api/v1, without credentials or query parameters.",
    );
  }
}
