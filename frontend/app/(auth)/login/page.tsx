'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, switchDemoUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setIsSubmitting(true);
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials.');
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'admin' | 'developer' | 'reporter') => {
    setErrorMsg('');
    try {
      setIsSubmitting(true);
      await switchDemoUser(role);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-black/[0.08] bg-white p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black p-2 shadow-sm mb-3">
            <img src="/bugsense-icon.png" alt="BugSense" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Sign In to <span className="font-serif italic font-normal">BugSense</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b6b6b]">Triage Smarter &bull; Build Faster</p>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="mb-6 rounded-xl bg-neutral-50 border border-black/[0.06] p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900 mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-neutral-600" />
            <span>One-Click Demo Personas:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] py-1.5 text-center text-xs font-medium text-neutral-800 transition shadow-sm active:scale-95"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('developer')}
              className="rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] py-1.5 text-center text-xs font-medium text-neutral-800 transition shadow-sm active:scale-95"
            >
              Developer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('reporter')}
              className="rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] py-1.5 text-center text-xs font-medium text-neutral-800 transition shadow-sm active:scale-95"
            >
              Reporter
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. dev.auth@bugtriage.ai"
              className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-black hover:bg-neutral-800 py-3 text-xs font-medium text-white shadow-sm disabled:opacity-50 transition duration-200 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <LogIn className="h-4 w-4" />}
            <span>Sign In</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Need an account?{' '}
          <Link href="/register" className="text-black hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
