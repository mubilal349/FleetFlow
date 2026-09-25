"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Truck,
  Users,
  ClipboardList,
  Wrench,
  MapPin,
  BarChart3,
  ShieldCheck,
  BookOpen,
  Zap,
  Moon,
  Sun,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type MenuName = "fleet" | "solutions" | "resources";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuName | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState<MenuName | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Prevent page scrolling while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMobileMenu(null);
  };

  const toggleMobileMenu = (menu: MenuName) => {
    setMobileMenu((current) => (current === menu ? null : menu));
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-200/70 bg-white/90 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-[#050b18]/90"
          : "bg-white/70 backdrop-blur-md dark:bg-[#050b18]/70"
      }`}
    >
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* ================================= */}
        {/* Left Side: Mobile Menu + Logo */}
        {/* ================================= */}

        <div className="flex items-center">
          {/* Mobile Hamburger - Left */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={2} />
            )}
          </button>

          {/* Logo */}
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="group absolute left-1/2 flex -translate-x-1/2 items-center lg:static lg:translate-x-0"
          >
            {/* F Logo */}
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/25 transition-all duration-300 group-hover:rotate-6 group-hover:shadow-blue-600/40">
              F
            </div>

            {/* FleetFlow text - Desktop */}
            <div className="ml-3 hidden sm:block">
              <div className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
                FleetFlow
              </div>

              <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Fleet Management
              </div>
            </div>
          </Link>
        </div>

        {/* ================================= */}
        {/* Desktop Navigation */}
        {/* ================================= */}

        <nav className="hidden items-center gap-1 lg:flex">
          {/* Fleet */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveMenu(activeMenu === "fleet" ? null : "fleet")
              }
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-blue-400"
            >
              Fleet
              <Chevron open={activeMenu === "fleet"} />
            </button>

            {activeMenu === "fleet" && (
              <Dropdown>
                <DropdownLink
                  href="#features"
                  icon={Truck}
                  title="Vehicles"
                  description="Manage your fleet and vehicle status"
                />

                <DropdownLink
                  href="#features"
                  icon={Users}
                  title="Drivers"
                  description="Manage drivers and assignments"
                />

                <DropdownLink
                  href="#features"
                  icon={ClipboardList}
                  title="Vehicle Requests"
                  description="Handle vehicle requests and approvals"
                />

                <DropdownLink
                  href="#features"
                  icon={Wrench}
                  title="Maintenance"
                  description="Track service and maintenance"
                />
              </Dropdown>
            )}
          </div>

          {/* Solutions */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveMenu(activeMenu === "solutions" ? null : "solutions")
              }
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-blue-400"
            >
              Solutions
              <Chevron open={activeMenu === "solutions"} />
            </button>

            {activeMenu === "solutions" && (
              <Dropdown>
                <DropdownLink
                  href="#how-it-works"
                  icon={MapPin}
                  title="Fleet Operations"
                  description="Coordinate your daily fleet operations"
                />

                <DropdownLink
                  href="#how-it-works"
                  icon={BarChart3}
                  title="Analytics"
                  description="Monitor fleet performance and insights"
                />

                <DropdownLink
                  href="#how-it-works"
                  icon={ShieldCheck}
                  title="Role Management"
                  description="Control access across your organization"
                />
              </Dropdown>
            )}
          </div>

          {/* Resources */}
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActiveMenu(activeMenu === "resources" ? null : "resources")
              }
              className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-blue-400"
            >
              Resources
              <Chevron open={activeMenu === "resources"} />
            </button>

            {activeMenu === "resources" && (
              <Dropdown>
                <DropdownLink
                  href="#features"
                  icon={BookOpen}
                  title="Features"
                  description="Explore FleetFlow capabilities"
                />

                <DropdownLink
                  href="#how-it-works"
                  icon={Zap}
                  title="How It Works"
                  description="See how FleetFlow manages operations"
                />

                <DropdownLink
                  href="#about"
                  icon={BarChart3}
                  title="Fleet Insights"
                  description="Understand your fleet performance"
                />
              </Dropdown>
            )}
          </div>

          {/* Company */}
          <Link
            href="#about"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-blue-400"
          >
            Company
          </Link>
        </nav>

        {/* ================================= */}
        {/* Right Side */}
        {/* ================================= */}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          >
            {theme === "dark" ? (
              <Sun className="h-4.5 w-4.5" strokeWidth={2} />
            ) : (
              <Moon className="h-4.5 w-4.5" strokeWidth={2} />
            )}
          </button>

          {/* Login */}
          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:text-blue-600 sm:block dark:text-zinc-200 dark:hover:text-blue-400"
          >
            Login
          </Link>

          {/* Get Started */}
          <Link
            href="/register"
            className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 sm:block"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* ================================= */}
      {/* Mobile Navigation */}
      {/* ================================= */}

      <div
        className={`overflow-hidden border-t border-zinc-200/70 bg-white transition-all duration-300 lg:hidden dark:border-white/10 dark:bg-[#050b18] ${
          mobileOpen
            ? "max-h-[calc(100vh-80px)] opacity-100"
            : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-h-[calc(100vh-80px)] overflow-y-auto px-5 pb-6 pt-4 sm:px-6">
          {/* Fleet */}
          <MobileMenuButton
            title="Fleet"
            icon={Truck}
            open={mobileMenu === "fleet"}
            onClick={() => toggleMobileMenu("fleet")}
          />

          {mobileMenu === "fleet" && (
            <MobileSubMenu>
              <MobileLink
                href="#features"
                icon={Truck}
                title="Vehicles"
                description="Manage your fleet and vehicle status"
                onClick={closeMobileMenu}
              />

              <MobileLink
                href="#features"
                icon={Users}
                title="Drivers"
                description="Manage drivers and assignments"
                onClick={closeMobileMenu}
              />

              <MobileLink
                href="#features"
                icon={ClipboardList}
                title="Vehicle Requests"
                description="Handle vehicle requests and approvals"
                onClick={closeMobileMenu}
              />

              <MobileLink
                href="#features"
                icon={Wrench}
                title="Maintenance"
                description="Track service and maintenance"
                onClick={closeMobileMenu}
              />
            </MobileSubMenu>
          )}

          {/* Solutions */}
          <MobileMenuButton
            title="Solutions"
            icon={MapPin}
            open={mobileMenu === "solutions"}
            onClick={() => toggleMobileMenu("solutions")}
          />

          {mobileMenu === "solutions" && (
            <MobileSubMenu>
              <MobileLink
                href="#how-it-works"
                icon={MapPin}
                title="Fleet Operations"
                description="Coordinate your daily fleet operations"
                onClick={closeMobileMenu}
              />

              <MobileLink
                href="#how-it-works"
                icon={BarChart3}
                title="Analytics"
                description="Monitor fleet performance and insights"
                onClick={closeMobileMenu}
              />

              <MobileLink
                href="#how-it-works"
                icon={ShieldCheck}
                title="Role Management"
                description="Control access across your organization"
                onClick={closeMobileMenu}
              />
            </MobileSubMenu>
          )}

          {/* Resources */}
          <MobileMenuButton
            title="Resources"
            icon={BookOpen}
            open={mobileMenu === "resources"}
            onClick={() => toggleMobileMenu("resources")}
          />

          {mobileMenu === "resources" && (
            <MobileSubMenu>
              <MobileLink
                href="#features"
                icon={BookOpen}
                title="Features"
                description="Explore FleetFlow capabilities"
                onClick={closeMobileMenu}
              />

              <MobileLink
                href="#how-it-works"
                icon={Zap}
                title="How It Works"
                description="See how FleetFlow manages operations"
                onClick={closeMobileMenu}
              />

              <MobileLink
                href="#about"
                icon={BarChart3}
                title="Fleet Insights"
                description="Understand your fleet performance"
                onClick={closeMobileMenu}
              />
            </MobileSubMenu>
          )}

          {/* Company */}
          <Link
            href="#about"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-blue-400"
          >
            <BarChart3 className="h-5 w-5" strokeWidth={1.8} />
            Company
          </Link>

          {/* Divider */}
          <div className="my-4 h-px bg-zinc-200 dark:bg-white/10" />

          {/* Mobile Login */}
          <Link
            href="/login"
            onClick={closeMobileMenu}
            className="flex w-full items-center justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-bold text-zinc-800 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/10 dark:text-zinc-200 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
          >
            Login
          </Link>

          {/* Mobile Get Started */}
          <Link
            href="/register"
            onClick={closeMobileMenu}
            className="mt-3 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Desktop dropdown backdrop */}
      {activeMenu && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setActiveMenu(null)}
          className="fixed inset-0 -z-10 h-screen w-screen cursor-default lg:block"
        />
      )}
    </header>
  );
}

