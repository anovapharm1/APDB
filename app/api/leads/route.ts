import { NextRequest, NextResponse } from 'next/server';
import { getAllLeads, addLead, updateLead, deleteLead } from '@/lib/db';
import { Lead } from '@/types/lead';

export async function GET() {
  try {
    const leads = getAllLeads();
    return NextResponse.json({ leads });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const lead: Lead = await req.json();
    addLead(lead);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const lead: Lead = await req.json();
    updateLead(lead);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    deleteLead(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
