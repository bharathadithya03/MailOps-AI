'use client';

import { useState, useEffect } from 'react';
import { PageHeader, Badge, StatusDot } from '@/components/ui';
import { getAuditLogs } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';
import { useDashboardFilter } from '@/app/dashboard/layout';
import { mockAuditLogs } from '@/lib/mockData';
import Link from 'next/link';

export default function AuditPage() {
  const { user } = useAuth();
  const { gmailConnected, gmailStatusLoading } = useDashboardFilter();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadAuditTrail() {
      if (gmailStatusLoading) return;
      try {
        if (gmailConnected) {
          const data = await getAuditLogs(user?.uid);
          setLogs(data || []);
          setIsDemo(false);
        } else {
          setLogs(mockAuditLogs);
          setIsDemo(true);
        }
      } catch (e) {
        console.error('Error loading audit trail:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAuditTrail();
  }, [user, gmailConnected, gmailStatusLoading]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.handler === filter;
  });

  const statuses = {
    completed: 'Completed',
    pending_review: 'Pending Review',
    resolved: 'Resolved',
    in_progress: 'In Progress',
  };

  const totalActions = logs.length;
  const completedActions = logs.filter((l) => l.status === 'completed').length;
  const pendingReviewActions = logs.filter((l) => l.status === 'pending_review').length;
  const systemActions = logs.filter((l) => l.performedBy?.toLowerCase().includes('engine') || l.performedBy === 'system').length;

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        description={`${logs.length} ${isDemo ? 'demo' : 'live'} operational events recorded`}
      />

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl px-5 py-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-blue-800">Demo Mode — Showing sample audit events.</span>
          </div>
          <Link href="/dashboard/settings" className="text-blue-700 font-bold hover:underline">
            Connect Gmail →
          </Link>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 mb-6 w-fit">
        {['all', 'invoice', 'payment', 'dispute'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-xs font-medium transition-all capitalize cursor-pointer ${
              filter === f
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f === 'all' ? 'All Handlers' : `${f} Handler`}
          </button>
        ))}
      </div>

      {/* Audit Log List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="col-span-1">Status</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Handler</div>
          <div className="col-span-1">Score</div>
          <div className="col-span-2">Performed By</div>
          <div className="col-span-2">Timestamp</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">
                {logs.length === 0 ? 'No audit events recorded yet.' : 'No audit records match the selected filter.'}
              </p>
              {logs.length === 0 && (
                <Link href="/dashboard/settings" className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
                  Sync Gmail in Settings to generate live audit trail →
                </Link>
              )}
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 hover:bg-slate-50 transition-colors items-center"
              >
                <div className="col-span-1 flex items-center gap-2">
                  <StatusDot status={log.status === 'completed' ? 'processed' : 'pending'} />
                  <span className="sm:hidden text-xs text-slate-500">
                    {statuses[log.status] || log.status}
                  </span>
                </div>
                <div className="col-span-4">
                  <p className="text-sm font-medium text-slate-800">{log.description}</p>
                  <p className="text-xs text-slate-400 sm:hidden mt-1">
                    {log.handler} · {log.confidence}% · {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                  </p>
                </div>
                <div className="col-span-2 hidden sm:block">
                  <Badge variant={log.handler || 'default'}>{log.handler || 'General'}</Badge>
                </div>
                <div className="col-span-1 hidden sm:block">
                  <span className="text-sm font-medium text-slate-700">{log.confidence || 100}%</span>
                </div>
                <div className="col-span-2 hidden sm:block">
                  <span className="text-xs font-semibold text-slate-600">{log.performedBy}</span>
                </div>
                <div className="col-span-2 hidden sm:block">
                  <span className="text-xs text-slate-400">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{totalActions}</p>
          <p className="text-xs text-slate-500 mt-1">Total Actions</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{completedActions}</p>
          <p className="text-xs text-slate-500 mt-1">Completed</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{pendingReviewActions}</p>
          <p className="text-xs text-slate-500 mt-1">Pending Review</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{systemActions}</p>
          <p className="text-xs text-slate-500 mt-1">Automated Operations</p>
        </div>
      </div>
    </div>
  );
}
