const stats = [
  {
    value: "100%",
    label: "Centralized Management",
  },
  {
    value: "24/7",
    label: "Fleet Visibility",
  },
  {
    value: "4+",
    label: "User Roles",
  },
  {
    value: "1",
    label: "Unified Platform",
  },
];

export default function Stats() {
  return (
    <section id="about" className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/[0.03]">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`p-7 text-center ${
                index !== stats.length - 1
                  ? "border-b border-zinc-200 sm:border-r lg:border-b-0 dark:border-white/10"
                  : ""
              } ${index === 1 ? "sm:border-r-0 lg:border-r" : ""}`}
            >
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                {stat.value}
              </div>

              <div className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
