import { NextResponse } from "next/server";
import { and, inArray, notLike } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { initScheduler } from "@/scheduler";

let isInitialized = false;

export async function GET() {
  if (isInitialized) {
    return NextResponse.json({ message: "Already initialized" }, { status: 400 });
  }

  isInitialized = true;

  console.log("Running initialization from /init...");

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

  try {
    await db
      .update(user)
      .set({ role: "admin" })
      .where(and(inArray(user.login, admins), notLike(user.role, "%admin%")));

    // Initialize scheduled tasks
    if (process.env.NODE_ENV === "production") {
      initScheduler();
    }

    return NextResponse.json({ message: "Initialized successfully" });
  } catch (error) {
    console.error("Initialization failed:", error);
    isInitialized = false; // Allow retry on failure
    return NextResponse.json(
      { message: "Initialization failed", error: String(error) },
      { status: 500 },
    );
  }
}
