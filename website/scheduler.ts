import cron from "node-cron";
import { syncRoles } from "./app/actions/sync-roles";

export function initScheduler() {
  console.log("Initializing role sync scheduler...");

  // Run at 4:00 AM every day (Europe/Paris timezone)
  cron.schedule(
    "0 4 * * *",
    async () => {
      console.log(`[${new Date().toISOString()}] Running scheduled role sync...`);
      try {
        const result = await syncRoles();
        console.log(
          `[${new Date().toISOString()}] Sync completed:`,
          result.message
        );
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Sync failed:`,
          error
        );
      }
    },
    {
      timezone: "Europe/Paris",
    }
  );

  console.log("Role sync scheduler initialized (runs daily at 4:00 AM Europe/Paris)");
}
