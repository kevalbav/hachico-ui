import { NextRequest } from "next/server";

const BASE = process.env.NEXT_PUBLIC_HACHI_API_BASE || "http://localhost:8000";
const KEY  = process.env.NEXT_PUBLIC_HACHI_API_KEY  || "dev-key";

type ParamCtx =
  | { params: { path: string[] } }
  | { params: Promise<{ path: string[] }> };

async function getPath(ctx: ParamCtx): Promise<string[]> {
  const p: any = (ctx as any).params;
  const obj = typeof p?.then === "function" ? await p : p;
  return (obj?.path as string[]) || [];
}

function buildURL(path: string[], req: NextRequest): string {
  const qs = req.nextUrl.search || "";
  const p  = path.join("/");
  return `${BASE}/${p}${qs}`;
}

async function forward(method: string, req: NextRequest, ctx: ParamCtx) {
  const path = await getPath(ctx);
  const url  = buildURL(path, req);

  const headers: Record<string, string> = { "x-api-key": KEY };
  // Pass through content-type & auth if present
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    // Read body once; DELETE in our app sends no body (that’s fine)
    const text = await req.text();
    body = text || undefined;
  }

  const resp = await fetch(url, { method, headers, body });
  // Stream response back
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers: resp.headers,
  });
}

export const GET     = (req: NextRequest, ctx: ParamCtx) => forward("GET", req, ctx);
export const POST    = (req: NextRequest, ctx: ParamCtx) => forward("POST", req, ctx);
export const PUT     = (req: NextRequest, ctx: ParamCtx) => forward("PUT", req, ctx);
export const PATCH   = (req: NextRequest, ctx: ParamCtx) => forward("PATCH", req, ctx);
export const DELETE  = (req: NextRequest, ctx: ParamCtx) => forward("DELETE", req, ctx);
export const OPTIONS = (req: NextRequest, ctx: ParamCtx) => forward("OPTIONS", req, ctx);
