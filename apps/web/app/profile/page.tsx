"use client";

import { ChangeEvent, useEffect, useState } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

const AVATAR_KEY = "fleetflow_avatar";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { collapsed } = useSidebar();

  const [avatar, setAvatar] = useState<string>("");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }

    const savedAvatar = localStorage.getItem(AVATAR_KEY);

    if (savedAvatar) {
      setAvatar(savedAvatar);
    }
  }, [user]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result as string;

      setAvatar(image);
      localStorage.setItem(AVATAR_KEY, image);

      window.dispatchEvent(new Event("fleetflow-avatar-updated"));
    };

    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setAvatar("");
    localStorage.removeItem(AVATAR_KEY);

    window.dispatchEvent(new Event("fleetflow-avatar-updated"));
  };

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#050816]">
        {" "}
        <div className="text-center">
          {" "}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20">
            F{" "}
          </div>
          ```
          <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading profile...
          </p>
        </div>
      </main>
    );
  }

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  const initial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#050816] dark:text-white">
      {" "}
      <DashboardSidebar />
      <div
        className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
          collapsed ? "lg:pl-[80px]" : "lg:pl-[270px]"
        }`}
      >
        <DashboardHeader />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            {/* Page Header */}
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Account
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Profile
              </h1>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Manage your personal information and account details.
              </p>
            </div>

            {/* Profile Header */}
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />

              <div className="px-6 pb-6 sm:px-8">
                <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-blue-100 text-3xl font-bold text-blue-600 shadow-xl dark:border-slate-900 dark:bg-blue-950 dark:text-blue-300">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={user?.name || "Profile"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initial
                        )}
                      </div>

                      {/* Upload button */}
                      <label
                        htmlFor="profile-avatar"
                        className="absolute -bottom-2 -right-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border-2 border-white bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 dark:border-slate-900"
                        title="Change profile picture"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>

                        <input
                          id="profile-avatar"
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>

                    <div className="pb-1">
                      <h2 className="text-xl font-bold">
                        {user?.name || "FleetFlow User"}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {user?.email}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                          {roleLabel}
                        </span>

                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {avatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="flex items-center gap-2 self-start rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30 sm:self-auto"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-4 w-4"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v5" />
                        <path d="M14 11v5" />
                      </svg>
                      Remove Photo
                    </button>
                  )}
                </div>

                <p className="mt-6 text-xs text-slate-400">
                  JPG, PNG or WebP. Maximum file size: 5MB.
                </p>
              </div>
            </section>

            {/* Personal Information */}
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Personal Information</h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Update your basic account information.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950/50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Role
                  </label>

                  <input
                    type="text"
                    value={roleLabel}
                    disabled
                    className="h-12 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Save Changes
                </button>

                {saved && (
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    Changes saved
                  </span>
                )}
              </div>
            </section>

            {/* Security */}
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">Account Security</h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage your password and account security.
                  </p>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Change Password
                </button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
