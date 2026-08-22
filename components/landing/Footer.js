import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-12 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">
                MAILOPS <span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
              AI-powered email automation for modern teams.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 cursor-pointer transition-colors text-xs font-bold">
                in
              </span>
              <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 cursor-pointer transition-colors text-xs font-bold">
                𝕏
              </span>
              <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 cursor-pointer transition-colors text-xs font-bold">
                ⌥
              </span>
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="/#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="/#features" className="hover:text-blue-600 transition-colors">How it works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">About Us</span></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Careers</span></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Contact</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
                <li><span className="hover:text-blue-600 transition-colors cursor-pointer">Security</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 text-center text-xs text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} MAILOPS AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
