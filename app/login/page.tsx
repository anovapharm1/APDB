'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ArrowRight, Building2, LockKeyhole, UserRound } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    const success = login(username, password);
    if (success) {
      window.location.assign('/');
      return;
    }
    setIsSubmitting(false);
    setError('Enter a valid whitelisted username and password.');
  };

  return (
    <main className="min-h-screen bg-[#F5F7F9] px-5 py-8 text-[#1F2937] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-[#DDE5EA] bg-white shadow-[0_24px_70px_rgba(31,55,69,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden bg-[#123B52] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D9EEF6] text-[#123B52]">
                  <Building2 className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-wide">Pipeline</p>
                  <p className="text-xs text-[#B8D0DC]">ANOVA CRM</p>
                </div>
              </div>
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-[#9DC7D8]">Clinic growth operations</p>
              <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-[-0.03em]">Keep every clinic moving forward.</h1>
              <p className="mt-5 max-w-sm text-sm leading-6 text-[#C8DCE5]">Coordinate long-cycle outreach, follow-ups, and pipeline momentum from one calm workspace.</p>
            </div>
            <p className="text-xs text-[#9DBBC8]">A focused workspace for consistent follow-through.</p>
          </section>

          <section className="p-7 sm:p-10 lg:p-12">
            <div className="mb-9 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#123B52] text-white"><Building2 className="h-5 w-5" strokeWidth={1.7} /></div>
                <div><p className="text-sm font-semibold">Pipeline</p><p className="text-xs text-[#7A8A93]">ANOVA CRM</p></div>
              </div>
            </div>
            <div className="mb-8">
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[#6B8794]">Secure workspace</p>
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#17232B]">Welcome back</h2>
              <p className="mt-2 text-sm text-[#71808A]">Sign in to continue managing your clinic pipeline.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="mb-2 block text-xs font-semibold text-[#42515A]">Username</label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8EA0AA]" strokeWidth={1.7} />
                  <input id="username" type="text" value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" placeholder="TWAN67 or BO" required className="w-full rounded-xl border border-[#DCE5EA] bg-[#FBFCFD] py-3 pl-10 pr-3 text-sm text-[#17232B] outline-none transition focus:border-[#2B7393] focus:ring-4 focus:ring-[#2B7393]/10" />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold text-[#42515A]">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8EA0AA]" strokeWidth={1.7} />
                  <input id="password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" placeholder="Enter password" required className="w-full rounded-xl border border-[#DCE5EA] bg-[#FBFCFD] py-3 pl-10 pr-3 text-sm text-[#17232B] outline-none transition focus:border-[#2B7393] focus:ring-4 focus:ring-[#2B7393]/10" />
                </div>
              </div>
              {error && <p role="alert" className="rounded-xl border border-[#F0C9C9] bg-[#FFF5F5] px-3 py-2.5 text-xs text-[#9F2F2D]">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B52] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1C536D] active:translate-y-px disabled:cursor-wait disabled:opacity-70">
                {isSubmitting ? 'Signing in...' : 'Sign in'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" strokeWidth={1.8} />}
              </button>
            </form>
            <p className="mt-7 text-center text-xs text-[#8A979E]">Use your assigned Pipeline account to continue.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
