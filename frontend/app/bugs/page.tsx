'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bug, 
  PlusCircle, 
  Search, 
  RefreshCw, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '@/lib/api';
import { Bug as BugType } from '@/types';

export default function BugsPage() {
  const [bugs, setBugs] = useState<BugType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadBugs = async () => {
    setLoading(true);
    try {
      const data = await api.getBugs();
      setBugs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBugs();
  }, []);

  const filtered = bugs.filter((b) => {
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.raw_description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-[-0.04em] flex items-center gap-2.5">
            <span>Bug Reports</span>
            <span className="font-serif italic font-normal text-neutral-900">Registry</span>
          </h1>
          <p className="mt-1 text-xs text-[#6b6b6b]">
            Browse, search, and manage software defect tickets across all microservices
          </p>
        </div>

        <Link
          href="/bugs/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition self-start sm:self-auto active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Bug Report</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or description keywords..."
            className="w-full rounded-full bg-neutral-50 border border-black/[0.1] pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full bg-neutral-50 border border-black/[0.1] px-4 py-2 text-xs text-neutral-900 focus:bg-white focus:outline-none focus:border-black transition capitalize"
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
          </div>

          <button
            onClick={loadBugs}
            className="rounded-full border border-black/[0.1] bg-white p-2 text-neutral-600 hover:text-black hover:bg-neutral-50 transition"
            title="Refresh List"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid of Bug Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((bug) => (
          <Link
            key={bug.id}
            href={`/bugs/${bug.id}`}
            className="group rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm hover:border-black/[0.22] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-[10px] text-neutral-400">#{bug.id.slice(0, 8)}</span>
                <span className="capitalize rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-black/[0.06]">
                  {bug.status}
                </span>
              </div>

              <h2 className="text-sm font-bold text-neutral-900 group-hover:text-black transition-colors line-clamp-2 mb-2 tracking-tight">
                {bug.title}
              </h2>

              <p className="text-xs text-[#6b6b6b] line-clamp-3 leading-relaxed mb-4">
                {bug.raw_description}
              </p>
            </div>

            <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-800 uppercase text-[10px] tracking-tight">{bug.severity}</span>
                <span>&bull;</span>
                <span className="font-mono text-neutral-600 font-bold text-[10px]">{bug.priority}</span>
              </div>

              <span className="flex items-center gap-1 text-black font-medium group-hover:translate-x-1 transition-transform text-xs">
                <span>Inspect</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
