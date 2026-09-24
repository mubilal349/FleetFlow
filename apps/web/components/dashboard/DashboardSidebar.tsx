"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

type IconName =
  | "dashboard"
  | "vehicles"
  | "vehicle-requests"
  | "drivers"
  | "trips"
  | "dispatch"
  | "tracking"
  | "maintenance"
  | "fuel"
  | "expenses"
  | "documents"
  | "analytics"
  | "audit"
  | "settings";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

const mainNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
  },
  {
    label: "Vehicles",
    href: "/vehicles",
    icon: "vehicles",
  },
  {
    label: "Vehicle Requests",
    href: "/vehicle-request",
    icon: "vehicle-requests",
  },
  {
    label: "Drivers",
    href: "/drivers",
    icon: "drivers",
  },
  {
    label: "Trips",
    href: "/trips",
    icon: "trips",
  },
  {
    label: "Dispatch",
    href: "/dispatch",
    icon: "dispatch",
  },
  {
    label: "Live Tracking",
    href: "/tracking",
    icon: "tracking",
  },
];

const operationsNavigation: NavItem[] = [
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: "maintenance",
  },
  {
    label: "Fuel",
    href: "/fuel",
    icon: "fuel",
  },
  {
    label: "Expenses",
    href: "/expenses",
    icon: "expenses",
  },
  {
    label: "Documents",
    href: "/documents",
    icon: "documents",
  },
];

const managementNavigation: NavItem[] = [
  {
    label: "Analytics",
    href: "/analytics",
    icon: "analytics",
  },
  {
    label: "Audit Logs",
    href: "/audit-logs",
    icon: "audit",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: "settings",
  },
];

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "vehicles":
      return (
        <svg {...common}>
          <path d="M5 17h14" />
          <path d="M6 17V9l2-4h8l2 4v8" />
          <path d="M4 11h16" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
        </svg>
      );

    case "vehicle-requests":
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h5" />
          <path d="M9 16h3" />
          <path d="m15 17 1.5 1.5L20 15" />
        </svg>
      );

    case "drivers":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21a7 7 0 0 1 14 0" />
        </svg>
      );

    case "trips":
      return (
        <svg {...common}>
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="6" r="2" />
          <path d="M8 18h4a4 4 0 0 0 4-4V8" />
        </svg>
      );

    case "dispatch":
      return (
        <svg {...common}>
          <path d="M4 12h16" />
          <path d="m14 6 6 6-6 6" />
          <path d="M4 6v12" />
        </svg>
      );

    case "tracking":
      return (
        <svg {...common}>
          <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );

    case "maintenance":
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4 4 0 0 0-5.2 5.2L4 17l3 3 5.5-5.5a4 4 0 0 0 5.2-5.2l-2.3 2.3-2.5-.5-.5-2.5Z" />
        </svg>
      );

    case "fuel":
      return (
        <svg {...common}>
          <path d="M6 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15" />
          <path d="M6 18h10" />
          <path d="M9 7h4" />
          <path d="M15 6h2l3 3v7a2 2 0 0 1-4 0v-3" />
        </svg>
      );

    case "expenses":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      );

    case "documents":
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );

    case "analytics":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 3-4 3 2 5-7" />
        </svg>
      );

    case "audit":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.5v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.5h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.7l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.5v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
      );
  }
}

function NavigationSection({
  title,
  items,
  pathname,
  onNavigate,
  collapsed,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  onNavigate: () => void;
  collapsed: boolean;
}) {
  return (
    <div className="mb-7">
      {!collapsed && (
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
          {title}
        </p>
      )}

      <div className="space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
              className={`group flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              }`}
            >
              <span
                className={`shrink-0 transition-transform duration-200 ${
                  active ? "" : "group-hover:scale-110"
                }`}
              >
                <Icon name={item.icon} size={19} />
              </span>

              {!collapsed && <span>{item.label}</span>}

              {!collapsed && item.label === "Live Tracking" && (
                <span className="ml-auto flex h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const { collapsed, toggleSidebar } = useSidebar();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const loadAvatar = () => {
      const savedAvatar = localStorage.getItem("fleetflow_avatar");
      setAvatar(savedAvatar || "");
    };

    loadAvatar();

    window.addEventListener("fleetflow-avatar-updated", loadAvatar);

    return () => {
      window.removeEventListener("fleetflow-avatar-updated", loadAvatar);
    };
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "User";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg dark:border-white/10 dark:bg-[#0b1120] dark:text-white lg:hidden"
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-300 ease-in-out dark:border-white/[0.07] dark:bg-[#080d1a] ${
          collapsed ? "w-[80px]" : "w-[270px]"
        } ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div
          className={`relative flex h-[76px] shrink-0 items-center border-b border-slate-200 dark:border-white/[0.07] ${
            collapsed ? "justify-center px-3" : "px-5"
          }`}
        >
          <Link
            href="/dashboard"
            onClick={closeMobile}
            className="group flex items-center gap-3"
            title={collapsed ? "FleetFlow" : undefined}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-base font-black text-white shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:rotate-3">
              F
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[17px] font-bold tracking-tight text-slate-950 dark:text-white">
                  FleetFlow
                </div>

                <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                  Fleet Management
                </div>
              </div>
            )}
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close sidebar"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] lg:hidden"
          >
            ×
          </button>

          {/* Desktop collapse / expand button */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-[#101827] dark:text-slate-400 dark:hover:bg-white/[0.08] dark:hover:text-white lg:flex"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {collapsed ? (
                <path d="m9 18 6-6-6-6" />
              ) : (
                <path d="m15 18-6-6 6-6" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          <NavigationSection
            title="Main"
            items={mainNavigation}
            pathname={pathname}
            onNavigate={closeMobile}
            collapsed={collapsed}
          />

          <NavigationSection
            title="Operations"
            items={operationsNavigation}
            pathname={pathname}
            onNavigate={closeMobile}
            collapsed={collapsed}
          />

          <NavigationSection
            title="Management"
            items={managementNavigation}
            pathname={pathname}
            onNavigate={closeMobile}
            collapsed={collapsed}
          />
        </div>

        {/* User card */}
        <div className="border-t border-slate-200 p-3 dark:border-white/[0.07]">
          <Link
            href="/profile"
            onClick={closeMobile}
            title={collapsed ? user?.name || "FleetFlow User" : undefined}
            className={`flex items-center rounded-xl p-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.05] ${
              collapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div
              className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-100 font-bold text-blue-600 dark:bg-blue-950 dark:text-blue-300 ${
                collapsed ? "h-10 w-10" : "h-11 w-11"
              }`}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt={user?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "U"
              )}
            </div>

            {!collapsed && (
              <>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user?.name || "FleetFlow User"}
                  </p>

                  <p className="text-xs capitalize text-slate-400">
                    {roleLabel}
                  </p>
                </div>

                <svg
                  className="ml-auto shrink-0 text-slate-400"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
