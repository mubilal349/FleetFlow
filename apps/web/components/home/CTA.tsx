import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-blue-600 px-6 py-16 text-center shadow-2xl shadow-blue-600/20 sm:px-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-950/20 blur-3xl" />

          <div className="relative">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
              Get Started
            </span>

            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
              Ready to take control of your fleet?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-blue-100">
              Start organizing your vehicles, drivers, and operations with
              FleetFlow.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex items-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-600 shadow-xl transition-all hover:-translate-y-1 hover:bg-blue-50"
            >
              Create Your Account
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
