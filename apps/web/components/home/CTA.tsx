import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Truck,
} from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-blue-500/20 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-700 shadow-2xl shadow-blue-600/20">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-blue-950/30 blur-3xl" />

            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
          </div>

          <div className="relative grid items-center gap-12 px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-20">
            {/* =====================================================
                LEFT — CTA CONTENT
            ====================================================== */}
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100 backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                  <Activity className="h-3 w-3" />
                </span>
                Get Started
              </div>

              <h2 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[3.5rem] lg:leading-[1.05]">
                Take control of your fleet.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg">
                Bring vehicles, drivers, requests, maintenance, and daily
                operations together in one streamlined fleet management
                platform.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-600 shadow-xl shadow-blue-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50"
                >
                  Create Your Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="#features"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
                >
                  Explore FleetFlow
                </Link>
              </div>

              {/* Feature points */}
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  Vehicle management
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  Driver operations
                </div>

                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  Fleet tracking
                </div>
              </div>
            </div>

            {/* =====================================================
                RIGHT — FLEETFLOW VISUAL
            ====================================================== */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              {/* Glow */}
              <div className="absolute -inset-6 rounded-[2rem] bg-white/10 blur-3xl" />

              {/* Main visual */}
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#08101f]/80 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-black text-white shadow-lg shadow-blue-500/20">
                      F
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">FleetFlow</p>

                      <p className="text-[9px] text-zinc-500">
                        Fleet operations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />

                      <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>

                    <span className="text-[8px] font-bold text-emerald-400">
                      ONLINE
                    </span>
                  </div>
                </div>

                {/* Fleet route visual */}
                <div className="relative mt-4 h-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0d1729]">
                  {/* Grid */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute left-1/4 top-0 h-full w-px bg-blue-300" />
                    <div className="absolute left-1/2 top-0 h-full w-px bg-blue-300" />
                    <div className="absolute left-3/4 top-0 h-full w-px bg-blue-300" />

                    <div className="absolute left-0 top-1/3 h-px w-full bg-blue-300" />
                    <div className="absolute left-0 top-2/3 h-px w-full bg-blue-300" />
                  </div>

                  {/* Road */}
                  <div className="absolute left-[-10%] top-[58%] h-10 w-[120%] rotate-[-5deg] bg-[#18243a]" />

                  {/* Route */}
                  <svg
                    className="absolute inset-0 h-full w-full"
                    viewBox="0 0 500 220"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M55 165 C130 145, 150 70, 245 100 S350 165, 445 45"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="3"
                      strokeDasharray="7 7"
                    />

                    <circle cx="55" cy="165" r="6" fill="#22c55e" />

                    <circle cx="445" cy="45" r="7" fill="#3b82f6" />

                    <circle
                      cx="445"
                      cy="45"
                      r="15"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="1.5"
                      opacity="0.4"
                    />
                  </svg>

                  {/* Truck */}
                  <div className="absolute left-[22%] top-[59%] flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-blue-600 shadow-lg shadow-blue-600/30">
                    <Truck className="h-4 w-4 text-white" />
                  </div>

                  {/* Destination */}
                  <div className="absolute right-[8%] top-[12%] flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                    <MapPin className="h-4 w-4 text-blue-400" />
                  </div>

                  {/* Labels */}
                  <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-[#08101f]/85 px-2.5 py-1.5 backdrop-blur-sm">
                    <p className="text-[8px] font-bold text-white">
                      Vehicle en route
                    </p>
                    <p className="text-[7px] text-zinc-500">
                      Route synchronized
                    </p>
                  </div>

                  <div className="absolute right-3 top-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5">
                    <p className="text-[8px] font-bold text-emerald-400">
                      Live tracking
                    </p>
                  </div>
                </div>

                {/* Bottom status cards */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                        <Truck className="h-3.5 w-3.5 text-blue-400" />
                      </div>

                      <div>
                        <p className="text-[8px] text-zinc-500">Fleet</p>

                        <p className="text-[10px] font-bold text-white">
                          Monitored
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </div>

                      <div>
                        <p className="text-[8px] text-zinc-500">Operations</p>

                        <p className="text-[10px] font-bold text-white">
                          Organized
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating top card */}
              <div className="absolute -right-4 -top-5 hidden rounded-2xl border border-white/15 bg-[#08101f] px-3 py-2.5 shadow-xl shadow-blue-950/30 sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10">
                    <Activity className="h-3.5 w-3.5 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-white">
                      Fleet activity
                    </p>

                    <p className="text-[8px] text-zinc-500">
                      Updating in real time
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating bottom card */}
              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-white/15 bg-[#08101f] px-3 py-2.5 shadow-xl shadow-blue-950/30 sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold text-white">
                      Ready to operate
                    </p>

                    <p className="text-[8px] text-zinc-500">
                      Everything in one place
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
