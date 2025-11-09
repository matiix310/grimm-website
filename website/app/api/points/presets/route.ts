import { db } from "@/db";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { headers } from "next/headers";

export const GET = async () => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { presets: ["view"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ presets: ["view"] });

  const presetList = await db.query.presets.findMany();

  return ApiResponse.json(presetList);
};
