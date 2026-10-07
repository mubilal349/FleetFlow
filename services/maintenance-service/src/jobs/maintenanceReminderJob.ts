import cron from "node-cron";

import { reminderService } from "../services/reminderService.js";

/**
 * Maintenance Reminder Scheduler
 *
 * Runs automatically every day at 8:00 AM.
 *
 * It checks all organizations and generates/updates
 * maintenance reminder alerts.
 */
export function startMaintenanceReminderJob() {
  /**
   * Cron expression:
   *
   * 0 8 * * *
   *
   * ┌──────── minute (0)
   * │ ┌────── hour (8)
   * │ │ ┌──── day of month (*)
   * │ │ │ ┌── month (*)
   * │ │ │ │ ┌ day of week (*)
   * │ │ │ │ │
   * 0 8 * * *
   *
   * Runs every day at 08:00.
   */
  cron.schedule(
    "0 8 * * *",
    async () => {
      try {
        console.log("🔔 Running maintenance reminder scheduler...");

        const results = await reminderService.generateAllReminders();

        const totalAlerts = results.reduce(
          (total, result) => total + result.alertsGenerated,
          0,
        );

        console.log(
          `✅ Maintenance reminder scheduler completed. ${totalAlerts} alerts processed.`,
        );

        for (const result of results) {
          console.log(
            `   Organization ${result.organizationId}: ${result.alertsGenerated} alerts`,
          );
        }
      } catch (error) {
        console.error("❌ Maintenance reminder scheduler failed:", error);
      }
    },
    {
      timezone: "Asia/Karachi",
    },
  );

  console.log("⏰ Maintenance reminder scheduler started.");

  console.log("📅 Schedule: Every day at 08:00 Asia/Karachi");
}
