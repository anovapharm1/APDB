'use client';

import React, { useState, useRef } from 'react';
import { Lead, PipelineStage, OutreachMethod } from '@/types/lead';
import { Search, Plus, FileText, Trash2, Filter, Upload } from 'lucide-react';

interface ClinicSpreadsheetProps {
  leads: Lead[];
  onAddLead: (lead: Partial<Lead>) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onSelectLead: (lead: Lead) => void;
}

const STAGES: PipelineStage[] = [
  'Lead Pending', 'Letter Written', 'Letter Sent',
  'Response', 'Meeting Had', 'Prospect Closed'
];

const stageMeta: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  'Lead Pending':     { label: 'Lead Pending',     dot: '#B8B8B8', bg: 'bg-[#F5F5F4]', text: 'text-[#787774]' },
  'Letter Written':   { label: 'Letter Written',   dot: '#1F6C9F', bg: 'bg-[#EEF6FC]', text: 'text-[#1F6C9F]' },
  'Letter Sent':      { label: 'Letter Sent',      dot: '#346538', bg: 'bg-[#EDF6ED]', text: 'text-[#346538]' },
  'Response':         { label: 'Response',         dot: '#956400', bg: 'bg-[#FBF7EB]', text: 'text-[#956400]' },
  'Meeting Had':      { label: 'Meeting Had',      dot: '#9F2F2D', bg: 'bg-[#FDEBEC]', text: 'text-[#9F2F2D]' },
  'Prospect Closed':  { label: 'Prospect Closed',  dot: '#787774', bg: 'bg-[#F5F5F4]', text: 'text-[#787774]' },
};

const methodMeta: Record<string, { label: string; color: string }> = {
  'Letters Sent':       { label: 'Letters',       color: '#1F6C9F' },
  'Cold Message Sent':  { label: 'Cold Msg',      color: '#6366F1' },
  'Cold Call Made':     { label: 'Cold Call',     color: '#F59E0B' },
  'In Person Visit':    { label: 'In Person',     color: '#10B981' },
};

