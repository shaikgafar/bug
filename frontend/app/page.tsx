'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bot, 
  ArrowRight, 
  Sparkles, 
  FileSearch, 
  BrainCircuit, 
  TestTube2, 
  GitPullRequestDraft, 
  PlayCircle, 
  ShieldCheck,
  CheckCircle2,
  Clock,
  Zap,
  Target
} from 'lucide-react';
import BugSenseNavbar from '@/components/BugSenseNavbar';
import BugSenseHero from '@/components/BugSenseHero';
import Hero3DAnimation from '@/components/Hero3DAnimation';

export default function HomePage() {
  const agentPillars = [
    {
      title: 'Triage Agent',
      stage: '01',
      desc: 'Parses raw reports, normalizes reproduction steps, assesses completeness and automatically poses targeted clarifying questions.',
      icon: FileSearch,
      color: 'from-blue-500 to-cyan-400',
      badge: 'NLP Parsing Engine'
    },
    {
      title: 'Intelligence Agent',
      stage: '02',
      desc: 'Semantic ChromaDB vector similarity for duplicate detection, architectural component mapping & severity/priority assessment.',
      icon: BrainCircuit,
      color: 'from-indigo-500 to-violet-400',
      badge: 'Vector Deduplication'
    },
    {
      title: 'Reproduction Agent',
      stage: '03',
      desc: 'Synthesizes headless Selenium automation scripts, executes browser assertion runs, and compiles visual evidence & snapshots.',
      icon: TestTube2,
      color: 'from-emerald-500 to-teal-400',
      badge: 'Headless Sandbox'
    },
    {
      title: 'Routing & Analysis Agent',
      stage: '04',
      desc: 'Pinpoints code regressions via Git blame, assigns owning developer & team, and formulates executive markdown triage reports.',
      icon: GitPullRequestDraft,
      color: 'from-amber-500 to-orange-400',
      badge: 'Regression Blame'
    },
  ];

  const metrics = [
    { label: 'Avg Triage Latency', value: '< 45s', detail: 'From raw issue to assigned ticket', icon: Clock, color: 'text-cyan-400' },
    { label: 'Deduplication Rate', value: '99.4%', detail: 'Cosine vector search via ChromaDB', icon: Target, color: 'text-violet-400' },
    { label: 'Autonomous Agents', value: '4 Swarm', detail: 'Triage, Intelligence, Repro, Route', icon: Zap, color: 'text-emerald-400' },
    { label: 'Reproduction Proof', value: '100%', detail: 'Headless assertion test execution', icon: ShieldCheck, color: 'text-amber-400' },
  ];

  return (
    <div className="bugsense-wrapper">
      {/* 1. BugSense Fixed Navbar & Fullscreen Drawer */}
      <BugSenseNavbar />

      {/* 2. BugSense Single-Page Landing Hero Section & Trusted Engineering Tools */}
      <BugSenseHero />

      {/* 3. BugSense Autonomous Multi-Agent 3D Infrastructure Showcase */}
      <section id="architecture" className="bugsense-showcase-section">
        {/* Section Header */}
        <div className="bugsense-section-header">
          <div className="bugsense-badge-pill">
            <Sparkles className="h-3.5 w-3.5 text-black" />
            <span>Autonomous Intelligence &bull; GENAI-23</span>
          </div>
          <h2 className="bugsense-section-title">
            Multi-Agent Defect Triage Infrastructure
          </h2>
          <p className="bugsense-section-desc">
            Powered by 4 specialized AI agents working synchronously to eliminate engineering bottlenecks, reproduce faults, and assign PR owners.
          </p>
        </div>

        {/* 3D Animation Video Stage */}
        <Hero3DAnimation />

        {/* Key Metrics Strip */}
        <div className="w-full my-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div 
                key={idx} 
                className="rounded-2xl border border-black/10 bg-black/[0.02] p-5 flex flex-col justify-between hover:border-black/20 hover:bg-black/[0.04] transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-500 font-medium">{m.label}</span>
                  <Icon className="h-4 w-4 text-black" />
                </div>
                <div className="text-3xl font-bold text-black tracking-tight">{m.value}</div>
                <p className="mt-1 text-xs text-neutral-500">{m.detail}</p>
              </div>
            );
          })}
        </div>

        {/* 4 Agent Pillars */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">
              Autonomous Contracts
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-black tracking-tight mt-1">
              4 Specialized Agents in Real Time
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {agentPillars.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm hover:shadow-md hover:border-black/25 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white shadow-md">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-mono text-xs font-bold text-neutral-400">STAGE {agent.stage}</span>
                    </div>
                    <h4 className="text-base font-bold text-black tracking-tight">
                      {agent.title}
                    </h4>
                    <p className="mt-2 text-xs text-neutral-600 leading-relaxed">{agent.desc}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-medium text-black">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{agent.badge}</span>
                    </div>
                    <span className="font-mono text-neutral-400 text-[11px]">Active</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive CTA Banner */}
        <div className="mt-16 rounded-3xl bg-black text-white p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Ready to eliminate bug triage bottlenecks?
            </h3>
            <p className="text-sm sm:text-base text-neutral-400">
              Test all 4 agents in the interactive presentation demo lab or submit a new bug ticket directly.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-neutral-100 transition shadow-lg"
              >
                Open Dashboard
              </Link>
              <Link
                href="/demo"
                className="px-6 py-3 rounded-full border border-neutral-700 bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition"
              >
                Launch 4-Scenario Demo Lab
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
