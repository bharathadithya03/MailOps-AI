'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { getEmails, getAuditLogs } from '@/lib/firestore';
import { useDashboardFilter } from '@/app/dashboard/layout';
import { mockEmails, mockAuditLogs } from '@/lib/mockData';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    dateRange,
    customStart,
    customEnd,
    priority,
    category,
    status,
    intent,
    clearFilters,
    isFiltered,
    gmailConnected,
    gmailStatusLoading,
  } = useDashboardFilter();

  const [allEmails, setAllEmails] = useState([]);
  const [allAuditLogs, setAllAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Load data: live Gmail data if connected, mock data if not
  useEffect(() => {
    async function loadData() {
      if (gmailStatusLoading) return;
      if (!user?.uid) return;
      setLoading(true);

      if (gmailConnected) {
        // Gmail connected — use only real synchronized data
        try {
          const [emails, audit] = await Promise.all([
            getEmails(user.uid),
            getAuditLogs(user.uid),
          ]);
          setAllEmails(emails || []);
          setAllAuditLogs(audit || []);
          setIsDemo(false);
        } catch (e) {
          console.error('Error loading dashboard live data:', e);
          setAllEmails([]);
          setAllAuditLogs([]);
          setIsDemo(false);
        }
      } else {
        // Gmail NOT connected — show mock/demo data
        setAllEmails(mockEmails);
        setAllAuditLogs(mockAuditLogs);
        setIsDemo(true);
      }

      setLoading(false);
    }
    loadData();
  }, [user, gmailConnected, gmailStatusLoading]);

  // Dynamically filter dataset based on all selected filter criteria
  const filteredEmails = useMemo(() => {
    if (!allEmails || allEmails.length === 0) return [];
    const now = new Date();

    return allEmails.filter((email) => {
      // 1. Date filter
      if (email.receivedAt || email.timestamp) {
        const emailDate = new Date(email.receivedAt || email.timestamp);
        if (dateRange === 'today') {
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (emailDate < startOfToday) return false;
        } else if (dateRange === '7d') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (emailDate < sevenDaysAgo) return false;
        } else if (dateRange === '30d') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (emailDate < thirtyDaysAgo) return false;
        } else if (dateRange === 'custom') {
          if (customStart && emailDate < new Date(customStart)) return false;
          if (customEnd && emailDate > new Date(`${customEnd}T23:59:59.999Z`)) return false;
        }
      }

      // 2. Priority filter
      if (priority !== 'all') {
        const p = email.priority || 'low';
        if (p !== priority) return false;
      }

      // 3. Category / Spam filter
      const isSpam = email.intent === 'spam' || email.labels?.includes('SPAM');
      if (category === 'spam' && !isSpam) return false;
      if (category === 'non_spam' && isSpam) return false;

      // 4. Processing Status filter
      const isAuto = email.action === 'automated' || email.policyDecision === 'auto_approve';
      const isReview = email.action === 'human_review' || email.policyDecision === 'human_review';
      if (status === 'automated' && !isAuto) return false;
      if (status === 'human_review' && !isReview) return false;

      // 5. Intent filter
      if (intent !== 'all') {
        const rawIntent = email.intent || 'general';
        if (intent === 'payment') {
          if (!rawIntent.startsWith('payment') && rawIntent !== 'inquiry' && email.handler !== 'payment') return false;
        } else if (intent === 'dispute') {
          if (rawIntent !== 'dispute' && email.handler !== 'dispute') return false;
        } else if (rawIntent !== intent) {
          return false;
        }
      }

      return true;
    });
  }, [allEmails, dateRange, customStart, customEnd, priority, category, status, intent]);

  // Compute live metrics from filtered dataset
  const totalEmails = filteredEmails.length;
  const processedEmails = filteredEmails.filter((e) => e.status === 'processed' || e.status === 'Completed').length;
  const automatedActions = filteredEmails.filter((e) => e.action === 'automated' || e.policyDecision === 'auto_approve').length;
  const humanReviews = filteredEmails.filter((e) => e.action === 'human_review' || e.policyDecision === 'human_review').length;
  const spamFiltered = filteredEmails.filter((e) => e.intent === 'spam' || e.labels?.includes('SPAM')).length;
  const autoResolvedRate = totalEmails > 0 ? Math.round((automatedActions / totalEmails) * 100) : 0;
  const avgConfidence = totalEmails > 0
    ? Math.round(filteredEmails.reduce((sum, e) => sum + (e.confidence || 0), 0) / totalEmails)
    : 0;

  // Real intent breakdown from filtered dataset
  const invoiceCount = filteredEmails.filter((e) => e.intent === 'invoice' || e.handler === 'invoice').length;
  const paymentCount = filteredEmails.filter((e) => e.intent === 'payment_confirmation' || e.intent === 'payment_request' || e.intent === 'inquiry' || e.handler === 'payment').length;
  const disputeCount = filteredEmails.filter((e) => e.intent === 'dispute' || e.intent === 'compliance' || e.intent === 'security' || e.handler === 'dispute').length;
  const spamCount = spamFiltered;
  const reviewCount = humanReviews;

  const invoicePercent = totalEmails > 0 ? Math.round((invoiceCount / totalEmails) * 100) : 0;
  const paymentPercent = totalEmails > 0 ? Math.round((paymentCount / totalEmails) * 100) : 0;
  const disputePercent = totalEmails > 0 ? Math.round((disputeCount / totalEmails) * 100) : 0;
  const spamPercent = totalEmails > 0 ? Math.round((spamCount / totalEmails) * 100) : 0;
  const reviewPercent = totalEmails > 0 ? Math.round((reviewCount / totalEmails) * 100) : 0;

  const recentOperations = filteredEmails.slice(0, 8);
  const emailIdsSet = new Set(filteredEmails.map((e) => e.id));
  const recentActivity = allAuditLogs.filter((a) => !a.emailId || emailIdsSet.has(a.emailId)).slice(0, 5);

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 overflow-x-hidden">
      {/* Demo Data Banner */}
      {isDemo && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold text-blue-800">Demo Mode — Showing sample data.</span>
            <span className="text-blue-600">Connect Gmail in Settings to see your real emails.</span>
          </div>
          <Link href="/dashboard/settings" className="text-blue-700 font-bold hover:underline">
            Go to Settings →
          </Link>
        </div>
      )}

      {/* Active Filter Chips Banner */}
      {isFiltered && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-blue-900">Active Filters:</span>
            {dateRange !== '7d' && (
              <span className="bg-white text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-200">
                Range: {dateRange}
              </span>
            )}
            {priority !== 'all' && (
              <span className="bg-white text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 capitalize">
                Priority: {priority}
              </span>
            )}
            {category !== 'all' && (
              <span className="bg-white text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 capitalize">
                Category: {category === 'non_spam' ? 'Inbox' : category}
              </span>
            )}
            {status !== 'all' && (
              <span className="bg-white text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 capitalize">
                Status: {status}
              </span>
            )}
            {intent !== 'all' && (
              <span className="bg-white text-blue-700 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 capitalize">
                Intent: {intent}
              </span>
            )}
          </div>
          <button
            onClick={clearFilters}
            className="text-blue-700 hover:text-blue-900 font-bold underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* 5 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full min-w-0">
        {/* Card 1: Emails Processed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">Emails Processed</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{totalEmails}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-0.5">
              <span>{totalEmails > 0 ? (isDemo ? 'Demo data' : 'Live in filtered set') : 'No emails match'}</span>
            </div>
          </div>
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 18 Q 15 22, 30 14 T 60 10 T 85 16 T 100 6" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Auto Resolved */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">Auto Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{autoResolvedRate}%</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-0.5">
              <span>{automatedActions} automated actions</span>
            </div>
          </div>
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 20 Q 20 12, 40 16 T 70 8 T 100 4" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Actions Taken */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">Actions Taken</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{automatedActions}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-0.5">
              <span>By AI Handlers</span>
            </div>
          </div>
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 16 Q 25 22, 50 12 T 75 14 T 100 6" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Human Reviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">Human Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{humanReviews}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-0.5">
              <span>Escalated cases</span>
            </div>
          </div>
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 8 Q 30 18, 60 12 T 100 20" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 5: Spam Filtered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-w-0">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-500 truncate">Spam Filtered</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 ml-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{spamFiltered}</div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mt-0.5">
              <span>Isolated</span>
            </div>
          </div>
          <div className="h-8 w-full pt-1">
            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path d="M0 18 Q 20 6, 50 14 T 80 8 T 100 6" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Middle Row: 3 Dynamic Charts / Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-w-0">
        {/* Card 1: Intent Distribution */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between min-w-0">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Intent Distribution</h2>
          
          {totalEmails === 0 ? (
            <div className="text-center py-10 my-auto">
              <p className="text-xs text-slate-400">No emails match the selected filters.</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto min-w-0">
              {/* Donut Chart SVG */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#1D4ED8" strokeWidth="14"
                    strokeDasharray={`${(invoicePercent * 238.7) / 100} 238.7`} strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="14"
                    strokeDasharray={`${(paymentPercent * 238.7) / 100} 238.7`}
                    strokeDashoffset={`-${(invoicePercent * 238.7) / 100}`} />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#60A5FA" strokeWidth="14"
                    strokeDasharray={`${(disputePercent * 238.7) / 100} 238.7`}
                    strokeDashoffset={`-${((invoicePercent + paymentPercent) * 238.7) / 100}`} />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="#93C5FD" strokeWidth="14"
                    strokeDasharray={`${(spamPercent * 238.7) / 100} 238.7`}
                    strokeDashoffset={`-${((invoicePercent + paymentPercent + disputePercent) * 238.7) / 100}`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900 leading-none">{totalEmails}</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Matched</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-xs w-full min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-700 shrink-0"></span>
                    <span className="text-slate-600 font-medium truncate">Invoice</span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{invoiceCount} ({invoicePercent}%)</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0"></span>
                    <span className="text-slate-600 font-medium truncate">Payment</span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{paymentCount} ({paymentPercent}%)</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-400 shrink-0"></span>
                    <span className="text-slate-600 font-medium truncate">Dispute</span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{disputeCount} ({disputePercent}%)</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-300 shrink-0"></span>
                    <span className="text-slate-600 font-medium truncate">Spam</span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{spamCount} ({spamPercent}%)</span>
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 shrink-0"></span>
                    <span className="text-slate-600 font-medium truncate">Review</span>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">{reviewCount} ({reviewPercent}%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Email Processing Pipeline */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Processing Pipeline</h2>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
              {isDemo ? 'Demo' : 'Live Feed'}
            </span>
          </div>

          <div className="relative w-full h-48 pt-2 flex flex-col justify-center">
            {totalEmails === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400">No activity recorded for filtered set.</p>
              </div>
            ) : (
              <div className="space-y-4 px-2 w-full">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Auto-Approved Pipeline</span>
                    <span className="font-bold text-blue-600">{autoResolvedRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${autoResolvedRate}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Average AI Confidence</span>
                    <span className="font-bold text-slate-800">{avgConfidence}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${avgConfidence}%` }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Human Review Routing</span>
                    <span className="font-bold text-slate-800">{reviewPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full transition-all" style={{ width: `${reviewPercent}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[11px] font-medium text-slate-400 pt-3 border-t border-slate-50">
            <span>{totalEmails} in selection</span>
            <span>{automatedActions} automated</span>
            <span>{humanReviews} review</span>
          </div>
        </div>

        {/* Card 3: Real Recent Activity */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            <Link href="/dashboard/audit" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>

          <div className="space-y-3 min-w-0">
            {recentActivity.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-slate-400">No events logged for this selection.</p>
              </div>
            ) : (
              recentActivity.map((activity, i) => (
                <div key={activity.id || i} className="flex items-center justify-between gap-3 min-w-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 truncate" title={activity.description}>
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0">
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Email Operations Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden w-full min-w-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Recent Email Operations</h2>
          <Link href="/dashboard/inbox" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View All Emails →
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          {recentOperations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">No emails match the selected filters.</p>
              {isFiltered && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Sender</th>
                  <th className="py-3 px-6">Subject</th>
                  <th className="py-3 px-6">Intent</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Confidence</th>
                  <th className="py-3 px-6">Action</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Received</th>
                  <th className="py-3 px-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentOperations.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/email/${row.id}`}
                  >
                    <td className="py-4 px-6 font-semibold text-slate-700 max-w-[180px]">
                      <div className="font-bold text-slate-900 truncate">{row.fromName || row.from}</div>
                      <div className="text-[11px] text-slate-400 truncate">{row.from}</div>
                    </td>
                    <td className="py-4 px-6 max-w-[240px]">
                      <div className="font-bold text-slate-900 truncate">{row.subject}</div>
                      <div className="text-[11px] text-slate-400 truncate">{row.snippet || row.body?.substring(0, 60)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100 capitalize whitespace-nowrap">
                        {row.intent?.replace(/_/g, ' ') || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.priority === 'high'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : row.priority === 'medium'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.priority || 'Low'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 w-8">{row.confidence || 90}%</span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full"
                            style={{ width: `${row.confidence || 90}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800 capitalize whitespace-nowrap">{row.action?.replace(/_/g, ' ') || 'Automated'}</div>
                      <div className="text-[11px] text-slate-400 capitalize whitespace-nowrap">{row.handler || 'General'} Handler</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap ${
                          row.status === 'processed' || row.status === 'Completed'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span>{row.status === 'processed' || row.status === 'Completed' ? '✓' : '◷'}</span>
                        <span>{row.status === 'processed' ? 'Completed' : row.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                      {row.receivedAt ? new Date(row.receivedAt).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-4 px-4 text-right text-slate-400 group-hover:text-slate-600">
                      <span className="text-lg font-bold">⋮</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
