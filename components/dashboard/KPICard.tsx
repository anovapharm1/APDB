import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

export default function KPICard({
  label,
  value,
  subtitle,
  trend = 'neutral',
  trendValue,
  icon,
  color = '#1F6C9F',
}: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#787774';

  return (
    <div className="bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}10` }}
          >
            {icon}
          </div>
        )}
        <span className="text-xs text-[#787774] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-bold font-mono text-[#111] mb-1">{value}</div>
      {trendValue && (
        <div className="flex items-center gap-1.5 mb-2">
          {TrendIcon && <TrendIcon className="w-3 h-3" style={{ color: trendColor }} strokeWidth={1.5} />}
          <span className="text-xs font-mono" style={{ color: trendColor }}>{trendValue}</span>
        </div>
      )}
      {subtitle && <span className="text-xs text-[#B8B8B8] mt-auto">{subtitle}</span>}
    </div>
  );
}
