import { NextRequest, NextResponse, ProxyConfig } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(
      new URL(
        "https://bde-grimm.com/login?redirect=" +
          request.nextUrl.protocol +
          "//" +
          request.headers.get("host") +
          request.nextUrl.pathname
      )
    );
  }

  if (session.user.banned) return NextResponse.redirect("https://bde-grimm.com");

  if (request.headers.get("host") === "db.bde-grimm.com")
    if (session.user.role !== "admin")
      return NextResponse.redirect(
        new URL(
          "https://bde-grim.com/login?redirect=https://db.bde-grimm.com" +
            request.nextUrl.pathname
        )
      );
    else
      return NextResponse.rewrite("http://drizzle-gate:4983" + request.nextUrl.pathname);

  // To access "/admin" you must have "admin" role
  if (request.nextUrl.pathname.startsWith("/admin") && session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config: ProxyConfig = {
  matcher: [
    "/users/me",
    "/admin/:path*",
    { source: "/:path*", has: [{ type: "host", value: "db.bde-grimm.com" }] },
  ],
};