export default function ClinicSpreadsheet({
  leads, onAddLead, onUpdateLead, onDeleteLead, onSelectLead
}: ClinicSpreadsheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newRow, setNewRow] = useState<Partial<Lead>>({
    clinicName: '', clinicAddress: '', ownerName: '', clinicWebsite: '',
    notes: '', phone: '', stage: 'Lead Pending', priority: 'Medium', outreachMethod: 'Letters Sent', outreachCompleted: false
  });

  const addNewRow = () => {
    if (!newRow.clinicName?.trim()) return;
    onAddLead({
      ...newRow,
      assignedTo: 'Alex Mercer',
    });
    setNewRow({
      clinicName: '', clinicAddress: '', ownerName: '', clinicWebsite: '',
      notes: '', phone: '', stage: 'Lead Pending', priority: 'Medium', outreachMethod: 'Letters Sent', outreachCompleted: false
    });
  };

  const handleFieldChange = (lead: Lead, field: keyof Lead, value: unknown) => {
    onUpdateLead({ ...lead, [field]: value, updatedAt: new Date().toISOString() });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
      if (lines.length < 2) { setImporting(false); return; }
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      let nameIdx = headers.findIndex(h => h === 'name' || h === 'clinic name' || h === 'clinicname');
      if (nameIdx === -1) nameIdx = 0;
      for (let i = 1; i < lines.length; i++) {
        const vals = parseCSVLine(lines[i]);
        const name = (vals[nameIdx] || '').trim().replace(/['"]/g, '');
        if (!name) continue;
        onAddLead({
          clinicName: name,
          ownerName: '',
          clinicAddress: '',
          clinicWebsite: '',
          phone: '',
          notes: '',
          outreachMethod: 'Letters Sent',
          stage: 'Lead Pending',
          priority: 'Medium',
          outreachCompleted: false,
          assignedTo: 'Alex Mercer',
        });
      }
    } catch (err) {
      console.error('Import failed:', err);
    }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  };

  const filteredLeads = leads.filter(l => {
    const q = searchTerm.toLowerCase();
    return (stageFilter === 'ALL' || l.stage === stageFilter) && (
      l.clinicName.toLowerCase().includes(q) ||
      l.ownerName.toLowerCase().includes(q) ||
      l.clinicAddress.toLowerCase().includes(q) ||
      l.phone.includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search clinics..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#F9F9F8] border border-[#EAEAEA] rounded-xl text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#1F6C9F]/10 focus:border-[#1F6C9F]/30 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-[#F9F9F8] rounded-xl p-1 border border-[#EAEAEA]">
            <Filter className="w-3 h-3 ml-1.5 text-[#B8B8B8]" strokeWidth={1.5} />
            <select
              value={stageFilter}
              onChange={e => setStageFilter(e.target.value)}
              className="bg-transparent px-2 py-1.5 text-sm text-[#2F3437] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.tsv" onChange={handleImport} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={importing}
            className="px-3 py-1.5 rounded-xl text-xs font-medium border border-[#EAEAEA] bg-[#F9F9F8] text-[#787774] hover:text-[#1F6C9F] hover:border-[#1F6C9F]/30 hover:bg-[#EEF6FC] transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50">
            <Upload className="w-3.5 h-3.5" strokeWidth={1.5} />
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <span className="text-xs text-[#787774] font-mono bg-[#F9F9F8] px-3 py-1.5 rounded-lg border border-[#EAEAEA]">
            {filteredLeads.length} clinic{filteredLeads.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EAEAEA] bg-gradient-to-r from-[#FAFAFA] to-[#F7F7F7] text-xs text-[#787774] uppercase tracking-wider select-none font-medium">
                <th className="w-10 text-center py-3.5">#</th>
                <th className="font-medium px-2 py-3.5">Clinic</th>
                <th className="font-medium px-2 py-3.5">Owner</th>
                <th className="font-medium px-2 py-3.5">Contact</th>
                <th className="font-medium px-2 py-3.5">Outreach</th>
                <th className="font-medium px-2 py-3.5">Stage</th>
                <th className="font-medium px-2 py-3.5 whitespace-nowrap">Done</th>
                <th className="w-14 text-center py-3.5"></th>
              </tr>
            </thead>
            <tbody>
              {/* Quick Entry Row */}
              <tr className="border-b border-[#EAEAEA] bg-gradient-to-r from-[#F9F9F8]/80 to-[#F9F9F8]/40">
                <td className="px-2 py-2.5 text-center">
                  <div className="w-6 h-6 rounded-lg bg-[#1F6C9F]/10 flex items-center justify-center mx-auto">
                    <Plus className="w-3 h-3 text-[#1F6C9F]" strokeWidth={2} />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <input placeholder="Clinic Name..." value={newRow.clinicName || ''} onChange={e => setNewRow({...newRow, clinicName: e.target.value})}
                    className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all font-medium" />
                </td>
                <td className="px-2 py-1.5">
                  <input placeholder="Dr. Name..." value={newRow.ownerName || ''} onChange={e => setNewRow({...newRow, ownerName: e.target.value})}
                    className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all" />
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex flex-col gap-1">
                    <input placeholder="Phone..." value={newRow.phone || ''} onChange={e => setNewRow({...newRow, phone: e.target.value})}
                      className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm font-mono text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all" />
                    <input placeholder="Website..." value={newRow.clinicWebsite || ''} onChange={e => setNewRow({...newRow, clinicWebsite: e.target.value})}
                      className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#1F6C9F] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all" />
                    <input placeholder="Address (Street, City, State ZIP)..." value={newRow.clinicAddress || ''} onChange={e => setNewRow({...newRow, clinicAddress: e.target.value})}
                      className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all" />
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <select value={newRow.outreachMethod || 'Letters Sent'} onChange={e => setNewRow({...newRow, outreachMethod: e.target.value as OutreachMethod})}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium border border-[#EAEAEA] bg-white cursor-pointer focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all appearance-none"
                    style={{ color: methodMeta[newRow.outreachMethod || 'Letters Sent']?.color || '#1F6C9F' }}>
                    <option value="Letters Sent">Letters Sent</option>
                    <option value="Cold Message Sent">Cold Message Sent</option>
                    <option value="Cold Call Made">Cold Call Made</option>
                    <option value="In Person Visit">In Person Visit</option>
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <select value={newRow.stage || 'Lead Pending'} onChange={e => setNewRow({...newRow, stage: e.target.value as PipelineStage})}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium border border-[#EAEAEA] bg-white cursor-pointer focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all appearance-none">
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5">
                  <select value={newRow.outreachCompleted ? 'Yes' : 'No'} onChange={e => setNewRow({...newRow, outreachCompleted: e.target.value === 'Yes'})}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium border border-[#EAEAEA] bg-white cursor-pointer focus:border-[#1F6C9F]/40 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all appearance-none">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </td>
                <td className="px-2 py-1.5 text-center">
                  <button onClick={addNewRow}
                    className="p-2 bg-[#1F6C9F]/10 text-[#1F6C9F] hover:bg-[#1F6C9F] hover:text-white rounded-xl transition-all duration-200 border border-[#1F6C9F]/20 hover:border-[#1F6C9F] shadow-sm hover:shadow-md">
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  </button>
                </td>
              </tr>

              {/* Data Rows */}
              {filteredLeads.map((lead, idx) => {
                const stage = stageMeta[lead.stage] || stageMeta['Lead Pending'];
                const method = methodMeta[lead.outreachMethod] || methodMeta['Letters Sent'];
                return (
                  <tr key={lead.id} className="border-b border-[#EAEAEA]/60 hover:bg-[#FAFAFA] transition-all duration-150 group">
                    <td className="px-2 py-3 text-center">
                      <span className="text-xs text-[#B8B8B8] font-mono group-hover:text-[#787774] transition-colors">{idx + 1}</span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-3">
                        <div className="min-w-0">
                          <input type="text" value={lead.clinicName} onChange={e => handleFieldChange(lead, 'clinicName', e.target.value)}
                            className="w-full bg-transparent px-0 py-1 rounded text-sm font-medium text-[#111] border border-transparent hover:border-[#EAEAEA] focus:border-[#1F6C9F]/30 focus:bg-white focus:px-2 focus:outline-none transition-all truncate" />
                          <input type="text" value={lead.clinicAddress} onChange={e => handleFieldChange(lead, 'clinicAddress', e.target.value)}
                            className="w-full bg-transparent px-0 py-0 rounded text-xs text-[#B8B8B8] border border-transparent hover:border-[#EAEAEA] focus:border-[#1F6C9F]/30 focus:bg-white focus:px-2 focus:outline-none transition-all truncate" />
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <input type="text" value={lead.ownerName} onChange={e => handleFieldChange(lead, 'ownerName', e.target.value)}
                        className="w-full bg-transparent px-0 py-1 rounded text-sm text-[#2F3437] border border-transparent hover:border-[#EAEAEA] focus:border-[#1F6C9F]/30 focus:bg-white focus:px-2 focus:outline-none transition-all" />
                    </td>
                    <td className="px-2 py-2 align-top">
                    <div className="flex flex-col gap-0.5 h-full">
                        <input type="text" value={lead.phone} onChange={e => handleFieldChange(lead, 'phone', e.target.value)}
                          className="w-full bg-transparent px-0 py-0.5 rounded text-xs font-mono text-[#2F3437] border border-transparent hover:border-[#EAEAEA] focus:border-[#1F6C9F]/30 focus:bg-white focus:px-1.5 focus:outline-none transition-all" />
                        <input type="text" value={lead.clinicWebsite} onChange={e => handleFieldChange(lead, 'clinicWebsite', e.target.value)}
                          className="w-full bg-transparent px-0 py-0.5 rounded text-xs text-[#1F6C9F] border border-transparent hover:border-[#EAEAEA] focus:border-[#1F6C9F]/30 focus:bg-white focus:px-1.5 focus:outline-none transition-all" />
                        <input type="text" value={lead.clinicAddress} onChange={e => handleFieldChange(lead, 'clinicAddress', e.target.value)}
                          className="w-full bg-transparent px-0 py-0.5 rounded text-xs text-[#2F3437] border border-transparent hover:border-[#EAEAEA] focus:border-[#1F6C9F]/30 focus:bg-white focus:px-1.5 focus:outline-none transition-all" />
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <select value={lead.outreachMethod} onChange={e => handleFieldChange(lead, 'outreachMethod', e.target.value as OutreachMethod)}
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#EAEAEA] bg-white cursor-pointer focus:border-[#1F6C9F]/30 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all appearance-none"
                        style={{ color: method.color }}>
                        <option value="Letters Sent">Letters Sent</option>
                        <option value="Cold Message Sent">Cold Message Sent</option>
                        <option value="Cold Call Made">Cold Call Made</option>
                        <option value="In Person Visit">In Person Visit</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select value={lead.stage} onChange={e => handleFieldChange(lead, 'stage', e.target.value as PipelineStage)}
                        className={`appearance-none w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#EAEAEA] cursor-pointer focus:border-[#1F6C9F]/30 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all ${stage.bg} ${stage.text}`}>
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <select value={lead.outreachCompleted ? 'Yes' : 'No'} onChange={e => handleFieldChange(lead, 'outreachCompleted', e.target.value === 'Yes')}
                        className={`appearance-none w-full px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#EAEAEA] cursor-pointer focus:border-[#1F6C9F]/30 focus:ring-2 focus:ring-[#1F6C9F]/8 focus:outline-none transition-all ${lead.outreachCompleted ? 'bg-[#EDF6ED] text-[#346538]' : 'bg-[#F5F5F4] text-[#787774]'}`}>
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => onSelectLead(lead)}
                          className="p-1.5 text-[#B8B8B8] hover:text-[#1F6C9F] hover:bg-[#EEF6FC] rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100">
                          <FileText className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => onDeleteLead(lead.id)}
                          className="p-1.5 text-[#B8B8B8] hover:text-[#9F2F2D] hover:bg-[#FDEBEC] rounded-lg transition-all duration-150 opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredLeads.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F5F5F4] to-[#EEEEEC] flex items-center justify-center mb-4 border border-[#EAEAEA]">
                <Search className="w-6 h-6 text-[#B8B8B8]" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium text-[#787774]">No clinics found</span>
              <span className="text-xs text-[#B8B8B8] mt-1">Try adjusting your search or filter</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}