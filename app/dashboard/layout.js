'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

export const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: () => {},
  toggleCollapsed: () => {},
});

export const DashboardFilterContext = createContext({
  dateRange: '7d',
  setDateRange: () => {},
  customStart: '',
  setCustomStart: () => {},
  customEnd: '',
  setCustomEnd: () => {},
  priority: 'all',
  setPriority: () => {},
  category: 'all',
  setCategory: () => {},
  status: 'all',
  setStatus: () => {},
  intent: 'all',
  setIntent: () => {},
  clearFilters: () => {},
  isFiltered: false,
  gmailConnected: false,
  gmailStatusLoading: true,
});

export const useSidebar = () => useContext(SidebarContext);
export const useDashboardFilter = () => useContext(DashboardFilterContext);

export default function DashboardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Filter States
  const [dateRange, setDateRange] = useState('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [priority, setPriority] = useState('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [intent, setIntent] = useState('all');

  // Gmail connection state — shared across all dashboard pages
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailStatusLoading, setGmailStatusLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mailops_sidebar_collapsed');
      if (stored !== null) {
        setCollapsed(stored === 'true');
      }
    } catch (e) {}
  }, []);

  // Check Gmail connection status on mount
  useEffect(() => {
    async function checkGmailStatus() {
      if (!user?.uid) {
        setGmailConnected(false);
        setGmailStatusLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/gmail/status?userId=${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const data = await res.json();
          setGmailConnected(Boolean(data.connected));
        } else {
          setGmailConnected(false);
        }
      } catch (e) {
        setGmailConnected(false);
      } finally {
        setGmailStatusLoading(false);
      }
    }
    checkGmailStatus();
  }, [user]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('mailops_sidebar_collapsed', String(next));
      } catch (e) {}
      return next;
    });
  };

  const clearFilters = () => {
    setDateRange('7d');
    setCustomStart('');
    setCustomEnd('');
    setPriority('all');
    setCategory('all');
    setStatus('all');
    setIntent('all');
  };

  const isFiltered =
    dateRange !== '7d' ||
    priority !== 'all' ||
    category !== 'all' ||
    status !== 'all' ||
    intent !== 'all' ||
    Boolean(customStart) ||
    Boolean(customEnd);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      <DashboardFilterContext.Provider
        value={{
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
          gmailConnected,
          setGmailConnected,
          gmailStatusLoading,
        }}
      >
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row w-full overflow-x-hidden">
          {/* Collapsible Sidebar */}
          <Sidebar collapsed={collapsed} toggleCollapsed={toggleCollapsed} />

          {/* Main Content Area */}
          <div
            className={`flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden transition-all duration-300 ${
              collapsed ? 'lg:ml-20' : 'lg:ml-64'
            }`}
          >
            <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 min-w-0 flex-1">
              <DashboardHeader />
              <main className="w-full min-w-0">{children}</main>
            </div>
          </div>
        </div>
      </DashboardFilterContext.Provider>
    </SidebarContext.Provider>
  );
}
