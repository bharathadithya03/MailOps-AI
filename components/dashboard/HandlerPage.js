'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge, ConfidenceBar, StatusDot, StatCard, PageHeader } from '@/components/ui';
import { getEmails } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { useDashboardFilter } from '@/app/dashboard/layout';
import { mockEmails } from '@/lib/mockData';

const HANDLER_META = {
  invoice: {
    name: 'Invoice Handler',
    description: 'Specialized processor for vendor invoices, billing receipts, and account statements.',
    status: 'active',
  },
  payment: {
    name: 'Payment Handler',
    description: 'Processes payment confirmations, transfer notifications, and payment balance requests.',
    status: 'active',
  },
  dispute: {
    name: 'Dispute Handler',
    description: 'Routes billing discrepancies, chargebacks, and compliance escalations for human review.',
    status: 'active',
  },
};

export default function HandlerPage({ handlerType, title, description }) {
  const { user } = useAuth();
  const { gmailConnected, gmailStatusLoading } = useDashboardFilter();
  const [allEmails, setAllEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadEmails() {
      if (gmailStatusLoading) return;
      try {
        if (gmailConnected) {
          const data = await getEmails(user?.uid);
          setAllEmails(data || []);
          setIsDemo(false);
        } else {
          setAllEmails(mockEmails);
          setIsDemo(true);
        }
      } catch (err) {
        console.error('Error loading handler emails:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmails();
  }, [user, gmailConnected, gmailStatusLoading]);

  const handler = HANDLER_META[handlerType] || {
    name: `${handlerType} Handler`,
    description: 'Specialized pipeline handler.',
    status: 'active',
  };

  const emails = allEmails.filter((e) => e.handler === handlerType);
  const autoEmails = emails.filter((e) => e.action === 'automated' || e.policyDecision === 'auto_approve');
  const reviewEmails = emails.filter((e) => e.action === 'human_review' || e.policyDecision === 'human_review');
  const avgConfidence = emails.length > 0
    ? Math.round(emails.reduce((sum, e) => sum + (e.confidence || 0), 0) / emails.length)
    : 0;

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
      />

      {/* Handler Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Emails"
          value={emails.length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          title="Automated"
          value={autoEmails.length}
          subtitle={`${emails.length > 0 ? Math.round((autoEmails.length / emails.length) * 100) : 0}% auto rate`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          title="Human Review"
          value={reviewEmails.length}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          title="Avg. Confidence"
          value={`${avgConfidence}%`}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Handler Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{handler.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{handler.description}</p>
          </div>
          <Badge variant={handler.status === 'active' ? 'primary' : 'default'}>
            {handler.status}
          </Badge>
        </div>
      </div>

      {/* Email List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Emails Assigned to this Handler</h3>
          <span className="text-xs text-slate-400">{emails.length} total</span>
        </div>

        <div className="divide-y divide-slate-100">
          {emails.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">No synchronized emails match this handler yet.</p>
              <Link href="/dashboard/settings" className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
                Sync Gmail in Settings →
              </Link>
            </div>
          ) : (
            emails.map((email) => (
              <Link
                key={email.id}
                href={`/dashboard/email/${email.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <StatusDot status={email.status} />
                <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-blue-600">
                    {(email.fromName || email.from || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{email.subject}</p>
                  <p className="text-xs text-slate-400">{email.fromName || email.from}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 hidden sm:flex">
                  <div className="w-24">
                    <ConfidenceBar value={email.confidence || 90} size="sm" />
                  </div>
                  <Badge variant={email.action === 'automated' || email.policyDecision === 'auto_approve' ? 'primary' : 'default'}>
                    {email.action === 'automated' || email.policyDecision === 'auto_approve' ? 'Auto' : 'Review'}
                  </Badge>
                  {email.amount && (
                    <span className="text-sm font-medium text-slate-700">
                      ${email.amount.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
