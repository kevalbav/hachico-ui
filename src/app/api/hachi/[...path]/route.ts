import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.HACHI_API_BASE!;
const KEY  = process.env.HACHI_API_KEY!;

function buildURL(pathSegments: string[], req: NextRequest) {
  const path = pathSegments.join("/");
  const search = req.nextUrl.search;
  return `${BASE}/${path}${search ?? ""}`;
}

async function forward(method: string, req: NextRequest, pathSegments: string[]) {
  const url = buildURL(pathSegments, req);
  const headers: Record<string, string> = { "x-api-key": KEY };

  const ct = req.headers.get("content-type") || "";
  let body: BodyInit | undefined;

  if (method === "GET" || method === "HEAD") {
    // no body
  } else if (ct.startsWith("multipart/form-data")) {
    headers["content-type"] = ct;
    body = req.body as unknown as BodyInit;
  } else {
    if (ct) headers["content-type"] = ct;
    body = await req.text();
  }

  const res = await fetch(url, { method, headers, body, redirect: "manual" });
  return new NextResponse(res.body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") || "application/json" },
  });
}

// Properly typed handlers (params is a Promise in route handlers)
type Ctx = { params: Promise<{ path: string[] }> };

export const GET  = async (req: NextRequest, ctx: Ctx) => {
  const { path } = await ctx.params;
  return forward("GET", req, path);
};

export const POST = async (req: NextRequest, ctx: Ctx) => {
  const { path } = await ctx.params;
  return forward("POST", req, path);
};
