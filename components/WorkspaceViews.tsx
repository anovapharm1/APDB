'use client';

import React from 'react';
import { CalendarClock, CheckCircle2, CircleAlert, ClipboardList, Database, FileBarChart, Mail, UsersRound } from 'lucide-react';
import { Lead } from '@/types/lead';

interface WorkspaceViewsProps {
  view: string;
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

const day = 86400000;
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Not scheduled';

function LeadRows({ leads, onSelectLead, empty }: { leads: Lead[]; onSelectLead: (lead: Lead) => void; empty: string }) {
  if (!leads.length) return <div className="rounded-xl border border-dashed border-[#D8E1E6] px-5 py-10 text-center text-sm text-[#71808A]">{empty}</div>;
  return <div className="overflow-hidden rounded-xl border border-[#E1E8EC] bg-white divide-y divide-[#EDF1F3]">
    {leads.map(lead => <button key={lead.id} onClick={() => onSelectLead(lead)} className="grid w-full grid-cols-[1.5fr_1fr_0.8fr_0.7fr] items-center gap-4 px-4 py-3.5 text-left transition hover:bg-[#F8FAFB]">
      <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#26343C]">{lead.clinicName}</p><p className="truncate text-xs text-[#82919A]">{lead.ownerName || 'No decision maker'}</p></div>
      <p className="truncate text-xs text-[#63737C]">{lead.nextActionType || lead.outreachMethod}</p>
      <p className="text-xs text-[#63737C]">{formatDate(lead.nextActionAt || lead.lastContactedAt)}</p>
      <span className={`justify-self-end rounded-full px-2 py-1 text-[11px] font-medium ${lead.priority === 'High' ? 'bg-[#FFF1EF] text-[#A44237]' : 'bg-[#F1F5F6] text-[#62737D]'}`}>{lead.priority}</span>
    </button>)}
  </div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return <div className="rounded-xl border border-[#E1E8EC] bg-white p-4"><Icon className="mb-4 h-4 w-4 text-[#2B7393]" strokeWidth={1.7} /><p className="text-2xl font-semibold tracking-tight text-[#26343C]">{value}</p><p className="mt-1 text-xs text-[#7A8991]">{label}</p></div>;
}

export default function WorkspaceViews({ view, leads, onSelectLead }: WorkspaceViewsProps) {
  const now = Date.now();
  const due = leads.filter(lead => lead.nextActionAt && new Date(lead.nextActionAt).getTime() <= now && lead.followUpStatus !== 'Completed');
  const stale = leads.filter(lead => now - new Date(lead.updatedAt).getTime() > 7 * day && lead.stage !== 'Prospect Closed');
  const opportunities = leads.filter(lead => ['Response', 'Meeting Had', 'Prospect Closed'].includes(lead.stage));
  const dataIssues = leads.filter(lead => !lead.phone || !lead.ownerName || !lead.assignedTo || !lead.clinicWebsite);
  const activities = leads.flatMap(lead => lead.activities.map(activity => ({ lead, activity }))).sort((a, b) => new Date(b.activity.timestamp).getTime() - new Date(a.activity.timestamp).getTime());
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const lettersSentToday = leads.reduce((count, lead) => count + lead.activities.filter(activity => {
    const description = activity.description.toLowerCase();
    return new Date(activity.timestamp).getTime() >= startOfToday.getTime() && (description.includes('letter sent') || description.includes('letters sent'));
  }).length, 0);

  const title: Record<string, string> = { today: 'Today', followups: 'Follow-up Queue', opportunities: 'Opportunities', accounts: 'Accounts', activities: 'Activity Log', reports: 'Reports', 'data-quality': 'Data Quality' };
  const heading = title[view] || 'Today';

  if (view === 'activities') return <main className="mx-auto max-w-[1400px] p-0"><h1 className="mb-2 text-xl font-semibold text-[#26343C]">{heading}</h1><p className="mb-6 text-sm text-[#71808A]">Every recorded touch across the pipeline.</p><div className="rounded-xl border border-[#E1E8EC] bg-white divide-y divide-[#EDF1F3]">{activities.slice(0, 30).map(({ lead, activity }) => <button key={activity.id} onClick={() => onSelectLead(lead)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-[#F8FAFB]"><div className="mt-1 h-7 w-7 rounded-lg bg-[#EAF3F6] flex items-center justify-center text-[#2B7393]"><ClipboardList className="h-3.5 w-3.5" /></div><div className="flex-1"><p className="text-sm text-[#33434C]"><span className="font-semibold">{lead.clinicName}</span> {activity.description}</p><p className="mt-1 text-xs text-[#82919A]">{formatDate(activity.timestamp)}</p></div></button>)}</div></main>;

  if (view === 'accounts') return <main className="mx-auto max-w-[1400px] p-0"><h1 className="mb-2 text-xl font-semibold text-[#26343C]">{heading}</h1><p className="mb-6 text-sm text-[#71808A]">Clinic records and current relationship status.</p><LeadRows leads={leads} onSelectLead={onSelectLead} empty="No clinic accounts yet." /></main>;

  if (view === 'reports') return <main className="mx-auto max-w-[1400px] p-0"><h1 className="mb-2 text-xl font-semibold text-[#26343C]">{heading}</h1><p className="mb-6 text-sm text-[#71808A]">Operational summaries based on the current clinic records.</p><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Stat label="Total clinics" value={leads.length} icon={UsersRound} /><Stat label="Completed touches" value={leads.filter(l => l.outreachCompleted).length} icon={CheckCircle2} /><Stat label="Open opportunities" value={opportunities.filter(l => l.stage !== 'Prospect Closed').length} icon={FileBarChart} /><Stat label="Data issues" value={dataIssues.length} icon={Database} /></div></main>;

  if (view === 'data-quality') return <main className="mx-auto max-w-[1400px] p-0"><h1 className="mb-2 text-xl font-semibold text-[#26343C]">{heading}</h1><p className="mb-6 text-sm text-[#71808A]">Records that need cleanup before they are ready for outreach.</p><LeadRows leads={dataIssues} onSelectLead={onSelectLead} empty="All clinic records have the core fields." /></main>;

  const rows = view === 'followups' ? due : view === 'opportunities' ? opportunities : view === 'today' ? [...due, ...stale.filter(l => !due.some(d => d.id === l.id))] : due;
  return <main className="mx-auto max-w-[1400px] p-0"><div className="mb-6 flex items-end justify-between"><div><h1 className="text-xl font-semibold text-[#26343C]">{heading}</h1><p className="mt-1 text-sm text-[#71808A]">{view === 'today' ? 'The work that deserves attention first.' : view === 'opportunities' ? 'Active conversations and accounts moving toward a decision.' : 'Prioritized work from next-action dates and follow-up status.'}</p></div><CalendarClock className="h-5 w-5 text-[#2B7393]" strokeWidth={1.7} /></div><div className={`mb-6 grid gap-3 ${view === 'today' ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}><Stat label="Needs attention" value={due.length} icon={CircleAlert} /><Stat label="Stale over 7 days" value={stale.length} icon={CalendarClock} /><Stat label="Letters sent today" value={lettersSentToday} icon={Mail} /></div><LeadRows leads={rows} onSelectLead={onSelectLead} empty="Nothing needs attention here." /></main>;
}
