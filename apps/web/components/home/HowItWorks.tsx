import {
  Building2,
  CheckCircle2,
  Settings2,
  Truck,
  BarChart3,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Create your organization",
    description:
      "Set up your FleetFlow workspace and configure your fleet operations.",
    icon: Building2,
  },
  {
    number: "02",
    title: "Add vehicles and drivers",
    description:
      "Build your fleet database and manage your drivers from one centralized system.",
    icon: Truck,
  },
  {
    number: "03",
    title: "Manage daily operations",
    description:
      "Handle vehicle requests, assignments, maintenance, and fleet activity.",
    icon: Settings2,
  },
  {
    number: "04",
    title: "Track performance",
    description:
      "Use operational insights to understand your fleet and make better decisions.",
    icon: BarChart3,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden py-24 sm:py-28"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
            How It Works
          </span>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl dark:text-white">
            From setup to daily operations.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            FleetFlow brings your fleet operations together through a simple,
            connected workflow.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mt-16">
          {/* Connecting line - desktop */}
          <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-px bg-gradient-to-r from-blue-500/10 via-blue-500/40 to-blue-500/10 lg:block" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group relative"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Step icon */}
                  <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-white text-blue-600 shadow-lg shadow-blue-500/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-blue-400 group-hover:shadow-xl group-hover:shadow-blue-500/20 dark:border-blue-500/20 dark:bg-[#0b1324] dark:text-blue-400 dark:group-hover:border-blue-500/40">
                    <Icon className="h-7 w-7" strokeWidth={1.8} />

                    {/* Number */}
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[9px] font-black text-white shadow-md shadow-blue-600/20">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom status */}
                  <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    FleetFlow workflow
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom workflow card */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/[0.03] sm:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col items-center justify-between gap-5 sm:flex-row">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                  <Truck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">
                    One connected fleet workflow
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    From fleet setup to operational insights.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Ready to operate
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
