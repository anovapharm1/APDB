import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const { website, content, analysis, lead } = await req.json();

    if (!website || !content || !analysis || !lead) {
      return NextResponse.json({ error: 'Website, content, analysis, and lead are required' }, { status: 400 });
    }

    const practiceName = lead.clinicName || 'your practice';
    const ownerName = lead.ownerName || '';
    const location = lead.clinicAddress || '';

    const prompt = `You are a medical practice outreach specialist writing a highly personalized outreach letter for Procare Specialty Pharmacy.

## Website Analysis
${analysis}

## Website Content
${content.substring(0, 10000)}

## Lead Information
- Practice Name: ${practiceName}
- Owner: ${ownerName || 'Not specified'}
- Location: ${location || 'Not specified'}
- Website: ${website}

## Instructions
Write a personalized outreach letter that:
1. Opens with a specific, evidence-based reference to the clinic's actual services or clinical model
2. References specific details from the website analysis above
3. Includes the static Procare quality assurance section (USP <797>, HPLC, Endotoxin screening)
4. Includes the documentation list (COAs, sterility testing, potency validation)
5. Mentions the value proposition about capturing more value from clinical expertise
6. Includes the CTA with QR code, pharmacycalendar.com, and phone number
7. Ends with "Thank you for your time in reading this letter." and "Respectfully, Procare Specialty Pharmacy"

The letter should be warm, professional, and clearly personalized to this specific clinic. Do not make unsupported assumptions about dissatisfaction with current vendors.

Return ONLY a JSON object with "subject" and "body" fields. Do not include any other text or markdown.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);

    const response = result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json({
        subject: parsed.subject || `Procare Specialty Pharmacy — Quality Compounding for ${practiceName}`,
        body: parsed.body || '',
      });
    } catch {
      return NextResponse.json({
        subject: `Procare Specialty Pharmacy — Quality Compounding for ${practiceName}`,
        body: text,
      });
    }
  } catch (err: any) {
    console.error('[Generate Letter Error]', err);
    return NextResponse.json({ error: err.message || 'Letter generation failed' }, { status: 500 });
  }
}
