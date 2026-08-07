'use client';
import React, { useState, useEffect } from 'react';
import { Lead, PipelineStage } from '@/types/lead';
import { useAuth } from '@/lib/auth-context';
import ClinicSpreadsheet from '@/components/ClinicSpreadsheet';
import LeadFormModal from '@/components/LeadFormModal';
import LeadDetailModal from '@/components/LeadDetailModal';
import AnovaDashboard from '@/components/AnovaDashboard';
import KanbanBoard from '@/components/KanbanBoard';
import OutreachVolume from '@/components/OutreachVolume';
import LetterGeneration from '@/components/LetterGeneration';
import LeadManagement from '@/components/LeadManagement';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import WorkspaceViews from '@/components/WorkspaceViews';
import { Building } from 'lucide-react';

const TAB_TITLES: Record<string, string> = {
  today: 'Today',
  spreadsheet: 'Leads',
  followups: 'Follow-up Queue',
  opportunities: 'Opportunities',
  accounts: 'Accounts',
  kanban: 'Pipeline Board',
  activities: 'Activity Log',
  dashboard: 'Analytics',
  volume: 'Outreach Volume',
  reports: 'Reports',
  letters: 'Letter Generation',
  'lead-management': 'Lead Management',
  'data-quality': 'Data Quality',
  settings: 'Settings',
};

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeTab, setActiveTab] = useState<string>('spreadsheet');
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days' | 'year'>('30days');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { user, isAuthenticated } = useAuth();

  const rangeStart = (() => {
    const start = new Date();
    if (dateRange === 'today') start.setHours(0, 0, 0, 0);
    if (dateRange === '7days') start.setDate(start.getDate() - 7);
    if (dateRange === '30days') start.setDate(start.getDate() - 30);
    if (dateRange === 'year') start.setMonth(0, 1);
    return start.getTime();
  })();
  const filteredLeads = leads.filter(lead => new Date(lead.createdAt).getTime() >= rangeStart);

  // Load leads from database on mount
  useEffect(() => {
    const loadLeads = async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || []);
        }
      } catch (err) {
        console.error('Failed to load leads:', err);
      }
    };
    loadLeads();
  }, []);

  // Save leads to database whenever they change
  useEffect(() => {
    if (leads.length > 0) {
      fetch('/api/leads/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads }),
      }).catch(err => console.error('Failed to save leads:', err));
    }
  }, [leads]);
  const handleAddLead = (leadData: Partial<Lead>) => {
    const newLead: Lead = {
      id: 'lead-' + Date.now(),
      clinicName: leadData.clinicName || '',
      clinicAddress: leadData.clinicAddress || '',
      ownerName: leadData.ownerName || '',
      clinicWebsite: leadData.clinicWebsite || '',
      notes: leadData.notes || '',
      phone: leadData.phone || '',
      outreachMethod: leadData.outreachMethod || 'Letters Sent',
      stage: leadData.stage || 'Lead Pending',
      priority: leadData.priority || 'Medium',
      assignedTo: leadData.assignedTo || 'Alex Mercer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [
        {
          id: 'act-' + Date.now(),
          type: 'Note',
          description: 'Lead entered into system.',
          timestamp: new Date().toISOString(),
          author: 'Current User'
        }
      ],
      outreachCompleted: false,
    };
    setLeads(prev => [newLead, ...prev]);
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    if (selectedLead?.id === updated.id) {
      setSelectedLead(updated);
    }
  };
  const handleDeleteLead = (id: string) => {
    if (confirm('Are you sure you want to delete this clinic entry?')) {
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
    }
  };
  const handleUpdateStage = (leadId: string, newStage: PipelineStage) => {
    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          stage: newStage,
          outreachCompleted: newStage === 'Letter Sent' ? true : l.outreachCompleted,
          updatedAt: new Date().toISOString(),
          activities: [
            {
              id: 'act-' + Date.now(),
              type: 'Stage Change',
              description: `Moved stage to ${newStage}`,
              timestamp: new Date().toISOString(),
              author: 'Current User'
            },
            ...(l.activities || [])
          ]
        };
      }
      return l;
    }));
  };

  const handleGenerateLabels = (letterLeads: Lead[]) => {
    const now = new Date();
    const shippingDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`;

    const templateHeader = "Reference ID,Reference ID 2,Shipping Date,Item Description,Item Quantity,Item Weight (lb),Item Weight (oz),Item Value,HS Tariff #,Country of Origin,Sender First Name,Sender Middle Initial,Sender Last Name,Sender Company/Org Name,Sender Address Line 1,Sender Address Line 2,Sender Address Line 3,Sender Address Town/City,Sender State,Sender Country,Sender ZIP Code,Sender Urbanization Code,Ship From Another ZIP Code,Sender Email,Sender Cell Phone,Recipient Country,Recipient First Name,Recipient Middle Initial,Recipient Last Name,Recipient Company/Org Name,Recipient Address Line 1,Recipient Address Line 2,Recipient Address Line 3,Recipient Address Town/City,Recipient Province,Recipient State,Recipient ZIP Code,Recipient Urbanization Code,Recipient Phone,Recipient Email,Service Type,Package Type,Package Weight (lb),Package Weight (oz),Length,Width,Height,Girth,Insured Value,Contents,Contents Description,Package Comments,Customs Form Reference #,License #,Certificate #,Invoice #,Customs Form Reference # Type,HAZMAT Type,Live Animals and Perishable Goods Indicator";

    const rows = letterLeads.map(lead => {
      const [firstName, ...rest] = (lead.ownerName || '').split(' ');
      const lastName = rest.length > 0 ? rest.join(' ') : '';

      // Parse address: "123 Main St STE 320, New York, NY 10001"
      const addressParts = (lead.clinicAddress || '').split(',').map(s => s.trim());
      let addressLine1 = '';
      let addressLine2 = '';
      let city = '';
      let state = '';
      let zip = '';

      if (addressParts.length > 0) {
        // Find the part that has state + zip pattern (e.g., "IL 60611")
        let stateZipIdx = -1;
        for (let i = addressParts.length - 1; i >= 0; i--) {
          const part = addressParts[i];
          const match = part.match(/^([A-Z]{2})\s*(\d{5})/);
          if (match) {
            state = match[1];
            zip = match[2];
            stateZipIdx = i;
            break;
          }
        }

        if (stateZipIdx >= 0) {
          // City is the part before state/zip
          if (stateZipIdx > 0) {
            city = addressParts[stateZipIdx - 1];
            const addrParts = addressParts.slice(0, stateZipIdx - 1);
            addressLine1 = addrParts[0] || '';
            addressLine2 = addrParts.slice(1).join(', ') || '';

            // Check if addressLine1 contains suite/apt/ste info and move it to addressLine2
            const suiteMatch = addressLine1.match(/\s+(STE|APT|SUITE|UNIT|#)\s+\S+/i);
            if (suiteMatch) {
              const suiteText = suiteMatch[0].trim();
              addressLine1 = addressLine1.replace(suiteMatch[0], '').trim();
              addressLine2 = addressLine2
                ? `${suiteText}, ${addressLine2}`
                : suiteText;
            }
          }
        } else {
          addressLine1 = addressParts.join(', ');
          // Check if addressLine1 contains suite/apt/ste info
          const suiteMatch = addressLine1.match(/\s+(STE|APT|SUITE|UNIT|#)\s+\S+/i);
          if (suiteMatch) {
            const suiteText = suiteMatch[0].trim();
            addressLine1 = addressLine1.replace(suiteMatch[0], '').trim();
            addressLine2 = suiteText;
          }
        }
      }

      const cells = new Array(59).fill('');
      cells[2] = shippingDate; // Shipping Date
      cells[13] = 'ProCare Specialty Pharmacy'; // Sender Company/Org Name
      cells[14] = '2220 Forest Avenue'; // Sender Address Line 1
      cells[17] = 'Staten Island'; // Sender Town/City
      cells[18] = 'NY'; // Sender State
      cells[19] = 'US'; // Sender Country
      cells[20] = '10303'; // Sender ZIP Code
      cells[23] = 'mass.deal9@gmail.com'; // Sender Email
      cells[24] = '9174054489'; // Sender Cell Phone
      cells[25] = 'US'; // Recipient Country
      cells[26] = firstName || ''; // Recipient First Name
      cells[28] = lastName || ''; // Recipient Last Name
      cells[30] = addressLine1; // Recipient Address Line 1
      cells[31] = addressLine2; // Recipient Address Line 2
      cells[33] = city; // Recipient Town/City
      cells[35] = state; // Recipient State
      cells[36] = zip; // Recipient ZIP Code
      cells[38] = lead.phone || ''; // Recipient Phone
      cells[40] = 'First-Class Mail'; // Service Type
      cells[41] = 'Large Envelope'; // Package Type
      cells[42] = '0'; // Package Weight (lb)
      cells[43] = '1.5'; // Package Weight (oz)
      cells[44] = '12'; // Length
      cells[46] = '9'; // Height
      return cells.map(c => `"${c.replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [templateHeader, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `labels_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    // Move leads from "Letter Written" to "Letter Sent"
    setLeads(prev => prev.map(l =>
      letterLeads.some(ll => ll.id === l.id)
        ? {
            ...l,
            stage: 'Letter Sent',
            outreachCompleted: true,
            updatedAt: now.toISOString(),
            activities: [
              {
                id: 'act-' + Date.now() + '-' + l.id,
                type: 'Stage Change',
                description: 'Letter sent',
                timestamp: now.toISOString(),
                author: user?.name || 'Current User'
              },
              ...(l.activities || [])
            ]
          }
        : l
    ));
  };


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#1F6C9F]/10 flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6 text-[#1F6C9F]" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-semibold text-[#111] mb-2">Authentication Required</h1>
          <p className="text-sm text-[#787774] mb-4">Please log in to access the application</p>
          <a
            href="/login"
            className="inline-flex px-4 py-2 bg-[#1F6C9F] text-white rounded-xl text-sm font-medium hover:bg-[#1A5A8A] transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex bg-[#F8F9FB] text-[#1F2937]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab as (tab: string) => void} />

      <div className="flex-1 overflow-y-auto">
        <Header title={TAB_TITLES[activeTab] || 'Dashboard'} dateRange={dateRange} onDateRangeChange={setDateRange} />

          {/* Tab View Contents */}
          {['today', 'followups', 'opportunities', 'accounts', 'activities', 'reports', 'data-quality'].includes(activeTab) && (
            <WorkspaceViews view={activeTab} leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} />
          )}
          {activeTab === 'spreadsheet' && (
            <ClinicSpreadsheet leads={leads} onAddLead={handleAddLead} onUpdateLead={handleUpdateLead} onDeleteLead={handleDeleteLead} onSelectLead={(lead) => setSelectedLead(lead)} />
          )}
          {activeTab === 'kanban' && (
            <KanbanBoard leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} onUpdateStage={handleUpdateStage} onAddLead={() => { setEditingLead(null); setIsFormOpen(true); }} onGenerateLabels={handleGenerateLabels} />
          )}
          {activeTab === 'dashboard' && (
            <AnovaDashboard leads={filteredLeads} />
          )}
          {activeTab === 'volume' && (
            <OutreachVolume leads={leads} />
          )}
          {activeTab === 'letters' && (
            <LetterGeneration leads={leads} onUpdateLead={handleUpdateLead} />
          )}
          {activeTab === 'lead-management' && (
            <LeadManagement leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} />
          )}
        </div>

      {/* Modals */}
      <LeadFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingLead(null); }}
        onSave={(data) => {
          if (editingLead) {
            handleUpdateLead({ ...editingLead, ...data });
          } else {
            handleAddLead(data);
          }
        }}
        initialLead={editingLead}
      />

      <LeadDetailModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdateLead={handleUpdateLead}
      />
    </div>
  );
}