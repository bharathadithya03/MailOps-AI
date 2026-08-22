'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge, ConfidenceBar, StatusDot } from '@/components/ui';
import { getEmailById, getAuditLogs } from '@/lib/firestore';
import { useAuth } from '@/lib/auth';

export default function EmailDetailPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [email, setEmail] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmailAndAudit() {
      try {
        const [emailData, logs] = await Promise.all([
          getEmailById(id, user?.uid),
          getAuditLogs(user?.uid),
        ]);
        setEmail(emailData);
        setAuditLogs((logs || []).filter((a) => a.emailId === id));
      } catch (err) {
        console.error('Error loading email details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEmailAndAudit();
  }, [id, user]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500">Loading live email details...</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 p-12">
        <h2 className="text-lg font-bold text-slate-900">Email not found</h2>
        <p className="text-sm text-slate-500 mt-1">This email record does not exist in the synchronized dataset.</p>
        <Link href="/dashboard/inbox" className="text-sm text-blue-600 font-semibold hover:underline mt-4 inline-block">
          ← Back to Inbox
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/inbox" className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-semibold">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Inbox
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Content - Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {(email.fromName || email.from || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{email.fromName || email.from}</p>
                  <p className="text-xs text-slate-400">{email.from}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusDot status={email.status} />
                <Badge variant={email.status === 'processed' || email.status === 'Completed' ? 'primary' : 'default'}>
                  {email.status === 'processed' ? 'Completed' : email.status}
                </Badge>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-900 mb-1">{email.subject}</h2>
            <p className="text-xs text-slate-400 mb-4">
              To: {email.to || 'me'} · {email.receivedAt ? new Date(email.receivedAt).toLocaleString() : 'Recent'}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {email.labels?.map((label) => (
                <Badge key={label} variant="default">{label}</Badge>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {email.body || email.snippet || '(No body content)'}
              </pre>
            </div>
          </div>

          {/* Genuine Audit Trail for this specific email */}
          {auditLogs.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Operational Audit Trail</h3>
                <span className="text-xs text-slate-400">{auditLogs.length} events</span>
              </div>
              <div className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <div key={log.id} className="px-6 py-3.5">
                    <div className="flex items-start gap-3">
                      <StatusDot status={log.status === 'completed' ? 'processed' : 'pending'} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{log.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-semibold text-slate-600">{log.performedBy}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis - Right */}
        <div className="space-y-6">
          {/* Intent Classification */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">AI Classification</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Detected Intent</p>
                <Badge variant={email.handler || 'primary'}>
                  {email.intent?.replace(/_/g, ' ') || 'General'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Confidence Score</p>
                <ConfidenceBar value={email.confidence || 90} />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Assigned Handler</p>
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {email.handler || 'General'} Handler
                </p>
              </div>
            </div>
          </div>

          {/* Policy Decision */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Policy Decision</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Decision</p>
                <Badge variant={email.policyDecision === 'auto_approve' ? 'primary' : 'default'}>
                  {email.policyDecision === 'auto_approve' ? 'Auto Approved' : 'Escalated'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Action</p>
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {email.action === 'automated' || email.policyDecision === 'auto_approve' ? '⚡ Automated' : '👤 Human Review'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Reason</p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {email.policyReason || 'Standard rule-based automated routing policy applied.'}
                </p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Message Details</h3>
            <div className="space-y-3">
              {email.amount && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-medium text-slate-900">${email.amount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Message ID</span>
                <span className="font-mono text-xs text-slate-600 truncate max-w-[140px]">{email.messageId || email.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Source</span>
                <span className="font-medium text-blue-600 capitalize">{email.source || 'Gmail'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Priority</span>
                <Badge variant={email.priority === 'high' ? 'danger' : 'default'}>
                  {email.priority || 'Normal'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
