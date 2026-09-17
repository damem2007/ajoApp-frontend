import { NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  const origin = process.env.AJO_API_ORIGIN || "http://127.0.0.1:8000",
    headers = new Headers(request.headers);
  for (const key of ["host", "content-length", "connection", "accept-encoding"])
    headers.delete(key);
  try {
    const upstream = await fetch(
        origin + request.nextUrl.pathname + request.nextUrl.search,
        {
          method: request.method,
          headers,
          body: ["GET", "HEAD"].includes(request.method)
            ? undefined
            : await request.arrayBuffer(),
          redirect: "manual",
          cache: "no-store",
        },
      ),
      out = new Headers(upstream.headers);
    for (const key of ["content-length", "content-encoding", "connection"])
      out.delete(key);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: out,
    });
  } catch {
    return Response.json(
      { detail: "The service is temporarily unavailable. Please try again." },
      { status: 502 },
    );
  }
}
