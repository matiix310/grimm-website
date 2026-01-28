import { performRoleSync } from "@/lib/sync-roles";
import { ScheduledJob } from "..";

const job = {
  name: "syncRoles",
  expression: "0 4 * * *",
  options: {
    timezone: "Europe/Paris",
  },
  func: async () => {
    console.log(`[${new Date().toISOString()}] Running scheduled role sync...`);
    try {
      const result = await performRoleSync();
      console.log(`[${new Date().toISOString()}] Sync completed:`, result.message);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Sync failed:`, error);
    }
  },
} as const satisfies ScheduledJob;

export default job;
