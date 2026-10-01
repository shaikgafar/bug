'use client';

import React from 'react';
import { 
  FileSearch, 
  BrainCircuit, 
  TestTube2, 
  GitPullRequestDraft, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  PauseCircle
} from 'lucide-react';
import { TriageRunStatus } from '@/types';

interface TriageProgressProps {
  status: TriageRunStatus | 'idle';
  activeAgent?: 'triage' | 'intelligence' | 'reproduction' | 'routing' | null;
  completedAgents?: string[];
  streamingMessage?: string;
  onRestart?: () => void;
}

export default function TriageProgress({
  status,
  activeAgent,
  completedAgents = [],
  streamingMessage,
  onRestart,
}: TriageProgressProps) {
  const agents = [
    {
      id: 'triage',
      name: 'Triage Agent',
      desc: 'Parses raw report, normalizes steps, assesses completeness',
      icon: FileSearch,
    },
    {
      id: 'intelligence',
      name: 'Intelligence Agent',
      desc: 'Vector duplicate search, component mapping, severity & priority',
      icon: BrainCircuit,
    },
    {
      id: 'reproduction',
      name: 'Reproduction Agent',
      desc: 'Synthesizes Selenium script, executes headless test & captures evidence',
      icon: TestTube2,
    },
    {
      id: 'routing',
      name: 'Routing & Analysis Agent',
      desc: 'Evaluates regression, designates developer & generates executive summary',
      icon: GitPullRequestDraft,
    },
  ];

  // Calculate percentage
  const completedCount = completedAgents.length;
  let progressPct = Math.round((completedCount / agents.length) * 100);
  if (status === 'running' && progressPct < 100) {
    progressPct = Math.max(15, progressPct + 10);
  }
  if (status === 'completed') {
    progressPct = 100;
  }

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Autonomous Multi-Agent Pipeline</h3>
            {status === 'running' && (
              <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-medium text-neutral-900 border border-black/[0.08]">
                <Loader2 className="h-3 w-3 animate-spin text-black" /> Live Triage In Progress
              </span>
            )}
            {status === 'waiting_for_user' && (
              <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                <PauseCircle className="h-3 w-3" /> Waiting for Clarification
              </span>
            )}
            {status === 'completed' && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" /> Triage Completed
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#6b6b6b]">
            Sequential agent orchestration streaming telemetry via Server-Sent Events (SSE).
          </p>
        </div>

        {onRestart && (
          <button
            onClick={onRestart}
            className="self-start sm:self-auto rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 px-4 py-1.5 text-xs font-medium text-neutral-900 shadow-sm transition"
          >
            Re-run Pipeline
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-500 mb-1.5">
          <span>Overall Progression</span>
          <span className="font-bold text-neutral-900">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 border border-black/[0.04]">
          <div
            className="h-full bg-black transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Agents grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          const isDone = completedAgents.includes(agent.id) || status === 'completed';
          const isCurrent = activeAgent === agent.id && status === 'running';
          const isWaiting = agent.id === 'triage' && status === 'waiting_for_user';

          let stateBorder = 'border-black/[0.06] bg-neutral-50/50 text-neutral-600';
          if (isDone) {
            stateBorder = 'border-black/[0.12] bg-white text-neutral-900 shadow-sm';
          } else if (isCurrent) {
            stateBorder = 'border-black bg-white text-neutral-900 shadow-md ring-1 ring-black';
          } else if (isWaiting) {
            stateBorder = 'border-amber-400 bg-amber-50/40 text-neutral-900 ring-1 ring-amber-400';
          }

          return (
            <div
              key={agent.id}
              className={`relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-300 ${stateBorder}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm ${
                    isDone || isCurrent ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-neutral-400">
                    0{idx + 1}
                  </span>
                </div>

                <div className="mt-3">
                  <h4 className="text-xs font-bold text-neutral-900 tracking-tight">{agent.name}</h4>
                  <p className="mt-1 text-[11px] text-[#6b6b6b] leading-relaxed line-clamp-2">
                    {agent.desc}
                  </p>
                </div>
              </div>

              {/* Status footer for this card */}
              <div className="mt-3 pt-2.5 border-t border-black/[0.06] flex items-center justify-between text-[11px]">
                {isDone && (
                  <span className="flex items-center gap-1 font-semibold text-neutral-900">
                    <CheckCircle2 className="h-3 w-3 text-[#17c964]" /> Done
                  </span>
                )}
                {isCurrent && (
                  <span className="flex items-center gap-1 font-semibold text-black animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" /> Processing
                  </span>
                )}
                {isWaiting && (
                  <span className="flex items-center gap-1 font-semibold text-amber-700">
                    <PauseCircle className="h-3 w-3" /> Clarifying
                  </span>
                )}
                {!isDone && !isCurrent && !isWaiting && (
                  <span className="flex items-center gap-1 font-medium text-neutral-400">
                    <Clock className="h-3 w-3" /> Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Streaming Log preview */}
      {streamingMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-neutral-50 border border-black/[0.06] px-3.5 py-2 text-xs font-mono text-neutral-800">
          <span className="inline-block h-2 w-2 rounded-full bg-[#17c964] animate-pulse" />
          <span className="truncate">{streamingMessage}</span>
        </div>
      )}
    </div>
  );
}
