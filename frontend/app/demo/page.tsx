'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  HelpCircle, 
  Copy, 
  TestTube2, 
  GitPullRequestDraft, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  Zap,
  ShieldCheck,
  Play
} from 'lucide-react';
import { api } from '@/lib/api';
import DemoVideoModal from '@/components/DemoVideoModal';
import { ScenarioData } from '@/components/ScenarioVideo';

export default function DemoPage() {
  const router = useRouter();
  const [runningScenario, setRunningScenario] = useState<number | null>(null);
  const [activeModalScenarioId, setActiveModalScenarioId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  React.useEffect(() => {
    // Quick backend health check
    api.getComponents()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  const scenarios: ScenarioData[] = [
    {
      id: 1,
      title: 'Scenario 1: Incomplete Report & Clarification Loop',
      tag: 'Interactive Chat Pause',
      desc: 'Submit an ambiguous, 1-line bug report ("Login broken"). Watch the Triage Agent identify missing reproduction steps, halt execution with "waiting_for_user", and engage the user in an interactive clarification chat.',
      icon: HelpCircle,
      payload: {
        title: 'Login broken',
        raw_description: "I tried to log in today and it didn't work. The button just spins and nothing happens. Please fix ASAP.",
      },
    },
    {
      id: 2,
      title: 'Scenario 2: Semantic Duplicate Detection',
      tag: 'ChromaDB Vector Match',
      desc: 'Submit an authentication bug with varied wording. The Intelligence Agent encodes the report into vector space, queries ChromaDB, and flags the existing Google OAuth bug with high similarity (>85%), rendering side-by-side verification.',
      icon: Copy,
      payload: {
        title: 'Google SSO login button remains in infinite loading state after auth popup',
        raw_description: 'Signing in through Google SSO triggers popup. Once authenticated, popup closes but authentication token is never written to session storage. Main login screen stays disabled with loading spinner forever.\n\nSteps to reproduce:\n1. Navigate to /login\n2. Click "Sign in with Google"\n3. Authenticate in consent popup\n4. Observe infinite loading spinner\n\nEnvironment: Chrome 128 on macOS Sonoma',
      },
    },
    {
      id: 3,
      title: 'Scenario 3: Automated Reproduction & Visual Evidence',
      tag: 'Headless Selenium Harness',
      desc: 'Submit a detailed user settings defect. The Reproduction Agent analyzes discrete actions, synthesizes a Selenium WebDriver test harness, and captures browser viewport screenshots along with DevTools console traces.',
      icon: TestTube2,
      payload: {
        title: 'User profile avatar upload fails for PNG images over 2MB with silent drop',
        raw_description: `Summary:
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
Firefox 129.0 on Ubuntu 24.04 LTS, Backend commit 4f981ae.`,
      },
    },
    {
      id: 4,
      title: 'Scenario 4: Full Pipeline Regression & Routing',
      tag: 'End-to-End Orchestration',
      desc: 'Submit a critical checkout regression. The pipeline orchestrates all 4 agents in real time: normalizes the steps, scores priority P0, captures reproduction proof, assigns the Core Payments developer, and compiles an executive markdown summary.',
      icon: GitPullRequestDraft,
      payload: {
        title: 'Regression: Checkout flow throws 500 Internal Server Error when selecting Stripe credit card',
        raw_description: "After release v2.4.1 deployed this morning, clicking 'Pay with Credit Card' on the checkout page immediately triggers a 500 error from POST /api/v1/checkout/process. In v2.4.0 this was functioning normally. Server log indicates KeyError: 'currency_code' in payment intent builder.",
      },
    },
  ];

  // Current selected scenario for modal
  const currentModalIndex = scenarios.findIndex((s) => s.id === activeModalScenarioId);
  const activeModalScenario = currentModalIndex !== -1 ? scenarios[currentModalIndex] : null;

  const handleOpenVideo = (scenarioId: number) => {
    setActiveModalScenarioId(scenarioId);
  };

  const handleCloseVideo = () => {
    setActiveModalScenarioId(null);
  };

  const handleNextVideo = () => {
    if (currentModalIndex < scenarios.length - 1) {
      setActiveModalScenarioId(scenarios[currentModalIndex + 1].id);
    }
  };

  const handlePrevVideo = () => {
    if (currentModalIndex > 0) {
      setActiveModalScenarioId(scenarios[currentModalIndex - 1].id);
    }
  };

  const handleRunLiveBackend = async (sc: ScenarioData) => {
    setErrorMessage(null);
    try {
      setRunningScenario(sc.id);
      setActiveModalScenarioId(null); // close video if open
      // 1. Create bug
      const newBug = await api.createBug({
        title: sc.payload.title,
        raw_description: sc.payload.raw_description,
      });

      // 2. Start triage pipeline
      await api.startTriage(newBug.id);

      // 3. Navigate to live command center
      router.push(`/bugs/${newBug.id}`);
    } catch (err: any) {
      console.error('Failed to run scenario', err);
      setErrorMessage(
        err.message || 'Failed to connect to backend triage engine. Please verify the backend service is running and accessible.'
      );
      setRunningScenario(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-neutral-50 px-4 py-1.5 text-xs font-medium text-neutral-800 shadow-sm mb-4">
          <Sparkles className="h-3.5 w-3.5 text-neutral-600" />
          <span>Interactive Presentation Suite</span>
          <span className="text-neutral-300">&bull;</span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-[#17c964] animate-pulse' : backendOnline === false ? 'bg-rose-500' : 'bg-amber-400'}`} />
            <span className="text-[11px] font-mono text-neutral-600">
              {backendOnline ? 'Backend Connected' : backendOnline === false ? 'Backend Offline' : 'Checking Engine...'}
            </span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold text-neutral-900 tracking-[-0.04em]">
          4-Scenario <span className="font-serif italic font-normal text-neutral-900">Autonomous Triage Lab</span>
        </h1>
        <p className="mt-3 text-sm text-[#6b6b6b] max-w-2xl mx-auto leading-relaxed">
          Click any scenario to launch the interactive AI demonstration video showcasing the unique contracts and intelligence of the 4 autonomous agents.
        </p>

        {errorMessage && (
          <div className="mt-4 max-w-xl mx-auto p-3.5 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-sm">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-black font-bold">&times;</button>
          </div>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrentRunning = runningScenario === sc.id;

          return (
            <div
              key={sc.id}
              onClick={() => handleOpenVideo(sc.id)}
              className="rounded-2xl border border-black/[0.08] bg-white p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-black/[0.25] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col justify-between group cursor-pointer relative"
              tabIndex={0}
              role="button"
              aria-label={`Open demo video for ${sc.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenVideo(sc.id);
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-3 py-1 text-[11px] font-medium tracking-tight bg-neutral-100 text-neutral-800 border border-black/[0.06]">
                      {sc.tag}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono text-neutral-900 font-semibold hidden sm:inline">
                      ▶ Click to Present
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-neutral-900 tracking-[-0.03em] mb-2 group-hover:text-black transition-colors">
                  {sc.title}
                </h3>

                <p className="text-xs text-[#6b6b6b] leading-relaxed mb-4">
                  {sc.desc}
                </p>

                {/* Pre-fill snippet preview */}
                <div className="rounded-xl bg-neutral-50 border border-black/[0.06] p-3.5 mb-6 font-mono text-[11px] text-neutral-800">
                  <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-1 font-sans">
                    Input Prompt Payload:
                  </span>
                  <div className="font-semibold text-neutral-900 truncate">&ldquo;{sc.payload.title}&rdquo;</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2">
                {/* Primary Button: Watch Video */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenVideo(sc.id);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 text-xs font-medium tracking-tight shadow-sm transition-all duration-200 active:scale-[0.98] bg-black text-white hover:bg-neutral-800 hover:shadow-md"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Watch AI Presentation Demo</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </button>

                {/* Secondary Button: Run Live Backend (optional) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRunLiveBackend(sc);
                  }}
                  disabled={runningScenario !== null}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-mono text-neutral-500 hover:text-neutral-900 transition"
                  title="Run directly against local FastAPI backend triage engine"
                >
                  {isCurrentRunning ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Bootstrapping Live Backend...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 text-neutral-400" />
                      <span>Or Run in Live Backend Lab &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="rounded-2xl border border-black/[0.08] bg-neutral-50/70 p-4 text-center text-xs text-[#6b6b6b] flex items-center justify-center gap-2 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-neutral-800" />
        <span>Each scenario video illustrates the exact multi-agent reasoning, evidence synthesis, and developer triage artifacts.</span>
      </div>

      {/* Demo Video Modal */}
      {activeModalScenario && (
        <DemoVideoModal
          scenario={activeModalScenario}
          scenarios={scenarios}
          currentIndex={currentModalIndex}
          onClose={handleCloseVideo}
          onNext={handleNextVideo}
          onPrevious={handlePrevVideo}
          onSelectScenario={(id) => setActiveModalScenarioId(id)}
          onLaunchBackend={handleRunLiveBackend}
        />
      )}
    </div>
  );
}
