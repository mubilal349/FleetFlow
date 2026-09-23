interface DashboardStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  change: string;
  positive?: boolean;
  icon: React.ReactNode;
}

export default function DashboardStatCard({
  title,
  value,
  subtitle,
  change,
  positive = true,
  icon,
}: DashboardStatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-white/[0.07] dark:bg-[#0b1120] dark:hover:border-white/[0.12]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>

          <div className="mt-2 flex items-end gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
              {value}
            </h3>

            <span
              className={`mb-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                positive
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
              }`}
            >
              {change}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-500/10 dark:text-blue-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
