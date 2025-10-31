import { db } from "@/db";
import { hasPermission } from "@/utils/auth";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const GET = async () => {
  if (
    !(await hasPermission({
      headers: await headers(),
      permissions: { ranking: ["force-refresh"] },
    }))
  )
    return NextResponse.json({
      error: true,
      message: "You don't have the required permissions to use this endpoint",
    });

  await db.execute(sql`SELECT * FROM update_ranking()`);
  return NextResponse.json({ error: false });
};
