import Link from 'next/link';

const features = [
  {
    title: 'Understand Intent',
    desc: 'AI analyzes emails and extracts key intent and context.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Smart Routing',
    desc: 'Emails are routed to the right handler or system instantly.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
  },
  {
    title: 'Specialized Handlers',
    desc: 'Invoices, payments, disputes, and more—handled automatically.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    title: 'Policy & Confidence',
    desc: 'Decisions are made with policy rules and confidence scoring.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: 'Automated Action',
    desc: 'Take action automatically or escalate with full context.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Audit Trail',
    desc: 'Every decision is logged for transparency and compliance.',
    icon: (
      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Built for Email Operations at Scale
        </h2>
        <p className="text-base sm:text-lg text-slate-500 font-normal">
          From understanding intent to taking action, MAILOPS AI handles it all.
        </p>
      </div>

      {/* 6 Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 mb-16">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="flex flex-col items-start bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-lg hover:border-blue-200 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50/80 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
              {feature.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom CTA Banner Card */}
      <div className="relative bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-blue-50/80 rounded-3xl border border-blue-100 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
        <div className="flex items-start sm:items-center gap-5">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              Ready to transform your inbox into impact?
            </h3>
            <p className="text-sm text-slate-500">
              Join teams that use MAILOPS AI to save time, reduce workload, and drive results.
            </p>
          </div>
        </div>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 hover:shadow-lg shrink-0"
        >
          <span>Get started free</span>
          <span className="text-lg">→</span>
        </Link>
      </div>
    </section>
  );
}
