'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { getEmails } from '@/lib/firestore';
import { useDashboardFilter } from '@/app/dashboard/layout';
import { mockEmails } from '@/lib/mockData';

export default function Sidebar({ collapsed = false, toggleCollapsed }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { gmailConnected, gmailStatusLoading } = useDashboardFilter();
  const [emailCount, setEmailCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      if (gmailStatusLoading) return;
      try {
        let emails;
        if (gmailConnected) {
          emails = await getEmails(user?.uid);
        } else {
          emails = mockEmails;
        }
        if (emails && emails.length > 0) {
          setEmailCount(emails.length);
          const reviews = emails.filter((e) => e.action === 'human_review' || e.policyDecision === 'human_review').length;
          setReviewCount(reviews);
        } else {
          setEmailCount(0);
          setReviewCount(0);
        }
      } catch (e) {}
    }
    loadStats();
  }, [user, gmailConnected, gmailStatusLoading]);

  const navItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Inbox',
      href: '/dashboard/inbox',
      badge: emailCount > 0 ? String(emailCount) : null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Actions',
      href: '/dashboard/classification',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      label: 'Human Review',
      href: '/dashboard/handlers/dispute',
      badge: reviewCount > 0 ? String(reviewCount) : null,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      label: 'Audit Log',
      href: '/dashboard/audit',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Analytics',
      href: '/dashboard/confidence',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl border border-slate-200 shadow-md text-slate-600 hover:text-blue-600 cursor-pointer"
        aria-label="Toggle mobile menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/25 backdrop-blur-xs z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-100 z-40 flex flex-col justify-between transition-all duration-300 ${
          collapsed ? 'lg:w-20 w-64' : 'lg:w-64 w-64'
        } ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Header & Logo + Toggle Button */}
            <div className={`h-20 flex items-center border-b border-slate-100 transition-all ${
              collapsed ? 'justify-center px-2' : 'justify-between px-5'
            }`}>
              <Link
                href="/"
                className="flex items-center gap-2.5 min-w-0"
                onClick={() => setMobileOpen(false)}
                title="MailOps AI Home"
              >
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-xs shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {!collapsed && (
                  <span className="text-base font-bold text-slate-900 tracking-tight truncate">
                    MailOps <span className="text-blue-600">AI</span>
                  </span>
                )}
              </Link>

              {/* Desktop Collapse / Expand Toggle Button */}
              {toggleCollapsed && (
                <button
                  onClick={toggleCollapsed}
                  className={`hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer shrink-0 ${
                    collapsed ? 'mt-2' : ''
                  }`}
                  title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-xl text-sm font-medium transition-all group ${
                      collapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ml-2 ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile at Bottom */}
          <div className={`border-t border-slate-100 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
            <Link
              href="/dashboard/settings"
              title={collapsed ? (user?.displayName || 'User Settings') : undefined}
              className={`flex items-center rounded-xl hover:bg-slate-50 transition-colors group ${
                collapsed ? 'p-2 justify-center' : 'justify-between p-2.5'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                  {(user?.displayName?.[0] || user?.email?.[0] || 'M').toUpperCase()}
                </div>
                {!collapsed && (
                  <div className="text-left min-w-0">
                    <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-[11px] text-slate-400 font-normal truncate">
                      {user?.role || 'Admin'}
                    </p>
                  </div>
                )}
              </div>
              {!collapsed && (
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
