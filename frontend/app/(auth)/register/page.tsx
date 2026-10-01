'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('reporter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setIsSubmitting(true);
      await register(name, email, password, role);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
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
            Create an <span className="font-serif italic font-normal">Account</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b6b6b]">Join BugSense multi-agent autonomous triage workspace</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Smith"
              className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@company.com"
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

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">Workspace Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition capitalize"
            >
              <option value="reporter">Reporter (Submit bug reports)</option>
              <option value="developer">Developer (Inspect reproduction &amp; feedback)</option>
              <option value="admin">Administrator (Manage components &amp; seed data)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-black hover:bg-neutral-800 py-3 text-xs font-medium text-white shadow-sm disabled:opacity-50 transition duration-200 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <UserPlus className="h-4 w-4" />}
            <span>Complete Registration</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <Link href="/login" className="text-black hover:underline font-semibold">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
