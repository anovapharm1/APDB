'use client';

import React from 'react';
import { Lead, PipelineStage } from '@/types/lead';
import { Building, Plus, Download } from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[]; onSelectLead: (lead: Lead) => void;
  onUpdateStage: (leadId: string, newStage: PipelineStage) => void; onAddLead: () => void;
  onGenerateLabels: (leads: Lead[]) => void;
}

const STAGES: PipelineStage[] = [
  'Lead Pending', 'Letter Written', 'Letter Sent',
  'Response', 'Meeting Had', 'Prospect Closed'
];

const stageStyles: Record<string, string> = {
  'Lead Pending': 'bg-[#F5F5F4] text-[#787774]',
  'Letter Written': 'bg-[#E1F3FE] text-[#1F6C9F]',
  'Letter Sent': 'bg-[#EDF3EC] text-[#346538]',
  'Response': 'bg-[#E0F7FA] text-[#00695C]',
  'Meeting Had': 'bg-[#FFF8E1] text-[#F9A825]',
  'Prospect Closed': 'bg-[#F5F5F4] text-[#787774]',
};

export default function KanbanBoard({ leads, onSelectLead, onUpdateStage, onAddLead, onGenerateLabels }: KanbanBoardProps) {
  const getStageLeads = (s: PipelineStage) => leads.filter(l => l.stage === s);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, ts: PipelineStage) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) onUpdateStage(id, ts); };
  const handleDragStart = (e: React.DragEvent, leadId: string) => e.dataTransfer.setData('text/plain', leadId);

  const letterWrittenLeads = getStageLeads('Letter Written');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-[#111]">Pipeline Board</h2>
          <p className="text-sm text-[#787774] mt-0.5">Drag cards between stages</p>
        </div>
        <button onClick={onAddLead} className="px-3 py-1.5 bg-[#111] text-white rounded-lg text-xs font-medium hover:bg-[#2F3437] transition-aesthetic">
          <Plus className="w-3.5 h-3.5 inline mr-1" strokeWidth={1.5} /> Add
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[70vh]">
        {STAGES.map(stage => {
          const stageLeads = getStageLeads(stage);
          const isLetterWritten = stage === 'Letter Written';
          const isLeadPending = stage === 'Lead Pending';
          return (
            <div key={stage} onDragOver={handleDragOver} onDrop={e => handleDrop(e, stage)}
              className="w-72 flex-shrink-0 bg-white rounded-xl border border-[#EAEAEA] p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-[#787774] flex items-center gap-2 uppercase tracking-wider">
                  {stage}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${stageStyles[stage] || 'bg-[#F5F5F4] text-[#787774]'}`}>{stageLeads.length}</span>
                </h3>
                {isLeadPending && stageLeads.length > 0 && (
                  <button
                    onClick={() => stageLeads.forEach(lead => onUpdateStage(lead.id, 'Letter Written'))}
                    className="px-2 py-1 bg-[#1F6C9F] text-white rounded-lg text-xs font-medium hover:bg-[#1A5A8A] transition-aesthetic flex items-center gap-1"
                  >
                    Move All
                  </button>
                )}
                {isLetterWritten && stageLeads.length > 0 && (
                  <button
                    onClick={() => onGenerateLabels(stageLeads)}
                    className="px-2 py-1 bg-[#1F6C9F] text-white rounded-lg text-xs font-medium hover:bg-[#1A5A8A] transition-aesthetic flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" strokeWidth={1.5} />
                    Generate Label CSV
                  </button>
                )}
              </div>

              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[65vh]">
                {stageLeads.length === 0 ? (
                  <div className="h-20 border border-dashed border-[#EAEAEA] rounded-lg flex items-center justify-center text-xs text-[#B8B8B8]">Drop here</div>
                ) : stageLeads.map(lead => (
                  <div key={lead.id} draggable onDragStart={e => handleDragStart(e, lead.id)} onClick={() => onSelectLead(lead)}
                    className="bg-white p-4 rounded-lg border border-[#EAEAEA] hover:border-[#D0D0D0] transition-aesthetic cursor-grab active:cursor-grabbing space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-[#111] leading-snug">{lead.clinicName}</h4>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0 ${
                        lead.priority === 'High' ? 'bg-[#FDEBEC] text-[#9F2F2D]' :
                        lead.priority === 'Medium' ? 'bg-[#FBF3DB] text-[#956400]' :
                        'bg-[#F5F5F4] text-[#787774]'}`}>{lead.priority}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#787774]">
                      <Building className="w-3 h-3" strokeWidth={1.5} /> {lead.ownerName}
                    </div>
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#EAEAEA] text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${stageStyles[lead.outreachMethod] || 'bg-[#F5F5F4] text-[#787774]'}`}>{lead.outreachMethod}</span>
                      <span className="font-mono text-[#B8B8B8]">{lead.phone || '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
