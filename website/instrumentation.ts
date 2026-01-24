export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const baseUrl = "http://localhost:8000";

    // Call /init in the background after a short delay to ensure the server is up
    setTimeout(async () => {
      try {
        console.log(`[Instrumentation] Triggering initialization via ${baseUrl}/init`);
        const response = await fetch(`${baseUrl}/init`);
        if (response.ok) {
          console.log("[Instrumentation] /init triggered successfully");
        } else {
          console.error(`[Instrumentation] /init failed with status: ${response.status}`);
        }
      } catch (error) {
        console.error("[Instrumentation] Error triggering /init:", error);
      }
    }, 2000);
  }
}
