const steps = [
  {
    number: "01",
    title: "Create your organization",
    description:
      "Set up your FleetFlow workspace and configure your fleet operations.",
  },
  {
    number: "02",
    title: "Add vehicles and drivers",
    description:
      "Build your fleet database and manage your drivers from one centralized system.",
  },
  {
    number: "03",
    title: "Manage daily operations",
    description:
      "Handle vehicle requests, assignments, maintenance, and fleet activity.",
  },
  {
    number: "04",
    title: "Track performance",
    description:
      "Use operational insights to understand your fleet and make better decisions.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
              How It Works
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Simple fleet management from start to finish.
            </h2>

            <p className="mt-5 max-w-lg leading-7 text-zinc-600 dark:text-zinc-400">
              FleetFlow is designed to keep your fleet operations organized,
              transparent, and easy to manage.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group flex gap-5 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/30"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20">
                  {step.number}
                </div>

                <div>
                  <h3 className="font-bold text-zinc-900 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
