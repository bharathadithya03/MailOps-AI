'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, ConfidenceBar, StatusDot } from '@/components/ui';
import { getEmails } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { useDashboardFilter } from '@/app/dashboard/layout';
import { mockEmails } from '@/lib/mockData';

export default function InboxPage() {
  const { user } = useAuth();
  const { gmailConnected, gmailStatusLoading } = useDashboardFilter();
  const [emails, setEmails] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadInbox() {
      if (gmailStatusLoading) return;
      try {
        if (gmailConnected) {
          const data = await getEmails(user?.uid);
          setEmails(data || []);
          setIsDemo(false);
        } else {
          setEmails(mockEmails);
          setIsDemo(true);
        }
      } catch (err) {
        console.warn('Error loading emails:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInbox();
  }, [user, gmailConnected, gmailStatusLoading]);

  const filteredEmails = emails.filter((email) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'processed' && (email.status === 'processed' || email.status === 'Completed')) ||
      (filter === 'pending' && (email.status === 'pending' || email.status === 'Pending Review')) ||
      (filter === 'automated' && (email.action === 'automated' || email.policyDecision === 'auto_approve')) ||
      (filter === 'review' && (email.action === 'human_review' || email.policyDecision === 'human_review'));

    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      (email.subject && email.subject.toLowerCase().includes(searchLower)) ||
      (email.fromName && email.fromName.toLowerCase().includes(searchLower)) ||
      (email.from && email.from.toLowerCase().includes(searchLower)) ||
      (email.body && email.body.toLowerCase().includes(searchLower));

    return matchesFilter && matchesSearch;
  });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'processed', label: 'Processed' },
    { key: 'pending', label: 'Pending' },
    { key: 'automated', label: 'Automated' },
    { key: 'review', label: 'Needs Review' },
  ];

  return (
    <div>
      <PageHeader
        title="Email Inbox"
        description={`${emails.length} ${isDemo ? 'demo' : 'synchronized'} emails in the ${isDemo ? 'sample' : 'live'} pipeline`}
      />

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-5 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-blue-800">Demo Mode — Showing sample emails.</span>
          </div>
          <Link href="/dashboard/settings" className="text-blue-700 font-bold hover:underline">
            Connect Gmail →
          </Link>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search emails..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  filter === f.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Loading inbox...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="text-center py-14">
              <p className="text-sm font-semibold text-slate-700">
                {emails.length === 0 ? 'No emails synchronized yet.' : 'No emails match your filters.'}
              </p>
              {emails.length === 0 && (
                <Link href="/dashboard/settings" className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
                  Go to Settings → Connect & Sync Gmail
                </Link>
              )}
            </div>
          ) : (
            filteredEmails.map((email) => (
              <Link
                key={email.id}
                href={`/dashboard/email/${email.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                {/* Status */}
                <StatusDot status={email.status} />

                {/* Sender Avatar */}
                <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-blue-600">
                    {(email.fromName || email.from || 'U')[0].toUpperCase()}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {email.fromName || email.from}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {email.from}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 truncate">{email.subject}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {(email.snippet || email.body || '').substring(0, 80)}...
                  </p>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 hidden sm:flex">
                  <div className="flex items-center gap-2">
                    <Badge variant={email.handler || 'primary'}>
                      {email.intent?.replace(/_/g, ' ') || 'General'}
                    </Badge>
                    {email.priority === 'high' && (
                      <Badge variant="danger">High</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {email.confidence || 90}%
                    </span>
                    <span className="text-xs text-slate-300">
                      {email.receivedAt ? new Date(email.receivedAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
