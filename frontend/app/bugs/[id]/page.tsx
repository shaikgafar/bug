'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Play, 
  FileText, 
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';
import { Bug, TriageRunStatus } from '@/types';
import TriageProgress from '@/components/TriageProgress';
import ClarificationChat from '@/components/ClarificationChat';
import DuplicateCard from '@/components/DuplicateCard';
import EvidenceGallery from '@/components/EvidenceGallery';
import AgentReasoning from '@/components/AgentReasoning';
import FeedbackModal from '@/components/FeedbackModal';

export default function BugDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bugId = params?.id as string;

  const [bug, setBug] = useState<Bug | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Real-time Triage Pipeline State
  const [triageStatus, setTriageStatus] = useState<TriageRunStatus | 'idle'>('idle');
  const [activeAgent, setActiveAgent] = useState<'triage' | 'intelligence' | 'reproduction' | 'routing' | null>(null);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  const loadBug = async () => {
    if (!bugId) return;
    try {
      const data = await api.getBug(bugId);
      setBug(data);
      
      // Check latest triage run status
      if (data.triage_runs && data.triage_runs.length > 0) {
        const latestRun = data.triage_runs[0];
        setTriageStatus(latestRun.status);

        // Compute completed agents from actions
        const acts = latestRun.actions || [];
        const completed = acts.map((a) => a.agent_name);
        setCompletedAgents(completed);

        if (latestRun.status === 'running') {
          // Connect to SSE stream if running
          connectSSE();
        }
      } else {
        setTriageStatus('idle');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch bug details');
    } finally {
      setLoading(false);
    }
  };

  const connectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const streamUrl = api.getTriageStreamUrl(bugId);
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.addEventListener('ping', () => {});

    es.addEventListener('start', () => {
      setTriageStatus('running');
      setStreamingMessage('Multi-agent pipeline started...');
    });

    es.addEventListener('agent_start', (e: any) => {
      try {
        const d = JSON.parse(e.data);
        setActiveAgent(d.agent);
        setStreamingMessage(`Agent '${d.agent}' actively analyzing telemetry...`);
      } catch (err) {}
    });

    es.addEventListener('agent_log', (e: any) => {
      try {
        const d = JSON.parse(e.data);
        setStreamingMessage(d.message);
      } catch (err) {}
    });

    es.addEventListener('agent_complete', (e: any) => {
      try {
        const d = JSON.parse(e.data);
        setCompletedAgents((prev) => Array.from(new Set([...prev, d.agent])));
      } catch (err) {}
    });

    es.addEventListener('waiting_for_user', (e: any) => {
      try {
        const d = JSON.parse(e.data);
        setTriageStatus('waiting_for_user');
        setStreamingMessage(d.question || 'Pipeline paused: Clarification needed.');
        loadBug();
      } catch (err) {}
    });

    es.addEventListener('complete', () => {
      setTriageStatus('completed');
      setActiveAgent(null);
      setStreamingMessage('Triage pipeline execution finished successfully.');
      loadBug();
      es.close();
    });

    es.addEventListener('error', (e: any) => {
      console.warn('SSE stream disconnected or ended', e);
      es.close();
    });
  };

  useEffect(() => {
    loadBug();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [bugId]);

  const handleStartTriage = async () => {
    try {
      setTriageStatus('running');
      setCompletedAgents([]);
      setActiveAgent('triage');
      setStreamingMessage('Submitting pipeline activation trigger...');

      await api.startTriage(bugId);
      connectSSE();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start triage');
      setTriageStatus('idle');
    }
  };

  const handleClarify = async (userMessage: string) => {
    try {
      await api.sendClarification(bugId, userMessage);
      setTriageStatus('running');
      connectSSE();
      loadBug();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send clarification');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent" />
        <p className="mt-3 text-xs text-neutral-500">Loading defect telemetry &amp; live agent streams...</p>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center rounded-2xl border border-black/[0.08] bg-white p-8 shadow-sm">
        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-rose-500" />
        <h2 className="text-base font-bold text-neutral-900">Bug Report Not Found</h2>
        <p className="text-xs text-[#6b6b6b] mt-1">{errorMsg || `ID ${bugId} does not exist.`}</p>
        <Link href="/bugs" className="mt-4 inline-block text-xs font-semibold text-black hover:underline">
          &larr; Back to Bug Registry
        </Link>
      </div>
    );
  }

  const latestRun = bug.triage_runs && bug.triage_runs.length > 0 ? bug.triage_runs[0] : null;
  const reproOutput = latestRun?.full_report?.reproduction_agent || null;
  const actions = latestRun?.actions || [];
  const finalSummaryMarkdown = latestRun?.full_report?.summary_markdown || null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/bugs"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.1] bg-white text-neutral-700 hover:text-black hover:bg-neutral-50 transition shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-400">#{bug.id.slice(0, 8)}</span>
              <span className="capitalize rounded-full px-2.5 py-0.5 text-[10px] font-medium bg-neutral-100 text-neutral-800 border border-black/[0.06]">
                {bug.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-[-0.03em] mt-0.5">
              {bug.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {triageStatus !== 'running' && (
            <button
              onClick={handleStartTriage}
              className="flex items-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 px-5 py-2.5 text-xs font-medium text-white shadow-sm transition active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{latestRun ? 'Re-Trigger Triage' : 'Start AI Triage'}</span>
            </button>
          )}

          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 px-4 py-2.5 text-xs font-medium text-neutral-900 shadow-sm transition"
          >
            <MessageSquare className="h-3.5 w-3.5 text-neutral-700" />
            <span>Developer Feedback</span>
          </button>
        </div>
      </div>

      {/* Triage Progress Banner */}
      <TriageProgress
        status={triageStatus}
        activeAgent={activeAgent}
        completedAgents={completedAgents}
        streamingMessage={streamingMessage}
        onRestart={handleStartTriage}
      />

      {/* Main 2-Column Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bug details & Evidence (2 cols wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary Markdown if completed */}
          {finalSummaryMarkdown && (
            <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 text-neutral-900 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="h-4 w-4" />
                <span>Routing &amp; Analysis Agent Executive Report</span>
              </div>
              <div className="prose prose-xs max-w-none text-neutral-800 leading-relaxed font-sans whitespace-pre-line">
                {finalSummaryMarkdown}
              </div>
            </div>
          )}

          {/* Raw Description & Metadata */}
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-700" />
              <span>Report Description &amp; Original Payload</span>
            </h3>
            <div className="rounded-xl bg-neutral-50 border border-black/[0.06] p-4 text-xs text-neutral-800 leading-relaxed whitespace-pre-wrap font-sans">
              {bug.raw_description}
            </div>

            {/* Metadata Pills */}
            <div className="mt-4 pt-4 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Severity</span>
                <div className="font-bold text-neutral-900 uppercase mt-0.5">{bug.severity}</div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Priority</span>
                <div className="font-mono font-bold text-neutral-900 mt-0.5">{bug.priority}</div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Target Subsystem</span>
                <div className="font-semibold text-neutral-900 mt-0.5">{bug.component?.name || 'Auto-Detected'}</div>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Assigned Engineer</span>
                <div className="font-semibold text-neutral-900 mt-0.5">{bug.assignee?.name || 'Pending Routing'}</div>
              </div>
            </div>
          </div>

          {/* Evidence Gallery */}
          <EvidenceGallery evidences={bug.evidences} reproductionOutput={reproOutput} />

          {/* Agent Reasoning Accordion */}
          <AgentReasoning actions={actions} />
        </div>

        {/* Right Column: Interactive Clarification Chat & Duplicate Detection */}
        <div className="space-y-6">
          {/* Clarification Chat */}
          <ClarificationChat
            bugId={bug.id}
            messages={bug.clarification_messages || []}
            isWaitingForUser={triageStatus === 'waiting_for_user'}
            onSendClarification={handleClarify}
          />

          {/* Duplicate Card */}
          <DuplicateCard
            currentBugId={bug.id}
            currentBugTitle={bug.title}
            currentBugDescription={bug.raw_description}
            matches={bug.duplicate_matches || []}
            onConfirmed={loadBug}
          />
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        bugId={bug.id}
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmitted={loadBug}
      />
    </div>
  );
}
