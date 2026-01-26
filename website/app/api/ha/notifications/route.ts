import ApiResponse from "@/lib/apiResponse";
import { sendDiscordNotification } from "@/lib/discord";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  const ip = request.headers.get("CF-Connecting-IP") ?? "";

  const haServers = {
    "4.233.135.234": "Test",
    "89.117.104.53": "Production",
  };

  console.log("Request received from ", ip);

  console.log(await request.json());

  if (!(ip in haServers)) {
    return ApiResponse.unauthorized();
  }

  const haServer = haServers[ip as keyof typeof haServers];

  console.log("Identified server:", haServer);

  await sendDiscordNotification(
    `New notification received from HelloAsso <@1441419768958550016>`,
    `Server : ${haServer}\nNotification : ${await request.json()}`,
    "info",
  );

  return ApiResponse.json({ success: true });
};
