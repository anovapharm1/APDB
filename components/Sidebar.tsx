'use client';

import React from 'react';
import {
  Table, Trello, BarChart3, Activity, Sparkles,
  Users, Settings, LogOut, Building, LogIn, X,
  CalendarCheck, ListChecks, BriefcaseBusiness, ContactRound, ClipboardList, FileBarChart, Database
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const navSections = [
  {
    label: 'Work',
    items: [
      { id: 'today', label: 'Today', icon: CalendarCheck },
      { id: 'spreadsheet', label: 'Leads', icon: Table },
      { id: 'followups', label: 'Follow-ups', icon: ListChecks },
      { id: 'opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
      { id: 'accounts', label: 'Accounts', icon: ContactRound },
    ],
  },
  {
    label: 'Review',
    items: [
      { id: 'kanban', label: 'Pipeline Board', icon: Trello },
      { id: 'activities', label: 'Activities', icon: ClipboardList },
      { id: 'dashboard', label: 'Analytics', icon: BarChart3 },
      { id: 'volume', label: 'Outreach Volume', icon: Activity },
      { id: 'reports', label: 'Reports', icon: FileBarChart },
    ],
  },
  {
    label: 'Manage',
    items: [
      { id: 'letters', label: 'Letter Gen', icon: Sparkles },
      { id: 'lead-management', label: 'Lead Management', icon: Users },
      { id: 'data-quality', label: 'Data Quality', icon: Database },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ activeTab, setActiveTab, isMobileOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[min(82vw,288px)] shrink-0 flex-col overflow-y-auto border-r border-[#E5E7EB] bg-white transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-screen md:w-[216px] md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111]">
              <Building className="h-4 w-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#111]">Pipeline</h1>
              <p className="text-xs text-[#9CA3AF]">ANOVA CRM</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[#9CA3AF] hover:bg-[#F5F5F4] hover:text-[#1F2937] md:hidden" aria-label="Close navigation">
            <X className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 p-3">
          {navSections.map(section => (
            <div key={section.label}>
              <span className="mb-2 block px-3 text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">{section.label}</span>
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveTab(item.id); onClose?.(); }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-[#F3F4F6] text-[#1F2937]'
                          : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#1F2937]'
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#E5E7EB] p-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5E7EB]">
                <Users className="h-4 w-4 text-[#6B7280]" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#1F2937]">{user.name}</p>
                <p className="truncate text-xs text-[#9CA3AF]">{user.role}</p>
              </div>
              <button onClick={logout} className="rounded-lg p-1 text-[#9CA3AF] transition-aesthetic hover:bg-[#E5E7EB] hover:text-[#1F2937]" aria-label="Sign out">
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => window.location.href = '/login'}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] transition-all hover:bg-[#F9FAFB] hover:text-[#1F2937]"
            >
              <LogIn className="h-4 w-4" strokeWidth={1.5} />
              Sign In
            </button>
          )}
        </div>
      </aside>
      {isMobileOpen && (
        <button onClick={onClose} className="fixed inset-0 z-40 bg-[#1F2937]/20 md:hidden" aria-label="Close navigation overlay" />
      )}
    </>
  );
}
