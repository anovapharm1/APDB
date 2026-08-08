import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, className = '', padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-8',
  };

  return (
    <div className={`
      bg-white rounded-2xl border border-[#EAEAEA]/80 shadow-sm
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  );
}
