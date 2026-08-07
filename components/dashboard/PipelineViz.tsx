import React from 'react';
import Card from './Card';

interface PipelineStage {
  name: string;
  count: number;
  conversion: number;
  dropoff: number;
  color: string;
}

interface PipelineVizProps {
  stages: PipelineStage[];
  total: number;
}

export default function PipelineViz({ stages, total }: PipelineVizProps) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#111]">Conversion Pipeline</h3>
        <p className="text-xs text-[#787774] mt-0.5">{total} total prospects</p>
      </div>

      <div className="space-y-4">
        {stages.map((stage, i) => {
          const widthPct = total > 0 ? (stage.count / total) * 100 : 0;
          const prevCount = i > 0 ? stages[i - 1].count : total;
          const stageConversion = prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : 0;

          return (
            <div key={stage.name} className="group cursor-pointer transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium text-[#111]">{stage.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold font-mono text-[#111]">{stage.count}</span>
                  <div className="hidden group-hover:flex items-center gap-3 text-xs text-[#787774]">
                    <span>Conv: {stageConversion}%</span>
                    <span>Drop: {100 - stageConversion}%</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="h-2 bg-[#F5F5F4] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all group-hover:opacity-80"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: stage.color,
                      opacity: 0.8,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-[#B8B8B8]">
                  <span>{widthPct.toFixed(0)}% of pipeline</span>
                  <span>{stage.conversion}% conversion</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
