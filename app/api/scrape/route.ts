import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch website' }, { status: 500 });
    }

    const html = await response.text();
    
    // Parse with JSDOM for better extraction
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Extract title
    const title = document.querySelector('title')?.textContent?.trim() || '';
    
    // Extract meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';
    
    // Extract H1
    const h1 = document.querySelector('h1')?.textContent?.trim() || '';
    
    // Extract H2s
    const h2s = Array.from(document.querySelectorAll('h2'))
      .map((h: Element) => h.textContent?.trim())
      .filter(Boolean)
      .slice(0, 10);
    
    // Extract paragraphs (filter for meaningful content)
    const paragraphs = Array.from(document.querySelectorAll('p'))
      .map((p: Element) => p.textContent?.trim())
      .filter(text => text && text.length > 30)
      .slice(0, 15);
    
    // Extract potential owner names
    let ownerName = '';
    const ownerPatterns = [
      /Dr\.?\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
      /Dr\.?\s+([A-Z][a-z]+)/gi,
      /([A-Z][a-z]+\s+[A-Z][a-z]+),\s*(MD|DO|DDS|DMD|PA)/gi,
    ];
    for (const pattern of ownerPatterns) {
      const match = html.match(pattern);
      if (match && match[0]) {
        ownerName = match[0].replace(/,/g, '').trim();
        break;
      }
    }
    
    // Extract location
    let location = '';
    const locationPatterns = [
      /([A-Z][a-z\s]+),\s*(VA|NY|CA|FL|TX|CO|WA|OR|GA|NC|MA|MD|DC)\b/gi,
      /(Northern\s+[A-Z][a-z]+)/gi,
    ];
    for (const pattern of locationPatterns) {
      const match = html.match(pattern);
      if (match && match[0]) {
        location = match[0].trim();
        break;
      }
    }
    
    // Extract specialties/services
    let specialties: string[] = [];
    const specialtyPatterns = [
      /(NAD\+|Peptide|Peptide Therapy|Hormone|Weight Loss|GLP-1|Longevity|Sexual Health|Regenerative|Aesthetics|Dermatology|Medical Spa|Wellness|Optimization|Injectables|Botox|Fillers|Laser|IV Therapy|Cellular)/gi,
    ];
    for (const pattern of specialtyPatterns) {
      const matches = html.match(pattern);
      if (matches) {
        specialties = Array.from(new Set(matches.map(m => m.trim())));
        break;
      }
    }
    
    // Build focused content for AI processing
    const focusedContent = [
      title,
      metaDesc,
      h1,
      ...h2s,
      ...paragraphs,
      `Owner: ${ownerName}`,
      `Location: ${location}`,
      `Specialties: ${specialties.join(', ')}`,
    ].filter(Boolean).join('\n\n');

    // Log what was scraped
    console.log('[Scrape Log]', {
      url,
      title,
      ownerName: ownerName || 'not found',
      location: location || 'not found',
      specialties: specialties.length > 0 ? specialties : 'none found',
      contentLength: focusedContent.length,
      paragraphsExtracted: paragraphs.length,
      headingsExtracted: h2s.length,
    });

    return NextResponse.json({ 
      content: focusedContent,
      log: {
        title,
        ownerName: ownerName || null,
        location: location || null,
        specialties: specialties,
        contentLength: focusedContent.length,
      }
    });
  } catch (err) {
    console.error('[Scrape Error]', err);
    return NextResponse.json({ error: 'Scraping failed' }, { status: 500 });
  }
}
