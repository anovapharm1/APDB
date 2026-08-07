'use client';

import React from 'react';
import { Lead } from '@/types/lead';
import { Building, Phone, Mail, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface LeadManagementProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

function calculateFollowUp(lead: Lead): { daysRemaining: number; isOverdue: boolean; followUpDate: string } {
  // Find when the lead moved to "Letter Sent"
  const letterSentActivity = lead.activities?.find(a =>
    a.type === 'Stage Change' && a.description?.includes('Letter Sent')
  );
  
  const sentDate = letterSentActivity
    ? new Date(letterSentActivity.timestamp)
    : lead.stage === 'Letter Sent'
    ? new Date(lead.updatedAt)
    : null;

  if (!sentDate) {
    return { daysRemaining: 10, isOverdue: false, followUpDate: '' };
  }

  const followUpDate = new Date(sentDate);
  followUpDate.setDate(followUpDate.getDate() + 10);
  
  const now = new Date();
  const diffTime = followUpDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    daysRemaining: diffDays,
    isOverdue: diffDays < 0,
    followUpDate: followUpDate.toISOString(),
  };
}

export default function LeadManagement({ leads, onSelectLead }: LeadManagementProps) {
  const letterSentLeads = leads.filter(l => l.stage === 'Letter Sent');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#111]">Lead Management</h1>
          <p className="text-sm text-[#787774] mt-0.5">
            {letterSentLeads.length} leads awaiting follow-up
          </p>
        </div>
      </div>

      {letterSentLeads.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#EAEAEA] p-8 text-center">
          <Clock className="w-8 h-8 text-[#B8B8B8] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-sm text-[#787774]">No leads in "Letter Sent" stage yet.</p>
          <p className="text-xs text-[#B8B8B8] mt-1">Leads appear here when moved to "Letter Sent".</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#EAEAEA] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EAEAEA] bg-[#FAFAFA] text-xs text-[#787774] uppercase tracking-wider font-medium">
                  <th className="px-5 py-3.5">Clinic</th>
                  <th className="px-5 py-3.5">Owner</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Date Sent</th>
                  <th className="px-5 py-3.5">Follow-Up</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="w-14 text-center py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {letterSentLeads.map(lead => {
                  const followUp = calculateFollowUp(lead);
                  const sentDate = new Date(
                    lead.activities?.find(a => a.type === 'Stage Change' && a.description?.includes('Letter Sent'))?.timestamp ||
                    lead.updatedAt
                  );
                  
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#FAFAFA] transition-aesthetic cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F5F5F4] flex items-center justify-center">
                            <Building className="w-4 h-4 text-[#787774]" strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="font-medium text-[#111]">{lead.clinicName}</div>
                            <div className="text-xs text-[#B8B8B8]">{lead.clinicAddress}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[#2F3437]">{lead.ownerName}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#787774]">
                          <Phone className="w-3 h-3" strokeWidth={1.5} />
                          {lead.phone || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-[#787774]">
                          <Calendar className="w-3 h-3" strokeWidth={1.5} />
                          {sentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className={`flex items-center gap-2 ${
                          followUp.isOverdue ? 'text-[#9F2F2D]' :
                          followUp.daysRemaining <= 3 ? 'text-[#956400]' :
                          'text-[#346538]'
                        }`}>
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          <span className="font-mono font-medium">
                            {followUp.isOverdue
                              ? `${Math.abs(followUp.daysRemaining)} days overdue`
                              : `${followUp.daysRemaining} days left`}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          followUp.isOverdue
                            ? 'bg-[#FDEBEC] text-[#9F2F2D]'
                            : followUp.daysRemaining <= 3
                            ? 'bg-[#FBF3DB] text-[#956400]'
                            : 'bg-[#EDF6ED] text-[#346538]'
                        }`}>
                          {followUp.isOverdue ? (
                            <>
                              <AlertCircle className="w-3 h-3" strokeWidth={1.5} />
                              Overdue
                            </>
                          ) : followUp.daysRemaining <= 3 ? (
                            <>
                              <Clock className="w-3 h-3" strokeWidth={1.5} />
                              Due Soon
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" strokeWidth={1.5} />
                              On Track
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-center">
                        <Mail className="w-3.5 h-3.5 text-[#B8B8B8]" strokeWidth={1.5} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
