import cron, { TaskFn, TaskOptions } from "node-cron";

import haSaintValentin from "./jobs/haSaintValentin";
import syncRolesJob from "./jobs/syncRolesJob";

const jobs: ScheduledJob[] = [haSaintValentin, syncRolesJob];

export async function initScheduler() {
  for (const job of jobs) {
    if (job.environment && !job.environment.includes(process.env.NODE_ENV)) {
      continue;
    }

    try {
      cron.schedule(job.expression, job.func, job.options);
      console.log(
        `[${new Date().toISOString()}] Scheduled job ${job.name} with expression ${job.expression}`,
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Failed to schedule job ${job.name}:`,
        error,
      );
    }
  }
}

export type ScheduledJob = {
  name: string;
  expression: string;
  func: string | TaskFn;
  options?: TaskOptions;
  environment?: (typeof process.env.NODE_ENV)[];
};
