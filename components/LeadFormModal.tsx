'use client';

import React, { useState } from 'react';
import { Lead, PipelineStage, Priority, OutreachMethod } from '@/types/lead';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface LeadFormModalProps {
  isOpen: boolean; onClose: () => void; onSave: (leadData: Partial<Lead>) => void; initialLead?: Lead | null;
}

const STAGES: PipelineStage[] = ['Lead Pending','Letter Written','Letter Sent','Response','Meeting Had','Prospect Closed'];
const PRIORITIES: Priority[] = ['Low','Medium','High'];

export default function LeadFormModal({ isOpen, onClose, onSave, initialLead }: LeadFormModalProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    clinicName: initialLead?.clinicName || '', clinicAddress: initialLead?.clinicAddress || '',
    ownerName: initialLead?.ownerName || '', clinicWebsite: initialLead?.clinicWebsite || '',
    notes: initialLead?.notes || '', phone: initialLead?.phone || '',
    stage: initialLead?.stage || 'Lead Pending',
    priority: initialLead?.priority || 'Medium', assignedTo: initialLead?.assignedTo || 'Alex Mercer',
    outreachMethod: initialLead?.outreachMethod || 'Letters Sent',
    outreachCompleted: initialLead?.outreachCompleted || false,
    nextActionAt: initialLead?.nextActionAt || '',
    nextActionType: initialLead?.nextActionType || 'Follow up call',
    outcome: initialLead?.outcome || 'Open',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.clinicName?.trim()) e.clinicName = 'Required';
    if (!formData.ownerName?.trim()) e.ownerName = 'Required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validate()) { onSave(formData); onClose(); }
  };

  const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-medium text-[#787774] mb-1">{label}</label>
      {children}
      {error && <p className="text-[#9F2F2D] text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" strokeWidth={1.5} /> {error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="my-3 w-full max-w-2xl rounded-xl border border-[#EAEAEA] bg-white shadow-xl sm:my-8">
        <div className="flex items-center justify-between border-b border-[#EAEAEA] px-4 py-3 sm:px-5">
          <h2 className="text-sm font-medium text-[#111]">{initialLead ? 'Edit Clinic' : 'New Clinic Entry'}</h2>
          <button onClick={onClose} className="p-1 text-[#B8B8B8] hover:text-[#111] hover:bg-[#F5F5F4] rounded-lg transition-aesthetic">
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Field label="Clinic Name" error={errors.clinicName}>
                <input type="text" value={formData.clinicName||''} onChange={e => setFormData({...formData, clinicName: e.target.value})}
                  className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/30 focus:outline-none transition-aesthetic" placeholder="Apex Dental" />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Clinic Address">
                <input type="text" value={formData.clinicAddress||''} onChange={e => setFormData({...formData, clinicAddress: e.target.value})}
                  className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/30 focus:outline-none transition-aesthetic" placeholder="123 Main St" />
              </Field>
            </div>
            <Field label="Owner Name" error={errors.ownerName}>
              <input type="text" value={formData.ownerName||''} onChange={e => setFormData({...formData, ownerName: e.target.value})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/30 focus:outline-none transition-aesthetic" placeholder="Dr. Name" />
            </Field>
            <Field label="Clinic Website">
              <input type="text" value={formData.clinicWebsite||''} onChange={e => setFormData({...formData, clinicWebsite: e.target.value})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#1F6C9F] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/30 focus:outline-none transition-aesthetic" placeholder="https://" />
            </Field>
            <Field label="Phone Number">
              <input type="text" value={formData.phone||''} onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm font-mono text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/30 focus:outline-none transition-aesthetic" placeholder="(555) 000-0000" />
            </Field>
            <Field label="Outreach Method">
              <select value={formData.outreachMethod||'Letters Sent'} onChange={e => setFormData({...formData, outreachMethod: e.target.value as OutreachMethod})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] focus:border-[#1F6C9F]/30 focus:outline-none cursor-pointer">
                <option>Letters Sent</option>
                <option>Cold Message Sent</option>
                <option>Cold Call Made</option>
                <option>In Person Visit</option>
              </select>
            </Field>
            <Field label="Outreach Completed">
              <select value={formData.outreachCompleted ? 'Yes' : 'No'} onChange={e => setFormData({...formData, outreachCompleted: e.target.value === 'Yes'})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] focus:border-[#1F6C9F]/30 focus:outline-none cursor-pointer">
                <option>No</option>
                <option>Yes</option>
              </select>
            </Field>
            <Field label="Next Action Due">
              <input type="date" value={formData.nextActionAt ? formData.nextActionAt.slice(0, 10) : ''} onChange={e => setFormData({...formData, nextActionAt: e.target.value ? new Date(`${e.target.value}T09:00:00`).toISOString() : undefined})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] focus:border-[#1F6C9F]/30 focus:outline-none" />
            </Field>
            <Field label="Next Action">
              <select value={formData.nextActionType || 'Follow up call'} onChange={e => setFormData({...formData, nextActionType: e.target.value})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] focus:border-[#1F6C9F]/30 focus:outline-none cursor-pointer">
                <option>Follow up call</option>
                <option>Send email</option>
                <option>Send information</option>
                <option>Book meeting</option>
                <option>Check back later</option>
              </select>
            </Field>
            <Field label="Pipeline Stage">
              <select value={formData.stage||'Lead Pending'} onChange={e => setFormData({...formData, stage: e.target.value as PipelineStage})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] focus:border-[#1F6C9F]/30 focus:outline-none cursor-pointer">
                {STAGES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Clinic Outcome">
              <select value={formData.outcome || 'Open'} onChange={e => setFormData({...formData, outcome: e.target.value as Lead['outcome']})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] focus:border-[#1F6C9F]/30 focus:outline-none cursor-pointer">
                <option>Open</option>
                <option>Won</option>
                <option>No Response</option>
                <option>Not a Fit</option>
                <option>Deferred</option>
              </select>
            </Field>
            <Field label="Priority">
              <select value={formData.priority||'Medium'} onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] focus:border-[#1F6C9F]/30 focus:outline-none cursor-pointer">
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <div className="md:col-span-2">
              <Field label="Notes">
                <textarea value={formData.notes||''} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3}
                  className="w-full bg-white border border-[#EAEAEA] rounded-lg px-3 py-2 text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:border-[#1F6C9F]/30 focus:outline-none transition-aesthetic" />
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#EAEAEA]">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#787774] hover:text-[#111] hover:bg-[#F5F5F4] rounded-lg transition-aesthetic">Cancel</button>
            <button type="submit"
              className="px-4 py-2 text-xs font-medium bg-[#111] text-white hover:bg-[#2F3437] rounded-lg transition-aesthetic flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}