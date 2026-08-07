export type OutreachMethod =
  | 'Letters Sent'
  | 'Cold Message Sent'
  | 'Cold Call Made'
  | 'In Person Visit';

export type PipelineStage =
  | 'Lead Pending'
  | 'Letter Written'
  | 'Letter Sent'
  | 'Response'
  | 'Meeting Had'
  | 'Prospect Closed';

export type Priority = 'Low' | 'Medium' | 'High';

export type LeadOutcome = 'Open' | 'Won' | 'No Response' | 'Not a Fit' | 'Deferred';

export type FollowUpStatus = 'Not Scheduled' | 'Due' | 'Completed' | 'Snoozed';

export interface LeadActivity {
  id: string;
  type: 'Note' | 'Call' | 'Email' | 'Meeting' | 'Stage Change';
  description: string;
  timestamp: string;
  author: string;
}

export interface Lead {
  id: string;
  clinicName: string;
  clinicAddress: string;
  ownerName: string;
  clinicWebsite: string;
  phone: string;
  notes: string;
  outreachMethod: OutreachMethod;
  stage: PipelineStage;
  priority: Priority;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  activities: LeadActivity[];
  outreachCompleted: boolean;
  nextActionAt?: string;
  nextActionType?: string;
  followUpStatus?: FollowUpStatus;
  outcome?: LeadOutcome;
  lastContactedAt?: string;
  firstResponseAt?: string;
  meetingBookedAt?: string;
  meetingHeldAt?: string;
}