'use client';

import React, { useState } from 'react';
import { Lead, LeadActivity, PipelineStage } from '@/types/lead';
import { X, User, Plus, Clock, MapPin, Globe, Phone, Calendar, ArrowUpRight } from 'lucide-react';

interface LeadDetailModalProps {
  lead: Lead | null; onClose: () => void; onUpdateLead: (updated: Lead) => void;
}

const STAGES: PipelineStage[] = [
  'Lead Pending', 'Letter Written', 'Letter Sent',
  'Response', 'Meeting Had', 'Prospect Closed'
];

export default function LeadDetailModal({ lead, onClose, onUpdateLead }: LeadDetailModalProps) {
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<'Note' | 'Call' | 'Email' | 'Meeting'>('Note');
  if (!lead) return null;

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onUpdateLead({
      ...lead,
      activities: [{ id: 'act-'+Date.now(), type: noteType, description: newNote.trim(), timestamp: new Date().toISOString(), author: 'Current User' }, ...(lead.activities||[])],
      updatedAt: new Date().toISOString()
    });
    setNewNote('');
  };

  const handleStageChange = (newStage: PipelineStage) => {
    onUpdateLead({
      ...lead, stage: newStage, updatedAt: new Date().toISOString(),
      activities: [{ id: 'act-'+Date.now(), type: 'Stage Change', description: `Stage updated from ${lead.stage} to ${newStage}`, timestamp: new Date().toISOString(), author: 'Current User' }, ...(lead.activities||[])]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="my-3 w-full max-w-3xl rounded-xl border border-[#EAEAEA] bg-white shadow-xl sm:my-8">
        <div className="flex items-start justify-between border-b border-[#EAEAEA] px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-base font-semibold text-[#111]">{lead.clinicName}</h2>
            <p className="text-sm text-[#787774] mt-0.5">{lead.ownerName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-[#B8B8B8] hover:text-[#111] hover:bg-[#F5F5F4] rounded-lg transition-aesthetic">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid max-h-[85dvh] grid-cols-1 divide-y divide-[#EAEAEA] overflow-y-auto sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="space-y-6 p-4 sm:col-span-2 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="bg-[#F9F9F8] rounded-lg p-4 border border-[#EAEAEA]">
                <span className="text-xs text-[#787774] font-mono">Outreach Method</span>
                <div className="text-sm font-medium text-[#956400] mt-1">{lead.outreachMethod}</div>
              </div>
              <div className="bg-[#F9F9F8] rounded-lg p-4 border border-[#EAEAEA]">
                <span className="text-xs text-[#787774] font-mono">Stage</span>
                <div className="text-sm font-medium text-[#1F6C9F] mt-1">{lead.stage}</div>
              </div>
              <div className="bg-[#F9F9F8] rounded-lg p-4 border border-[#EAEAEA]">
                <span className="text-xs text-[#787774] font-mono">Outreach Completed</span>
                <div className={`text-sm font-medium mt-1 ${lead.outreachCompleted ? 'text-[#346538]' : 'text-[#9F2F2D]'}`}>{lead.outreachCompleted ? 'Yes' : 'No'}</div>
              </div>
            </div>

            <div>
              <label className="text-xs text-[#787774] font-medium mb-2 block">Move to Stage</label>
              <div className="flex flex-wrap gap-1.5">
                {STAGES.map(stg => (
                  <button key={stg} onClick={() => handleStageChange(stg)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-aesthetic ${
                      lead.stage === stg
                        ? 'bg-[#111] text-white border-[#111]'
                        : 'bg-white text-[#787774] border-[#EAEAEA] hover:border-[#D0D0D0] hover:text-[#111]'
                    }`}>{stg}</button>
                ))}
              </div>
            </div>

            <div className="bg-[#F9F9F8] rounded-lg p-4 border border-[#EAEAEA]">
              <h4 className="text-xs text-[#787774] font-mono mb-1">NOTES</h4>
              <p className="text-sm text-[#2F3437] leading-relaxed">{lead.notes || 'No notes entered.'}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs text-[#787774] font-mono tracking-wider">ACTIVITY LOG</h3>
              <form onSubmit={handleAddActivity} className="bg-[#F9F9F8] rounded-lg p-4 border border-[#EAEAEA] space-y-2">
                <div className="flex gap-2">
                  <select value={noteType} onChange={e => setNoteType(e.target.value as 'Note'|'Call'|'Email'|'Meeting')}
                    className="px-2 py-1 bg-white border border-[#EAEAEA] rounded-md text-xs text-[#2F3437] focus:outline-none">
                    <option>Note</option><option>Call</option><option>Email</option><option>Meeting</option>
                  </select>
                </div>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Log interaction..." rows={2}
                  className="w-full bg-white border border-[#EAEAEA] rounded-lg p-2.5 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:outline-none focus:border-[#1F6C9F]/30" />
                <div className="flex justify-end">
                  <button type="submit" className="px-3 py-1.5 bg-[#111] text-white rounded-lg text-xs font-medium hover:bg-[#2F3437] transition-aesthetic flex items-center gap-1">
                    <Plus className="w-3 h-3" strokeWidth={1.5} /> Log
                  </button>
                </div>
              </form>

              <div className="space-y-3 pl-2 border-l-2 border-[#EAEAEA]">
                {lead.activities?.length ? lead.activities.map(act => (
                  <div key={act.id} className="relative pl-3">
                    <div className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-white border-2 border-[#1F6C9F]/30" />
                    <div className="flex justify-between text-xs text-[#B8B8B8]">
                      <span className="font-medium text-[#787774]">{act.type} &middot; {act.author}</span>
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-[#2F3437] mt-0.5 bg-[#F9F9F8] p-2.5 rounded border border-[#EAEAEA]">{act.description}</p>
                  </div>
                )) : <p className="text-sm text-[#B8B8B8] italic pl-3">No activity yet.</p>}
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#F9F9F8] space-y-5">
            <h4 className="text-xs text-[#787774] font-mono tracking-wider">DETAILS</h4>
            <div className="space-y-4 text-sm">
              {[
                { icon: MapPin, color: '#9F2F2D', label: 'Address', value: lead.clinicAddress || '—' },
                { icon: User, color: '#1F6C9F', label: 'Owner', value: lead.ownerName || '—' },
                { icon: Globe, color: '#346538', label: 'Website', value: lead.clinicWebsite, link: true },
                { icon: Phone, color: '#956400', label: 'Phone', value: lead.phone || '—' },
                { icon: Calendar, color: '#787774', label: 'Created', value: new Date(lead.createdAt).toLocaleDateString() },
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5">
                  <item.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: item.color }} strokeWidth={1.5} />
                  <div>
                    <span className="text-xs text-[#B8B8B8] block">{item.label}</span>
                    {item.link && item.value ? (
                      <a href={item.value.startsWith('http') ? item.value : `https://${item.value}`} target="_blank" rel="noopener noreferrer"
                        className="text-[#1F6C9F] hover:underline font-mono text-xs break-all inline-flex items-center gap-1">{item.value}<ArrowUpRight className="w-3 h-3" strokeWidth={1.5} /></a>
                    ) : (
                      <span className="text-[#2F3437]">{item.value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}