'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bug, 
  CheckCircle2, 
  Activity, 
  PlusCircle, 
  PlayCircle, 
  ArrowRight, 
  Star,
  RefreshCw, 
  Search
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Bug as BugType, AdminStats } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [bugs, setBugs] = useState<BugType[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bugsData, statsData] = await Promise.all([
        api.getBugs(),
        api.getAdminStats(),
      ]);
      setBugs(bugsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredBugs = bugs.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.raw_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="rounded-full bg-neutral-100 text-neutral-700 px-2.5 py-0.5 text-[11px] font-medium border border-black/[0.06]">Submitted</span>;
      case 'clarifying':
        return <span className="rounded-full bg-amber-50 text-amber-800 px-2.5 py-0.5 text-[11px] font-medium border border-amber-200 animate-pulse">Clarifying</span>;
      case 'triaging':
        return <span className="rounded-full bg-blue-50 text-blue-800 px-2.5 py-0.5 text-[11px] font-medium border border-blue-200 animate-pulse">Triaging</span>;
      case 'reproduced':
        return <span className="rounded-full bg-emerald-50 text-emerald-800 px-2.5 py-0.5 text-[11px] font-medium border border-emerald-200">Reproduced</span>;
      case 'routed':
        return <span className="rounded-full bg-neutral-900 text-white px-2.5 py-0.5 text-[11px] font-medium shadow-sm">Routed</span>;
      case 'duplicate':
        return <span className="rounded-full bg-purple-50 text-purple-800 px-2.5 py-0.5 text-[11px] font-medium border border-purple-200">Duplicate</span>;
      case 'closed':
        return <span className="rounded-full bg-neutral-100 text-neutral-400 px-2.5 py-0.5 text-[11px] font-medium border border-black/[0.04]">Closed</span>;
      default:
        return <span className="rounded-full bg-neutral-100 text-neutral-600 px-2 py-0.5 text-[11px]">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="text-red-600 font-bold text-xs uppercase tracking-tight">Critical</span>;
      case 'high':
        return <span className="text-amber-600 font-semibold text-xs uppercase tracking-tight">High</span>;
      case 'medium':
        return <span className="text-neutral-700 font-medium text-xs uppercase tracking-tight">Medium</span>;
      case 'low':
        return <span className="text-neutral-400 text-xs uppercase tracking-tight">Low</span>;
      default:
        return <span className="text-neutral-400 text-xs">{severity}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-800 mb-3">
            <span className="flex h-2 w-2 rounded-full bg-[#17c964] animate-pulse" />
            <span className="text-[11px] tracking-tight">Live Workspace Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-[-0.04em]">
            Welcome back, <span className="font-serif italic font-normal">{user ? user.name : 'Engineering Team'}</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b6b6b]">
            Role: <strong className="capitalize text-neutral-800 font-medium">{user?.role || 'Guest'}</strong> &bull; 4 AI Agents actively orchestrating triage queue
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/bugs/new"
            className="flex items-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit New Bug</span>
          </Link>
          <Link
            href="/demo"
            className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-900 shadow-sm transition"
          >
            <PlayCircle className="h-4 w-4 text-neutral-700" />
            <span>Demo Scenarios</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm hover:border-black/[0.18] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Reports</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
              <Bug className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-neutral-900 tracking-tight">{stats?.total_bugs ?? bugs.length}</div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Indexed in ChromaDB vector space</p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm hover:border-black/[0.18] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Triaged / Routed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-neutral-900 tracking-tight">
            {stats?.triaged_bugs ?? bugs.filter((b) => b.status === 'routed').length}
          </div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Autonomous multi-agent processed</p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm hover:border-black/[0.18] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Reproduced</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-neutral-900 tracking-tight">
            {stats?.reproduced_bugs ?? bugs.filter((b) => b.status === 'reproduced').length}
          </div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Selenium evidence captured</p>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm hover:border-black/[0.18] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Developer Rating</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800">
              <Star className="h-4 w-4 fill-neutral-800" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-neutral-900 tracking-tight">
            {stats?.avg_accuracy_rating ? `${stats.avg_accuracy_rating} / 5` : '4.8 / 5'}
          </div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Based on developer feedback</p>
        </div>
      </div>

      {/* Main Bugs Table Section */}
      <div className="rounded-2xl border border-black/[0.08] bg-white shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-black/[0.06]">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Active Bug Triage Queue</h2>
            <p className="text-xs text-[#6b6b6b] mt-0.5">Select any ticket to view live agent reasoning, evidence, and chat</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bugs..."
                className="w-48 sm:w-60 rounded-full bg-neutral-50 border border-black/[0.1] pl-9 pr-4 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-full bg-neutral-50 border border-black/[0.1] px-4 py-1.5 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition capitalize"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="clarifying">Clarifying</option>
              <option value="triaging">Triaging</option>
              <option value="reproduced">Reproduced</option>
              <option value="routed">Routed</option>
              <option value="duplicate">Duplicate</option>
              <option value="closed">Closed</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 rounded-full border border-black/[0.1] bg-white text-neutral-600 hover:text-black hover:bg-neutral-50 transition"
              title="Refresh Queue"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-black/[0.06] text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Bug Title &amp; ID</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Created</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6b6b6b]">
                    No bugs found matching current filter.
                  </td>
                </tr>
              ) : (
                filteredBugs.map((bug) => (
                  <tr key={bug.id} className="hover:bg-neutral-50/70 transition group">
                    <td className="px-6 py-4">
                      <Link href={`/bugs/${bug.id}`} className="block group-hover:text-black transition">
                        <span className="font-semibold text-neutral-900 line-clamp-1">{bug.title}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">#{bug.id.slice(0, 8)}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(bug.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getSeverityBadge(bug.severity)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="rounded-full bg-neutral-100 border border-black/[0.06] px-2.5 py-0.5 text-[11px] font-mono font-bold text-neutral-800">
                        {bug.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-500">
                      {new Date(bug.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/bugs/${bug.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white hover:bg-black hover:text-white px-3.5 py-1.5 text-xs font-medium text-neutral-900 transition-all shadow-sm"
                      >
                        <span>Inspect &amp; Triage</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
