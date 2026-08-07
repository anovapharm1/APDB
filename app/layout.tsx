import './globals.css';
import React from 'react';
import { AuthProvider } from '@/lib/auth-context';

export const metadata = {
  title: 'Pipeline - ANOVA CRM',
  description: 'Comprehensive CRM Application with Lead Entry, Pipeline Tracking & ANOVA Analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8F9FB] text-[#1F2937] antialiased min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
