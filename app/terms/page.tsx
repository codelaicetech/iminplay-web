import Link from "next/link";
import type { Metadata } from "next";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The Terms of Service governing your use of IminPlay, operated by Codelaice Technology (Pty) Ltd.",
  alternates: { canonical: "https://iminplay.com/terms" },
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="mt-3 text-sm font-bold text-text-muted">
          Last updated: April 5, 2026
        </p>

        <p className="mt-8 text-base leading-relaxed text-text-secondary">
          Welcome to IminPlay, operated by Codelaice Technology (Pty) Ltd
          (Registration: 2025/786133/07), a company incorporated in the Republic
          of South Africa (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
          &ldquo;Company&rdquo;). By using our mobile application, website, or
          any related services (the &ldquo;Service&rdquo;), you agree to these
          Terms of Service (&ldquo;Terms&rdquo;). Please read them carefully.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By creating an account, downloading the app, or using the Service in
            any way, you agree to be bound by these Terms and our{" "}
            <Link
              href="/privacy"
              className="font-bold text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            . If you do not agree, do not use the Service.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <ul>
            <li>You must be at least 13 years old to use the Service.</li>
            <li>
              If you are between 13 and 18, you must have parental or guardian
              consent.
            </li>
            <li>
              By using the Service, you represent that you meet these
              requirements.
            </li>
          </ul>
        </Section>

        <Section title="3. Your Account">
          <ul>
            <li>
              You are responsible for maintaining the confidentiality of your
              login credentials.
            </li>
            <li>
              You must provide accurate, current, and complete information.
            </li>
            <li>You are responsible for all activity under your account.</li>
            <li>
              Notify us immediately at{" "}
              <a
                href="mailto:hello@iminplay.com"
                className="font-bold text-primary hover:underline"
              >
                hello@iminplay.com
              </a>{" "}
              if you suspect unauthorised access.
            </li>
            <li>
              We reserve the right to suspend accounts that violate these
              Terms.
            </li>
          </ul>
        </Section>

        <Section title="4. Acceptable Use">
          <p>
            You agree to use the Service only for lawful purposes. You must not:
          </p>
          <ul>
            <li>Harass, abuse, threaten, or discriminate against other users</li>
            <li>Post false, misleading, defamatory, or offensive content</li>
            <li>Create fake accounts or impersonate others</li>
            <li>
              Use the Service for any commercial purpose without our written
              consent
            </li>
            <li>
              Attempt to access other users&apos; accounts or private data
            </li>
            <li>
              Interfere with the operation, security, or performance of the
              Service
            </li>
            <li>
              Use bots, scrapers, or automated tools to access the Service
            </li>
            <li>Upload malware, viruses, or harmful code</li>
            <li>Violate any applicable law or regulation</li>
          </ul>
          <p>
            We reserve the right to remove content and suspend accounts that
            violate these rules without notice.
          </p>
        </Section>

        <Section title="5. Games and Meetups">
          <ul>
            <li>
              IminPlay is a platform that facilitates connections between sports
              players. We do <strong>not</strong> organise, supervise, or
              control any games, events, or meetups.
            </li>
            <li>
              You participate in all games and activities{" "}
              <strong>at your own risk</strong>.
            </li>
            <li>
              You are solely responsible for your own safety, health, and
              well-being during any activity arranged through the Service.
            </li>
            <li>
              You should assess the suitability of any game or venue before
              participating.
            </li>
            <li>
              IminPlay is <strong>not liable</strong> for any injuries, damages,
              losses, theft, or disputes arising from games or meetups arranged
              through the Service.
            </li>
            <li>
              You are responsible for obtaining any necessary insurance for
              sporting activities.
            </li>
          </ul>
        </Section>

        <Section title="6. Content">
          <ul>
            <li>
              You retain ownership of content you create (photos, descriptions,
              messages).
            </li>
            <li>
              By posting content, you grant IminPlay a worldwide, non-exclusive,
              royalty-free licence to use, display, reproduce, and distribute it
              within the Service.
            </li>
            <li>
              You represent that you have the right to post any content you
              share.
            </li>
            <li>
              We may remove content that violates these Terms at our
              discretion.
            </li>
          </ul>
        </Section>

        <Section title="7. IminPlay Pro (Paid Subscription)">
          <ul>
            <li>
              IminPlay may offer paid subscription plans (&ldquo;IminPlay
              Pro&rdquo;) with additional features.
            </li>
            <li>
              Subscriptions are billed through the Apple App Store or Google
              Play Store.
            </li>
            <li>
              Cancellation and refund policies are governed by the respective
              platform&apos;s terms.
            </li>
            <li>
              We reserve the right to change subscription pricing with 30
              days&apos; notice.
            </li>
            <li>
              Free features will remain free; we will not retroactively charge
              for existing functionality.
            </li>
          </ul>
        </Section>

        <Section title="8. Account Deletion">
          <ul>
            <li>
              You may delete your account at any time via{" "}
              <strong>Settings &gt; Danger Zone &gt; Delete Account</strong> in
              the app.
            </li>
            <li>
              You may also request deletion by emailing{" "}
              <a
                href="mailto:hello@iminplay.com"
                className="font-bold text-primary hover:underline"
              >
                hello@iminplay.com
              </a>
              .
            </li>
            <li>
              Upon deletion, your profile, games, messages, and ratings will be
              permanently removed within 30 days.
            </li>
            <li>
              Active subscriptions should be cancelled through the App Store or
              Google Play before deleting your account.
            </li>
          </ul>
        </Section>

        <Section title="9. Intellectual Property">
          <ul>
            <li>
              The IminPlay name, logo, branding, and app design are the property
              of Codelaice Technology (Pty) Ltd.
            </li>
            <li>
              You may not copy, modify, distribute, or create derivative works
              from any part of the Service without our written consent.
            </li>
          </ul>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            The Service is provided <strong>&ldquo;as is&rdquo;</strong> and{" "}
            <strong>&ldquo;as available&rdquo;</strong> without warranties of
            any kind, whether express or implied. We do not guarantee that the
            Service will be:
          </p>
          <ul>
            <li>Uninterrupted, timely, or error-free</li>
            <li>Free from viruses or harmful components</li>
            <li>Accurate or complete</li>
          </ul>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>To the maximum extent permitted by South African law:</p>
          <ul>
            <li>
              Codelaice Technology (Pty) Ltd shall not be liable for any
              indirect, incidental, special, consequential, or punitive
              damages.
            </li>
            <li>
              Our total liability for any claim arising from the Service shall
              not exceed the amount you paid us in the 12 months preceding the
              claim, or R500 (ZAR), whichever is greater.
            </li>
          </ul>
        </Section>

        <Section title="12. Indemnification">
          <p>
            You agree to indemnify and hold harmless Codelaice Technology (Pty)
            Ltd, its directors, employees, and agents from any claims, damages,
            or expenses arising from your use of the Service or violation of
            these Terms.
          </p>
        </Section>

        <Section title="13. Governing Law and Jurisdiction">
          <ul>
            <li>
              These Terms are governed by the laws of the{" "}
              <strong>Republic of South Africa</strong>.
            </li>
            <li>
              Any disputes shall be subject to the exclusive jurisdiction of
              the courts of{" "}
              <strong>Cape Town, Western Cape, South Africa</strong>.
            </li>
            <li>
              The Consumer Protection Act 68 of 2008 (CPA) applies to these
              Terms where applicable.
            </li>
          </ul>
        </Section>

        <Section title="14. Changes to Terms">
          <p>
            We may update these Terms from time to time. Material changes will
            be communicated via in-app notification or email at least 14 days
            before they take effect. Continued use of the Service after changes
            constitutes acceptance.
          </p>
        </Section>

        <Section title="15. Severability">
          <p>
            If any provision of these Terms is found to be invalid or
            unenforceable, the remaining provisions will continue in full force
            and effect.
          </p>
        </Section>

        <Section title="16. Contact">
          <p>If you have questions about these Terms, contact us:</p>
          <ul>
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
            <li>
              <strong>Website:</strong>{" "}
              <a
                href="https://iminplay.com"
                className="font-bold text-primary hover:underline"
              >
                iminplay.com
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
