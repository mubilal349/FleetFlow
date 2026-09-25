import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Mail,
  MapPin,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

const productLinks = [
  { label: "Fleet Management", href: "#features", icon: Truck },
  { label: "Vehicle Requests", href: "#features", icon: ClipboardList },
  { label: "Driver Management", href: "#features", icon: Users },
  { label: "Maintenance", href: "#features", icon: Wrench },
];

const companyLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#features" },
  { label: "Get Started", href: "/register" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-white/10 dark:bg-[#050b18]">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 group-hover:rotate-6 group-hover:shadow-blue-600/30">
                F
              </div>

              <div>
                <p className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
                  FleetFlow
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                  Smart Fleet Management
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              A modern fleet management platform built to help businesses manage
              vehicles, drivers, requests, maintenance, and daily operations
              from one centralized system.
            </p>

            {/* Location */}
            <div className="mt-5 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Smart logistics, simplified.</span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Platform
            </h3>

            <ul className="mt-5 space-y-3">
              {productLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                    >
                      <Icon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-zinc-950 dark:text-white">
              Explore
            </h3>

            <ul className="mt-5 space-y-3">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
                  >
                    {item.label}

                    {item.label === "Get Started" && (
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mb-8 flex flex-col gap-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-blue-500/10 dark:bg-blue-500/5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />

              <p className="text-sm font-bold text-zinc-950 dark:text-white">
                Ready to streamline your fleet?
              </p>
            </div>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Start managing your fleet from one centralized platform.
            </p>
          </div>

          <Link
            href="/register"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30"
          >
            Get Started
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Copyright */}
        <div className="flex flex-col gap-3 border-t border-zinc-100 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:text-zinc-500">
          <p>© {currentYear} FleetFlow. All rights reserved.</p>

          <div className="flex items-center gap-5">
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

            <Link
              href="/security"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
