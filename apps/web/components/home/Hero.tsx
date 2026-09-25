"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  MoreHorizontal,
  Navigation,
  Package,
  Truck,
  Users,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl sm:h-[600px] sm:w-[700px] lg:w-[900px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          {/* =====================================================
              LEFT — HERO CONTENT
          ====================================================== */}
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 sm:mb-6 sm:px-3.5 sm:text-xs">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-blue-500" />

              <span className="truncate">Smart Fleet Management Platform</span>
            </div>

            <h1 className="max-w-3xl text-[2.65rem] font-black leading-[1.05] tracking-tight text-zinc-950 sm:text-6xl sm:leading-[1.05] lg:text-7xl dark:text-white">
              Move your fleet
              <span className="block text-blue-600">smarter.</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-400 sm:mt-6 sm:text-lg sm:leading-8">
              FleetFlow helps businesses manage vehicles, drivers, requests,
              maintenance, and daily fleet operations from one powerful
              platform.
            </p>

            {/* Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row">
              <Link
                href="/register"
                className="group inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-blue-600/30 sm:w-auto sm:px-6"
              >
                Start Managing Your Fleet
                <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <a
                href="#features"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3.5 text-sm font-bold text-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-blue-500/40 dark:hover:text-blue-400 sm:w-auto sm:px-6"
              >
                Explore Features
              </a>
            </div>

            {/* Feature checks */}
            <div className="mt-7 grid gap-3 text-sm text-zinc-500 dark:text-zinc-400 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                Vehicle Management
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                Driver Management
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                Real-time Operations
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT — FLEETFLOW PRODUCT PREVIEW
          ====================================================== */}
          <div className="relative min-w-0 animate-fade-up-delay">
            {/* Glow */}
            <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-blue-500/10 blur-3xl sm:-inset-6" />

            {/* Dashboard shell */}
            <div className="relative min-w-0 overflow-hidden rounded-[1.35rem] border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/10 dark:border-white/10 dark:bg-[#0b1324] dark:shadow-black/40 sm:rounded-[1.75rem]">
              {/* Browser / App Header */}
              <div className="flex h-14 min-w-0 items-center justify-between gap-3 border-b border-zinc-200 px-3.5 dark:border-white/10 sm:px-4">
                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                    F
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-zinc-900 dark:text-white">
                      FleetFlow
                    </p>

                    <p className="truncate text-[9px] text-zinc-500">
                      Fleet Management
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="hidden text-[10px] font-medium text-zinc-500 dark:text-zinc-400 xs:inline sm:inline">
                    System Online
                  </span>
                </div>
              </div>

              {/* Dashboard */}
              <div className="grid min-w-0 grid-cols-[48px_minmax(0,1fr)] sm:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[70px_minmax(0,1fr)]">
                {/* Sidebar */}
                <aside className="border-r border-zinc-200 bg-zinc-50 px-1.5 py-3 dark:border-white/10 dark:bg-[#08101f] sm:px-2.5 lg:px-3">
                  <div className="flex flex-col items-center gap-2.5 sm:gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20 sm:h-9 sm:w-9 sm:rounded-xl">
                      <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>

                    <div className="h-px w-6 bg-zinc-200 dark:bg-white/10 sm:w-8" />

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 sm:h-9 sm:w-9 sm:rounded-xl">
                      <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 sm:h-9 sm:w-9 sm:rounded-xl">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 sm:h-9 sm:w-9 sm:rounded-xl">
                      <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 sm:h-9 sm:w-9 sm:rounded-xl">
                      <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                  </div>
                </aside>

                {/* Main Dashboard */}
                <div className="min-w-0 overflow-hidden p-3 sm:p-4 lg:p-5">
                  {/* Dashboard title */}
                  <div className="mb-4 flex min-w-0 items-center justify-between gap-2 sm:mb-5">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-zinc-950 dark:text-white sm:text-sm">
                        Fleet Overview
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-zinc-500 sm:text-[10px]">
                        Monitor your fleet in real time
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="More dashboard options"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 dark:border-white/10 sm:h-8 sm:w-8"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2.5">
                    <StatCard
                      icon={<Truck className="h-3.5 w-3.5" />}
                      label="Vehicles"
                      value="48"
                    />

                    <StatCard
                      icon={<Users className="h-3.5 w-3.5" />}
                      label="Drivers"
                      value="36"
                    />

                    <StatCard
                      icon={<Navigation className="h-3.5 w-3.5" />}
                      label="Active"
                      value="24"
                    />

                    <StatCard
                      icon={<Clock3 className="h-3.5 w-3.5" />}
                      label="Requests"
                      value="12"
                    />
                  </div>

                  {/* Main content */}
                  <div className="mt-3 grid min-w-0 gap-3 lg:grid-cols-[1.35fr_0.65fr]">
                    {/* Fleet Map */}
                    <div className="relative h-[210px] min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-[#101b30] sm:h-[250px]">
                      {/* Map grid */}
                      <div className="absolute inset-0 opacity-30">
                        <div className="absolute left-1/4 top-0 h-full w-px bg-zinc-400 dark:bg-zinc-600" />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-zinc-400 dark:bg-zinc-600" />
                        <div className="absolute left-3/4 top-0 h-full w-px bg-zinc-400 dark:bg-zinc-600" />

                        <div className="absolute left-0 top-1/4 h-px w-full bg-zinc-400 dark:bg-zinc-600" />
                        <div className="absolute left-0 top-1/2 h-px w-full bg-zinc-400 dark:bg-zinc-600" />
                        <div className="absolute left-0 top-3/4 h-px w-full bg-zinc-400 dark:bg-zinc-600" />
                      </div>

                      {/* Roads */}
                      <div className="absolute left-[-10%] top-[48%] h-7 w-[120%] rotate-[-8deg] bg-white/80 dark:bg-[#18243a] sm:h-8" />

                      <div className="absolute left-[30%] top-[-10%] h-[120%] w-6 rotate-[18deg] bg-white/80 dark:bg-[#18243a] sm:w-7" />

                      {/* Route */}
                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 500 250"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M70 190 C130 165, 150 75, 230 105 S330 190, 430 60"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray="7 7"
                        />
                      </svg>

                      {/* Vehicle markers */}
                      <MapMarker
                        className="left-[13%] top-[70%]"
                        label="Truck"
                      />

                      <MapMarker className="left-[44%] top-[38%]" label="Van" />

                      <MapMarker
                        className="left-[68%] top-[66%]"
                        label="Truck"
                      />

                      <MapMarker
                        className="left-[82%] top-[20%]"
                        label="Destination"
                        destination
                      />

                      {/* Map label */}
                      <div className="absolute left-2.5 top-2.5 max-w-[calc(100%-20px)] truncate rounded-lg border border-zinc-200 bg-white/90 px-2 py-1.5 text-[8px] font-semibold text-zinc-700 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#0b1324]/90 dark:text-zinc-300 sm:left-3 sm:top-3 sm:px-2.5 sm:text-[9px]">
                        Live Fleet Tracking
                      </div>
                    </div>

                    {/* Right information panel */}
                    <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {/* Active requests */}
                      <div className="min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[10px] font-bold text-zinc-900 dark:text-white">
                            Vehicle Requests
                          </p>

                          <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-[8px] font-semibold text-blue-600 dark:text-blue-400">
                            4 New
                          </span>
                        </div>

                        <div className="mt-3 space-y-2.5">
                          <RequestItem
                            vehicle="Toyota Hilux"
                            status="Pending"
                          />

                          <RequestItem
                            vehicle="Isuzu Truck"
                            status="Approved"
                          />

                          <RequestItem vehicle="Honda Bike" status="Pending" />
                        </div>
                      </div>

                      {/* Fleet health */}
                      <div className="min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold text-zinc-900 dark:text-white">
                            Fleet Health
                          </p>

                          <span className="text-[10px] font-bold text-emerald-500">
                            94%
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                          <div className="h-full w-[94%] rounded-full bg-emerald-500" />
                        </div>

                        <div className="mt-2 flex justify-between gap-2 text-[8px] text-zinc-500">
                          <span>Excellent</span>
                          <span className="truncate">Updated now</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom activity */}
                  <div className="mt-3 min-w-0 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold text-zinc-900 dark:text-white">
                        Recent Activity
                      </p>

                      <span className="shrink-0 text-[9px] text-blue-600 dark:text-blue-400">
                        View all
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <ActivityItem text="Vehicle assigned" detail="TRK-204" />

                      <ActivityItem text="Request approved" detail="REQ-381" />

                      <ActivityItem
                        text="Maintenance completed"
                        detail="VH-102"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating status card */}
            <div className="absolute -bottom-5 left-2 hidden max-w-[230px] rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl shadow-zinc-950/10 sm:block lg:-left-4 dark:border-white/10 dark:bg-[#0b1324] dark:shadow-black/30">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-zinc-900 dark:text-white">
                    Fleet operating normally
                  </p>

                  <p className="text-[9px] text-zinc-500">24 vehicles active</p>
                </div>
              </div>
            </div>

            {/* Floating live card */}
            <div className="absolute -right-1 -top-5 hidden rounded-2xl border border-blue-100 bg-white p-3 shadow-xl shadow-blue-950/10 sm:block lg:-right-4 dark:border-blue-500/10 dark:bg-[#0b1324]">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />

                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
                </span>

                <span className="text-[10px] font-bold text-zinc-900 dark:text-white">
                  Live tracking
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-2 dark:border-white/10 dark:bg-white/[0.03] sm:p-2.5">
      <div className="flex min-w-0 items-center gap-1.5 text-blue-600 dark:text-blue-400">
        {icon}

        <span className="truncate text-[8px] font-medium text-zinc-500 dark:text-zinc-500">
          {label}
        </span>
      </div>

      <p className="mt-1 text-base font-black text-zinc-900 dark:text-white sm:text-lg">
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   MAP MARKER
===================================================== */

