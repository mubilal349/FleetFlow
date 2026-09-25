import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/10" />

      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left — unchanged */}
          <div className="animate-fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Smart Fleet Management Platform
            </div>

            <h1 className="max-w-3xl text-5xl font-black tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white">
              Move your fleet
              <span className="block text-blue-600">smarter.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              FleetFlow helps businesses manage vehicles, drivers, assignments,
              maintenance, and operations from one powerful platform.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 hover:bg-blue-700"
              >
                Start Managing Your Fleet
                <span className="ml-2">→</span>
              </Link>

              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-3.5 text-sm font-bold text-zinc-800 transition-all hover:-translate-y-1 hover:border-blue-300 hover:text-blue-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:border-blue-500/40 dark:hover:text-blue-400"
              >
                Explore Features
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Vehicle Management
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Driver Management
              </div>

              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Real-time Operations
              </div>
            </div>
          </div>

          {/* Right — logistics illustration */}
          <div className="relative animate-fade-up-delay">
            <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/10 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-b from-[#0f1b33] to-[#0b1324] shadow-2xl shadow-zinc-950/10 dark:border-white/10 dark:shadow-black/30">
              <svg
                viewBox="0 0 800 600"
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f1b33" />
                    <stop offset="55%" stopColor="#13223f" />
                    <stop offset="100%" stopColor="#0b1324" />
                  </linearGradient>
                  <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1c2942" />
                    <stop offset="100%" stopColor="#111b30" />
                  </linearGradient>
                  <linearGradient id="warehouse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22314f" />
                    <stop offset="100%" stopColor="#182339" />
                  </linearGradient>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Sky */}
                <rect x="0" y="0" width="800" height="600" fill="url(#sky)" />
                <circle cx="620" cy="120" r="140" fill="url(#glow)" />

                {/* Distant city skyline */}
                <g opacity="0.5" fill="#1e2c47">
                  <rect x="520" y="150" width="18" height="90" />
                  <rect x="545" y="120" width="22" height="120" />
                  <rect x="575" y="160" width="16" height="80" />
                  <rect x="598" y="100" width="24" height="140" />
                  <rect x="630" y="140" width="18" height="100" />
                  <rect x="655" y="115" width="20" height="125" />
                  <rect x="682" y="155" width="16" height="85" />
                </g>
                <g opacity="0.3" fill="#3b82f6">
                  <rect x="606" y="108" width="4" height="12" />
                  <rect x="551" y="128" width="4" height="10" />
                  <rect x="662" y="122" width="4" height="10" />
                </g>

                {/* Ground */}
                <rect x="0" y="420" width="800" height="180" fill="#0d1729" />

                {/* Road curving from warehouse toward city */}
                <path
                  d="M 60 470 C 260 470, 340 440, 460 400 S 700 260, 800 230"
                  fill="none"
                  stroke="url(#road)"
                  strokeWidth="70"
                  strokeLinecap="round"
                />
                <path
                  d="M 60 470 C 260 470, 340 440, 460 400 S 700 260, 800 230"
                  fill="none"
                  stroke="#2a3a58"
                  strokeWidth="1.5"
                  strokeDasharray="10 14"
                  opacity="0.6"
                />

                {/* Digital route overlay */}
                <path
                  d="M 90 460 C 270 460, 350 432, 470 392 S 705 258, 780 232"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  strokeDasharray="4 10"
                  opacity="0.8"
                />
                {/* Route pins */}
                <g fill="#60a5fa">
                  <circle cx="470" cy="392" r="4" />
                  <circle
                    cx="470"
                    cy="392"
                    r="8"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                </g>
                <path d="M 776 222 l 6 10 l -12 0 z" fill="#3b82f6" />
                <circle cx="782" cy="216" r="5" fill="#3b82f6" />

                {/* Warehouse building */}
                <g>
                  <rect
                    x="40"
                    y="270"
                    width="260"
                    height="180"
                    fill="url(#warehouse)"
                    rx="4"
                  />
                  <rect
                    x="40"
                    y="270"
                    width="260"
                    height="14"
                    fill="#3b82f6"
                    opacity="0.5"
                  />
                  {/* roof line */}
                  <polygon points="30,270 170,220 310,270" fill="#1a2540" />
                  {/* loading dock opening */}
                  <rect
                    x="200"
                    y="330"
                    width="90"
                    height="120"
                    fill="#0a1220"
                    rx="3"
                  />
                  <rect
                    x="200"
                    y="330"
                    width="90"
                    height="120"
                    fill="none"
                    stroke="#324566"
                    strokeWidth="3"
                  />
                  {/* dock stripes */}
                  <g stroke="#eab308" strokeWidth="4" opacity="0.7">
                    <line
                      x1="196"
                      y1="452"
                      x2="294"
                      y2="452"
                      strokeDasharray="8 6"
                    />
                  </g>
                  {/* windows */}
                  <g fill="#3b5378" opacity="0.6">
                    <rect x="60" y="300" width="24" height="24" rx="2" />
                    <rect x="96" y="300" width="24" height="24" rx="2" />
                    <rect x="132" y="300" width="24" height="24" rx="2" />
                  </g>
                  {/* logo mark (no brand) */}
                  <circle
                    cx="70"
                    cy="360"
                    r="12"
                    fill="#3b82f6"
                    opacity="0.85"
                  />
                  <path
                    d="M 64 360 l 4 4 l 8 -9"
                    stroke="#0b1324"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Stacked pallets / packages near dock */}
                <g>
                  <rect
                    x="140"
                    y="410"
                    width="34"
                    height="26"
                    fill="#c9a06a"
                    rx="2"
                  />
                  <rect
                    x="140"
                    y="410"
                    width="34"
                    height="26"
                    fill="none"
                    stroke="#8a6a3f"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="145"
                    y="386"
                    width="26"
                    height="24"
                    fill="#d9b77e"
                    rx="2"
                  />
                  <rect
                    x="108"
                    y="418"
                    width="28"
                    height="22"
                    fill="#b8895a"
                    rx="2"
                  />
                  <rect
                    x="112"
                    y="398"
                    width="20"
                    height="20"
                    fill="#e2c290"
                    rx="2"
                  />
                  {/* barcode label */}
                  <rect x="147" y="391" width="16" height="8" fill="#f8f4ec" />
                  <g stroke="#333" strokeWidth="0.8">
                    <line x1="149" y1="391" x2="149" y2="399" />
                    <line x1="151" y1="391" x2="151" y2="399" />
                    <line x1="153.5" y1="391" x2="153.5" y2="399" />
                    <line x1="156" y1="391" x2="156" y2="399" />
                    <line x1="159" y1="391" x2="159" y2="399" />
                  </g>
                </g>

                {/* Truck at dock, rear open, being loaded */}
                <g>
                  {/* trailer body */}
                  <rect
                    x="300"
                    y="340"
                    width="150"
                    height="95"
                    rx="6"
                    fill="#e7ebf1"
                  />
                  <rect
                    x="300"
                    y="340"
                    width="150"
                    height="18"
                    rx="4"
                    fill="#3b82f6"
                  />
                  <rect
                    x="308"
                    y="366"
                    width="134"
                    height="60"
                    rx="3"
                    fill="#f4f6f9"
                    stroke="#c7cedb"
                    strokeWidth="1.5"
                  />
                  {/* open rear doors */}
                  <rect
                    x="296"
                    y="345"
                    width="8"
                    height="85"
                    fill="#c7cedb"
                    rx="2"
                  />
                  {/* cab */}
                  <path
                    d="M 450 355 h 46 a 10 10 0 0 1 10 10 v 55 a 8 8 0 0 1 -8 8 h -48 z"
                    fill="#1f2b45"
                  />
                  <rect
                    x="462"
                    y="368"
                    width="26"
                    height="24"
                    rx="3"
                    fill="#93c5fd"
                    opacity="0.85"
                  />
                  <rect x="450" y="400" width="46" height="10" fill="#161f33" />
                  {/* wheels */}
                  <circle cx="330" cy="440" r="16" fill="#111827" />
                  <circle cx="330" cy="440" r="6" fill="#4b5563" />
                  <circle cx="400" cy="440" r="16" fill="#111827" />
                  <circle cx="400" cy="440" r="6" fill="#4b5563" />
                  <circle cx="468" cy="440" r="16" fill="#111827" />
                  <circle cx="468" cy="440" r="6" fill="#4b5563" />
                  {/* subtle blue accent stripe */}
                  <rect
                    x="308"
                    y="418"
                    width="134"
                    height="5"
                    fill="#3b82f6"
                    opacity="0.7"
                  />
                  {/* shadow */}
                  <ellipse
                    cx="400"
                    cy="458"
                    rx="110"
                    ry="10"
                    fill="#000"
                    opacity="0.25"
                  />
                </g>

                {/* Worker silhouette pushing a hand truck of boxes */}
                <g fill="#0f1830">
                  <circle cx="256" cy="392" r="7" />
                  <path d="M 249 400 q 7 -6 14 0 l -2 26 q -5 4 -10 0 z" />
                  <path
                    d="M 250 410 l -10 14"
                    stroke="#0f1830"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
                <g>
                  <rect
                    x="228"
                    y="404"
                    width="18"
                    height="20"
                    fill="#d9b77e"
                    rx="2"
                  />
                  <rect
                    x="232"
                    y="386"
                    width="12"
                    height="16"
                    fill="#c9a06a"
                    rx="2"
                  />
                  <line
                    x1="230"
                    y1="428"
                    x2="248"
                    y2="428"
                    stroke="#4b5563"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="231" cy="430" r="3.5" fill="#374151" />
                  <circle cx="247" cy="430" r="3.5" fill="#374151" />
                </g>

                {/* Motorcycle being loaded with parcels, ahead on the road */}
                <g>
                  <ellipse
                    cx="512"
                    cy="378"
                    rx="34"
                    ry="6"
                    fill="#000"
                    opacity="0.2"
                  />
                  <circle
                    cx="490"
                    cy="374"
                    r="13"
                    fill="none"
                    stroke="#1a2540"
                    strokeWidth="4"
                  />
                  <circle
                    cx="534"
                    cy="374"
                    r="13"
                    fill="none"
                    stroke="#1a2540"
                    strokeWidth="4"
                  />
                  <path
                    d="M 490 374 L 510 350 L 534 374"
                    stroke="#1f2b45"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 510 350 L 505 336"
                    stroke="#1f2b45"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <rect
                    x="480"
                    y="330"
                    width="16"
                    height="14"
                    rx="3"
                    fill="#3b82f6"
                  />
                  {/* delivery box on back */}
                  <rect
                    x="520"
                    y="344"
                    width="22"
                    height="20"
                    rx="3"
                    fill="#e7ebf1"
                    stroke="#c7cedb"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="526"
                    y="350"
                    width="10"
                    height="4"
                    fill="#3b82f6"
                    opacity="0.7"
                  />
                  {/* rider silhouette */}
                  <circle cx="504" cy="322" r="7" fill="#0f1830" />
                  <path
                    d="M 497 330 q 7 -5 15 0 l -3 20 h -10 z"
                    fill="#0f1830"
                  />
                </g>

                {/* Motion lines behind truck + bike to suggest movement */}
                <g
                  stroke="#3b82f6"
                  strokeWidth="2"
                  opacity="0.35"
                  strokeLinecap="round"
                >
                  <line x1="470" y1="392" x2="440" y2="392" />
                  <line x1="480" y1="404" x2="452" y2="404" />
                  <line x1="560" y1="330" x2="540" y2="330" />
                </g>

                {/* Small floating location pin near city, signalling destination */}
                <g fill="#60a5fa">
                  <path
                    d="M 700 190 c 0 10 -10 18 -10 28 c 0 -10 -10 -18 -10 -28 a 10 10 0 0 1 20 0 z"
                    opacity="0.9"
                  />
                  <circle cx="700" cy="190" r="4" fill="#0b1324" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
