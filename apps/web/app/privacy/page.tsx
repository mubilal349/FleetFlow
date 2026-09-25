import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Cookie,
  Database,
  FileText,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    paragraphs: [
      "When you use FleetFlow, we may collect information that you provide directly, information generated through your use of the platform, and limited technical information required to operate and secure the service.",
    ],
    bullets: [
      {
        title: "Account information",
        text: "Name, email address, password or authentication credentials, account role, organization information, and other information required to create and manage an account.",
      },
      {
        title: "Fleet and operational information",
        text: "Vehicle records, driver information, vehicle requests, assignments, maintenance records, operational statuses, notes, and other information entered by an organization or its authorized users.",
      },
      {
        title: "Usage information",
        text: "Information about actions performed within FleetFlow, such as account activity, requests, assignments, status changes, and interactions with platform functionality.",
      },
      {
        title: "Technical information",
        text: "Information such as browser type, device type, IP address, operating system, application logs, timestamps, and error information that may be generated when you access the service.",
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "2. How We Use Information",
    paragraphs: [
      "We use information collected through FleetFlow only for purposes related to providing, maintaining, securing, and improving the platform and its services.",
    ],
    bullets: [
      {
        title: "Provide the service",
        text: "To create accounts, authenticate users, manage organizations, and provide FleetFlow functionality.",
      },
      {
        title: "Fleet operations",
        text: "To process vehicle requests, assignments, driver operations, maintenance activities, and other fleet-management workflows.",
      },
      {
        title: "Security and fraud prevention",
        text: "To protect accounts, investigate suspicious activity, prevent unauthorized access, and maintain the integrity of the platform.",
      },
      {
        title: "Product improvement",
        text: "To identify errors, understand platform usage, improve features, and maintain application performance.",
      },
      {
        title: "Communications",
        text: "To send service-related communications such as account notifications, security notices, operational updates, and important changes to the service.",
      },
      {
        title: "Legal obligations",
        text: "To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.",
      },
    ],
  },
  {
    id: "legal-basis",
    title: "3. Legal Basis for Processing",
    paragraphs: [
      "Where applicable law requires a legal basis for processing personal information, the applicable basis may depend on the nature of the information and the relationship between FleetFlow, an organization using FleetFlow, and its users.",
      "Depending on the circumstances, processing may be based on performance of a contract, legitimate interests, consent, compliance with legal obligations, or another lawful basis recognized by applicable law.",
    ],
  },
  {
    id: "organization-data",
    title: "4. Organization Data",
    paragraphs: [
      "FleetFlow may be used by organizations to manage their employees, drivers, vehicles, requests, maintenance records, and other operational information.",
      "If you use FleetFlow through an organization, that organization may determine what information is entered into the platform, how it is used, and which users are granted access.",
      "In those circumstances, the organization may have its own privacy policies and responsibilities concerning the information it provides to FleetFlow.",
    ],
  },
  {
    id: "information-sharing",
    title: "5. How We Share Information",
    paragraphs: [
      "We do not sell personal information as part of the FleetFlow service.",
      "Information may be shared or processed in limited circumstances necessary to operate the platform, comply with legal obligations, or protect the rights and security of FleetFlow and its users.",
    ],
    bullets: [
      {
        title: "Service providers",
        text: "We may use third-party infrastructure, hosting, database, authentication, monitoring, email, or other technology providers needed to operate FleetFlow.",
      },
      {
        title: "Organization administrators",
        text: "Users within an organization may be able to access information according to their role and the permissions configured by the organization.",
      },
      {
        title: "Legal requirements",
        text: "Information may be disclosed when required by applicable law, court order, legal process, or valid governmental request.",
      },
      {
        title: "Security and protection",
        text: "Information may be processed when reasonably necessary to investigate security incidents, prevent abuse, or protect users, organizations, or the platform.",
      },
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies and Similar Technologies",
    paragraphs: [
      "FleetFlow may use cookies, browser storage, or similar technologies to maintain authentication sessions, remember preferences, improve functionality, and support application security.",
      "For example, the application may store authentication or interface preferences in the user's browser so that the platform can function correctly.",
      "You can control certain browser storage and cookie behavior through your browser settings. Disabling required storage may prevent some FleetFlow functionality from working correctly.",
    ],
  },
  {
    id: "data-security",
    title: "7. Data Security",
    paragraphs: [
      "FleetFlow is designed using security controls intended to protect information from unauthorized access, alteration, disclosure, or destruction.",
      "Depending on the deployed version and infrastructure, these controls may include authenticated access, role-based authorization, server-side validation, protected API endpoints, secure credential handling, logging, and access controls.",
      "No internet-based service can guarantee absolute security. Users and organizations are also responsible for protecting their credentials and configuring appropriate access permissions.",
    ],
  },
  {
    id: "data-retention",
    title: "8. Data Retention",
    paragraphs: [
      "We retain information for as long as reasonably necessary to provide FleetFlow, maintain operational records, comply with legal obligations, resolve disputes, enforce agreements, and protect the security of the service.",
      "The specific retention period may vary depending on the type of information, the organization's configuration, contractual requirements, and applicable law.",
    ],
  },
  {
    id: "your-rights",
    title: "9. Your Privacy Rights",
    paragraphs: [
      "Depending on your location and applicable law, you may have rights relating to your personal information. These may include:",
    ],
    bullets: [
      {
        title: "Access",
        text: "Request information about personal data held about you.",
      },
      {
        title: "Correction",
        text: "Request correction of inaccurate or incomplete personal information.",
      },
      {
        title: "Deletion",
        text: "Request deletion of personal information where applicable legal requirements permit it.",
      },
      {
        title: "Restriction",
        text: "Request that certain processing of your personal information be restricted in circumstances provided by law.",
      },
      {
        title: "Objection",
        text: "Object to certain types of processing where applicable law provides that right.",
      },
      {
        title: "Data portability",
        text: "Request a copy of certain personal information in a commonly used format where applicable.",
      },
      {
        title: "Withdraw consent",
        text: "Where processing is based on consent, you may withdraw that consent subject to applicable legal and technical limitations.",
      },
    ],
  },
  {
    id: "international-transfers",
    title: "10. International Data Transfers",
    paragraphs: [
      "FleetFlow and its service providers may process information in countries other than the country where you live or where your organization operates.",
      "Where applicable law imposes requirements on international transfers of personal information, appropriate safeguards should be used in accordance with those requirements.",
    ],
  },
  {
    id: "children",
    title: "11. Children's Privacy",
    paragraphs: [
      "FleetFlow is intended for business and organizational use and is not directed toward children.",
      "We do not knowingly design the service to collect personal information from children for purposes unrelated to the service. If you believe a child has provided personal information to FleetFlow improperly, contact the service administrator so the situation can be reviewed.",
    ],
  },
  {
    id: "third-party-services",
    title: "12. Third-Party Services",
    paragraphs: [
      "FleetFlow may integrate with or rely on third-party services for infrastructure, authentication, communications, analytics, storage, or other functionality.",
      "Those providers may process information according to their own terms and privacy policies. Organizations should review applicable third-party services before enabling integrations that involve personal information.",
    ],
  },
  {
    id: "changes",
    title: "13. Changes to This Privacy Policy",
    paragraphs: [
      "We may update this Privacy Policy when FleetFlow, its functionality, legal requirements, or data-processing practices change.",
      "When material changes are made, the updated policy should be made available through the FleetFlow platform or another appropriate communication channel.",
      "The 'Last updated' date at the top of this page indicates when the policy was most recently revised.",
    ],
  },
  {
    id: "contact",
    title: "14. Contact Us",
    paragraphs: [
      "If you have questions about this Privacy Policy, your personal information, or privacy practices relating to FleetFlow, contact the FleetFlow service administrator.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 dark:bg-[#050b18] dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#050b18]/90">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20 transition-all duration-300 group-hover:rotate-6 group-hover:shadow-blue-600/30">
              F
            </div>

            <div>
              <p className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
                FleetFlow
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                Smart Fleet Management
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to FleetFlow</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-white/10">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-500/10 dark:text-blue-400">
            <LockKeyhole className="h-7 w-7" />
          </div>

          <p className="mt-7 text-sm font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
            Legal & Privacy
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl dark:text-white">
            Privacy Policy
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-600 dark:text-zinc-400 sm:text-lg">
            This Privacy Policy explains how FleetFlow collects, uses, protects,
            and handles information when you use our fleet management platform.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400">
              Last updated: September 2026
            </span>

            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              FleetFlow Privacy
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-500">
                On this page
              </p>

              <nav className="mt-5 space-y-1.5">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                  >
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    {section.title.replace(/^\d+\.\s/, "")}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Policy */}
          <article className="max-w-3xl">
            {/* Intro */}
            <div className="mb-12 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 dark:border-blue-500/10 dark:bg-blue-500/5">
              <div className="flex gap-4">
                <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />

                <div>
                  <h2 className="font-bold text-zinc-950 dark:text-white">
                    About this policy
                  </h2>

                  <p className="mt-2 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
                    This policy applies to information processed through the
                    FleetFlow application, website, and related services.
                    Specific contractual arrangements with an organization may
                    supplement or modify these practices where applicable.
                  </p>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-14">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28"
                >
                  <h2 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                    {section.title}
                  </h2>

                  <div className="mt-5 space-y-4">
                    {section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-zinc-600 dark:text-zinc-400 sm:text-[15px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {section.bullets && (
                    <div className="mt-6 space-y-3">
                      {section.bullets.map((bullet) => (
                        <div
                          key={bullet.title}
                          className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-white/10 dark:bg-white/[0.025]"
                        >
                          <div className="flex gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />

                            <div>
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                                {bullet.title}
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                {bullet.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Contact Card */}
            <div className="mt-14 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Mail className="h-5 w-5" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-zinc-950 dark:text-white">
                Privacy questions?
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                For privacy requests or questions about information handled by
                FleetFlow, contact your FleetFlow service administrator.
              </p>

              {/* Replace this with your real business email when available */}
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Replace with your official privacy email
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Related Policies */}
      <section className="border-y border-zinc-200 bg-zinc-50/70 dark:border-white/5 dark:bg-[#070e1d]">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              href="/terms"
              className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <FileText className="h-5 w-5" />
                </div>

                <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
              </div>

              <h3 className="mt-5 font-bold text-zinc-950 dark:text-white">
                Terms of Service
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Review the rules and conditions for using FleetFlow.
              </p>
            </Link>

            <Link
              href="/security"
              className="group rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-blue-500/30"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <ChevronRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
              </div>

              <h3 className="mt-5 font-bold text-zinc-950 dark:text-white">
                Security
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                Learn about the security approach used by FleetFlow.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-black text-white">
              F
            </div>

            <span>
              © {new Date().getFullYear()} FleetFlow. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="font-semibold text-blue-600 dark:text-blue-400"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Terms
            </Link>

            <Link
              href="/security"
              className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
            >
              Security
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
