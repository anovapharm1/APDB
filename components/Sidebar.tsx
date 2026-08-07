'use client';

import React from 'react';
import {
  Table, Trello, BarChart3, Activity, Sparkles,
  Users, Settings, LogOut, Building, LogIn,
  CalendarCheck, ListChecks, BriefcaseBusiness, ContactRound, ClipboardList, FileBarChart, Database
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
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

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-[216px] h-screen bg-white border-r border-[#E5E7EB] flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#111] flex items-center justify-center">
            <Building className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-[#111]">Pipeline</h1>
            <p className="text-xs text-[#9CA3AF]">ANOVA CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6">
        {navSections.map(section => (
          <div key={section.label}>
            <span className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider px-3 mb-2 block">
              {section.label}
            </span>
            <div className="space-y-1">
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#F3F4F6] text-[#1F2937]'
                        : 'text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F9FAFB]'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#E5E7EB]">
        {user ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#E5E7EB] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1F2937] truncate">{user.name}</p>
              <p className="text-xs text-[#9CA3AF] truncate">{user.role}</p>
            </div>
            <button onClick={logout} className="p-1 text-[#9CA3AF] hover:text-[#1F2937] rounded-lg hover:bg-[#E5E7EB] transition-aesthetic">
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F9FAFB] transition-all"
          >
            <LogIn className="w-4 h-4" strokeWidth={1.5} />
            Sign In
          </button>
        )}
      </div>
    </aside>
  );
}
