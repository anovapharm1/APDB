'use client';

import React from 'react';
import { Calendar, SortAsc, Download, Share2 } from 'lucide-react';

interface HeaderProps {
  title: string;
  dateRange: 'today' | '7days' | '30days' | 'year';
  onDateRangeChange: (range: HeaderProps['dateRange']) => void;
}

export default function Header({ title, dateRange, onDateRangeChange }: HeaderProps) {
  const labels = { today: 'Today', '7days': 'Last 7 days', '30days': 'Last 30 days', year: 'This year' };
  const [open, setOpen] = React.useState(false);

  return (
    <header className="h-12 flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold text-[#1F2937]">{title}</h1>
      <div className="flex items-center gap-2">
        <div className="relative">
          <button onClick={() => setOpen(value => !value)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all">
            <Calendar className="w-4 h-4" strokeWidth={1.5} />{labels[dateRange]}
          </button>
          {open && (
            <div role="menu" className="absolute right-0 top-full mt-2 w-40 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-lg z-20">
              {(Object.keys(labels) as Array<keyof typeof labels>).map(range => (
                <button key={range} role="menuitem" onClick={() => { onDateRangeChange(range); setOpen(false); }} className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-[#F9FAFB] ${range === dateRange ? 'font-medium text-[#1F6C9F] bg-[#F4F8FB]' : 'text-[#374151]'}`}>
                  {labels[range]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all">
          <SortAsc className="w-4 h-4" strokeWidth={1.5} />Sort
        </button>
        <button className="flex items-center gap-2 px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all">
          <Download className="w-4 h-4" strokeWidth={1.5} />Export
        </button>
        <button className="p-2 border border-[#E5E7EB] rounded-lg text-[#374151] hover:bg-[#F9FAFB] transition-all" aria-label="Share">
          <Share2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
