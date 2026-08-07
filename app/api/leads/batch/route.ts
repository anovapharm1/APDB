import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, addLead, updateLead, deleteLead } from '@/lib/db';
import { Lead } from '@/types/lead';

export async function POST(req: NextRequest) {
  try {
    const { leads }: { leads: Lead[] } = await req.json();
    
    // Get existing leads from DB
    const existingLeads = getAllLeads();
    const existingIds = new Set(existingLeads.map(l => l.id));
    
    // Add new leads, update existing ones
    for (const lead of leads) {
      if (existingIds.has(lead.id)) {
        updateLead(lead);
      } else {
        addLead(lead);
      }
    }
    
    // Delete leads that are no longer in the list
    const newIds = new Set(leads.map(l => l.id));
    for (const existing of existingLeads) {
      if (!newIds.has(existing.id)) {
        deleteLead(existing.id);
      }
    }
    
    return NextResponse.json({ success: true, count: leads.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
