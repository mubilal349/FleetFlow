import {
  Truck,
  Users,
  ClipboardList,
  Wrench,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Vehicle Management",
    description:
      "Keep complete records of your fleet, vehicle status, assignments, and operational availability.",
  },
  {
    icon: Users,
    title: "Driver Management",
    description:
      "Manage drivers, roles, assignments, and operational responsibilities from one place.",
  },
  {
    icon: ClipboardList,
    title: "Vehicle Requests",
    description:
      "Allow authorized users to request vehicles and streamline the approval and assignment workflow.",
  },
  {
    icon: Wrench,
    title: "Maintenance Tracking",
    description:
      "Track vehicles that require maintenance and keep your fleet operating efficiently.",
  },
  {
    icon: BarChart3,
    title: "Fleet Analytics",
    description:
      "Turn fleet activity into useful insights with centralized operational statistics and reports.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description:
      "Give administrators, managers, drivers, and customers access to the features they need.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-y border-zinc-200/70 bg-zinc-50/70 py-24 dark:border-white/5 dark:bg-[#070e1d] sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            Powerful Features
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white">
            Everything your fleet needs.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            FleetFlow brings vehicles, drivers, requests, maintenance, and
            operational insights together in one centralized platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-white/[0.03] ${
                  index === 0
                    ? "border-blue-200 shadow-lg shadow-blue-500/5 dark:border-blue-500/30"
                    : "border-zinc-200 dark:border-white/10"
                }`}
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-blue-500/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                {/* Featured label */}
                {index === 0 && (
                  <div className="absolute right-5 top-5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                    Core
                  </div>
                )}

                {/* Icon */}
                <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>

                {/* Title */}
                <div className="relative mt-6 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {feature.title}
                  </h3>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-300 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-500 group-hover:opacity-100 dark:text-zinc-600 dark:group-hover:text-blue-400" />
                </div>

                {/* Description */}
                <p className="relative mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>

                {/* Bottom accent */}
                <div className="mt-6 h-px w-0 bg-blue-500 transition-all duration-500 group-hover:w-full" />
              </div>
            );
          })}
        </div>

        {/* Bottom platform statement */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-5 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>

            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                Built around your fleet operations
              </p>

              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                One platform for managing your day-to-day fleet workflow.
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
            FleetFlow Platform
          </span>
        </div>
      </div>
    </section>
  );
}
