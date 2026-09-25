import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "Using FleetFlow",
    items: [
      "FleetFlow provides tools for managing fleet information, vehicles, drivers, requests, assignments, maintenance, and related operational activities.",
      "Users must use the platform only for legitimate business and organizational purposes.",
      "Users are responsible for maintaining the confidentiality of their account credentials.",
    ],
  },
  {
    title: "Accounts and Access",
    items: [
      "Users must provide accurate information when creating an account.",
      "Organizations are responsible for managing their members and assigning appropriate roles.",
      "Users must not attempt to access data or functionality that they are not authorized to access.",
      "Account credentials should not be shared with other individuals.",
    ],
  },
  {
    title: "Organization Data",
    items: [
      "Organizations are responsible for the information they enter into FleetFlow.",
      "Organizations should ensure that they have the appropriate rights and permissions to process information stored in the platform.",
      "FleetFlow should not be used to store information that the organization is prohibited from processing.",
    ],
  },
  {
    title: "Acceptable Use",
    items: [
      "Users must not intentionally disrupt, damage, or interfere with FleetFlow.",
      "Users must not attempt unauthorized access to accounts, systems, APIs, databases, or infrastructure.",
      "Users must not use the platform for unlawful activities.",
      "Users must not upload malicious software or content intended to compromise the platform or other users.",
    ],
  },
  {
    title: "Service Availability",
    items: [
      "FleetFlow is designed to provide reliable fleet management functionality, but uninterrupted availability cannot be guaranteed.",
      "Maintenance, updates, infrastructure issues, or circumstances outside the service's control may temporarily affect availability.",
      "Features may evolve as the platform is developed and improved.",
    ],
  },
  {
    title: "Changes to These Terms",
    items: [
      "These terms may be updated as FleetFlow evolves.",
      "Material changes should be communicated through appropriate service channels where applicable.",
      "Continued use of the service after an applicable update may constitute acceptance of the updated terms, subject to applicable law.",
    ],
  },
];

export default function TermsPage() {
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
            <FileText className="h-6 w-6" />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            These terms describe the general rules for using the FleetFlow
            platform and its fleet management functionality.
          </p>

          <p className="mt-4 text-xs text-zinc-500">
            Last updated: September 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white">
                {section.title}
              </h2>

              <ul className="mt-4 space-y-3">
                {section.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-7 text-zinc-600 dark:text-zinc-400"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-500/10 dark:bg-blue-500/5">
            <div className="flex gap-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

              <div>
                <h2 className="font-bold text-zinc-950 dark:text-white">
                  Important
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  This page provides general product terms for the FleetFlow
                  project. Before using these terms for a commercial service,
                  they should be reviewed and adapted to the applicable
                  jurisdiction, organization, and contractual requirements.
                </p>
              </div>
            </div>
          </section>
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
              href="/security"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Security
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
