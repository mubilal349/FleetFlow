import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">FleetFlow</h1>

      <p className="text-gray-600">
        Smart Logistics & Fleet Management Platform
      </p>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Login
        </Link>

        <Link href="/register" className="rounded-lg border px-5 py-3">
          Register
        </Link>
      </div>
    </main>
  );
}
