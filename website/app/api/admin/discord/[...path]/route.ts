import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { headers as nextHeaders } from "next/headers";
import { NextRequest } from "next/server";

async function proxyRequest(request: NextRequest, path: string[]) {
  const headers = await nextHeaders();
  const canAccessDiscord = await hasPermission({
    headers,
    permissions: { discord: ["admin"] },
  });

  if (!canAccessDiscord) {
    return ApiResponse.unauthorizedPermission({ discord: ["admin"] });
  }

  if (!process.env.DISCORD_URL) {
    return ApiResponse.internalServerError("DISCORD_URL is not defined");
  }

  const url = `${process.env.DISCORD_URL}/${path.join("/")}`;
  const body = request.body ? await request.json() : undefined;

  try {
    const res = await fetch(url, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    return ApiResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error proxying request to Discord bot:", error);
    return ApiResponse.internalServerError("Failed to communicate with Discord bot");
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
