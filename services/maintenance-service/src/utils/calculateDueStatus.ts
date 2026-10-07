export type MaintenanceAlertSeverity = "critical" | "warning" | "upcoming";

export function calculateMaintenanceAlert(scheduledDate: Date) {
  const now = new Date();

  const difference = new Date(scheduledDate).getTime() - now.getTime();

  const daysRemaining = Math.ceil(difference / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      severity: "critical" as const,
      title: "Maintenance Overdue",
      daysRemaining,
    };
  }

  if (daysRemaining <= 7) {
    return {
      severity: "warning" as const,
      title: "Maintenance Due Soon",
      daysRemaining,
    };
  }

  if (daysRemaining <= 30) {
    return {
      severity: "upcoming" as const,
      title: "Upcoming Maintenance",
      daysRemaining,
    };
  }

  return null;
}
