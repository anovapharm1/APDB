'use client';

import React, { useState } from 'react';
import { Lead } from '@/types/lead';
import { Globe, Sparkles, Copy, Send, RefreshCw, CheckCircle, AlertCircle, FileDown } from 'lucide-react';
import { ScrapeLog } from '@/lib/openrouter';

interface LetterGenerationProps {
  leads: Lead[];
  onUpdateLead: (lead: Lead) => void;
}

export default function LetterGeneration({ leads, onUpdateLead }: LetterGenerationProps) {
  const [website, setWebsite] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'idle' | 'scraping' | 'analyzing' | 'generating' | 'done'>('idle');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [letter, setLetter] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [scrapeLog, setScrapeLog] = useState<ScrapeLog | null>(null);

  const selectedLead = leads.find(l => l.id === selectedLeadId);

  const handleGenerate = async () => {
    if (!website.trim()) {
      setError('Please enter a website URL');
      return;
    }
    setError('');
    setIsGenerating(true);
    setAnalysis(null);
    setLetter(null);
    setScrapeLog(null);

    try {
      // Step 1: Scrape website
      setStep('scraping');
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: website }),
      });
      if (!scrapeRes.ok) {
        const errData = await scrapeRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Scraping failed');
      }
      const scrapeData = await scrapeRes.json();
      setScrapeLog(scrapeData.log || null);
      const content = scrapeData.content || '';
      if (!content) {
        setError('Could not retrieve website content. Please check the URL.');
        setIsGenerating(false);
        return;
      }

      // Step 2: Analyze with Gemini
      setStep('analyzing');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          content,
          clinicName: selectedLead?.clinicName || '',
        }),
      });
      if (!analyzeRes.ok) {
        const errData = await analyzeRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed');
      }
      const analyzeData = await analyzeRes.json();
      setAnalysis(analyzeData.analysis || '');

      // Step 3: Generate letter
      setStep('generating');
      const lead = selectedLead || {
        id: 'new',
        clinicName: '',
        clinicAddress: '',
        ownerName: '',
        clinicWebsite: website,
        phone: '',
        notes: '',
        outreachMethod: 'Letters Sent',
        stage: 'Lead Pending',
        priority: 'Medium',
        assignedTo: 'Alex Mercer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activities: [],
        outreachCompleted: false,
      };
      const genRes = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          content,
          analysis: analyzeData.analysis,
          lead,
        }),
      });
      if (!genRes.ok) {
        const errData = await genRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Letter generation failed');
      }
      const genData = await genRes.json();
      setLetter({ subject: genData.subject, body: genData.body });
      setStep('done');
    } catch (err: any) {
      setError(err.message || 'Failed to generate letter');
      setStep('idle');
    }
    setIsGenerating(false);
  };

  const handleCopy = () => {
    if (!letter) return;
    const text = `Subject: ${letter.subject}\n\n${letter.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!letter) return;
    const content = `Subject: ${letter.subject}\n\n${letter.body}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${letter.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToLead = () => {
    if (!selectedLead || !letter) return;
    onUpdateLead({
      ...selectedLead,
      notes: `${selectedLead.notes || ''}\n\n--- Generated Outreach Letter ---\nSubject: ${letter.subject}\n\n${letter.body}`,
    });
  };

  const stepLabels = {
    idle: 'Ready',
    scraping: 'Scraping website...',
    analyzing: 'Analyzing signals...',
    generating: 'Generating letter...',
    done: 'Complete!',
  };

  return (
    <div className="space-y-5">
      {/* Input Section */}
      <div className="bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm p-6">
        <h2 className="text-sm font-medium text-[#111] mb-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1F6C9F]" strokeWidth={1.5} />
          Letter Generation
        </h2>
        <p className="text-xs text-[#787774] mb-5">Enter a website URL to scrape and generate a personalized outreach letter using AI.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-[#787774] font-medium mb-1.5">Website URL</label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B8B8]" strokeWidth={1.5} />
              <input
                type="url"
                placeholder="https://example-clinic.com"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-[#F9F9F8] border border-[#EAEAEA] rounded-xl text-sm text-[#2F3437] placeholder-[#B8B8B8] focus:outline-none focus:ring-2 focus:ring-[#1F6C9F]/10 focus:border-[#1F6C9F]/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#787774] font-medium mb-1.5">Lead (optional)</label>
            <select
              value={selectedLeadId}
              onChange={e => setSelectedLeadId(e.target.value)}
              className="w-full px-3 py-2 bg-[#F9F9F8] border border-[#EAEAEA] rounded-xl text-sm text-[#2F3437] focus:outline-none focus:ring-2 focus:ring-[#1F6C9F]/10 focus:border-[#1F6C9F]/30 transition-all cursor-pointer"
            >
              <option value="">New lead (website only)</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>{l.clinicName} — {l.ownerName}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-[#FDEBEC] border border-[#FDEBEC] rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#9F2F2D] shrink-0" strokeWidth={1.5} />
              <span className="text-xs text-[#9F2F2D]">{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !website.trim()}
            className="w-full px-4 py-2.5 bg-[#1F6C9F] text-white rounded-xl text-sm font-medium hover:bg-[#1A5A8A] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                {stepLabels[step]}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                Generate Personalized Letter
              </>
            )}
          </button>
        </div>
      </div>

      {/* Scrape Log */}
      {scrapeLog && (
        <div className="bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm p-5">
          <h3 className="text-xs text-[#787774] font-mono tracking-wider mb-3">SCRAPE LOG</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-[#B8B8B8] block">Title</span>
                <span className="text-sm font-medium text-[#111]">{scrapeLog.title || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-[#B8B8B8] block">Owner Name</span>
                <span className="text-sm font-medium text-[#111]">{scrapeLog.ownerName || 'not found'}</span>
              </div>
              <div>
                <span className="text-xs text-[#B8B8B8] block">Location</span>
                <span className="text-sm font-medium text-[#111]">{scrapeLog.location || 'not found'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-[#B8B8B8] block">Specialties</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {scrapeLog.specialties && scrapeLog.specialties.length > 0
                    ? scrapeLog.specialties.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#EEF6FC] text-[#1F6C9F] rounded-full text-xs">{s}</span>
                      ))
                    : <span className="text-xs text-[#B8B8B8]">none found</span>}
                </div>
              </div>
              <div>
                <span className="text-xs text-[#B8B8B8] block">Content Length</span>
                <span className="text-sm font-medium text-[#111]">{scrapeLog.contentLength || 0} chars</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Display */}
      {analysis && (
        <div className="bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm p-5">
          <h3 className="text-xs text-[#787774] font-mono tracking-wider mb-3">WEBSITE ANALYSIS</h3>
          <div className="prose prose-sm max-w-none text-[#2F3437] leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}

      {/* Generated Letter */}
      {letter && (
        <div className="bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#EAEAEA] bg-gradient-to-r from-[#FAFAFA] to-[#F7F7F7] flex items-center justify-between">
            <span className="text-xs text-[#787774] font-mono tracking-wider">GENERATED LETTER</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#787774] hover:text-[#1F6C9F] hover:bg-[#EEF6FC] transition-all flex items-center gap-1"
              >
                {copied ? <CheckCircle className="w-3 h-3 text-[#346538]" strokeWidth={1.5} /> : <Copy className="w-3 h-3" strokeWidth={1.5} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#787774] hover:text-[#1F6C9F] hover:bg-[#EEF6FC] transition-all flex items-center gap-1"
              >
                <FileDown className="w-3 h-3" strokeWidth={1.5} />
                Download
              </button>
              {selectedLead && (
                <button
                  onClick={handleSaveToLead}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#787774] hover:text-[#346538] hover:bg-[#EDF6ED] transition-all flex items-center gap-1"
                >
                  <Send className="w-3 h-3" strokeWidth={1.5} />
                  Save to Lead
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-medium text-[#111] mb-1">{letter.subject}</h3>
            <div className="prose prose-sm max-w-none text-[#2F3437] leading-relaxed whitespace-pre-wrap">
              {letter.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
