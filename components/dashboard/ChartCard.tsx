import React from 'react';
import Card from './Card';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
}

export default function ChartCard({ title, subtitle, children, className = '', height = 'h-72' }: ChartCardProps) {
  return (
    <Card className={className}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#111]">{title}</h3>
        {subtitle && <p className="text-xs text-[#787774] mt-0.5">{subtitle}</p>}
      </div>
      <div className={height}>
        {children}
      </div>
    </Card>
  );
}
