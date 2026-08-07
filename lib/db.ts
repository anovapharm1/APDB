import Database from 'better-sqlite3';
import { Lead, LeadActivity, PipelineStage, OutreachMethod, Priority } from '@/types/lead';
import { INITIAL_LEADS } from '@/lib/leadStore';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'pipeline.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    clinicName TEXT,
    clinicAddress TEXT,
    ownerName TEXT,
    clinicWebsite TEXT,
    phone TEXT,
    notes TEXT,
    outreachMethod TEXT,
    stage TEXT,
    priority TEXT,
    assignedTo TEXT,
    createdAt TEXT,
    updatedAt TEXT,
    outreachCompleted INTEGER,
    nextActionAt TEXT,
    nextActionType TEXT,
    followUpStatus TEXT,
    outcome TEXT,
    lastContactedAt TEXT,
    firstResponseAt TEXT,
    meetingBookedAt TEXT,
    meetingHeldAt TEXT
  );
  
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    leadId TEXT,
    type TEXT,
    description TEXT,
    timestamp TEXT,
    author TEXT,
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
  );
`);

// Add workflow columns to databases created before the long-cycle clinic workflow.
for (const statement of [
  'ALTER TABLE leads ADD COLUMN nextActionAt TEXT',
  'ALTER TABLE leads ADD COLUMN nextActionType TEXT',
  'ALTER TABLE leads ADD COLUMN followUpStatus TEXT',
  'ALTER TABLE leads ADD COLUMN outcome TEXT',
  'ALTER TABLE leads ADD COLUMN lastContactedAt TEXT',
  'ALTER TABLE leads ADD COLUMN firstResponseAt TEXT',
  'ALTER TABLE leads ADD COLUMN meetingBookedAt TEXT',
  'ALTER TABLE leads ADD COLUMN meetingHeldAt TEXT',
]) {
  try { db.exec(statement); } catch { /* column already exists */ }
}

// Migrate existing leads on first run

// Migrate existing leads on first run
const count = db.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number };
if (count.count === 0) {
  const insertLead = db.prepare(`
    INSERT INTO leads (id, clinicName, clinicAddress, ownerName, clinicWebsite, phone, notes, outreachMethod, stage, priority, assignedTo, createdAt, updatedAt, outreachCompleted, nextActionAt, nextActionType, followUpStatus, outcome, lastContactedAt, firstResponseAt, meetingBookedAt, meetingHeldAt)
    VALUES (@id, @clinicName, @clinicAddress, @ownerName, @clinicWebsite, @phone, @notes, @outreachMethod, @stage, @priority, @assignedTo, @createdAt, @updatedAt, @outreachCompleted, @nextActionAt, @nextActionType, @followUpStatus, @outcome, @lastContactedAt, @firstResponseAt, @meetingBookedAt, @meetingHeldAt)
  `);
  const insertActivity = db.prepare(`
    INSERT INTO activities (id, leadId, type, description, timestamp, author)
    VALUES (@id, @leadId, @type, @description, @timestamp, @author)
  `);
  
  const insertMany = db.transaction((leads: Lead[]) => {
    for (const lead of leads) {
      insertLead.run({
        id: lead.id,
        clinicName: lead.clinicName,
        clinicAddress: lead.clinicAddress,
        ownerName: lead.ownerName,
        clinicWebsite: lead.clinicWebsite,
        phone: lead.phone,
        notes: lead.notes,
        outreachMethod: lead.outreachMethod,
        stage: lead.stage,
        priority: lead.priority,
        assignedTo: lead.assignedTo,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
        outreachCompleted: lead.outreachCompleted ? 1 : 0,
        nextActionAt: lead.nextActionAt || null,
        nextActionType: lead.nextActionType || null,
        followUpStatus: lead.followUpStatus || 'Not Scheduled',
        outcome: lead.outcome || 'Open',
        lastContactedAt: lead.lastContactedAt || null,
        firstResponseAt: lead.firstResponseAt || null,
        meetingBookedAt: lead.meetingBookedAt || null,
        meetingHeldAt: lead.meetingHeldAt || null,
      });
      for (const activity of lead.activities || []) {
        insertActivity.run({
          id: activity.id,
          leadId: lead.id,
          type: activity.type,
          description: activity.description,
          timestamp: activity.timestamp,
          author: activity.author,
        });
      }
    }
  });
  
  insertMany(INITIAL_LEADS);
  console.log(`[DB] Seeded ${INITIAL_LEADS.length} initial leads`);
}

export function getAllLeads(): Lead[] {
  const leads = db.prepare(`
    SELECT * FROM leads ORDER BY createdAt DESC
  `).all() as any[];
  
  return leads.map(lead => ({
    id: lead.id,
    clinicName: lead.clinicName,
    clinicAddress: lead.clinicAddress,
    ownerName: lead.ownerName,
    clinicWebsite: lead.clinicWebsite,
    phone: lead.phone,
    notes: lead.notes,
    outreachMethod: lead.outreachMethod as OutreachMethod,
    stage: lead.stage as PipelineStage,
    priority: lead.priority as Priority,
    assignedTo: lead.assignedTo,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    outreachCompleted: lead.outreachCompleted === 1,
    nextActionAt: lead.nextActionAt || undefined,
    nextActionType: lead.nextActionType || undefined,
    followUpStatus: lead.followUpStatus || undefined,
    outcome: lead.outcome || undefined,
    lastContactedAt: lead.lastContactedAt || undefined,
    firstResponseAt: lead.firstResponseAt || undefined,
    meetingBookedAt: lead.meetingBookedAt || undefined,
    meetingHeldAt: lead.meetingHeldAt || undefined,
    activities: getActivitiesForLead(lead.id),
  }));
}

function getActivitiesForLead(leadId: string): LeadActivity[] {
  return db.prepare(`
    SELECT * FROM activities WHERE leadId = ? ORDER BY timestamp DESC
  `).all(leadId) as LeadActivity[];
}

export function addLead(lead: Lead): void {
  const insertLead = db.prepare(`
    INSERT INTO leads (id, clinicName, clinicAddress, ownerName, clinicWebsite, phone, notes, outreachMethod, stage, priority, assignedTo, createdAt, updatedAt, outreachCompleted, nextActionAt, nextActionType, followUpStatus, outcome, lastContactedAt, firstResponseAt, meetingBookedAt, meetingHeldAt)
    VALUES (@id, @clinicName, @clinicAddress, @ownerName, @clinicWebsite, @phone, @notes, @outreachMethod, @stage, @priority, @assignedTo, @createdAt, @updatedAt, @outreachCompleted, @nextActionAt, @nextActionType, @followUpStatus, @outcome, @lastContactedAt, @firstResponseAt, @meetingBookedAt, @meetingHeldAt)
  `);
  
  const insertActivity = db.prepare(`
    INSERT INTO activities (id, leadId, type, description, timestamp, author)
    VALUES (@id, @leadId, @type, @description, @timestamp, @author)
  `);
  
  const insertMany = db.transaction((lead: Lead) => {
    insertLead.run({
      id: lead.id,
      clinicName: lead.clinicName,
      clinicAddress: lead.clinicAddress,
      ownerName: lead.ownerName,
      clinicWebsite: lead.clinicWebsite,
      outreachCompleted: lead.outreachCompleted ? 1 : 0,
      nextActionAt: lead.nextActionAt || null,
      nextActionType: lead.nextActionType || null,
      followUpStatus: lead.followUpStatus || 'Not Scheduled',
      outcome: lead.outcome || 'Open',
      lastContactedAt: lead.lastContactedAt || null,
      firstResponseAt: lead.firstResponseAt || null,
      meetingBookedAt: lead.meetingBookedAt || null,
      meetingHeldAt: lead.meetingHeldAt || null,
      notes: lead.notes,
      outreachMethod: lead.outreachMethod,
      stage: lead.stage,
      priority: lead.priority,
      assignedTo: lead.assignedTo,
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
    });
    for (const activity of lead.activities || []) {
      insertActivity.run({
        id: activity.id,
        leadId: lead.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        author: activity.author,
      });
    }
  });
  
  insertMany(lead);
}

export function updateLead(lead: Lead): void {
  const updateLead = db.prepare(`
    UPDATE leads SET 
      clinicName = @clinicName,
      clinicAddress = @clinicAddress,
      ownerName = @ownerName,
      clinicWebsite = @clinicWebsite,
      phone = @phone,
      notes = @notes,
      outreachMethod = @outreachMethod,
      stage = @stage,
      priority = @priority,
      assignedTo = @assignedTo,
      updatedAt = @updatedAt,
      outreachCompleted = @outreachCompleted,
      nextActionAt = @nextActionAt,
      nextActionType = @nextActionType,
      followUpStatus = @followUpStatus,
      outcome = @outcome,
      lastContactedAt = @lastContactedAt,
      firstResponseAt = @firstResponseAt,
      meetingBookedAt = @meetingBookedAt,
      meetingHeldAt = @meetingHeldAt
    WHERE id = @id
  `);
  
  updateLead.run({
    id: lead.id,
    clinicName: lead.clinicName,
    clinicAddress: lead.clinicAddress,
    ownerName: lead.ownerName,
    clinicWebsite: lead.clinicWebsite,
    phone: lead.phone,
    notes: lead.notes,
    outreachMethod: lead.outreachMethod,
    stage: lead.stage,
    priority: lead.priority,
    assignedTo: lead.assignedTo,
    updatedAt: lead.updatedAt,
    outreachCompleted: lead.outreachCompleted ? 1 : 0,
    nextActionAt: lead.nextActionAt || null,
    nextActionType: lead.nextActionType || null,
    followUpStatus: lead.followUpStatus || 'Not Scheduled',
    outcome: lead.outcome || 'Open',
    lastContactedAt: lead.lastContactedAt || null,
    firstResponseAt: lead.firstResponseAt || null,
    meetingBookedAt: lead.meetingBookedAt || null,
    meetingHeldAt: lead.meetingHeldAt || null,
  });
  
  // Update activities - delete old and insert new
  db.prepare('DELETE FROM activities WHERE leadId = ?').run(lead.id);
  const insertActivity = db.prepare(`
    INSERT INTO activities (id, leadId, type, description, timestamp, author)
    VALUES (@id, @leadId, @type, @description, @timestamp, @author)
  `);
  const insertMany = db.transaction((activities: LeadActivity[], leadId: string) => {
    for (const activity of activities) {
      insertActivity.run({
        id: activity.id,
        leadId: leadId,
        type: activity.type,
        description: activity.description,
        timestamp: activity.timestamp,
        author: activity.author,
      });
    }
  });
  insertMany(lead.activities || [], lead.id);
}

export function deleteLead(id: string): void {
  db.prepare('DELETE FROM leads WHERE id = ?').run(id);
  // Activities are deleted via ON DELETE CASCADE
}

export function closeDb(): void {
  db.close();
}