function MapMarker({
  className,
  label,
  destination = false,
}: {
  className: string;
  label: string;
  destination?: boolean;
}) {
  return (
    <div className={`absolute ${className}`}>
      <div className="group relative">
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-white shadow-lg sm:h-7 sm:w-7 ${
            destination ? "bg-blue-600" : "bg-emerald-500"
          }`}
        >
          {destination ? (
            <MapPin className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
          ) : (
            <Truck className="h-3 w-3 text-white sm:h-3.5 sm:w-3.5" />
          )}
        </div>

        <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-zinc-900 px-1.5 py-0.5 text-[7px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          {label}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   REQUEST ITEM
===================================================== */

function RequestItem({
  vehicle,
  status,
}: {
  vehicle: string;
  status: "Pending" | "Approved";
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-[9px] font-semibold text-zinc-800 dark:text-zinc-200">
          {vehicle}
        </p>

        <p className="truncate text-[8px] text-zinc-500">Vehicle request</p>
      </div>

      <span
        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-semibold ${
          status === "Approved"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

/* =====================================================
   ACTIVITY ITEM
===================================================== */

function ActivityItem({ text, detail }: { text: string; detail: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl bg-white p-2 dark:bg-white/[0.03]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[8px] font-semibold text-zinc-800 dark:text-zinc-200">
          {text}
        </p>

        <p className="text-[7px] text-zinc-500">{detail}</p>
      </div>
    </div>
  );
}
