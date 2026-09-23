"use client";

import DashboardStatCard from "./DashboardStatCard";

function MiniTruckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h11v11H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3 21a6 6 0 0 1 12 0" />
      <path d="M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4.5" />
    </svg>
  );
}

function RouteIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h3a5 5 0 0 0 5-5V8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M12 3 2.8 20h18.4L12 3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <section>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Fleet overview
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              Your fleet at a glance
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Monitor vehicles, trips, drivers and operational alerts.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Create Trip
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total Vehicles"
          value="42"
          subtitle="38 currently active"
          change="+8.4%"
          icon={<MiniTruckIcon />}
        />

        <DashboardStatCard
          title="Active Drivers"
          value="28"
          subtitle="24 available today"
          change="+4.2%"
          icon={<UsersIcon />}
        />

        <DashboardStatCard
          title="Active Trips"
          value="16"
          subtitle="12 currently running"
          change="+12.6%"
          icon={<RouteIcon />}
        />

        <DashboardStatCard
          title="Open Alerts"
          value="5"
          subtitle="2 require attention"
          change="-18.2%"
          positive
          icon={<AlertIcon />}
        />
      </section>

      {/* Main analytics */}
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Fleet utilization */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white">
                Fleet utilization
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Vehicle activity over the last 7 days
              </p>
            </div>

            <select className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600 outline-none dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          <div className="mt-8 flex h-[230px] items-end gap-2 sm:gap-4">
            {[62, 74, 68, 86, 78, 91, 84].map((height, index) => (
              <div
                key={index}
                className="group flex h-full flex-1 flex-col justify-end"
              >
                <div
                  className="relative w-full rounded-t-lg bg-blue-500/20 transition-all duration-500 group-hover:bg-blue-500/35 dark:bg-blue-500/20 dark:group-hover:bg-blue-500/30"
                  style={{ height: `${height}%` }}
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-blue-600"
                    style={{ height: `${Math.min(height * 0.75, 100)}%` }}
                  />
                </div>

                <span className="mt-3 text-center text-[10px] text-slate-400">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trip status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
          <div>
            <h3 className="font-bold text-slate-950 dark:text-white">
              Trip status
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Current trip distribution
            </p>
          </div>

          <div className="mt-7 flex items-center justify-center">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-blue-600">
              <div className="absolute inset-[-18px] rounded-full border-[18px] border-transparent border-r-emerald-500 border-b-amber-400 rotate-[25deg]" />

              <div className="text-center">
                <p className="text-3xl font-bold text-slate-950 dark:text-white">
                  24
                </p>
                <p className="text-xs text-slate-400">Total trips</p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                <span className="text-[11px] text-slate-400">Running</span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                12
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] text-slate-400">Completed</span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                8
              </p>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-[11px] text-slate-400">Delayed</span>
              </div>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                4
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lower section */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Maintenance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white">
                Upcoming maintenance
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Vehicles requiring service
              </p>
            </div>

            <a
              href="/maintenance"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View all
            </a>
          </div>

          <div className="mt-5 space-y-3">
            {[
              {
                vehicle: "Toyota Hiace",
                id: "FL-024",
                date: "Tomorrow",
                type: "Oil & filter",
              },
              {
                vehicle: "Isuzu NPR",
                id: "FL-017",
                date: "Sep 26",
                type: "Brake inspection",
              },
              {
                vehicle: "Hino 500",
                id: "FL-031",
                date: "Sep 29",
                type: "Full service",
              },
            ].map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/[0.05]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 0 0 5.2-5.2l-2.3 2.3-2.5-.5-.5-2.5Z" />
                  </svg>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.vehicle}
                  </p>

                  <p className="text-xs text-slate-400">
                    {item.id} • {item.type}
                  </p>
                </div>

                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white">
                Recent activity
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Latest fleet operations
              </p>
            </div>

            <a
              href="/audit-logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              View logs
            </a>
          </div>

          <div className="mt-5 space-y-5">
            {[
              {
                title: "Trip dispatched",
                description: "TRP-1042 assigned to FL-018",
                time: "8 min ago",
                type: "blue",
              },
              {
                title: "Vehicle maintenance completed",
                description: "FL-009 is back in service",
                time: "24 min ago",
                type: "green",
              },
              {
                title: "Driver status updated",
                description: "Ahmad Khan is now available",
                time: "41 min ago",
                type: "purple",
              },
              {
                title: "Fuel record added",
                description: "92L recorded for FL-021",
                time: "1 hr ago",
                type: "amber",
              },
            ].map((activity) => (
              <div key={activity.title} className="flex gap-3">
                <div
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    activity.type === "blue"
                      ? "bg-blue-500"
                      : activity.type === "green"
                        ? "bg-emerald-500"
                        : activity.type === "purple"
                          ? "bg-purple-500"
                          : "bg-amber-500"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {activity.title}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        {activity.description}
                      </p>
                    </div>

                    <span className="shrink-0 text-[10px] text-slate-400">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
        <div>
          <h3 className="font-bold text-slate-950 dark:text-white">
            Quick actions
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Common fleet management operations
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Add vehicle",
              description: "Register a fleet vehicle",
              href: "/vehicles/new",
            },
            {
              title: "Add driver",
              description: "Create driver profile",
              href: "/drivers/new",
            },
            {
              title: "Create trip",
              description: "Schedule a new trip",
              href: "/trips/new",
            },
            {
              title: "Record expense",
              description: "Add operational cost",
              href: "/expenses/new",
            },
          ].map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="group rounded-xl border border-slate-100 p-4 transition-all hover:border-blue-200 hover:bg-blue-50/50 dark:border-white/[0.05] dark:hover:border-blue-500/20 dark:hover:bg-blue-500/[0.04]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {action.title}
                </p>

                <svg
                  className="text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-500"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {action.description}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
