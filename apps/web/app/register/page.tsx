"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [darkMode, setDarkMode] = useState(true);

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

  const passwordStrength = (() => {
    const password = form.password;

    if (!password) {
      return {
        label: "",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak password",
        width: "35%",
      };
    }

    if (score <= 3) {
      return {
        label: "Good password",
        width: "65%",
      };
    }

    return {
      label: "Strong password",
      width: "100%",
    };
  })();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
        darkMode ? "bg-[#050816] text-white" : "bg-slate-50 text-slate-900"
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
                  className={`mb-6 inline-flex animate-[fadeInUp_0.6s_ease-out] items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${
                    darkMode
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                      : "border-blue-200 bg-blue-50 text-blue-600"
                  }`}
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Smart fleet management platform
                </div>

                <h1 className="animate-[fadeInUp_0.7s_ease-out] text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">
                  Your fleet.
                  <br />
                  <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    One powerful flow.
                  </span>
                </h1>

                <p
                  className={`mt-7 max-w-lg animate-[fadeInUp_0.8s_ease-out] text-lg leading-8 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  FleetFlow brings vehicles, drivers, trips, maintenance and
                  daily operations together in one intelligent workspace.
                </p>

                {/* Feature Cards */}

                <div className="mt-10 grid max-w-xl grid-cols-2 gap-4">
                  <div
                    className={`animate-[fadeInUp_0.9s_ease-out] rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                      darkMode
                        ? "border-slate-800 bg-slate-900/60 hover:border-blue-500/30"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg"
                    }`}
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                      ↗
                    </div>

                    <h3 className="font-semibold">Track smarter</h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        darkMode ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      Keep your fleet operations visible and organized.
                    </p>
                  </div>

                  <div
                    className={`animate-[fadeInUp_1s_ease-out] rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${
                      darkMode
                        ? "border-slate-800 bg-slate-900/60 hover:border-cyan-500/30"
                        : "border-slate-200 bg-white hover:border-cyan-200 hover:shadow-lg"
                    }`}
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500">
                      ✓
                    </div>

                    <h3 className="font-semibold">Stay organized</h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${
                        darkMode ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      Manage your vehicles, drivers and trips from one place.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* --------------------------------------------------
                Register Card
            -------------------------------------------------- */}

            <section
              className={`w-full animate-[fadeInUp_0.7s_ease-out] rounded-[2rem] border p-6 shadow-2xl transition-all duration-500 sm:p-8 ${
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="19" y1="8" x2="19" y2="14" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>

                <h2 className="text-3xl font-bold tracking-tight">
                  Create your account
                </h2>

                <p
                  className={`mt-2 text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Start managing your fleet with FleetFlow.
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
                {/* Name */}

                <div className="group">
                  <label
                    htmlFor="name"
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Muhammad Bilal"
                    autoComplete="name"
                    disabled={loading}
                    className={`w-full rounded-xl border px-4 py-3.5 text-sm outline-none transition-all duration-300 focus:ring-4 ${
                      darkMode
                        ? "border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/10"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                    }`}
                  />
                </div>

                {/* Email */}

                <div className="group">
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
                  <label
                    htmlFor="password"
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
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

                  {form.password && (
                    <div className="mt-3 animate-[fadeIn_0.3s_ease-out]">
                      <div
                        className={`h-1.5 overflow-hidden rounded-full ${
                          darkMode ? "bg-slate-800" : "bg-slate-200"
                        }`}
                      >
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{
                            width: passwordStrength.width,
                          }}
                        />
                      </div>

                      <p
                        className={`mt-1.5 text-xs ${
                          darkMode ? "text-slate-500" : "text-slate-400"
                        }`}
                      >
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className={`mb-2 block text-sm font-medium ${
                      darkMode ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className={`w-full rounded-xl border px-4 py-3.5 pr-12 text-sm outline-none transition-all duration-300 focus:ring-4 ${
                        darkMode
                          ? "border-slate-700 bg-slate-950/80 text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-blue-500/10"
                          : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-blue-500/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium transition ${
                        darkMode
                          ? "text-slate-500 hover:text-slate-300"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {form.confirmPassword && (
                    <p
                      className={`mt-2 text-xs ${
                        form.password === form.confirmPassword
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {form.password === form.confirmPassword
                        ? "✓ Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Terms */}

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span
                    className={`text-xs leading-5 ${
                      darkMode ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    I agree to the FleetFlow{" "}
                    <span className="font-medium text-blue-500">
                      Terms of Service
                    </span>{" "}
                    and{" "}
                    <span className="font-medium text-blue-500">
                      Privacy Policy
                    </span>
                    .
                  </span>
                </label>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  <span className="relative flex w-full items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create FleetFlow account
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Login */}

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
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-500 transition-colors hover:text-blue-400"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------
          Custom Animations
      -------------------------------------------------- */}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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
