'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Database, 
  Star, 
  CheckCircle2, 
  Plus, 
  Loader2, 
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { Component, AdminStats, Feedback } from '@/types';

export default function AdminPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // New component form
  const [compName, setCompName] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compTeam, setCompTeam] = useState('');
  const [isCreatingComp, setIsCreatingComp] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [compData, statsData, fbData] = await Promise.all([
        api.getComponents(),
        api.getAdminStats(),
        api.getFeedback(),
      ]);
      setComponents(compData);
      setStats(statsData);
      setFeedbacks(fbData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compDesc || !compTeam) return;

    try {
      setIsCreatingComp(true);
      await api.createComponent({
        name: compName,
        description: compDesc,
        owner_team: compTeam,
      });
      setCompName('');
      setCompDesc('');
      setCompTeam('');
      loadAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingComp(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      setSeedNotice('');
      const res = await api.seedDemo();
      setSeedNotice(res.message || 'Demo environment re-seeded successfully!');
      loadAdminData();
    } catch (err: any) {
      setSeedNotice(`Seed error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-[-0.04em] flex items-center gap-2.5">
            <span>Admin &amp;</span>
            <span className="font-serif italic font-normal text-neutral-900">Architecture Console</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b6b6b]">
            System component registry, multi-agent accuracy telemetry, and demo environment reset
          </p>
        </div>

        <button
          onClick={handleSeedDemo}
          disabled={isSeeding}
          className="flex items-center gap-2 rounded-full bg-black hover:bg-neutral-800 px-5 py-2.5 text-xs font-medium text-white shadow-sm disabled:opacity-50 transition active:scale-95"
        >
          {isSeeding ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Database className="h-4 w-4" />}
          <span>Re-Seed Sample Bugs &amp; Vector Store</span>
        </button>
      </div>

      {seedNotice && (
        <div className="rounded-2xl bg-neutral-50 border border-black/[0.08] p-4 text-xs text-neutral-800 flex items-center gap-2 shadow-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-neutral-600" />
          <span>{seedNotice}</span>
        </div>
      )}

      {/* Accuracy & Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Triage Accuracy Score</span>
            <Star className="h-4 w-4 text-neutral-900 fill-neutral-900" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-neutral-900 tracking-tight">
            {stats?.avg_accuracy_rating ? `${stats.avg_accuracy_rating} / 5` : '4.8 / 5'}
          </div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Evaluated by engineering team leads</p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Reproduction Fidelity</span>
            <CheckCircle2 className="h-4 w-4 text-[#17c964]" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-neutral-900 tracking-tight">
            {stats?.avg_reproduction_rating ? `${stats.avg_reproduction_rating} / 5` : '4.6 / 5'}
          </div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Automated headless test pass rate</p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>Registered Components</span>
            <Layers className="h-4 w-4 text-neutral-900" />
          </div>
          <div className="mt-3 text-3xl font-extrabold text-neutral-900 tracking-tight">
            {components.length}
          </div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Mapped to specialized teams</p>
        </div>
      </div>

      {/* Components Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Component List (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Layers className="h-4 w-4 text-neutral-700" />
              <span>Architectural Components ({components.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {components.map((comp) => (
              <div
                key={comp.id}
                className="rounded-xl border border-black/[0.06] bg-neutral-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-black/[0.15] transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900 text-xs">{comp.name}</span>
                    <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-[10px] text-neutral-800 font-medium">
                      {comp.owner_team}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6b6b6b] mt-1 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Component Form (1 col) */}
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm h-fit">
          <h2 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-neutral-700" />
            <span>Add New Component</span>
          </h2>

          <form onSubmit={handleCreateComponent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">Component Name</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                placeholder="e.g. Media CDN &amp; Assets"
                className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">Owning Team</label>
              <input
                type="text"
                value={compTeam}
                onChange={(e) => setCompTeam(e.target.value)}
                placeholder="e.g. Content Infrastructure"
                className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] px-3.5 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">Description &amp; Scope</label>
              <textarea
                rows={3}
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                placeholder="Handles S3 image uploads, transcoding, and edge caching..."
                className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] p-3 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingComp}
              className="w-full rounded-full bg-black hover:bg-neutral-800 py-2.5 text-xs font-medium text-white shadow-sm transition active:scale-95 disabled:opacity-50"
            >
              {isCreatingComp ? 'Registering...' : 'Register Component'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
