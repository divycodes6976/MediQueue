import { NextRequest } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:3001").replace(
  /\/$/,
  ""
);

function withCookiePathRoot(setCookie: string) {
  const cleaned = setCookie.replace(/;\s*Path=[^;]*/gi, "");
  const sameSite = /;\s*SameSite=/i.test(cleaned) ? cleaned : `${cleaned}; SameSite=Lax`;
  return `${sameSite}; Path=/`;
}

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `${BACKEND}/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", req.headers.get("accept") ?? "*/*");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(target, init);
  } catch {
    return Response.json({ message: "Backend is unreachable" }, { status: 502 });
  }

  const outHeaders = new Headers();
  const contentTypeOut = upstream.headers.get("content-type");
  if (contentTypeOut) outHeaders.set("content-type", contentTypeOut);
  const cacheControl = upstream.headers.get("cache-control");
  if (cacheControl) outHeaders.set("cache-control", cacheControl);

  const setCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];
  for (const cookieValue of setCookies) {
    outHeaders.append("Set-Cookie", withCookiePathRoot(cookieValue));
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const dynamic = "force-dynamic";
