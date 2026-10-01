'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, X, ExternalLink, Sparkles } from 'lucide-react';
import { DuplicateMatch } from '@/types';
import { api } from '@/lib/api';

interface DuplicateCardProps {
  currentBugId: string;
  currentBugTitle: string;
  currentBugDescription: string;
  matches: DuplicateMatch[];
  onConfirmed?: () => void;
}

export default function DuplicateCard({
  currentBugId,
  currentBugTitle,
  currentBugDescription,
  matches,
  onConfirmed,
}: DuplicateCardProps) {
  const [loadingMatchId, setLoadingMatchId] = useState<string | null>(null);

  if (!matches || matches.length === 0) {
    return (
      <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2.5 text-neutral-700">
          <Copy className="h-4 w-4 text-neutral-500" />
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Duplicate Detection</h3>
        </div>
        <p className="mt-3 text-xs text-[#6b6b6b] leading-relaxed">
          Vector similarity index checked against existing reports. No potential duplicates detected above threshold (&gt; 50%).
        </p>
      </div>
    );
  }

  const handleConfirm = async (matchedBugId: string, confirmed: boolean) => {
    try {
      setLoadingMatchId(matchedBugId);
      await api.confirmDuplicate(currentBugId, matchedBugId, confirmed);
      if (onConfirmed) onConfirmed();
    } finally {
      setLoadingMatchId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 shadow-sm">
            <Copy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Potential Duplicate Detected</h3>
            <p className="text-[11px] text-[#6b6b6b]">ChromaDB semantic vector cosine match</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-900 border border-black/[0.06]">
          <Sparkles className="h-3 w-3 text-neutral-600" /> {matches.length} Candidate(s)
        </span>
      </div>

      <div className="space-y-4">
        {matches.map((match) => {
          const pct = Math.round(match.similarity_score * 100);
          const isHigh = pct >= 80;
          const isConfirmed = match.confirmed === true;
          const isRejected = match.confirmed === false;

          return (
            <div
              key={match.id}
              className="rounded-xl border border-black/[0.08] bg-neutral-50/50 p-5 transition-all"
            >
              {/* Score header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      isHigh
                        ? 'bg-black text-white'
                        : 'bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    {pct}% Similarity
                  </span>
                  <span className="text-xs font-medium text-neutral-600">
                    Matches with Bug <strong className="text-neutral-900 font-mono">#{match.matched_bug_id.slice(0, 8)}</strong>
                  </span>
                </div>

                <Link
                  href={`/bugs/${match.matched_bug_id}`}
                  className="flex items-center gap-1 text-xs text-neutral-900 font-semibold hover:underline"
                  target="_blank"
                >
                  <span>Inspect Bug</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              {/* Matched Title */}
              <div className="text-xs font-semibold text-neutral-900 mb-3">
                &ldquo;{match.matched_bug_title || 'Historical Bug Report'}&rdquo;
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white border border-black/[0.06] p-4 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Current Report (This Bug)
                  </div>
                  <div className="font-semibold text-neutral-900 line-clamp-1 mb-1">{currentBugTitle}</div>
                  <p className="text-neutral-600 text-[11px] line-clamp-3 leading-relaxed">
                    {currentBugDescription}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-black/[0.06] p-4 shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    Matched Historical Bug
                  </div>
                  <div className="font-semibold text-neutral-900 line-clamp-1 mb-1">{match.matched_bug_title}</div>
                  <p className="text-neutral-600 text-[11px] leading-relaxed">
                    Status: <span className="font-mono text-neutral-800 capitalize font-medium">{match.matched_bug_status || 'triaged'}</span>. Vector distance indicates shared subsystem failure and reproduction steps.
                  </p>
                </div>
              </div>

              {/* Confirmation Actions */}
              <div className="mt-4 pt-3 border-t border-black/[0.06] flex items-center justify-between">
                <div className="text-[11px] text-neutral-500">
                  {isConfirmed && <span className="text-[#17c964] font-semibold">✓ Confirmed as Duplicate</span>}
                  {isRejected && <span className="text-neutral-500">✗ Marked as Distinct Issue</span>}
                  {match.confirmed === null && <span>Review similarity and confirm whether this is a duplicate:</span>}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConfirm(match.matched_bug_id, true)}
                    disabled={loadingMatchId === match.matched_bug_id || isConfirmed}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition shadow-sm ${
                      isConfirmed
                        ? 'bg-neutral-200 text-neutral-600'
                        : 'bg-black text-white hover:bg-neutral-800'
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    <span>Confirm Duplicate</span>
                  </button>

                  <button
                    onClick={() => handleConfirm(match.matched_bug_id, false)}
                    disabled={loadingMatchId === match.matched_bug_id || isRejected}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium border border-black/[0.1] bg-white hover:bg-neutral-50 text-neutral-800 transition shadow-sm ${
                      isRejected ? 'opacity-50' : ''
                    }`}
                  >
                    <X className="h-3 w-3" />
                    <span>Distinct</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
