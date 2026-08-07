import React from 'react';
import Card from './Card';

interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: any) => React.ReactNode;
}

interface AnalyticsTableProps {
  title: string;
  columns: TableColumn[];
  data: any[];
  subtitle?: string;
}

export default function AnalyticsTable({ title, subtitle, columns, data }: AnalyticsTableProps) {
  return (
    <Card>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[#111]">{title}</h3>
        {subtitle && <p className="text-xs text-[#787774] mt-0.5">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#EAEAEA] text-xs text-[#787774] uppercase tracking-wider font-medium">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-3 ${
                    col.align === 'center' ? 'text-center' :
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAEAEA]">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-[#F9F9F8] transition-aesthetic">
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${
                      col.align === 'center' ? 'text-center' :
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
