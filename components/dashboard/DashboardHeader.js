'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useDashboardFilter } from '@/app/dashboard/layout';

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const {
    dateRange,
    setDateRange,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    priority,
    setPriority,
    category,
    setCategory,
    status,
    setStatus,
    intent,
    setIntent,
    clearFilters,
    isFiltered,
  } = useDashboardFilter();

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const dateDropdownRef = useRef(null);
  const filterModalRef = useRef(null);

  const isMainDashboard = pathname === '/dashboard';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.warn('Logout notice:', e);
    }
    router.push('/login');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target)) {
        setDateDropdownOpen(false);
      }
      if (filterModalRef.current && !filterModalRef.current.contains(event.target)) {
        setFilterModalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dateRangeLabels = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    custom: 'Custom Range',
  };

  // Subpage header
  if (!isMainDashboard) {
    return (
      <header className="flex items-center justify-between gap-4 pb-4 mb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>MailOps AI</span>
          <span>/</span>
          <span className="text-slate-900 capitalize">
            {pathname.split('/').filter(Boolean).pop() || 'Section'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </header>
    );
  }

  // Main /dashboard header
  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 mb-2">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Live overview of your email operations
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Date Range Selector Dropdown */}
        <div className="relative" ref={dateDropdownRef}>
          <button
            onClick={() => {
              setDateDropdownOpen(!dateDropdownOpen);
              setFilterModalOpen(false);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-300 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dateRangeLabels[dateRange] || 'Last 7 Days'}</span>
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dateDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 space-y-1">
              {[
                { key: 'today', label: 'Today' },
                { key: '7d', label: 'Last 7 Days' },
                { key: '30d', label: 'Last 30 Days' },
                { key: 'custom', label: 'Custom Range' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    setDateRange(option.key);
                    if (option.key !== 'custom') {
                      setDateDropdownOpen(false);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                    dateRange === option.key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{option.label}</span>
                  {dateRange === option.key && <span className="text-blue-600">✓</span>}
                </button>
              ))}

              {dateRange === 'custom' && (
                <div className="pt-2 border-t border-slate-100 space-y-2 px-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Start Date</label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">End Date</label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => setDateDropdownOpen(false)}
                    className="w-full py-1 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md mt-1"
                  >
                    Apply Range
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Filter Popover Button */}
        <div className="relative" ref={filterModalRef}>
          <button
            onClick={() => {
              setFilterModalOpen(!filterModalOpen);
              setDateDropdownOpen(false);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
              isFiltered
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filter</span>
            {isFiltered && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>

          {/* Filter Popover Modal */}
          {filterModalOpen && (
            <div className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span className="text-xs font-bold text-slate-900">Filter Data</span>
                {isFiltered && (
                  <button
                    onClick={clearFilters}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Priority</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'high', label: 'High' },
                    { id: 'medium', label: 'Med' },
                    { id: 'low', label: 'Low' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriority(p.id)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        priority === p.id
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Category / Spam Filter */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Email Category</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'non_spam', label: 'Inbox' },
                    { id: 'spam', label: 'Spam' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        category === c.id
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Processing Status</label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'automated', label: 'Automated' },
                    { id: 'human_review', label: 'Review' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatus(s.id)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        status === s.id
                          ? 'bg-blue-50 border-blue-400 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intent */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Intent</label>
                <select
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Intents</option>
                  <option value="invoice">Invoice</option>
                  <option value="payment">Payment</option>
                  <option value="dispute">Dispute</option>
                  <option value="security">Security</option>
                  <option value="compliance">Compliance</option>
                  <option value="inquiry">Inquiry</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Apply / Close button */}
              <button
                onClick={() => setFilterModalOpen(false)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 bg-white rounded-xl border border-slate-200/80 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer"
          title="Sign out of MailOps AI"
        >
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
