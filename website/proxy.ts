import { NextRequest, NextResponse, ProxyConfig } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { loadAssetFromStorage } from "./lib/storage";
import ApiResponse from "./lib/apiResponse";

export async function proxy(request: NextRequest) {
  const assetsPrefix = "/api/s3/";
  const path = request.nextUrl.pathname;

  if (path.startsWith("/api/s3/")) {
    const key = path.slice(assetsPrefix.length);
    const newUrl = await loadAssetFromStorage(key);

    if (newUrl === undefined) return ApiResponse.notFound();
    return NextResponse.rewrite(newUrl);
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const host = request.headers.get("host"); /* === "localhost"
      ? "localhost:8000"
      : request.headers.get("host");*/

  if (!session) {
    return NextResponse.redirect(
      new URL(
        `${process.env.BASE_URL!}/login?redirect=${
          request.nextUrl.protocol
        }//${host}${path}`
      )
    );
  }

  if (session.user.banned) return NextResponse.redirect(process.env.BASE_URL!);

  const roles = session.user.role?.split(",") ?? [];

  if (request.headers.get("host") === "db.bde-grimm.com")
    if (!roles.includes("admin"))
      return NextResponse.redirect(
        new URL(`${process.env.BASE_URL!}/login?redirect=https://db.bde-grimm.com${path}`)
      );
    else return NextResponse.rewrite("http://drizzle-gate:4983" + path);

  // To access "/admin" you must have "admin" role
  if (path.startsWith("/admin") && !roles.includes("admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config: ProxyConfig = {
  matcher: [
    "/users/me",
    "/admin/:path*",
    "/pass",
    "/api/s3/:path*",
    { source: "/:path*", has: [{ type: "host", value: "db.bde-grimm.com" }] },
  ],
};
