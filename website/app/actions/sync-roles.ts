"use server";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { getSheetData } from "@/lib/google-sheets";
import { Roles } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Role mapping from Google Sheet names to internal role names
const roleMapping: Record<string, Roles> = {
  // Bureau
  bureau: "bureau",

  // Respos
  "respo tech": "respoTech",
  "respo design": "respoDesign",
  "respo com": "respoCom",
  "respo assistants": "respoAssistants",
  "respo wei": "respoWei",
  "respo inter": "respoInter",

  // Teams
  "team tech": "teamTech",
  "team design": "teamDesign",
  "team com": "teamCom",

  // Members
  membre: "member",

  // Staff
  staff: "staff",
};

function mapRole(roleStr: string): Roles | null {
  const normalized = roleStr.toLowerCase().trim();
  return roleMapping[normalized] || null;
}

export async function syncRoles() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !serviceAccountEmail || !privateKey) {
    return { success: false, message: "Missing Google Sheets credentials" };
  }

  try {
    // Fetch data from the first sheet
    const data = await getSheetData(sheetId, "A:C", serviceAccountEmail, privateKey);

    if (!data || data.length === 0) {
      return { success: false, message: "No data found in Google Sheet" };
    }

    // Skip header row
    const rows = data.slice(1);
    let updatedCount = 0;
    const errors: string[] = [];
    const skipped: string[] = [];

    for (const row of rows) {
      const login = row[0]?.trim();
      const roleStr = row[2]?.trim();

      if (!login || !roleStr) continue;

      // Parse multiple roles from Google Sheet (comma-separated)
      const sheetRoleStrings = roleStr
        .split(",")
        .map((r: string) => r.trim())
        .filter(Boolean);

      // Map each role to internal role name
      const newRoles: Roles[] = [];
      const unknownRoles: string[] = [];

      for (const roleString of sheetRoleStrings) {
        const mappedRole = mapRole(roleString);
        if (mappedRole) {
          newRoles.push(mappedRole);
        } else {
          unknownRoles.push(roleString);
        }
      }

      // Skip if no valid roles found
      if (newRoles.length === 0) {
        skipped.push(`${login} (unknown roles: "${roleStr}")`);
        continue;
      }

      // Log unknown roles but continue with valid ones
      if (unknownRoles.length > 0) {
        console.warn(`User ${login}: Unknown roles skipped: ${unknownRoles.join(", ")}`);
      }

      try {
        // Find user by login
        const existingUser = await db.query.user.findFirst({
          where: eq(user.login, login),
        });

        if (existingUser) {
          // Parse existing roles (comma-separated)
          const existingRoles = existingUser.role
            ? existingUser.role
                .split(",")
                .map((r: string) => r.trim())
                .filter(Boolean)
            : [];

          // Preserve user and admin roles
          const preservedRoles = existingRoles.filter(
            (r: string) => r === "user" || r === "admin"
          );

          // Build new role set: preserved roles + new roles from sheet
          const finalRoles = [...new Set([...preservedRoles, ...newRoles])];

          // Only update if different
          const newRoleString = finalRoles.join(",");
          const currentRoleString = existingUser.role || "";

          if (currentRoleString !== newRoleString) {
            await db
              .update(user)
              .set({ role: newRoleString })
              .where(eq(user.login, login));
            updatedCount++;
          }
        }
      } catch (err) {
        console.error(`Failed to update user ${login}:`, err);
        errors.push(`Failed to update ${login}`);
      }
    }

    revalidatePath("/admin/users");

    let message = `Synced ${updatedCount} users.`;
    if (skipped.length > 0) {
      message += ` Skipped ${skipped.length} (unknown roles).`;
    }
    if (errors.length > 0) {
      message += ` Errors: ${errors.length}.`;
    }

    return {
      success: true,
      message,
      details: { updated: updatedCount, skipped, errors },
    };
  } catch (error) {
    console.error("Sync failed:", error);
    return { success: false, message: "Failed to sync roles" };
  }
}
