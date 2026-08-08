'use client';

import React from 'react';
import { Calendar, SortAsc, Download, Share2, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  dateRange: 'today' | '7days' | '30days' | 'year';
  onDateRangeChange: (range: HeaderProps['dateRange']) => void;
  onMenuClick?: () => void;
}

export default function Header({ title, dateRange, onDateRangeChange, onMenuClick }: HeaderProps) {
  const labels = { today: 'Today', '7days': 'Last 7 days', '30days': 'Last 30 days', year: 'This year' };
  const [open, setOpen] = React.useState(false);

  return (
    <header className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <button onClick={onMenuClick} className="rounded-lg border border-[#E5E7EB] bg-white p-2 text-[#374151] shadow-sm md:hidden" aria-label="Open navigation">
          <Menu className="h-4 w-4" strokeWidth={1.7} />
        </button>
        <h1 className="truncate text-xl font-semibold text-[#1F2937]">{title}</h1>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
        <div className="relative min-w-0 flex-1 sm:flex-none">
          <button onClick={() => setOpen(value => !value)} aria-haspopup="menu" aria-expanded={open} className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#374151] transition-all hover:bg-[#F9FAFB] sm:w-auto">
            <Calendar className="h-4 w-4" strokeWidth={1.5} /><span>{labels[dateRange]}</span>
          </button>
          {open && (
            <div role="menu" className="absolute right-0 top-full z-20 mt-2 w-40 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-lg">
              {(Object.keys(labels) as Array<keyof typeof labels>).map(range => (
                <button key={range} role="menuitem" onClick={() => { onDateRangeChange(range); setOpen(false); }} className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-[#F9FAFB] ${range === dateRange ? 'bg-[#F4F8FB] font-medium text-[#1F6C9F]' : 'text-[#374151]'}`}>
                  {labels[range]}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#374151] transition-all hover:bg-[#F9FAFB]" aria-label="Sort">
          <SortAsc className="h-4 w-4" strokeWidth={1.5} /><span className="hidden sm:inline">Sort</span>
        </button>
        <button className="flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm font-medium text-[#374151] transition-all hover:bg-[#F9FAFB]" aria-label="Export">
          <Download className="h-4 w-4" strokeWidth={1.5} /><span className="hidden sm:inline">Export</span>
        </button>
        <button className="rounded-lg border border-[#E5E7EB] p-2 text-[#374151] transition-all hover:bg-[#F9FAFB]" aria-label="Share">
          <Share2 className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
