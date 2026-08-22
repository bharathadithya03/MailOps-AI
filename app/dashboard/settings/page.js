'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { PageHeader, Badge } from '@/components/ui';
import { getEmails } from '@/lib/firestore';
import { useDashboardFilter } from '@/app/dashboard/layout';

export default function SettingsPage() {
  const { setGmailConnected } = useDashboardFilter();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [gmailStatus, setGmailStatus] = useState({ connected: false, email: null, lastSyncedAt: null });
  const [connectingGmail, setConnectingGmail] = useState(false);
  const [syncingGmail, setSyncingGmail] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [liveEmails, setLiveEmails] = useState([]);

  // Check Gmail connection status & load live synchronized stats strictly for user.uid
  useEffect(() => {
    async function checkGmailAndStats() {
      if (!user?.uid) return;
      try {
        const [statusRes, emails] = await Promise.all([
          fetch(`/api/gmail/status?userId=${encodeURIComponent(user.uid)}`),
          getEmails(user.uid),
        ]);
        if (statusRes.ok) {
          const data = await statusRes.json();
          setGmailStatus(data);
        }
        setLiveEmails(emails || []);
      } catch (e) {
        console.warn('Gmail status & stats check error:', e);
      }
    }
    checkGmailAndStats();

    // Check query params for status messages from OAuth redirect
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('gmail') === 'connected') {
        const email = url.searchParams.get('email');
        setGmailStatus({ connected: true, email: email || 'Connected Account' });
        setGmailConnected(true);
        setSyncMessage('Gmail connected successfully! Click "Sync Emails" to load your mailbox.');
      } else if (url.searchParams.get('gmail') === 'error') {
        const msg = url.searchParams.get('msg') || 'Failed to connect Gmail.';
        setErrorMessage(msg);
      }
    }
  }, [user]);

  const handleConnectGmail = async () => {
    if (!user?.uid) {
      setErrorMessage('You must be logged in to connect Gmail.');
      return;
    }
    setConnectingGmail(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/gmail/auth-url?userId=${encodeURIComponent(user.uid)}`);
      const data = await res.json();

      if (data.configured && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setErrorMessage(
          data.message || 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local to complete Google OAuth authorization.'
        );
      }
    } catch (e) {
      setErrorMessage('Could not initiate Google OAuth flow. Check server connection.');
    } finally {
      setConnectingGmail(false);
    }
  };

  const handleDisconnectGmail = async () => {
    if (!user?.uid) return;
    try {
      const res = await fetch('/api/gmail/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      if (res.ok) {
        // Clear local storage for this user
        if (typeof window !== 'undefined') {
          localStorage.removeItem(`mailops_synced_emails_${user.uid}`);
        }
        setGmailStatus({ connected: false, email: null, lastSyncedAt: null });
        setGmailConnected(false);
        setLiveEmails([]);
        setSyncMessage('Gmail disconnected and email pipeline cleared.');
      }
    } catch (e) {
      setErrorMessage('Error disconnecting Gmail.');
    }
  };

  const handleSyncEmails = async () => {
    if (!user?.uid) return;
    setSyncingGmail(true);
    setSyncMessage('');
    setErrorMessage('');
    try {
      const res = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.emails && data.emails.length > 0 && typeof window !== 'undefined') {
          localStorage.setItem(`mailops_synced_emails_${user.uid}`, JSON.stringify(data.emails));
          setLiveEmails(data.emails);
        }
        setGmailConnected(true);
        setSyncMessage(`Successfully synchronized ${data.count} emails from Gmail!`);
        setGmailStatus((prev) => ({ ...prev, lastSyncedAt: data.syncedAt }));
      } else {
        setErrorMessage(data.error || 'Failed to sync emails from Gmail.');
      }
    } catch (e) {
      setErrorMessage('Error syncing emails.');
    } finally {
      setSyncingGmail(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Real operations metrics calculated dynamically from live dataset
  const totalEmails = liveEmails.length;
  const automatedCount = liveEmails.filter((e) => e.action === 'automated' || e.policyDecision === 'auto_approve').length;
  const autoPercent = totalEmails > 0 ? Math.round((automatedCount / totalEmails) * 100) : 0;
  const humanReviewCount = liveEmails.filter((e) => e.action === 'human_review' || e.policyDecision === 'human_review').length;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, integrations, and email synchronization"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Integrations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Profile Information</h3>

            {saved && (
              <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800">
                Profile updated successfully.
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.displayName || user?.email?.split('@')[0] || 'MailOps User'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email || 'user@domain.com'}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Role</label>
                  <input
                    type="text"
                    defaultValue={user?.role || 'Administrator'}
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Organization</label>
                  <input
                    type="text"
                    defaultValue="MailOps Workspace"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
              >
                Save Changes
              </button>
            </form>
          </div>

          {/* Email Integration Section */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Email Integration</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Connect your Gmail account via Google OAuth to synchronize emails and enable automated workflows.
            </p>

            {syncMessage && (
              <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{syncMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800 flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gmail Integration Card */}
              <div className="border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 bg-white hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">Gmail</p>
                      <p className="text-xs text-slate-400 font-normal mt-0.5">Google Workspace</p>
                    </div>
                  </div>

                  {gmailStatus.connected && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      <span>✓</span>
                      <span>Connected</span>
                    </span>
                  )}
                </div>

                {gmailStatus.connected ? (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-600 truncate">
                      <span className="text-slate-400">Account: </span>
                      <span className="font-semibold text-slate-800">{gmailStatus.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSyncEmails}
                        disabled={syncingGmail}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {syncingGmail ? 'Syncing...' : 'Sync Emails'}
                      </button>
                      <button
                        onClick={handleDisconnectGmail}
                        className="px-3 py-2 bg-white text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={handleConnectGmail}
                      disabled={connectingGmail}
                      className="w-full px-4 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{connectingGmail ? 'Opening Google Auth...' : 'Connect Gmail'}</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Outlook Integration Card */}
              <div className="border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-tight">Outlook</p>
                      <p className="text-xs text-slate-400 font-normal mt-0.5">Microsoft 365</p>
                    </div>
                  </div>
                  <Badge>Coming Soon</Badge>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400">Microsoft Graph API integration in development.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Account Details & Live Usage */}
        <div className="space-y-6">
          {/* Account Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-700 font-extrabold text-2xl shadow-inner">
              {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {user?.displayName || user?.email?.split('@')[0] || 'MailOps User'}
            </h4>
            <p className="text-xs text-slate-400 font-normal mb-3">{user?.email || 'user@domain.com'}</p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              Active Member
            </span>
          </div>

          {/* Live Operations Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Pipeline Operations</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Synchronized Emails</span>
                <span className="font-bold text-slate-900">{totalEmails}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min(totalEmails * 10, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs pt-2">
                <span className="text-slate-500 font-medium">Auto-Resolutions</span>
                <span className="font-bold text-slate-900">{autoPercent}% ({automatedCount})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Human Escalations</span>
                <span className="font-bold text-slate-900">{humanReviewCount} cases</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
