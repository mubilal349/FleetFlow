"use client";

import { useState } from "react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { useSidebar } from "@/context/SidebarContext";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const { collapsed } = useSidebar();
  const { theme, setTheme } = useTheme();

  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [tripAlerts, setTripAlerts] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      <DashboardSidebar />

      <div
        className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
          collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
        }`}
      >
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* Heading */}
            <div className="mb-8">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                System
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Configure your FleetFlow experience and preferences.
              </p>
            </div>

            <div className="space-y-6">
              {/* Appearance */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
                <div className="border-b border-slate-200 px-6 py-5 dark:border-white/[0.07]">
                  <h2 className="font-semibold text-slate-950 dark:text-white">
                    Appearance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Customize how FleetFlow looks on your device.
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        Theme
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Choose between light and dark appearance.
                      </p>
                    </div>

                    <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/[0.08] dark:bg-white/[0.03]">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                          theme === "light"
                            ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        >
                          <circle cx="12" cy="12" r="4" />
                          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
                        </svg>
                        Light
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                          theme === "dark"
                            ? "bg-slate-900 text-white shadow-sm dark:bg-white/10"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        }`}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        >
                          <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.7 6.7 0 0 0 21 12.8Z" />
                        </svg>
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Notifications */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
                <div className="border-b border-slate-200 px-6 py-5 dark:border-white/[0.07]">
                  <h2 className="font-semibold text-slate-950 dark:text-white">
                    Notifications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Choose which FleetFlow notifications you want to receive.
                  </p>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-white/[0.07]">
                  {/* Master notifications */}
                  <SettingToggle
                    title="Notifications"
                    description="Enable notifications throughout FleetFlow."
                    enabled={notifications}
                    onChange={setNotifications}
                  />

                  <SettingToggle
                    title="Email notifications"
                    description="Receive important FleetFlow updates by email."
                    enabled={emailNotifications}
                    onChange={setEmailNotifications}
                    disabled={!notifications}
                  />

                  <SettingToggle
                    title="Trip alerts"
                    description="Get notified about trip status changes and delays."
                    enabled={tripAlerts}
                    onChange={setTripAlerts}
                    disabled={!notifications}
                  />

                  <SettingToggle
                    title="Maintenance alerts"
                    description="Receive alerts when vehicles require maintenance."
                    enabled={maintenanceAlerts}
                    onChange={setMaintenanceAlerts}
                    disabled={!notifications}
                  />
                </div>
              </section>

              {/* Fleet preferences */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[0.07] dark:bg-[#0b1120]">
                <div className="border-b border-slate-200 px-6 py-5 dark:border-white/[0.07]">
                  <h2 className="font-semibold text-slate-950 dark:text-white">
                    Fleet Preferences
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Configure general fleet management preferences.
                  </p>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="distance-unit"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Distance unit
                    </label>

                    <select
                      id="distance-unit"
                      defaultValue="km"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                    >
                      <option value="km">Kilometers (km)</option>
                      <option value="mi">Miles (mi)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="fuel-unit"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Fuel unit
                    </label>

                    <select
                      id="fuel-unit"
                      defaultValue="liters"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                    >
                      <option value="liters">Liters (L)</option>
                      <option value="gallons">Gallons (gal)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="timezone"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Timezone
                    </label>

                    <select
                      id="timezone"
                      defaultValue="Asia/Karachi"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                    >
                      <option value="Asia/Karachi">Asia/Karachi (PKT)</option>

                      <option value="UTC">UTC</option>

                      <option value="Asia/Dubai">Asia/Dubai (GST)</option>

                      <option value="Europe/London">Europe/London</option>

                      <option value="America/New_York">America/New_York</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="date-format"
                      className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Date format
                    </label>

                    <select
                      id="date-format"
                      defaultValue="DD/MM/YYYY"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Danger zone */}
              <section className="rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-500/20 dark:bg-[#0b1120]">
                <div className="border-b border-red-100 px-6 py-5 dark:border-red-500/10">
                  <h2 className="font-semibold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Actions in this section can affect your FleetFlow account.
                  </p>
                </div>

                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Sign out of all sessions
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Sign out from all devices where your account is active.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    Sign Out Everywhere
                  </button>
                </div>
              </section>

              {/* Save */}
              <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
                {saved && (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Settings saved successfully.
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
  disabled = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-6 px-6 py-5 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          enabled ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
