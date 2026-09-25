import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-white/10 dark:bg-[#050b18]">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-base font-black text-white">
              F
            </div>

            <div>
              <p className="font-bold text-zinc-950 dark:text-white">
                FleetFlow
              </p>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Smart Fleet Management
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap gap-5 text-sm text-zinc-500 dark:text-zinc-400">
            <a
              href="#features"
              className="transition-colors hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition-colors hover:text-blue-600"
            >
              How It Works
            </a>

            <Link
              href="/login"
              className="transition-colors hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="transition-colors hover:text-blue-600"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-100 pt-6 text-center text-xs text-zinc-500 dark:border-white/5 dark:text-zinc-500">
          © {new Date().getFullYear()} FleetFlow. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
