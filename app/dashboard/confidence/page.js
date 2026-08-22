'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Badge, ConfidenceBar, StatCard } from '@/components/ui';
import { getEmails } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { useDashboardFilter } from '@/app/dashboard/layout';
import { mockEmails } from '@/lib/mockData';
import Link from 'next/link';

export default function ConfidencePage() {
  const { user } = useAuth();
  const { gmailConnected, gmailStatusLoading } = useDashboardFilter();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadConfidenceData() {
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
        console.error('Error loading confidence data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadConfidenceData();
  }, [user, gmailConnected, gmailStatusLoading]);

  const total = emails.length;
  const avgConfidence = total > 0
    ? Math.round(emails.reduce((sum, e) => sum + (e.confidence || 0), 0) / total)
    : 0;

  const highConfidence = emails.filter((e) => (e.confidence || 0) >= 85).length;
  const medConfidence = emails.filter((e) => (e.confidence || 0) >= 70 && (e.confidence || 0) < 85).length;
  const lowConfidence = emails.filter((e) => (e.confidence || 0) < 70).length;

  // Real Confidence distribution brackets
  const brackets = [
    { label: '90-100%', count: emails.filter((e) => (e.confidence || 0) >= 90).length },
    { label: '80-89%', count: emails.filter((e) => (e.confidence || 0) >= 80 && (e.confidence || 0) < 90).length },
    { label: '70-79%', count: emails.filter((e) => (e.confidence || 0) >= 70 && (e.confidence || 0) < 80).length },
    { label: '60-69%', count: emails.filter((e) => (e.confidence || 0) >= 60 && (e.confidence || 0) < 70).length },
    { label: '<60%', count: emails.filter((e) => (e.confidence || 0) < 60).length },
  ];
  const maxCount = Math.max(...brackets.map((b) => b.count), 1);

  const activePolicies = [
    {
      id: 'pol_1',
      name: 'High Confidence Auto-Approval',
      type: 'Automation Threshold',
      value: 85,
      unit: '%',
      status: 'active',
      description: 'Emails classified with ≥85% confidence are auto-approved unless safety rules apply.',
    },
    {
      id: 'pol_2',
      name: 'Human Review Routing',
      type: 'Review Threshold',
      value: 70,
      unit: '%',
      status: 'active',
      description: 'Emails between 70% and 84% confidence are routed to the human review queue.',
    },
    {
      id: 'pol_3',
      name: 'Dispute & Compliance Isolation',
      type: 'Safety Rule',
      value: 'Mandatory',
      unit: '',
      status: 'active',
      description: 'All billing disputes, legal notices, and compliance inquiries require manual verification.',
    },
    {
      id: 'pol_4',
      name: 'High Value Transaction Guard',
      type: 'Financial Limit',
      value: '$50,000',
      unit: '',
      status: 'active',
      description: 'Transactions exceeding $50,000 are escalated to senior operations personnel.',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Confidence & Policy"
        description={`Confidence thresholds and automation policy evaluation for ${isDemo ? 'demo' : 'synchronized'} emails`}
      />

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-5 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-blue-800">Demo Mode — Showing sample analytics.</span>
          </div>
          <Link href="/dashboard/settings" className="text-blue-700 font-bold hover:underline">
            Connect Gmail →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Avg. Confidence"
          value={`${avgConfidence}%`}
          subtitle={total > 0 ? `${total} emails scored` : 'No emails scored'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          title="High Confidence"
          value={highConfidence}
          subtitle="≥ 85% (auto-approve)"
        />
        <StatCard
          title="Medium Confidence"
          value={medConfidence}
          subtitle="70-84% (review)"
        />
        <StatCard
          title="Low Confidence"
          value={lowConfidence}
          subtitle="< 70% (escalate)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confidence Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-6">Confidence Distribution</h3>
          {total === 0 ? (
            <div className="text-center py-10">
              <p className="text-xs text-slate-400">No confidence metrics available.</p>
              <Link href="/dashboard/settings" className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
                Sync Gmail in Settings →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {brackets.map((bracket) => (
                <div key={bracket.label} className="flex items-center gap-4">
                  <span className="text-xs font-medium text-slate-500 w-16">{bracket.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max((bracket.count / maxCount) * 100, bracket.count > 0 ? 12 : 0)}%` }}
                    >
                      {bracket.count > 0 && (
                        <span className="text-xs font-medium text-white">{bracket.count}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auto-Approve Threshold */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-6">Threshold Settings</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-700">Auto-Approve Threshold</span>
                <span className="text-sm font-bold text-blue-600">85%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Emails above this confidence level are auto-processed
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-700">Review Threshold</span>
                <span className="text-sm font-bold text-blue-400">70%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: '70%' }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Emails between 70-84% go to human review
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-700">Escalation Threshold</span>
                <span className="text-sm font-bold text-slate-400">&lt;70%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '70%' }} />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Emails below 70% are escalated for manual processing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Policies */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Active Policies</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {activePolicies.map((policy) => (
            <div key={policy.id} className="px-6 py-4 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-slate-900">{policy.name}</h4>
                  <Badge variant={policy.status === 'active' ? 'primary' : 'default'}>
                    {policy.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{policy.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-sm font-bold text-slate-900">
                  {typeof policy.value === 'number'
                    ? `${policy.value}${policy.unit === '%' ? '%' : ` ${policy.unit}`}`
                    : policy.value}
                </span>
                <p className="text-xs text-slate-400">{policy.type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
