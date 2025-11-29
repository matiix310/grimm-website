import { and, inArray, notLike } from "drizzle-orm";
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
    "flavien.henrotte-robert",
  ];
  await db
    .update(user)
    .set({ role: "admin" })
    .where(and(inArray(user.login, admins), notLike(user.role, "%admin%")));
}
