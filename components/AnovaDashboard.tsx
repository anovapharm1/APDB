'use client';

import React, { useState } from 'react';
import { Lead, PipelineStage } from '@/types/lead';
import { Users, Target, Calendar, TrendingUp, Mail, Phone, MessageCircle, Send, BarChart3, PieChart as PieChartIcon, CheckCircle, Clock, Award, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Card from '@/components/dashboard/Card';
import KPICard from '@/components/dashboard/KPICard';
import ChartCard from '@/components/dashboard/ChartCard';
import AnalyticsTable from '@/components/dashboard/AnalyticsTable';
import PipelineViz from '@/components/dashboard/PipelineViz';

interface PipelineDashboardProps { leads: Lead[]; }

const COLORS = ['#1F6C9F', '#6366F1', '#A855F7', '#F59E0B', '#10B981', '#EF4444'];
const OUTREACH_STAGES: PipelineStage[] = ['Lead Pending', 'Letter Written', 'Letter Sent'];
const STAGES: PipelineStage[] = [
  'Lead Pending', 'Letter Written', 'Letter Sent',
  'Response', 'Meeting Had', 'Prospect Closed'
];

const STAGE_COLORS: Record<string, string> = {
  'Lead Pending': '#B8B8B8',
  'Letter Written': '#1F6C9F',
  'Letter Sent': '#346538',
  'Response': '#956400',
  'Meeting Had': '#9F2F2D',
  'Prospect Closed': '#787774',
};

export default function AnovaDashboard({ leads }: PipelineDashboardProps) {
  const [groupBy, setGroupBy] = useState<'stage' | 'priority' | 'assignedTo'>('stage');
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const totalLeads = leads.length;
  const atResponseOrBeyond = leads.filter(l =>
    l.stage === 'Response' || l.stage === 'Meeting Had' || l.stage === 'Prospect Closed'
  ).length;
  const atMeetingOrBeyond = leads.filter(l =>
    l.stage === 'Meeting Had' || l.stage === 'Prospect Closed'
  ).length;
  const closedCount = leads.filter(l => l.stage === 'Prospect Closed').length;
  const outreachStageCount = leads.filter(l => OUTREACH_STAGES.includes(l.stage)).length;
  const outreachCompleted = leads.filter(l => l.outreachCompleted).length;
  const responseRate = totalLeads > 0 ? Math.round((atResponseOrBeyond / totalLeads) * 100) : 0;
  const meetingRate = totalLeads > 0 ? Math.round((atMeetingOrBeyond / totalLeads) * 100) : 0;
  const closedRate = totalLeads > 0 ? Math.round((closedCount / totalLeads) * 100) : 0;

  // Activity KPIs: each recorded activity is a touch, while the lead boolean
  // remains a completion flag for the first-touch workflow.
  const allActivities = leads.flatMap(l => l.activities || []);
  const totalOutreachAttempts = allActivities.filter(a => ['Call', 'Email', 'Meeting'].includes(a.type)).length + outreachCompleted;
  const emailsSent = allActivities.filter(a => a.type === 'Email').length;
  const callsMade = allActivities.filter(a => a.type === 'Call').length;
  const smsSent = 0;
  const linkedinMessages = 0;
  const newProspectsAdded = leads.filter(l => (Date.now() - new Date(l.createdAt).getTime()) <= 7 * 86400000).length;
  const followUpsCompleted = allActivities.filter(a => ['Call', 'Email', 'Meeting'].includes(a.type)).length;
  const today = new Date().toISOString().slice(0, 10);
  const followUpsDueToday = leads.filter(l => l.nextActionAt?.slice(0, 10) === today && l.followUpStatus !== 'Completed').length;
  const overdueFollowUps = leads.filter(l => !!l.nextActionAt && l.nextActionAt < new Date().toISOString() && l.followUpStatus !== 'Completed').length;
  const tasksCompleted = leads.filter(l => l.followUpStatus === 'Completed').length;
  const outreachGoalProgress = Math.round((outreachCompleted / 50) * 100);

  // Long-cycle clinic sales metrics. Empty values remain honest instead of
  // displaying synthetic averages when the event history is insufficient.
  const dayAverage = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  const firstResponses = leads.filter(l => l.firstResponseAt).map(l => (new Date(l.firstResponseAt!).getTime() - new Date(l.createdAt).getTime()) / 86400000);
  const meetingBookingTimes = leads.filter(l => l.meetingBookedAt).map(l => (new Date(l.meetingBookedAt!).getTime() - new Date(l.createdAt).getTime()) / 86400000);
  const avgDaysToFirstResponse = dayAverage(firstResponses);
  const avgDaysToBookMeeting = dayAverage(meetingBookingTimes);
  const followUpIntervals = allActivities.slice(1).map((activity, index) => Math.abs(new Date(activity.timestamp).getTime() - new Date(allActivities[index].timestamp).getTime()) / 86400000);
  const avgDaysBetweenFollowUps = dayAverage(followUpIntervals);
  const oldestLeadDate = leads.length ? Math.min(...leads.map(l => new Date(l.createdAt).getTime())) : Date.now();
  const activeDays = Math.max(1, Math.ceil((Date.now() - oldestLeadDate) / 86400000));
  const avgOutreachPerDay = Math.round(totalOutreachAttempts / activeDays);
  const dailyGoalCompletion = Math.min(100, Math.round((allActivities.filter(a => a.timestamp.slice(0, 10) === today).length / 5) * 100));
  const weeklyGoalCompletion = Math.min(100, Math.round((allActivities.filter(a => new Date(a.timestamp).getTime() >= Date.now() - 7 * 86400000).length / 25) * 100));
  const monthlyGoalCompletion = Math.min(100, Math.round((allActivities.filter(a => new Date(a.timestamp).getTime() >= Date.now() - 30 * 86400000).length / 100) * 100));
  const activityVsGoal = Math.round((outreachCompleted / 50) * 100);

  // Funnel KPIs
  const positiveResponses = leads.filter(l => l.stage === 'Response' || l.stage === 'Meeting Had' || l.stage === 'Prospect Closed').length;
  const positiveResponseRate = atResponseOrBeyond > 0 ? Math.round((positiveResponses / atResponseOrBeyond) * 100) : 0;
  const showRate = atMeetingOrBeyond > 0 ? Math.round((atMeetingOrBeyond / positiveResponses) * 100) : 0;
  const qualifiedOpps = leads.filter(l => l.stage === 'Meeting Had' || l.stage === 'Prospect Closed').length;
  const qualifiedOppRate = positiveResponses > 0 ? Math.round((qualifiedOpps / positiveResponses) * 100) : 0;
  const proposalRate = qualifiedOpps > 0 ? Math.round((closedCount / qualifiedOpps) * 100) : 0;

  // Pipeline KPIs
  const activeProspects = leads.filter(l => !['Prospect Closed', 'Lead Pending'].includes(l.stage)).length;
  const awaitingFollowUp = leads.filter(l => l.stage === 'Letter Sent' || l.stage === 'Response').length;
  const meetingsScheduled = leads.filter(l => l.stage === 'Meeting Had').length;
  const dealsWon = closedCount;
  const dealsLost = leads.filter(l => l.stage === 'Response').length;
  const avgTouchesPerProspect = totalLeads > 0 ? Math.round(totalOutreachAttempts / totalLeads) : 0;
  // Backsolve the operating plan from a target and an editable historical
  // average value per win. The planning assumptions stay visible to managers.
  const [annualTarget, setAnnualTarget] = useState(100_000_000);
  const [averageWinValue, setAverageWinValue] = useState(250_000);
  const targetWins = Math.ceil(annualTarget / Math.max(1, averageWinValue));
  const observedWinRate = totalLeads > 0 ? closedCount / totalLeads : 0;
  const observedMeetingRate = totalLeads > 0 ? atMeetingOrBeyond / totalLeads : 0;
  const observedResponseRate = totalLeads > 0 ? atResponseOrBeyond / totalLeads : 0;
  const requiredQualified = Math.ceil(targetWins / Math.max(0.01, observedWinRate));
  const requiredMeetings = Math.ceil(requiredQualified / Math.max(0.01, observedMeetingRate));
  const requiredResponses = Math.ceil(requiredMeetings / Math.max(0.01, observedResponseRate));
  const requiredFirstTouches = Math.ceil(requiredResponses / Math.max(0.01, responseRate / 100));
  const leakage = [
    { label: 'First touch to response', entered: outreachCompleted, advanced: atResponseOrBeyond, rate: outreachCompleted ? Math.round((atResponseOrBeyond / outreachCompleted) * 100) : 0 },
    { label: 'Response to meeting', entered: atResponseOrBeyond, advanced: atMeetingOrBeyond, rate: atResponseOrBeyond ? Math.round((atMeetingOrBeyond / atResponseOrBeyond) * 100) : 0 },
    { label: 'Meeting to close', entered: atMeetingOrBeyond, advanced: closedCount, rate: atMeetingOrBeyond ? Math.round((closedCount / atMeetingOrBeyond) * 100) : 0 },
  ];
  const staleLeads = leads.filter(l => {
    const latest = l.lastContactedAt || l.updatedAt || l.createdAt;
    return !['Won', 'Not a Fit', 'No Response'].includes(l.outcome || '') && Date.now() - new Date(latest).getTime() > 7 * 86400000;
  });
  const noNextAction = leads.filter(l => !['Won', 'Not a Fit', 'No Response'].includes(l.outcome || '') && !l.nextActionAt);
  const positiveWithoutMeeting = leads.filter(l => l.stage === 'Response' && !l.meetingBookedAt);
  const meetingsWithoutFollowUp = leads.filter(l => l.stage === 'Meeting Had' && l.followUpStatus !== 'Completed');
  const reps = Array.from(new Set(leads.map(l => l.assignedTo).filter(Boolean))).map(rep => {
    const repLeads = leads.filter(l => l.assignedTo === rep);
    const repWon = repLeads.filter(l => l.outcome === 'Won' || l.stage === 'Prospect Closed').length;
    const repTouches = repLeads.reduce((sum, l) => sum + (l.activities || []).filter(a => ['Call', 'Email', 'Meeting'].includes(a.type)).length, 0);
    const repOverdue = repLeads.filter(l => !!l.nextActionAt && l.nextActionAt < new Date().toISOString() && l.followUpStatus !== 'Completed').length;
    return { rep, leads: repLeads.length, won: repWon, winRate: repLeads.length ? Math.round((repWon / repLeads.length) * 100) : 0, touches: repTouches, overdue: repOverdue };
  });


  // Group data for charts
  const groupsMap = new Map<string, Lead[]>();
  leads.forEach(l => {
    const k = l[groupBy] || 'Unassigned';
    if (!groupsMap.has(k)) groupsMap.set(k, []);
    groupsMap.get(k)!.push(l);
  });

  const summary = Array.from(groupsMap.entries()).map(([name, g]) => {
    const count = g.length;
    const atResponse = g.filter(l =>
      l.stage === 'Response' || l.stage === 'Meeting Had' || l.stage === 'Prospect Closed'
    ).length;
    const atMeeting = g.filter(l =>
      l.stage === 'Meeting Had' || l.stage === 'Prospect Closed'
    ).length;
    const closed = g.filter(l => l.stage === 'Prospect Closed').length;
    return {
      name,
      count,
      responseRate: count > 0 ? Math.round((atResponse / count) * 100) : 0,
      meetingRate: count > 0 ? Math.round((atMeeting / count) * 100) : 0,
      closedRate: count > 0 ? Math.round((closed / count) * 100) : 0,
    };
  });

  const barData = summary.map(g => ({ name: g.name, count: g.count }));
  const pieData = summary.map(g => ({ name: g.name, value: g.count }));

  // Stage distribution for pipeline viz
  const pipelineStages = STAGES.map(s => {
    const count = leads.filter(l => l.stage === s).length;
    const prevCount = leads.filter(l => l.stage === STAGES[STAGES.indexOf(s) - 1]).length;
    const conversion = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
    const dropoff = prevCount > 0 ? 100 - conversion : 0;
    return {
      name: s,
      count,
      conversion,
      dropoff,
      color: STAGE_COLORS[s] || '#B8B8B8',
    };
  });

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111]">Analytics Dashboard</h1>
          <p className="mt-0.5 text-sm text-[#787774]">{totalLeads} total prospects in pipeline</p>
        </div>
        <div className="flex w-full items-center justify-between gap-1 rounded-lg border border-[#EAEAEA] bg-[#F5F5F4] p-1 sm:w-auto sm:justify-start">
          {(['daily', 'weekly', 'monthly'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-aesthetic sm:flex-none ${
                timeRange === range
                  ? 'border border-[#EAEAEA] bg-white text-[#111] shadow-sm'
                  : 'text-[#787774] hover:text-[#111]'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity KPIs - Leading Indicators */}
      <Card>
        <h2 className="text-xs text-[#787774] font-mono tracking-wider mb-4">ACTIVITY KPIs (LEADING INDICATORS)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <KPICard
            label="Total Outreach Attempts"
            value={totalOutreachAttempts}
            subtitle={`${outreachCompleted} completed`}
            icon={<Send className="w-4 h-4 text-[#1F6C9F]" strokeWidth={1.5} />}
            color="#1F6C9F"
          />
          <KPICard
            label="Emails Sent"
            value={emailsSent}
            subtitle="Cold messages"
            icon={<Mail className="w-4 h-4 text-[#6366F1]" strokeWidth={1.5} />}
            color="#6366F1"
          />
          <KPICard
            label="Calls Made"
            value={callsMade}
            subtitle="Cold calls"
            icon={<Phone className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />}
            color="#F59E0B"
          />
          <KPICard
            label="Letters Sent"
            value={smsSent}
            subtitle="Physical mail"
            icon={<Send className="w-4 h-4 text-[#10B981]" strokeWidth={1.5} />}
            color="#10B981"
          />
          <KPICard
            label="New Prospects Added"
            value={newProspectsAdded}
            subtitle="Last 7 days"
            icon={<Users className="w-4 h-4 text-[#A855F7]" strokeWidth={1.5} />}
            color="#A855F7"
          />
          <KPICard
            label="Follow-ups Due Today"
            value={followUpsDueToday}
            subtitle={`${followUpsCompleted} completed`}
            icon={<Clock className="w-4 h-4 text-[#EC4899]" strokeWidth={1.5} />}
            color="#EC4899"
          />
          <KPICard
            label="Overdue Follow-ups"
            value={overdueFollowUps}
            subtitle="Needs attention"
            icon={<Clock className="w-4 h-4 text-[#9F2F2D]" strokeWidth={1.5} />}
            color="#9F2F2D"
          />
          <KPICard
            label="Outreach Goal Progress"
            value={`${outreachGoalProgress}%`}
            subtitle={`${outreachCompleted} / 50`}
            icon={<Target className="w-4 h-4 text-[#10B981]" strokeWidth={1.5} />}
            color="#10B981"
          />
        </div>
      </Card>

      {/* Funnel KPIs */}
      <Card>
        <h2 className="text-xs text-[#787774] font-mono tracking-wider mb-4">FUNNEL KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Prospects"
            value={totalLeads}
            subtitle="All leads"
            icon={<Users className="w-4 h-4 text-[#1F6C9F]" strokeWidth={1.5} />}
            color="#1F6C9F"
          />
          <KPICard
            label="Response Rate"
            value={`${responseRate}%`}
            subtitle={`${atResponseOrBeyond} responded`}
            icon={<Mail className="w-4 h-4 text-[#6366F1]" strokeWidth={1.5} />}
            color="#6366F1"
          />
          <KPICard
            label="Meeting Booking Rate"
            value={`${meetingRate}%`}
            subtitle={`${atMeetingOrBeyond} booked`}
            icon={<Calendar className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />}
            color="#F59E0B"
          />
          <KPICard
            label="Close Rate"
            value={`${closedRate}%`}
            subtitle={`${closedCount} closed`}
            icon={<Target className="w-4 h-4 text-[#EF4444]" strokeWidth={1.5} />}
            color="#EF4444"
          />
        </div>
      </Card>

      {/* Pipeline KPIs */}
      <Card>
        <h2 className="text-xs text-[#787774] font-mono tracking-wider mb-4">PIPELINE KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Active Prospects"
            value={activeProspects}
            subtitle="In pipeline"
            icon={<Activity className="w-4 h-4 text-[#1F6C9F]" strokeWidth={1.5} />}
            color="#1F6C9F"
          />
          <KPICard
            label="Awaiting Follow-up"
            value={awaitingFollowUp}
            subtitle="Needs attention"
            icon={<Clock className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />}
            color="#F59E0B"
          />
          <KPICard
            label="Meetings Scheduled"
            value={meetingsScheduled}
            subtitle="This period"
            icon={<Calendar className="w-4 h-4 text-[#6366F1]" strokeWidth={1.5} />}
            color="#6366F1"
          />
          <KPICard
            label="Qualified Opportunities"
            value={qualifiedOpps}
            subtitle={`${qualifiedOppRate}% conversion`}
            icon={<Award className="w-4 h-4 text-[#10B981]" strokeWidth={1.5} />}
            color="#10B981"
          />
        </div>
      </Card>

      {/* Productivity KPIs */}
      <Card>
        <h2 className="text-xs text-[#787774] font-mono tracking-wider mb-4">PRODUCTIVITY KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Avg Touches per Prospect"
            value={avgTouchesPerProspect}
            subtitle="Multi-channel"
            icon={<Send className="w-4 h-4 text-[#1F6C9F]" strokeWidth={1.5} />}
            color="#1F6C9F"
          />
          <KPICard
            label="Avg Days to First Response"
            value={avgDaysToFirstResponse}
            subtitle="Days"
            icon={<Clock className="w-4 h-4 text-[#6366F1]" strokeWidth={1.5} />}
            color="#6366F1"
          />
          <KPICard
            label="Avg Days to Book Meeting"
            value={avgDaysToBookMeeting}
            subtitle="Days"
            icon={<Calendar className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />}
            color="#F59E0B"
          />
          <KPICard
            label="Activity vs Goal"
            value={`${activityVsGoal}%`}
            subtitle="On track"
            icon={<TrendingUp className="w-4 h-4 text-[#10B981]" strokeWidth={1.5} />}
            color="#10B981"
          />
        </div>
      </Card>

      {/* Goal & Performance Tracking */}
      <Card>
        <h2 className="text-xs text-[#787774] font-mono tracking-wider mb-4">GOAL & PERFORMANCE TRACKING</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Daily Goal Completion"
            value={`${dailyGoalCompletion}%`}
            subtitle="Today"
            icon={<CheckCircle className="w-4 h-4 text-[#10B981]" strokeWidth={1.5} />}
            color="#10B981"
          />
          <KPICard
            label="Weekly Goal Completion"
            value={`${weeklyGoalCompletion}%`}
            subtitle="This week"
            icon={<CheckCircle className="w-4 h-4 text-[#1F6C9F]" strokeWidth={1.5} />}
            color="#1F6C9F"
          />
          <KPICard
            label="Monthly Goal Completion"
            value={`${monthlyGoalCompletion}%`}
            subtitle="This month"
            icon={<CheckCircle className="w-4 h-4 text-[#6366F1]" strokeWidth={1.5} />}
            color="#6366F1"
          />
          <KPICard
            label="Activity vs Goal"
            value={`${activityVsGoal}%`}
            subtitle="Overall"
            icon={<BarChart3 className="w-4 h-4 text-[#F59E0B]" strokeWidth={1.5} />}
            color="#F59E0B"
          />
        </div>
      </Card>

      {/* Target operating plan */}
      <Card>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm font-medium text-[#111]">Target operating plan</h2>
            <p className="text-xs text-[#787774] mt-1">Backsolve the activity required to reach the annual target.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[#787774]">Target</label>
            <input type="number" value={annualTarget} onChange={e => setAnnualTarget(Number(e.target.value) || 0)} className="w-28 px-2 py-1.5 text-xs border border-[#E5E7EB] rounded-lg" />
            <label className="text-xs text-[#787774]">Avg win</label>
            <input type="number" value={averageWinValue} onChange={e => setAverageWinValue(Number(e.target.value) || 1)} className="w-24 px-2 py-1.5 text-xs border border-[#E5E7EB] rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[['Wins required', targetWins], ['Qualified opportunities', requiredQualified], ['Meetings required', requiredMeetings], ['Responses required', requiredResponses], ['First touches required', requiredFirstTouches]].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-[#F8F9FB] border border-[#EAEAEA] p-3">
              <p className="text-[11px] text-[#787774]">{label}</p>
              <p className="text-xl font-semibold text-[#111] mt-1">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Manager execution controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-medium text-[#111]">Funnel leakage</h2>
          <p className="text-xs text-[#787774] mt-1 mb-4">Where clinics stop advancing.</p>
          <div className="space-y-3">
            {leakage.map(item => (
              <div key={item.label} className="flex items-center justify-between border-b border-[#F0F0EF] pb-3">
                <div><p className="text-xs font-medium text-[#111]">{item.label}</p><p className="text-[11px] text-[#787774]">{item.advanced} of {item.entered} advanced</p></div>
                <span className="font-mono text-sm text-[#1F6C9F]">{item.rate}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-medium text-[#111]">Manager attention queue</h2>
          <p className="text-xs text-[#787774] mt-1 mb-4">Execution gaps in the long-cycle pipeline.</p>
          <div className="grid grid-cols-2 gap-3">
            {[['Stale 7+ days', staleLeads.length], ['No next action', noNextAction.length], ['Response, no meeting', positiveWithoutMeeting.length], ['Meeting, no follow-up', meetingsWithoutFollowUp.length]].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[#EAEAEA] p-3"><p className="text-[11px] text-[#787774]">{label}</p><p className="text-xl font-semibold text-[#111] mt-1">{value}</p></div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rep scorecard */}
      <Card>
        <h2 className="text-sm font-medium text-[#111]">Rep scorecard</h2>
        <p className="text-xs text-[#787774] mt-1 mb-4">Compare follow-through and conversion quality, not raw volume alone.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-[#787774] border-b border-[#EAEAEA]"><th className="py-2">Rep</th><th className="py-2 text-right">Prospects</th><th className="py-2 text-right">Touches</th><th className="py-2 text-right">Won</th><th className="py-2 text-right">Win rate</th><th className="py-2 text-right">Overdue</th></tr></thead>
            <tbody>{reps.map(row => <tr key={row.rep} className="border-b border-[#F0F0EF]"><td className="py-2 font-medium text-[#111]">{row.rep}</td><td className="py-2 text-right font-mono">{row.leads}</td><td className="py-2 text-right font-mono">{row.touches}</td><td className="py-2 text-right font-mono">{row.won}</td><td className="py-2 text-right font-mono text-[#1F6C9F]">{row.winRate}%</td><td className={`py-2 text-right font-mono ${row.overdue ? 'text-[#9F2F2D]' : 'text-[#346538]'}`}>{row.overdue}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Chart - Wide */}
        <div className="lg:col-span-2">
          <ChartCard title="Pipeline Distribution" subtitle="Leads by stage">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#787774' }} interval={0} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#787774' }} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #EAEAEA',
                    borderRadius: '8px',
                    color: '#111',
                    fontSize: '12px',
                    boxShadow: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#1F6C9F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Secondary Chart */}
        <div>
          <ChartCard title="Method Performance" subtitle="Outreach by method">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #EAEAEA',
                    borderRadius: '8px',
                    color: '#111',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Table */}
        <AnalyticsTable
          title="Pipeline Distribution"
          subtitle="Leads by stage"
          columns={[
            {
              key: 'stage',
              label: 'Stage',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[row.stage] || '#B8B8B8' }} />
                  <span className="font-medium text-[#111]">{row.stage}</span>
                </div>
              ),
            },
            { key: 'count', label: 'Leads', align: 'right', render: (row) => <span className="font-mono text-[#787774]">{row.count}</span> },
            {
              key: 'share',
              label: 'Share',
              align: 'right',
              render: (row) => (
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${row.share}%`, backgroundColor: STAGE_COLORS[row.stage] || '#B8B8B8' }}
                    />
                  </div>
                  <span className="text-xs text-[#B8B8B8] font-mono">{row.share}%</span>
                </div>
              ),
            },
            { key: 'conversion', label: 'Conversion', align: 'right', render: (row) => <span className="font-mono text-[#1F6C9F]">{row.conversion}%</span> },
          ]}
          data={pipelineStages.map(s => ({
            stage: s.name,
            count: s.count,
            share: totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0,
            conversion: s.conversion,
          }))}
        />

        {/* Group Summary Table */}
        <AnalyticsTable
          title="Segment Summary"
          subtitle={`Grouped by ${groupBy === 'assignedTo' ? 'Rep' : groupBy}`}
          columns={[
            {
              key: 'name',
              label: groupBy === 'assignedTo' ? 'Rep' : groupBy,
              render: (row) => <span className="font-medium text-[#111]">{row.name}</span>,
            },
            { key: 'count', label: 'Count', align: 'right', render: (row) => <span className="font-mono text-[#787774]">{row.count}</span> },
            { key: 'responseRate', label: 'Response', align: 'right', render: (row) => <span className="font-mono text-[#1F6C9F]">{row.responseRate}%</span> },
            { key: 'closedRate', label: 'Closed', align: 'right', render: (row) => <span className="font-mono text-[#9F2F2D]">{row.closedRate}%</span> },
          ]}
          data={summary}
        />
      </div>

      {/* Conversion Funnel */}
      <PipelineViz stages={pipelineStages} total={totalLeads} />

      {/* Group Controls */}
      <div className="flex items-center gap-1 bg-[#F5F5F4] rounded-lg p-1 border border-[#EAEAEA]">
        {(['stage', 'priority', 'assignedTo'] as const).map(group => (
          <button
            key={group}
            onClick={() => setGroupBy(group)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-aesthetic ${
              groupBy === group
                ? 'bg-white text-[#111] border border-[#EAEAEA] shadow-sm'
                : 'text-[#787774] hover:text-[#111]'
            }`}
          >
            {group === 'assignedTo' ? 'Rep' : group}
          </button>
        ))}
      </div>
    </div>
  );
}
