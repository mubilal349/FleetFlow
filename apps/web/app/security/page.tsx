import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const securityAreas = [
  {
    icon: LockKeyhole,
    title: "Authentication",
    description:
      "FleetFlow uses authenticated accounts to control access to protected platform functionality.",
  },
  {
    icon: UserRound,
    title: "Role-Based Access",
    description:
      "Different organization roles can be given different permissions so users only access the functionality relevant to their responsibilities.",
  },
  {
    icon: KeyRound,
    title: "Credential Protection",
    description:
      "Authentication credentials are handled through the application's authentication system and should never be shared between users.",
  },
  {
    icon: ShieldCheck,
    title: "Operational Security",
    description:
      "FleetFlow is designed with access control, validation, protected APIs, and secure application practices in mind.",
  },
];

const practices = [
  "Authenticated access to protected application functionality.",
  "Role-based authorization for organization users.",
  "Server-side validation of application requests.",
  "Protected API endpoints for sensitive operations.",
  "Secure handling of authentication tokens and credentials.",
  "Logging and monitoring capabilities can be used to investigate operational activity.",
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-[#050b18] dark:text-white">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 group-hover:rotate-6">
              F
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">FleetFlow</p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Smart Fleet Management
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to FleetFlow
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-white/10">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[700px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Security
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Security at FleetFlow
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            FleetFlow is designed with security and controlled access in mind,
            helping organizations manage fleet information through authenticated
            and role-aware workflows.
          </p>

          <p className="mt-4 text-xs text-zinc-500">
            Last updated: September 2026
          </p>
        </div>
      </section>

      {/* Security Areas */}
      <section className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {securityAreas.map((area) => {
            const Icon = area.icon;

            return (
              <div
                key={area.title}
                className="group rounded-3xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-5 text-lg font-bold text-zinc-950 dark:text-white">
                  {area.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {area.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security Practices */}
      <section className="border-y border-zinc-200 bg-zinc-50/70 dark:border-white/5 dark:bg-[#070e1d]">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Security Practices
          </p>

          <h2 className="mt-3 text-2xl font-black text-zinc-950 dark:text-white sm:text-3xl">
            Security is part of the platform workflow.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-400">
            The application is designed to reduce unauthorized access and
            provide controlled access to fleet operations.
          </p>

          <div className="mt-8 space-y-3">
            {practices.map((practice) => (
              <div
                key={practice}
                className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {practice}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Note */}
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-500/10 dark:bg-blue-500/5">
          <div className="flex gap-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

            <div>
              <h2 className="font-bold text-zinc-950 dark:text-white">
                Security disclosure
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                If you discover a potential security issue in FleetFlow,
                document the issue responsibly and report it to the service
                administrator. Do not attempt to access, modify, or extract
                another user's data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FleetFlow. All rights reserved.</p>

          <div className="flex gap-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
