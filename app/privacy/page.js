import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — MAILOPS AI',
  description: 'Learn how MAILOPS AI protects your data, handles Google OAuth authorization, and processes email records.',
};

export default function PrivacyPolicyPage() {
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
            Privacy Policy
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
              1. Overview
            </h2>
            <p>
              MAILOPS AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) provides an intelligent email operations platform designed to help teams classify, route, and automate email workflows. We are committed to protecting your privacy and ensuring transparency in how your data is accessed, processed, and stored.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              2. Google OAuth & Gmail Integration
            </h2>
            <p>
              MAILOPS AI allows users to connect their Google Workspace or personal Gmail account to process incoming emails. Please note the following key points regarding our Gmail integration:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong className="text-slate-900">Explicit User Authorization:</strong> We only access your Gmail mailbox after you explicitly authorize access through Google&apos;s OAuth 2.0 consent screen.
              </li>
              <li>
                <strong className="text-slate-900">Scope of Access:</strong> We request only the minimum necessary permissions (<code className="text-xs bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-mono">gmail.readonly</code> and basic profile info) required to retrieve incoming messages for classification and workflow routing.
              </li>
              <li>
                <strong className="text-slate-900">Purpose Limitation:</strong> Gmail data is accessed and used exclusively to provide the core email operations features of MAILOPS AI—such as invoice extraction, payment classification, dispute handling, and policy-driven routing.
              </li>
              <li>
                <strong className="text-slate-900">No Advertising or Sale of Data:</strong> We never sell your email content or personal data to third parties, and we do not use your Gmail data for advertising or marketing purposes.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              3. Information We Collect
            </h2>
            <p>We may collect and process the following categories of information:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>
                <strong className="text-slate-900">Account Information:</strong> Name, work email address, and authentication credentials managed securely via Firebase Authentication.
              </li>
              <li>
                <strong className="text-slate-900">Email Metadata & Content:</strong> Sender, recipient, timestamp, subject line, message snippet, and message body needed for classification and routing decisions.
              </li>
              <li>
                <strong className="text-slate-900">Operational Records:</strong> Audit trails, confidence scores, assigned handlers, and execution timestamps associated with processed emails.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              4. Data Storage & Security
            </h2>
            <p>
              Your data is stored securely in Firebase Firestore using industry-standard encryption in transit (HTTPS/TLS) and at rest. Access to Firestore collections is strictly scoped to authenticated user accounts, ensuring no cross-organization or cross-user data exposure.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              5. Disconnecting & Data Deletion
            </h2>
            <p>
              You maintain full control over your connected accounts. You may disconnect your Gmail integration at any time by navigating to <strong>Dashboard → Settings → Email Integration</strong> and clicking <strong>Disconnect</strong>.
            </p>
            <p>
              Upon disconnection, stored access tokens are deleted and no further synchronization occurs. You may also request deletion of your account and associated email records by contacting us.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              6. Contact Us
            </h2>
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
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
