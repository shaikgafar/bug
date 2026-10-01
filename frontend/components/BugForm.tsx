'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Send, 
  Sparkles, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { Component, BugSeverity, BugPriority } from '@/types';
import { api } from '@/lib/api';

export default function BugForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'raw' | 'structured'>('raw');
  const [components, setComponents] = useState<Component[]>([]);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [rawDescription, setRawDescription] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [priority, setPriority] = useState<BugPriority>('P2');
  const [autoTriage, setAutoTriage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Structured fields (if structured tab)
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [environment, setEnvironment] = useState('');

  useEffect(() => {
    api.getComponents()
      .then((data) => setComponents(data))
      .catch((err) => console.error('Failed to load components', err));
  }, []);

  const loadPreset = (presetType: 'incomplete' | 'duplicate' | 'regression' | 'complete') => {
    if (presetType === 'incomplete') {
      setTitle('Login broken');
      setRawDescription("I tried to log in today and it didn't work. The button just spins and nothing happens. Please fix ASAP.");
      setMode('raw');
    } else if (presetType === 'duplicate') {
      setTitle('Google SSO login button remains in infinite loading state after auth popup');
      setRawDescription('Signing in through Google SSO triggers popup. Once authenticated, popup closes but authentication token is never written to session storage. Main login screen stays disabled with loading spinner forever.');
      setMode('raw');
    } else if (presetType === 'regression') {
      setTitle('Regression: Checkout flow throws 500 Internal Server Error when selecting Stripe credit card');
      setRawDescription("After release v2.4.1 deployed this morning, clicking 'Pay with Credit Card' on the checkout page immediately triggers a 500 error from POST /api/v1/checkout/process. In v2.4.0 this was functioning normally. Server log indicates KeyError: 'currency_code' in payment intent builder.");
      setMode('raw');
    } else if (presetType === 'complete') {
      setTitle('User profile avatar upload fails for PNG images over 2MB with silent drop');
      setRawDescription(`Summary:
Uploading a 2.5MB PNG file as user profile photo fails silently without any error banner displayed to the user.

Steps to reproduce:
1. Log in as any standard user.
2. Navigate to /settings/profile.
3. Click 'Upload Photo' and select sample_avatar_3mb.png.
4. Click 'Save Profile Changes'.

Expected Result:
Either upload succeeds and displays avatar preview, or a clear validation message shows: 'File size must be under 2MB'.

Actual Result:
The form resets to original state, no network request is logged in the DevTools console, and no feedback is shown.

Environment:
Firefox 129.0 on Ubuntu 24.04 LTS, Backend commit 4f981ae.`);
      setMode('raw');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let finalDesc = rawDescription;
    if (mode === 'structured') {
      finalDesc = `${rawDescription}\n\nSteps to reproduce:\n${steps}\n\nExpected Result:\n${expected}\n\nActual Result:\n${actual}\n\nEnvironment:\n${environment}`;
    }

    if (!title.trim() || !finalDesc.trim()) {
      setErrorMsg('Please enter a title and description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newBug = await api.createBug({
        title: title.trim(),
        raw_description: finalDesc.trim(),
        component_id: selectedComponent ? selectedComponent : null,
        severity: severity,
        priority: priority,
      });

      if (autoTriage) {
        await api.startTriage(newBug.id);
      }

      router.push(`/bugs/${newBug.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit bug report.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-sm max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5 mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>Submit Bug</span>
            <span className="font-serif italic font-normal text-neutral-900">Report</span>
          </h2>
          <p className="text-xs text-[#6b6b6b] mt-0.5">
            Accepts freeform text, Slack snippets, customer emails, or structured forms
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center rounded-full bg-neutral-100 p-1 border border-black/[0.06]">
          <button
            type="button"
            onClick={() => setMode('raw')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              mode === 'raw' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Raw Unstructured
          </button>
          <button
            type="button"
            onClick={() => setMode('structured')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              mode === 'structured' ? 'bg-black text-white shadow-sm' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Structured
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 rounded-2xl bg-neutral-50/80 border border-black/[0.06] p-4">
        <div className="flex items-center justify-between text-xs text-neutral-800 font-semibold mb-2.5">
          <span className="flex items-center gap-1.5 text-neutral-900">
            <Sparkles className="h-3.5 w-3.5 text-neutral-600" />
            <span>Load Demo Presets:</span>
          </span>
          <span className="text-[10px] text-neutral-400">1-click test scenarios</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadPreset('incomplete')}
            className="rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] px-3 py-1.5 text-xs text-neutral-800 transition font-medium shadow-sm"
          >
            1. Incomplete (&ldquo;Login broken&rdquo;)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('duplicate')}
            className="rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] px-3 py-1.5 text-xs text-neutral-800 transition font-medium shadow-sm"
          >
            2. Potential Duplicate
          </button>
          <button
            type="button"
            onClick={() => loadPreset('regression')}
            className="rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] px-3 py-1.5 text-xs text-neutral-800 transition font-medium shadow-sm"
          >
            3. New Regression (500 Error)
          </button>
          <button
            type="button"
            onClick={() => loadPreset('complete')}
            className="rounded-full bg-white hover:bg-neutral-100 border border-black/[0.08] px-3 py-1.5 text-xs text-neutral-800 transition font-medium shadow-sm"
          >
            4. Complete High-Quality Report
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-800 flex items-center gap-2 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Bug Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Infinite spinner on Google OAuth login button"
            className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Description / Report Details <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={mode === 'raw' ? 8 : 4}
            value={rawDescription}
            onChange={(e) => setRawDescription(e.target.value)}
            placeholder={
              mode === 'raw'
                ? "Paste raw bug report, customer feedback, stack traces, or step descriptions...\nThe Triage Agent will automatically extract steps, expected/actual results, and assess completeness."
                : "General overview of the defect..."
            }
            className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] p-4 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition font-sans leading-relaxed"
            required
          />
        </div>

        {mode === 'structured' && (
          <div className="space-y-4 pt-3 border-t border-black/[0.06]">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Steps to Reproduce</label>
              <textarea
                rows={3}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder="1. Go to /login&#10;2. Click Sign In with Google&#10;3. Authorize account"
                className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Expected Result</label>
                <input
                  type="text"
                  value={expected}
                  onChange={(e) => setExpected(e.target.value)}
                  placeholder="Redirects to dashboard"
                  className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-4 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Actual Result</label>
                <input
                  type="text"
                  value={actual}
                  onChange={(e) => setActual(e.target.value)}
                  placeholder="Button spins indefinitely"
                  className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-4 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Environment</label>
              <input
                type="text"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Chrome 128 on macOS Sonoma, App v2.4.1"
                className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-4 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
              />
            </div>
          </div>
        )}

        {/* Optional Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-black/[0.06]">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Target Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
            >
              <option value="">Auto-Detect with AI</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as BugSeverity)}
              className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition capitalize"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as BugPriority)}
              className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
            >
              <option value="P0">P0 (Urgent)</option>
              <option value="P1">P1 (High)</option>
              <option value="P2">P2 (Medium)</option>
              <option value="P3">P3 (Low)</option>
            </select>
          </div>
        </div>

        {/* Auto-Triage Checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="autoTriage"
            checked={autoTriage}
            onChange={(e) => setAutoTriage(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black accent-black"
          />
          <label htmlFor="autoTriage" className="text-xs font-medium text-neutral-700 cursor-pointer">
            Immediately trigger 4-Agent Autonomous Triage Pipeline upon creation
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-black/[0.06]">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-full bg-black hover:bg-neutral-800 px-6 py-3 text-xs font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Launching Multi-Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Create &amp; Triage Bug</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
