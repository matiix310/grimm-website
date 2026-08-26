import { NextResponse } from "next/server";
import { initScheduler } from "@/scheduler";

let isInitialized = false;

export async function GET() {
  if (isInitialized) {
    return NextResponse.json({ message: "Already initialized" }, { status: 400 });
  }

  isInitialized = true;

  console.log("Running initialization from /init...");

  try {
    initScheduler();

    return NextResponse.json({ message: "Initialized successfully" });
  } catch (error) {
    console.error("Initialization failed:", error);
    isInitialized = false;
    return NextResponse.json(
      { message: "Initialization failed", error: String(error) },
      { status: 500 },
    );
  }
}