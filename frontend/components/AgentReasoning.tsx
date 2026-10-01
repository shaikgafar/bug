'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  BrainCircuit, 
  FileSearch, 
  TestTube2, 
  GitPullRequestDraft 
} from 'lucide-react';
import { AgentAction } from '@/types';

interface AgentReasoningProps {
  actions: AgentAction[];
}

export default function AgentReasoning({ actions }: AgentReasoningProps) {
  const [openAgent, setOpenAgent] = useState<string | null>('routing');

  if (!actions || actions.length === 0) {
    return null;
  }

  const agentConfig: Record<
    string,
    { label: string; icon: any; badge: string }
  > = {
    triage: {
      label: 'Triage Agent Reasoning',
      icon: FileSearch,
      badge: 'Step 1: Normalization & Completeness',
    },
    intelligence: {
      label: 'Intelligence Agent Reasoning',
      icon: BrainCircuit,
      badge: 'Step 2: Vector Duplicate & Component Scoring',
    },
    reproduction: {
      label: 'Reproduction Agent Reasoning',
      icon: TestTube2,
      badge: 'Step 3: Headless Execution & Evidence Verdict',
    },
    routing: {
      label: 'Routing & Analysis Agent Reasoning',
      icon: GitPullRequestDraft,
      badge: 'Step 4: Regression & Developer Assignment',
    },
  };

  const toggle = (agent: string) => {
    setOpenAgent(openAgent === agent ? null : agent);
  };

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Agent Reasoning &amp; Explainability</h3>
          <p className="text-[11px] text-[#6b6b6b]">Inspect transparent decision-making logic for each pipeline stage</p>
        </div>
      </div>

      <div className="space-y-3">
        {actions.map((act) => {
          const cfg = agentConfig[act.agent_name] || {
            label: `${act.agent_name} Agent`,
            icon: BrainCircuit,
            badge: 'Pipeline Action',
          };
          const Icon = cfg.icon;
          const isOpen = openAgent === act.agent_name;

          return (
            <div
              key={act.id}
              className="rounded-xl border border-black/[0.08] bg-neutral-50/40 overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggle(act.agent_name)}
                className="w-full flex items-center justify-between p-4 hover:bg-neutral-100/50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-white shadow-sm">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-900">{cfg.label}</span>
                    <span className="ml-2 text-[10px] text-neutral-400 font-mono">({cfg.badge})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-black/[0.06] text-xs">
                  <div className="rounded-xl bg-white border border-black/[0.06] p-4 text-neutral-800 leading-relaxed font-sans shadow-sm">
                    <p className="font-semibold text-neutral-900 mb-1 flex items-center gap-1.5 text-[11px]">
                      <span>Reasoning Rationale:</span>
                    </p>
                    <p className="whitespace-pre-line text-[11px] text-neutral-600">
                      {act.reasoning || 'Agent completed evaluation and synthesized contract parameters successfully.'}
                    </p>
                  </div>

                  {act.output_data && (
                    <div className="mt-3">
                      <details className="text-[10px] font-mono text-neutral-500 cursor-pointer">
                        <summary className="hover:text-black transition py-1">View Raw Structured Output JSON</summary>
                        <pre className="mt-1.5 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 overflow-x-auto max-h-48">
                          {JSON.stringify(act.output_data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
