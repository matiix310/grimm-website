import { db } from "@/db";
import ApiResponse from "@/lib/apiResponse";
import { hasPermission } from "@/utils/auth";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";

export const GET = async () => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { ranking: ["force-refresh"] },
    }))
  )
    return ApiResponse.unauthorizedPermission({ ranking: ["force-refresh"] });

  await db.execute(sql`SELECT * FROM update_ranking()`);
  return ApiResponse.json({});
};
