import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — MAILOPS AI',
  description: 'Terms and conditions governing the use of the MAILOPS AI platform and email automation services.',
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-blue-100 selection:text-blue-700">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 sm:px-8 lg:px-12 max-w-4xl mx-auto w-full">
        {/* Header Badge & Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-4">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              Legal & Compliance
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Last Updated: August 21, 2026
          </p>
        </div>

        {/* Content Box */}
        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base border-t border-slate-100 pt-8">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using MAILOPS AI (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use or access the Service.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              2. Description of Service
            </h2>
            <p>
              MAILOPS AI provides a software-as-a-service web application for automating email operations, including AI-driven email classification, specialized handler routing (such as invoices, payments, and disputes), confidence policy evaluation, human review escalation, and audit logging.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              3. User Accounts and Authentication
            </h2>
            <p>
              To access the dashboard and email processing features, you must register for an account using Firebase Authentication. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              4. Third-Party Integrations & Google OAuth
            </h2>
            <p>
              MAILOPS AI offers optional integrations with third-party providers, including Google Workspace and Gmail. By connecting a third-party service:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                You confirm that you possess the necessary authorization to grant MAILOPS AI access to that account.
              </li>
              <li>
                You authorize MAILOPS AI to read and process incoming email messages strictly for the automated features enabled in your dashboard.
              </li>
              <li>
                You may revoke third-party authorizations at any time through the application settings or your provider&apos;s account security settings.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              5. Acceptable Use
            </h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Violate any applicable local, state, national, or international laws.</li>
              <li>Process or transmit malicious software, unsolicited bulk messages (spam), or infringing content.</li>
              <li>Attempt to gain unauthorized access to any accounts, systems, or networks connected to the Service.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              6. Disclaimers & Limitation of Liability
            </h2>
            <p>
              The Service and AI processing features are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While MAILOPS AI provides confidence scoring and policy-based review mechanisms, automated decisions should be verified by authorized personnel according to your organization&apos;s internal policies.
            </p>
            <p>
              To the maximum extent permitted by law, MAILOPS AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              7. Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate your access to the Service at our discretion if you breach these Terms. You may terminate your account at any time by contacting our support team.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              8. Contact Information
            </h2>
            <p>
              If you have any questions regarding these Terms of Service, please contact us:
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-800">
              Email: <span className="text-blue-600">support@mailops.ai</span>
              <br />
              Website: <Link href="/" className="text-blue-600 hover:underline">mailops.ai</Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
