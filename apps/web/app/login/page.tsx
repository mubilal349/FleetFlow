"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

  // --------------------------------------------------
  // Page entrance animation
  // --------------------------------------------------
  // Starts false on every mount (initial load OR refresh), then flips
  // true one frame later so the CSS transitions below always replay.
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPageLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // --------------------------------------------------
  // Theme
  // --------------------------------------------------

  useEffect(() => {
    const savedTheme = localStorage.getItem("fleetflow-theme");

    if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDarkMode = !darkMode;

    setDarkMode(nextDarkMode);

    if (nextDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fleetflow-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fleetflow-theme", "light");
    }
  };

  // --------------------------------------------------
  // Form
  // --------------------------------------------------

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await login({
        email: form.email.trim(),
        password: form.password,
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Small helper so every entrance element shares the same transition
  // behavior and only differs by stagger delay.
  const enter = (delayClass = "") =>
    `transition-all duration-700 ease-out ${delayClass} ${
      pageLoaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
    }`;

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        darkMode ? "bg-[#050816] text-white" : "bg-slate-50 text-slate-900"
      } transition-opacity duration-700 ease-out ${
        pageLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* --------------------------------------------------
          Animated Background
      -------------------------------------------------- */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -left-32 -top-32 h-96 w-96 animate-[float_8s_ease-in-out_infinite] rounded-full blur-3xl ${
            darkMode ? "bg-blue-600/20" : "bg-blue-400/20"
          }`}
        />

        <div
          className={`absolute -bottom-32 -right-32 h-96 w-96 animate-[float_10s_ease-in-out_infinite] rounded-full blur-3xl ${
            darkMode ? "bg-cyan-500/15" : "bg-cyan-400/20"
          }`}
        />

        <div
          className={`absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 animate-[pulse_6s_ease-in-out_infinite] rounded-full blur-3xl ${
            darkMode ? "bg-indigo-600/10" : "bg-indigo-300/20"
          }`}
        />

        <div
          className={`absolute inset-0 ${
            darkMode
              ? "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_45%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_45%)]"
          }`}
        />
      </div>

      {/* --------------------------------------------------
          Header
      -------------------------------------------------- */}

      <header className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-14">
        <Link
          href="/"
          className="group flex items-center gap-3 transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/25 transition-all duration-300 group-hover:rotate-6 group-hover:shadow-blue-600/40">
            F
          </div>

          <div>
            <div className="text-xl font-bold tracking-tight">
              Fleet<span className="text-blue-500">Flow</span>
            </div>

            <div
              className={`hidden text-[10px] font-medium uppercase tracking-[0.2em] sm:block ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Fleet Management
            </div>
          </div>
        </Link>

        {/* Theme Toggle */}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`relative flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 hover:scale-105 ${
            darkMode
              ? "border-slate-700 bg-slate-900 text-yellow-300 hover:border-slate-600"
              : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300"
          }`}
        >
          <span
            className={`absolute transition-all duration-300 ${
              darkMode
                ? "rotate-0 scale-100 opacity-100"
                : "rotate-90 scale-0 opacity-0"
            }`}
          >
            ☀
          </span>

          <span
            className={`absolute transition-all duration-300 ${
              darkMode
                ? "-rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            }`}
          >
            ☾
          </span>
        </button>
      </header>

      {/* --------------------------------------------------
          Main
      -------------------------------------------------- */}

      <div className="relative z-10 flex min-h-[calc(100vh-92px)] items-center justify-center px-4 pb-12 pt-4 sm:px-6">
        <div className="w-full max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-[1fr_460px]">
            {/* --------------------------------------------------
                Left Content
            -------------------------------------------------- */}

            <section className="hidden lg:block">
              <div className="max-w-xl">
                <div
                  className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${enter(
                    "delay-100",
                  )} ${
                    darkMode
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                      : "border-blue-200 bg-blue-50 text-blue-600"
                  }`}
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Welcome back to FleetFlow
                </div>

                <h1
                  className={`text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl ${enter(
                    "delay-150",
                  )}`}
                >
                  Keep your fleet
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    moving forward.
                  </span>
                </h1>

                <p
                  className={`mt-7 max-w-lg text-lg leading-8 ${enter(
                    "delay-200",
                  )} ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Sign in to your FleetFlow workspace and stay on top of your
                  vehicles, drivers, trips, maintenance, and operations.
                </p>

                {/* Stats */}

                <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
                  <div
                    className={`rounded-2xl border p-4 ${enter("delay-300")} ${
                      darkMode
                        ? "border-slate-800 bg-slate-900/60"
                        : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <p className="text-2xl font-bold">24/7</p>
                    <p
                      className={`mt-1 text-xs ${
                        darkMode ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      Visibility
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${enter(
                      "delay-[350ms]",
                    )} ${
                      darkMode
                        ? "border-slate-800 bg-slate-900/60"
                        : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <p className="text-2xl font-bold">1</p>
                    <p
                      className={`mt-1 text-xs ${
                        darkMode ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      Workspace
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border p-4 ${enter(
                      "delay-[400ms]",
                    )} ${
                      darkMode
                        ? "border-slate-800 bg-slate-900/60"
                        : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <p className="text-2xl font-bold">∞</p>
                    <p
                      className={`mt-1 text-xs ${
                        darkMode ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      Possibilities
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* --------------------------------------------------
                Login Card
            -------------------------------------------------- */}

            <section
              className={`w-full rounded-[2rem] border p-6 shadow-2xl transition-all duration-500 sm:p-8 ${enter(
                "delay-150",
              )} ${
                darkMode
                  ? "border-slate-800/80 bg-slate-900/80 shadow-black/30 backdrop-blur-xl"
                  : "border-slate-200 bg-white/90 shadow-slate-200/60 backdrop-blur-xl"
              }`}
            >
              {/* Card Header */}

              <div className="mb-8">
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${
                    darkMode
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Welcome back
                </h2>

                <p
                  className={`mt-2 text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Sign in to continue to your FleetFlow workspace.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div
                  role="alert"
                  className="mb-6 animate-[shake_0.35s_ease-in-out] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                >
                  <div className="flex gap-3">
                    <span>!</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Form */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition-all duration-300 focus:ring-4 ${
                      darkMode
                        ? "border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/10"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                    }`}
                  />
                </div>

                {/* Password */}

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium ${
                        darkMode ? "text-slate-200" : "text-slate-700"
                      }`}
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-medium text-blue-500 transition hover:text-blue-400"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className={`w-full rounded-xl border px-4 py-3.5 pr-12 text-sm outline-none transition-all duration-300 focus:ring-4 ${
                        darkMode
                          ? "border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/10"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium transition ${
                        darkMode
                          ? "text-slate-500 hover:text-slate-300"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span
                    className={`text-sm ${
                      darkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Remember me
                  </span>
                </label>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 cursor-pointer disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative flex w-full items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in to FleetFlow
                        <svg
                          width="23"
                          height="23"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Register */}

              <div
                className={`mt-7 border-t pt-6 text-center ${
                  darkMode ? "border-slate-800" : "border-slate-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    darkMode ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-blue-500 transition-colors hover:text-blue-400"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Back Home */}

              <div className="mt-5 text-center">
                <Link
                  href="/"
                  className={`group flex items-center justify-center gap-2 text-xs transition-colors ${
                    darkMode
                      ? "text-slate-600 hover:text-slate-400"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="shrink-0 transition-transform duration-300 group-hover:-translate-x-1"
                  >
                    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
                    <polyline points="14 17 9 12 14 7" />
                    <line x1="9" y1="12" x2="21" y2="12" />
                  </svg>

                  <span>Back to FleetFlow</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          Animations
      -------------------------------------------------- */}

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) translateX(0);
          }

          50% {
            transform: translateY(-25px) translateX(15px);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }

          25% {
            transform: translateX(-5px);
          }

          50% {
            transform: translateX(5px);
          }

          75% {
            transform: translateX(-3px);
          }
        }
      `}</style>
    </main>
  );
}
