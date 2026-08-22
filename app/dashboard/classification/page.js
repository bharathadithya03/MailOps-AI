'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader, Badge, ConfidenceBar, StatusDot } from '@/components/ui';
import { getEmails } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { useDashboardFilter } from '@/app/dashboard/layout';
import { mockEmails } from '@/lib/mockData';

export default function ClassificationPage() {
  const { user } = useAuth();
  const { gmailConnected, gmailStatusLoading } = useDashboardFilter();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadEmails() {
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
      } catch (e) {
        console.error('Error loading classifications:', e);
      } finally {
        setLoading(false);
      }
    }
    loadEmails();
  }, [user, gmailConnected, gmailStatusLoading]);

  // Compute intent distribution counts
  const intentCounts = emails.reduce((acc, email) => {
    const key = email.intent || 'general';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const intentStats = Object.entries(intentCounts).map(([intent, count]) => {
    const intentEmails = emails.filter((e) => (e.intent || 'general') === intent);
    const avgConfidence = Math.round(
      intentEmails.reduce((sum, e) => sum + (e.confidence || 0), 0) / (intentEmails.length || 1)
    );
    const autoRate = Math.round(
      (intentEmails.filter((e) => e.action === 'automated' || e.policyDecision === 'auto_approve').length / (intentEmails.length || 1)) * 100
    );
    return { intent, count, avgConfidence, autoRate };
  });

  return (
    <div>
      <PageHeader
        title="AI Classification"
        description={`${emails.length} emails classified in the ${isDemo ? 'demo' : 'live'} pipeline`}
      />

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-5 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-blue-800">Demo Mode — Showing sample classifications.</span>
          </div>
          <Link href="/dashboard/settings" className="text-blue-700 font-bold hover:underline">
            Connect Gmail →
          </Link>
        </div>
      )}

      {/* Intent Distribution Cards */}
      {intentStats.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center mb-8">
          <p className="text-sm text-slate-500">No emails classified yet.</p>
          <Link href="/dashboard/settings" className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
            Sync Gmail in Settings →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {intentStats.map((stat) => (
            <div key={stat.intent} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="primary">{stat.intent?.replace(/_/g, ' ')}</Badge>
                <span className="text-lg font-bold text-slate-900">{stat.count}</span>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Avg. Confidence</span>
                    <span className="font-medium text-slate-700">{stat.avgConfidence}%</span>
                  </div>
                  <ConfidenceBar value={stat.avgConfidence} size="sm" />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Auto-Process Rate</span>
                  <span className="font-medium text-blue-600">{stat.autoRate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Classifications Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">{isDemo ? 'Demo' : 'Synchronized'} Email Classifications</h3>
          <span className="text-xs text-slate-400">{emails.length} total records</span>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Intent</div>
          <div className="col-span-2">Confidence</div>
          <div className="col-span-2">Handler</div>
          <div className="col-span-2">Action</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-100">
          {emails.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">No email classifications found.</p>
            </div>
          ) : (
            emails.map((email) => (
              <Link
                key={email.id}
                href={`/dashboard/email/${email.id}`}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-slate-50 transition-colors items-center"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <StatusDot status={email.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{email.subject}</p>
                    <p className="text-xs text-slate-400 truncate">{email.fromName || email.from}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <Badge variant="primary">{email.intent?.replace(/_/g, ' ') || 'General'}</Badge>
                </div>
                <div className="col-span-2">
                  <ConfidenceBar value={email.confidence || 90} size="sm" />
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-slate-700 capitalize">{email.handler || 'General'}</span>
                </div>
                <div className="col-span-2">
                  <Badge variant={email.action === 'automated' || email.policyDecision === 'auto_approve' ? 'primary' : 'default'}>
                    {email.action === 'automated' || email.policyDecision === 'auto_approve' ? 'Auto' : 'Review'}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
