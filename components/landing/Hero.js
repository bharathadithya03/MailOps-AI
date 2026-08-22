'use client';

import Link from 'next/link';

export default function Hero() {
  const workflowNodes = [
    {
      id: 'inbox',
      title: 'Email Inbox',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m0 0l-2.5-2.5M12 17l2.5-2.5" />
        </svg>
      ),
    },
    {
      id: 'intent',
      title: 'AI Intent Engine',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <circle cx="8" cy="9" r="1.5" fill="currentColor" />
          <circle cx="16" cy="9" r="1.5" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'invoice',
      title: 'Invoice Handler',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'payment',
      title: 'Payment Handler',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'dispute',
      title: 'Dispute Handler',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'policy',
      title: 'Confidence & Policy\nEngine',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 6l9-4 9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4" />
        </svg>
      ),
    },
  ];

  return (
    <section className="pt-32 pb-20 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-6 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
              AI-Powered Email Automation
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
            Intelligent Email
            <br />
            Automation for
            <br />
            <span className="text-blue-600">Modern Teams</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-slate-500 max-w-xl leading-relaxed font-normal">
            MAILOPS AI analyzes, routes, and resolves emails with precision—so your team can focus on what truly matters.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/signup"
              className="px-7 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 hover:-translate-y-0.5"
            >
              Get started free
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-slate-700 font-semibold rounded-xl border border-blue-200 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book a demo
            </button>
          </div>

          {/* Trust points */}
          <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                ✓
              </div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px]">
                ✓
              </div>
              <span>Setup in 2 minutes</span>
            </div>
          </div>
        </div>

        {/* Right Column: Workflow Visualization */}
        <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-radial from-blue-50/50 via-transparent to-transparent pointer-events-none -z-10" />

          {/* Interactive Flow Container */}
          <div className="relative w-full max-w-xl bg-white/70 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            {/* SVG Connecting Flow Lines */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 0 }}
              preserveAspectRatio="none"
              viewBox="0 0 540 460"
            >
              <defs>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Central Lens Ring */}
              <ellipse
                cx="375"
                cy="230"
                rx="20"
                ry="180"
                fill="none"
                stroke="#DBEAFE"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Converging Stream Lines from each left card towards the right card */}
              <path d="M 230 48 C 320 48, 350 200, 420 220" fill="none" stroke="url(#flowGrad)" strokeWidth="1.5" />
              <path d="M 230 118 C 320 118, 350 210, 420 225" fill="none" stroke="url(#flowGrad)" strokeWidth="1.5" />
              <path d="M 230 188 C 310 188, 350 220, 420 230" fill="none" stroke="url(#flowGrad)" strokeWidth="1.5" />
              <path d="M 230 258 C 310 258, 350 235, 420 235" fill="none" stroke="url(#flowGrad)" strokeWidth="1.5" />
              <path d="M 230 328 C 320 328, 350 245, 420 240" fill="none" stroke="url(#flowGrad)" strokeWidth="1.5" />
              <path d="M 230 398 C 320 398, 350 255, 420 245" fill="none" stroke="url(#flowGrad)" strokeWidth="1.5" />
            </svg>

            <div className="relative z-10 flex items-center justify-between gap-4 sm:gap-6">
              {/* Left Stack: 6 Handlers */}
              <div className="flex flex-col gap-3 sm:gap-3.5 w-48 sm:w-56">
                {workflowNodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center gap-3 px-3.5 py-2.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50/80 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      {node.icon}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 leading-tight whitespace-pre-line group-hover:text-blue-600 transition-colors">
                      {node.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right Box: Automated Action Target */}
              <div className="flex flex-col items-center justify-center p-6 sm:p-7 bg-white rounded-2xl border-2 border-blue-100 shadow-lg shadow-blue-500/10 w-36 sm:w-44 text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-inner">
                  <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  Automated
                  <br />
                  Action
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
