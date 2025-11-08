import { inArray } from "drizzle-orm";
import { db } from "./db";
import { user } from "./db/schema/auth";

export async function register() {
  // register the default admins at next instance startup
  const admins = [
    "lucas.stephan",
    "jules.dubois",
    "baptiste.durringer",
    "simon1.meloni",
    "arthur.gallier",
    "nicolas.naegelen",
    "baptiste.cormorant",
    "valentin.oison",
  ];
  await db.update(user).set({ role: "admin" }).where(inArray(user.login, admins));
}
