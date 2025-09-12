import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.HACHI_API_BASE!;
const KEY  = process.env.HACHI_API_KEY!;

function buildURL(pathSegments: string[], req: NextRequest) {
  const path = pathSegments.join("/");
  const search = req.nextUrl.search; // includes ?...
  return `${BASE}/${path}${search ?? ""}`;
}

async function forward(method: string, req: NextRequest, ctx: { params: { path: string[] } }) {
  const url = buildURL(ctx.params.path, req);
  const headers: Record<string, string> = { "x-api-key": KEY };

  let body: BodyInit | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const ct = req.headers.get("content-type") || "";
    headers["content-type"] = ct;
    body = await req.text();
  }

  const res = await fetch(url, { method, headers, body, redirect: "manual" });
  return new NextResponse(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}

export const GET  = (req: NextRequest, ctx: any) => forward("GET", req, ctx);
export const POST = (req: NextRequest, ctx: any) => forward("POST", req, ctx);
