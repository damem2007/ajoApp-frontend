import type { SessionTokens } from "../types";
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public fields: { field: string; message: string }[] = [],
  ) {
    super(message);
  }
}
export function storedSession(): SessionTokens | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem("ajoSession") || "null");
  } catch {
    return null;
  }
}
export function saveSession(session: SessionTokens | null) {
  session
    ? sessionStorage.setItem("ajoSession", JSON.stringify(session))
    : sessionStorage.removeItem("ajoSession");
}
let refresh: Promise<SessionTokens | null> | null = null;
async function refreshSession() {
  if (!refresh)
    refresh = (async () => {
      const session = storedSession();
      if (!session) return null;
      const response = await fetch("/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (!response.ok) {
        saveSession(null);
        return null;
      }
      const next: SessionTokens = await response.json();
      saveSession(next);
      return next;
    })().finally(() => {
      refresh = null;
    });
  return refresh;
}
export async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    format?: "json" | "blob";
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  async function send() {
    const session = storedSession(),
      multipart = options.body instanceof FormData;
    return fetch("/api/v1" + path, {
      method: options.method || (options.body === undefined ? "GET" : "POST"),
      headers: {
        ...(session ? { Authorization: "Bearer " + session.access_token } : {}),
        ...(!multipart && options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      body:
        options.body === undefined
          ? undefined
          : multipart
            ? (options.body as FormData)
            : JSON.stringify(options.body),
      cache: "no-store",
      signal: options.signal,
    });
  }
  let response = await send();
  if (
    response.status === 401 &&
    storedSession() &&
    !path.startsWith("/auth/")
  ) {
    if (await refreshSession()) response = await send();
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      typeof error.detail === "string"
        ? error.detail
        : "Please check your information and try again.",
      response.status,
      error.errors || [],
    );
  }
  if (response.status === 204) return undefined as T;
  return options.format === "blob"
    ? ((await response.blob()) as T)
    : ((await response.json()) as T);
}
export async function download(path: string, name: string) {
  const blob = await request<Blob>(path, { format: "blob" }),
    url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
