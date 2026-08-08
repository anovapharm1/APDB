import { createClient } from '@supabase/supabase-js';
import { Lead, LeadActivity } from '@/types/lead';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase environment variables');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

type LeadRow = {
  id: string; clinic_name: string; clinic_address: string; owner_name: string; clinic_website: string;
  phone: string; notes: string; outreach_method: Lead['outreachMethod']; stage: Lead['stage']; priority: Lead['priority'];
  assigned_to: string; created_at: string; updated_at: string; outreach_completed: boolean;
  next_action_at: string | null; next_action_type: string | null; follow_up_status: Lead['followUpStatus'] | null;
  outcome: Lead['outcome'] | null; last_contacted_at: string | null; first_response_at: string | null;
  meeting_booked_at: string | null; meeting_held_at: string | null;
};

type ActivityRow = { id: string; lead_id: string; type: LeadActivity['type']; description: string; timestamp: string; author: string };

function toLead(row: LeadRow, activities: LeadActivity[]): Lead {
  return {
    id: row.id, clinicName: row.clinic_name, clinicAddress: row.clinic_address, ownerName: row.owner_name,
    clinicWebsite: row.clinic_website, phone: row.phone, notes: row.notes, outreachMethod: row.outreach_method,
    stage: row.stage, priority: row.priority, assignedTo: row.assigned_to, createdAt: row.created_at,
    updatedAt: row.updated_at, outreachCompleted: row.outreach_completed, activities,
    nextActionAt: row.next_action_at || undefined, nextActionType: row.next_action_type || undefined,
    followUpStatus: row.follow_up_status || undefined, outcome: row.outcome || undefined,
    lastContactedAt: row.last_contacted_at || undefined, firstResponseAt: row.first_response_at || undefined,
    meetingBookedAt: row.meeting_booked_at || undefined, meetingHeldAt: row.meeting_held_at || undefined,
  };
}

const leadPayload = (lead: Lead) => ({
  id: lead.id, clinic_name: lead.clinicName, clinic_address: lead.clinicAddress, owner_name: lead.ownerName,
  clinic_website: lead.clinicWebsite, phone: lead.phone, notes: lead.notes, outreach_method: lead.outreachMethod,
  stage: lead.stage, priority: lead.priority, assigned_to: lead.assignedTo, created_at: lead.createdAt,
  updated_at: lead.updatedAt, outreach_completed: lead.outreachCompleted, next_action_at: lead.nextActionAt || null,
  next_action_type: lead.nextActionType || null, follow_up_status: lead.followUpStatus || 'Not Scheduled',
  outcome: lead.outcome || 'Open', last_contacted_at: lead.lastContactedAt || null,
  first_response_at: lead.firstResponseAt || null, meeting_booked_at: lead.meetingBookedAt || null,
  meeting_held_at: lead.meetingHeldAt || null,
});

const activityPayload = (lead: Lead) => (lead.activities || []).map(activity => ({
  id: activity.id, lead_id: lead.id, type: activity.type, description: activity.description,
  timestamp: activity.timestamp, author: activity.author,
}));

export async function getAllLeads(): Promise<Lead[]> {
  const supabase = getClient();
  const [{ data: rows, error: leadError }, { data: activityRows, error: activityError }] = await Promise.all([
    supabase.from('leads').select('*').order('created_at', { ascending: false }),
    supabase.from('activities').select('*').order('timestamp', { ascending: false }),
  ]);
  if (leadError) throw leadError;
  if (activityError) throw activityError;
  const activitiesByLead = new Map<string, LeadActivity[]>();
  for (const activity of (activityRows || []) as ActivityRow[]) {
    const list = activitiesByLead.get(activity.lead_id) || [];
    list.push({ id: activity.id, type: activity.type, description: activity.description, timestamp: activity.timestamp, author: activity.author });
    activitiesByLead.set(activity.lead_id, list);
  }
  return ((rows || []) as LeadRow[]).map(row => toLead(row, activitiesByLead.get(row.id) || []));
}

export async function addLead(lead: Lead): Promise<void> {
  const supabase = getClient();
  const { error: leadError } = await supabase.from('leads').insert(leadPayload(lead));
  if (leadError) throw leadError;
  if (lead.activities?.length) {
    const { error } = await supabase.from('activities').insert(activityPayload(lead));
    if (error) throw error;
  }
}

export async function updateLead(lead: Lead): Promise<void> {
  const supabase = getClient();
  const { error: leadError } = await supabase.from('leads').upsert(leadPayload(lead));
  if (leadError) throw leadError;
  const { error: deleteError } = await supabase.from('activities').delete().eq('lead_id', lead.id);
  if (deleteError) throw deleteError;
  if (lead.activities?.length) {
    const { error } = await supabase.from('activities').insert(activityPayload(lead));
    if (error) throw error;
  }
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await getClient().from('leads').delete().eq('id', id);
  if (error) throw error;
}