/* ================================= */
/* Desktop Dropdown */
/* ================================= */

function Dropdown({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-0 top-[calc(100%+10px)] w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl shadow-zinc-950/10 dark:border-white/10 dark:bg-[#0b1324] dark:shadow-black/30">
      {children}
    </div>
  );
}

/* ================================= */
/* Desktop Dropdown Link */
/* ================================= */

function DropdownLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-200 group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-400">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </div>

      <div>
        <div className="text-sm font-bold text-zinc-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {title}
        </div>

        <p className="mt-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </Link>
  );
}

/* ================================= */
/* Chevron */
/* ================================= */

function Chevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      className={`h-3.5 w-3.5 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      strokeWidth={2}
    />
  );
}

/* ================================= */
/* Mobile Menu Button */
/* ================================= */

function MobileMenuButton({
  title,
  icon: Icon,
  open,
  onClick,
}: {
  title: string;
  icon: React.ElementType;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-200 dark:hover:bg-white/5 dark:hover:text-blue-400"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
        {title}
      </span>

      <ChevronDown
        className={`h-4 w-4 transition-transform duration-200 ${
          open ? "rotate-180" : ""
        }`}
        strokeWidth={2}
      />
    </button>
  );
}

/* ================================= */
/* Mobile Sub Menu */
/* ================================= */

function MobileSubMenu({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-3 border-l border-zinc-200 pl-3 dark:border-white/10">
      {children}
    </div>
  );
}

/* ================================= */
/* Mobile Link */
/* ================================= */

function MobileLink({
  href,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex gap-3 rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
      </div>

      <div>
        <div className="text-sm font-bold text-zinc-900 dark:text-white">
          {title}
        </div>

        <p className="mt-0.5 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </Link>
  );
}
