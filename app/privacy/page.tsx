import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How IminPlay collects, uses and protects your personal data — POPIA-compliant.",
  alternates: { canonical: "https://iminplay.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="flex-1">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 sm:px-10">
          <Wordmark size="sm" asLink />
          <Link
            href="/"
            className="text-sm font-bold text-text-muted hover:text-charcoal"
          >
            ← Home
          </Link>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl px-6 py-14 sm:px-10">
        <h1 className="text-4xl font-black leading-tight sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm font-bold text-text-muted">
          Last updated: April 5, 2026
        </p>

        <p className="mt-8 text-base leading-relaxed text-text-secondary">
          Codelaice Technology (Pty) Ltd (Registration: 2025/786133/07), trading
          as IminPlay (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;),
          operates the IminPlay mobile application and website (the
          &ldquo;Service&rdquo;). This Privacy Policy explains how we collect,
          use, store, and protect your personal information in compliance with
          the{" "}
          <strong className="text-charcoal">
            Protection of Personal Information Act (POPIA)
          </strong>{" "}
          of South Africa and applicable international data protection
          regulations.
        </p>

        <Section title="1. Information We Collect">
          <Table
            head={["Category", "Data", "Purpose"]}
            rows={[
              [
                "Account",
                "Name, email, phone number, profile photo",
                "Create and manage your account",
              ],
              [
                "Profile",
                "Favourite sports, skill level, city",
                "Personalise your experience",
              ],
              [
                "Game Data",
                "Games created/joined, location, date, participants",
                "Provide core functionality",
              ],
              [
                "Location",
                "Approximate location (GPS, with permission)",
                "Show games near you",
              ],
              [
                "Usage",
                "Pages visited, features used, app version",
                "Improve the Service",
              ],
              [
                "Device",
                "Device type, OS version, unique identifiers",
                "Technical support and analytics",
              ],
            ]}
          />
        </Section>

        <Section title="2. Legal Basis for Processing (POPIA)">
          <p>
            We process your personal information based on the following lawful
            grounds under POPIA Section 11:
          </p>
          <ul>
            <li>
              <strong>Consent:</strong> You consent to data processing when
              creating an account.
            </li>
            <li>
              <strong>Contract:</strong> Processing is necessary to provide the
              Service you requested.
            </li>
            <li>
              <strong>Legitimate interest:</strong> We process data to improve
              and secure the Service.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul>
            <li>Provide, maintain, and improve the Service</li>
            <li>Show you games and players near your location</li>
            <li>
              Send notifications about games you&apos;ve joined (e.g. reminders,
              player updates)
            </li>
            <li>Communicate service updates and important notices</li>
            <li>Ensure safety, prevent fraud, and enforce our Terms</li>
            <li>
              Analyse usage patterns to improve the product (anonymised /
              aggregated data only)
            </li>
          </ul>
          <p>
            We do <strong>not</strong> use your data for profiling, automated
            decision-making, or targeted advertising from third parties.
          </p>
        </Section>

        <Section title="4. Information Sharing">
          <p>
            We do <strong>not sell, rent, or trade</strong> your personal data.
            We share information only in these limited cases:
          </p>
          <ul>
            <li>
              <strong>Other Players:</strong> Your name, profile photo, city,
              sports, and rating are visible to other users within the Service.
            </li>
            <li>
              <strong>Game Participants:</strong> When you join a game, other
              participants can see your profile.
            </li>
            <li>
              <strong>Service Providers:</strong> We use the following
              third-party processors:
            </li>
          </ul>
          <Table
            head={["Provider", "Purpose", "Data Processed", "Location"]}
            rows={[
              [
                "Supabase",
                "Database, authentication",
                "Account data, game data",
                "EU",
              ],
              ["AWS", "Cloud infrastructure", "Various data", "US/EU"],
              ["Resend", "Email delivery", "Email address", "US"],
              [
                "Google (OAuth)",
                "Sign-in",
                "Name, email, profile photo",
                "Global",
              ],
              ["Apple (Sign In)", "Sign-in", "Name, email", "Global"],
              [
                "Expo / EAS",
                "Push notifications, app builds",
                "Device tokens",
                "US",
              ],
            ]}
          />
          <ul>
            <li>
              <strong>Legal Requirements:</strong> We may disclose data if
              required by South African law, court order, or government
              request.
            </li>
          </ul>
        </Section>

        <Section title="5. Data Storage, Security, and Retention">
          <Subheading>Storage</Subheading>
          <p>
            Your data is stored on cloud servers (Supabase/AWS) with encryption
            in transit (TLS 1.2+) and at rest (AES-256). Servers may be located
            outside South Africa; by using the Service, you consent to this
            transfer in accordance with POPIA Section 72.
          </p>

          <Subheading>Security</Subheading>
          <p>We implement industry-standard security measures including:</p>
          <ul>
            <li>Encrypted data transmission (HTTPS/TLS)</li>
            <li>Encrypted data storage</li>
            <li>Row-level security on database</li>
            <li>Rate limiting and abuse prevention</li>
            <li>Regular security reviews</li>
          </ul>

          <Subheading>Retention</Subheading>
          <Table
            head={["Data", "Retention Period"]}
            rows={[
              ["Account data", "Until you delete your account"],
              [
                "Game data",
                "12 months after game completion, then anonymised",
              ],
              [
                "Messages (in-game chat)",
                "6 months after game completion",
              ],
              ["Ratings", "Until you delete your account"],
              [
                "Usage/analytics data",
                "12 months (aggregated/anonymised)",
              ],
              [
                "Deleted account data",
                "Permanently deleted within 30 days of account deletion",
              ],
            ]}
          />
        </Section>

        <Section title="6. Your Rights">
          <p>
            Under POPIA and applicable data protection laws, you have the right
            to:
          </p>
          <ul>
            <li>
              <strong>Access:</strong> Request a copy of your personal data
            </li>
            <li>
              <strong>Correction:</strong> Update or correct your information
              (via app Settings)
            </li>
            <li>
              <strong>Deletion:</strong> Delete your account and all associated
              data (via app Settings &gt; Delete Account)
            </li>
            <li>
              <strong>Data portability:</strong> Request your data in a
              machine-readable format
            </li>
            <li>
              <strong>Objection:</strong> Object to specific processing of your
              data
            </li>
            <li>
              <strong>Withdraw consent:</strong> Withdraw your consent at any
              time
            </li>
            <li>
              <strong>Lodge a complaint:</strong> File a complaint with the
              Information Regulator of South Africa
            </li>
          </ul>
          <p>
            To exercise these rights, use the in-app Settings or contact us at{" "}
            <a
              href="mailto:hello@iminplay.com"
              className="font-bold text-primary hover:underline"
            >
              hello@iminplay.com
            </a>
            . We will respond within 30 days.
          </p>
        </Section>

        <Section title="7. Account Deletion">
          <p>You can delete your account at any time:</p>
          <ul>
            <li>
              <strong>In the app:</strong> Settings &gt; Danger Zone &gt; Delete
              Account
            </li>
            <li>
              <strong>By email:</strong> Send a request to{" "}
              <a
                href="mailto:hello@iminplay.com"
                className="font-bold text-primary hover:underline"
              >
                hello@iminplay.com
              </a>
            </li>
          </ul>
          <p>Upon deletion:</p>
          <ul>
            <li>
              Your profile, games, ratings, and messages are permanently deleted
              within 30 days
            </li>
            <li>Your email is removed from all mailing lists</li>
            <li>
              Anonymised/aggregated data may be retained for analytics
            </li>
          </ul>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            Our Service is not intended for children under 13 (or under 18
            without parental consent, as required by POPIA). We do not knowingly
            collect data from children. If we discover we have collected data
            from a child, we will delete it immediately.
          </p>
        </Section>

        <Section title="9. Cookies and Tracking">
          <p>
            We use minimal cookies for session management only. We do{" "}
            <strong>not</strong> use:
          </p>
          <ul>
            <li>Third-party advertising trackers</li>
            <li>Cross-app tracking (Apple ATT not required)</li>
            <li>Analytics that identify individual users</li>
          </ul>
        </Section>

        <Section title="10. International Data Transfers">
          <p>
            Your data may be transferred to and processed in countries outside
            South Africa (including the US and EU) where our service providers
            operate. These transfers comply with POPIA Section 72, and we ensure
            adequate protection through contractual safeguards with our service
            providers.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Material
            changes will be communicated via in-app notification or email.
            Continued use of the Service after changes constitutes acceptance.
          </p>
        </Section>

        <Section title="12. Information Officer">
          <p>
            In accordance with POPIA, our designated Information Officer is:
          </p>
          <ul>
            <li>
              <strong>Name:</strong> Elton Tomas Laice
            </li>
            <li>
              <strong>Company:</strong> Codelaice Technology (Pty) Ltd
            </li>
            <li>
              <strong>Address:</strong> 33 Strand Road, Bellville, Cape Town,
              7530
            </li>
            <li>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:hello@iminplay.com"
                className="font-bold text-primary hover:underline"
              >
                hello@iminplay.com
              </a>
            </li>
          </ul>
        </Section>

        <Section title="13. Regulatory Authority">
          <p>
            If you are not satisfied with how we handle your data, you may lodge
            a complaint with:
          </p>
          <ul>
            <li>
              <strong>Information Regulator of South Africa</strong>
            </li>
            <li>
              Website:{" "}
              <a
                href="https://inforegulator.org.za"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-primary hover:underline"
              >
                inforegulator.org.za
              </a>
            </li>
            <li>
              Email:{" "}
              <a
                href="mailto:complaints.IR@justice.gov.za"
                className="font-bold text-primary hover:underline"
              >
                complaints.IR@justice.gov.za
              </a>
            </li>
          </ul>
        </Section>

        <hr className="my-12 border-border" />
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} Codelaice Technology (Pty) Ltd, trading
          as IminPlay. All rights reserved.
        </p>
      </article>
    </main>
  );
}

/* ── Local typography components ───────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-black leading-tight text-charcoal sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-text-secondary [&_a]:break-words [&_li]:leading-relaxed [&_strong]:text-charcoal [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 text-base font-black uppercase tracking-wider text-primary">
      {children}
    </h3>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-5 overflow-hidden rounded-2xl ring-1 ring-border/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-off-white">
            <tr>
              {head.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-text-muted"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-border bg-white align-top"
              >
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 text-text-secondary ${
                      j === 0 ? "font-bold text-charcoal" : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
