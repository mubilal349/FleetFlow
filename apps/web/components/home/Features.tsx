import {
  Truck,
  Users,
  ClipboardList,
  Wrench,
  BarChart3,
  ShieldCheck,
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
      className="border-y border-zinc-200/70 bg-zinc-50/70 py-24 dark:border-white/5 dark:bg-[#070e1d]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Powerful Features
          </span>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
            Everything your fleet needs
          </h2>

          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            FleetFlow brings your fleet operations together in one centralized
            platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-zinc-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/30"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/10 dark:text-blue-400">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>

                {/* Title */}
                <h3 className="mt-6 text-lg font-bold text-zinc-900 dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
