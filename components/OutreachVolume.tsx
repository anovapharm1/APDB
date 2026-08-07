'use client';

import React, { useState, useMemo } from 'react';
import { Lead, OutreachMethod, PipelineStage } from '@/types/lead';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface OutreachVolumeProps { leads: Lead[]; }

type Period = 'daily' | 'weekly' | 'monthly';

const OUTREACH_METHODS: OutreachMethod[] = ['Letters Sent', 'Cold Message Sent', 'Cold Call Made', 'In Person Visit'];
const DOWNSTREAM_STAGES: PipelineStage[] = ['Response', 'Meeting Had', 'Prospect Closed'];

const METHOD_COLORS: Record<string, string> = {
  'Letters Sent': '#1F6C9F',
  'Cold Message Sent': '#6366F1',
  'Cold Call Made': '#F59E0B',
  'In Person Visit': '#10B981',
};

export default function OutreachVolume({ leads }: OutreachVolumeProps) {
  const [period, setPeriod] = useState<Period>('weekly');

  const { timeSeries, methodSummary } = useMemo(() => {
    // Compute time-series data
    const sorted = [...leads].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sorted.length === 0) return { timeSeries: [], methodSummary: [] };

    // Bucket leads by period
    const bucketKey = (date: Date): string => {
      if (period === 'daily') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (period === 'weekly') {
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay());
        return start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    };

    const bucketSortKey = (date: Date): number => date.getTime();

    // Build buckets
    const buckets = new Map<string, { date: Date; outreach: Record<string, number>; response: number; meeting: number; closed: number }>();
    
    for (const lead of sorted) {
      const date = new Date(lead.createdAt);
      const key = bucketKey(date);
      
      if (!buckets.has(key)) {
        buckets.set(key, { date, outreach: { 'Letters Sent': 0, 'Cold Message Sent': 0, 'Cold Call Made': 0, 'In Person Visit': 0 }, response: 0, meeting: 0, closed: 0 });
      }
      
      const bucket = buckets.get(key)!;
      const method = lead.outreachMethod;
      if (lead.outreachCompleted) {
        bucket.outreach[method] = (bucket.outreach[method] || 0) + 1;
      }
      
      if (lead.stage === 'Response' || lead.stage === 'Meeting Had' || lead.stage === 'Prospect Closed') bucket.response += 1;
      if (lead.stage === 'Meeting Had' || lead.stage === 'Prospect Closed') bucket.meeting += 1;
      if (lead.stage === 'Prospect Closed') bucket.closed += 1;
    }

    // For monthly view, fill all 12 months of the year
    if (period === 'monthly') {
      const year = new Date().getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let m = 0; m < 12; m++) {
        const key = `${monthNames[m]} ${String(year).slice(-2)}`;
        if (!buckets.has(key)) {
          buckets.set(key, {
            date: new Date(year, m, 1),
            outreach: { 'Letters Sent': 0, 'Cold Message Sent': 0, 'Cold Call Made': 0, 'In Person Visit': 0 },
            response: 0, meeting: 0, closed: 0,
          });
        }
      }
    }

    const timeSeries = Array.from(buckets.entries())

    // Method summary
    const methodSummary = OUTREACH_METHODS.map(method => {
      const methodLeads = leads.filter(l => l.outreachMethod === method && l.outreachCompleted);
      const total = methodLeads.length;
      const responded = methodLeads.filter(l => l.stage === 'Response' || l.stage === 'Meeting Had' || l.stage === 'Prospect Closed').length;
      const met = methodLeads.filter(l => l.stage === 'Meeting Had' || l.stage === 'Prospect Closed').length;
      const closed = methodLeads.filter(l => l.stage === 'Prospect Closed').length;
      return {
        method,
        total,
        responded,
        meeting: met,
        closed,
        responseRate: total > 0 ? Math.round((responded / total) * 100) : 0,
        meetingRate: total > 0 ? Math.round((met / total) * 100) : 0,
        closeRate: total > 0 ? Math.round((closed / total) * 100) : 0,
      };
    }).filter(m => m.total > 0);

    return { timeSeries, methodSummary };
  }, [leads, period]);

  const totalOutreaches = leads.filter(l => l.outreachCompleted).length;
  const totalResponses = leads.filter(l => l.stage === 'Response' || l.stage === 'Meeting Had' || l.stage === 'Prospect Closed').length;
  const totalMeetings = leads.filter(l => l.stage === 'Meeting Had' || l.stage === 'Prospect Closed').length;
  const totalClosed = leads.filter(l => l.stage === 'Prospect Closed').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 space-y-1.5">
          <span className="text-xs text-[#787774] font-mono">Total Outreaches</span>
          <div className="text-2xl font-bold font-mono text-[#111]">{totalOutreaches}</div>
          <span className="text-xs text-[#B8B8B8]">across all methods</span>
        </div>
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 space-y-1.5">
          <span className="text-xs text-[#787774] font-mono">Responses Received</span>
          <div className="text-2xl font-bold font-mono text-[#1F6C9F]">{totalResponses}</div>
          <span className="text-xs text-[#B8B8B8]">{totalOutreaches > 0 ? Math.round(totalResponses/totalOutreaches*100) : 0}% response rate</span>
        </div>
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 space-y-1.5">
          <span className="text-xs text-[#787774] font-mono">Meetings Held</span>
          <div className="text-2xl font-bold font-mono text-[#6366F1]">{totalMeetings}</div>
          <span className="text-xs text-[#B8B8B8]">{totalOutreaches > 0 ? Math.round(totalMeetings/totalOutreaches*100) : 0}% meeting rate</span>
        </div>
        <div className="bg-white border border-[#EAEAEA] rounded-xl p-5 space-y-1.5">
          <span className="text-xs text-[#787774] font-mono">Prospects Closed</span>
          <div className="text-2xl font-bold font-mono text-[#10B981]">{totalClosed}</div>
          <span className="text-xs text-[#B8B8B8]">{totalOutreaches > 0 ? Math.round(totalClosed/totalOutreaches*100) : 0}% close rate</span>
        </div>
      </div>

      {/* Time Series Chart + Period Selector */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-medium text-[#111]">Outreach Volume Over Time</h2>
            <p className="text-xs text-[#787774] mt-0.5">Track outreach activity and downstream conversion by period</p>
          </div>
          <div className="flex gap-1 bg-[#F5F5F4] rounded-lg p-1 border border-[#EAEAEA]">
            {(['daily', 'weekly', 'monthly'] as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-aesthetic ${period === p ? 'bg-white text-[#111] border border-[#EAEAEA] shadow-sm' : 'text-[#787774] hover:text-[#111]'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeSeries} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEAEA" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#787774' }} interval={0} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#787774' }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #EAEAEA', borderRadius: '8px', color: '#111', fontSize: '12px', boxShadow: 'none' }} />
              {OUTREACH_METHODS.map(m => (
                <Bar key={m} dataKey={m} stackId="a" fill={METHOD_COLORS[m]} radius={[0,0,0,0]}
                  label={{ position: 'inside', fill: '#ffffff', fontSize: 11, fontWeight: 600, formatter: (v: number) => v > 0 ? v : '' }} />
              ))}
              <Bar dataKey="closed" stackId="b" fill="#10B981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#EAEAEA] text-xs text-[#787774]">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#1F6C9F]" /> Letters</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#6366F1]" /> Cold Message</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#F59E0B]" /> Cold Call</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#10B981]" /> In Person</div>
          <div className="flex items-center gap-2 ml-auto"><div className="w-3 h-3 rounded-sm bg-[#10B981]" /> Closed</div>
        </div>
      </div>

      {/* Method Breakdown Table */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#EAEAEA] bg-[#F9F9F8]">
          <h3 className="text-xs text-[#787774] font-mono tracking-wider">OUTREACH METHOD BREAKDOWN</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EAEAEA] text-xs text-[#787774] uppercase tracking-wider font-medium">
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Volume</th>
                <th className="px-5 py-3">Responses</th>
                <th className="px-5 py-3">Response Rate</th>
                <th className="px-5 py-3">Meetings</th>
                <th className="px-5 py-3">Meeting Rate</th>
                <th className="px-5 py-3">Closed</th>
                <th className="px-5 py-3">Close Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {methodSummary.map(m => (
                <tr key={m.method} className="hover:bg-[#F9F9F8] transition-aesthetic">
                  <td className="px-5 py-3 font-medium text-[#111]">{m.method}</td>
                  <td className="px-5 py-3 font-mono font-semibold text-[#2F3437]">{m.total}</td>
                  <td className="px-5 py-3 font-mono text-[#1F6C9F]">{m.responded}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1F6C9F] rounded-full" style={{ width: `${m.responseRate}%` }} />
                      </div>
                      <span className="font-mono text-xs text-[#787774]">{m.responseRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-[#6366F1]">{m.meeting}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${m.meetingRate}%` }} />
                      </div>
                      <span className="font-mono text-xs text-[#787774]">{m.meetingRate}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-[#10B981]">{m.closed}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-[#F5F5F4] rounded-full overflow-hidden">
                        <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${m.closeRate}%` }} />
                      </div>
                      <span className="font-mono text-xs text-[#787774]">{m.closeRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Funnel Summary */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-5">
        <h3 className="text-xs text-[#787774] font-mono tracking-wider mb-4">CONVERSION FUNNEL</h3>
        <div className="flex items-end gap-3">
          {[
            { label: 'Outreach', count: totalOutreaches, pct: 100, color: '#1F6C9F' },
            { label: 'Response', count: totalResponses, pct: totalOutreaches > 0 ? Math.round(totalResponses/totalOutreaches*100) : 0, color: '#6366F1' },
            { label: 'Meeting', count: totalMeetings, pct: totalOutreaches > 0 ? Math.round(totalMeetings/totalOutreaches*100) : 0, color: '#F59E0B' },
            { label: 'Closed', count: totalClosed, pct: totalOutreaches > 0 ? Math.round(totalClosed/totalOutreaches*100) : 0, color: '#10B981' },
          ].map((stage, i) => (
            <div key={stage.label} className="flex-1 text-center">
              <div className="relative mb-2">
                <div className="bg-[#F5F5F4] rounded-lg overflow-hidden" style={{ height: '120px' }}>
                  <div className="absolute bottom-0 w-full rounded-lg transition-all duration-500" 
                    style={{ height: `${stage.pct}%`, backgroundColor: stage.color, opacity: 0.85 }} />
                </div>
              </div>
              <div className="text-lg font-bold font-mono text-[#111]">{stage.count}</div>
              <div className="text-xs text-[#787774]">{stage.label}</div>
              <div className="text-xs font-mono text-[#B8B8B8]">{stage.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}