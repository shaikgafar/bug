'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  CheckCircle2, 
  Sparkles, 
  Bot, 
  Terminal, 
  Copy, 
  ArrowRight,
  HelpCircle,
  TestTube2,
  GitPullRequestDraft,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Check,
  Cpu,
  Layers,
  Clock,
  User,
  ExternalLink,
  Presentation,
  BookOpen,
  SlidersHorizontal,
  FileText
} from 'lucide-react';

export interface ScenarioData {
  id: number;
  title: string;
  tag: string;
  desc: string;
  icon: any;
  payload: {
    title: string;
    raw_description: string;
  };
}

interface ScenarioVideoProps {
  scenario: ScenarioData;
  onEnded?: () => void;
  onNext?: () => void;
  videoSrc?: string;
}

// Presenter keynotes & talking points per scenario
const SCENARIO_PITCH_NOTES: Record<number, {
  challenge: string;
  solution: string;
  metrics: string;
  talkingPoints: string[];
}> = {
  1: {
    challenge: 'Vague, 1-line bug tickets waste senior dev hours back-and-forth.',
    solution: 'Triage Agent detects incomplete steps, halts safely with waiting_for_user, and interviews reporter.',
    metrics: '0 human dev interruption • 100% normalized repro steps',
    talkingPoints: [
      'Autonomous detection of missing environment & steps to reproduce',
      'Non-blocking Human-in-the-loop state machine with asynchronous resume',
      'Automatic schema normalization into structured JSON payload'
    ]
  },
  2: {
    challenge: 'Duplicate bugs split engineering effort across separate tickets and teams.',
    solution: 'Intelligence Agent embeds text into 384-dim vector space and runs cosine search in ChromaDB.',
    metrics: '91.4% Cosine Match • Instant master ticket merge suggestion',
    talkingPoints: [
      'ChromaDB vector embedding captures semantic intent despite completely different user phrasing',
      'Component blast radius mapping determines architectural risk',
      'Automated duplicate linking prevents redundant triage overhead'
    ]
  },
  3: {
    challenge: 'Developers reject bugs that lack deterministic reproduction proof.',
    solution: 'Reproduction Agent synthesizes headless Selenium code, executes in sandbox, and captures screenshot diffs.',
    metrics: '100% Deterministic Run • Viewport snapshot & DOM logs captured',
    talkingPoints: [
      'AI-generated Selenium WebDriver automation code in isolated container',
      'Silent HTTP 413 / network drop isolated via Chrome DevTools logging',
      'Concrete visual evidence attached directly to Jira/GitHub ticket'
    ]
  },
  4: {
    challenge: 'Critical checkout regressions require emergency escalation and correct developer assignment.',
    solution: 'Routing Agent correlates error stack trace with release v2.4.1 Git commit #4f981ae & auto-assigns Lead.',
    metrics: '42s Total Latency • P0 Escalation • Executive markdown report',
    talkingPoints: [
      'Autonomous Git blame AST correlation pins exact author and squad',
      'Deterministic priority scoring: escalates to P0 Critical with instant notifications',
      'Executive-ready markdown summary with automated rollback recommendation'
    ]
  }
};

export default function ScenarioVideo({
  scenario,
  onEnded,
  onNext,
}: ScenarioVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isDeckMode, setIsDeckMode] = useState(false); // Deck / Step-by-Step presentation mode
  const [showPitchNotes, setShowPitchNotes] = useState(false); // Presenter Talking Points drawer
  const [copiedReport, setCopiedReport] = useState(false);
  const [duration] = useState(18); // 18-second presentation
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);

  // Audio synthesis for subtle professional keynote chimes
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playChime = useCallback((freq = 587.33, type: OscillatorType = 'sine', length = 0.08) => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + length);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + length);
    } catch (e) {}
  }, [isMuted]);

  // Main 100ms playback loop (governed by playback speed and deck mode)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isDeckMode) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackSpeed;
          if (next >= duration) {
            setIsPlaying(false);
            setHasEnded(true);
            if (onEnded) onEnded();
            return duration;
          }
          return parseFloat(next.toFixed(1));
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isDeckMode, playbackSpeed, duration, onEnded]);

  // Presentation chapters
  const chapters = [
    { id: 1, label: '01 Intake', start: 0, end: 3.0 },
    { id: 2, label: '02 AI Triage Scan', start: 3.0, end: 7.0 },
    { id: 3, label: '03 Swarm Action', start: 7.0, end: 11.5 },
    { id: 4, label: '04 Verification', start: 11.5, end: 15.0 },
    { id: 5, label: '05 Resolution', start: 15.0, end: 18.0 },
  ];

  // Sound cues on chapter change
  useEffect(() => {
    if (currentTime >= 2.9 && currentTime <= 3.1) playChime(523.25, 'sine', 0.1);
    if (currentTime >= 6.9 && currentTime <= 7.1) playChime(659.25, 'sine', 0.1);
    if (currentTime >= 11.4 && currentTime <= 11.6) playChime(783.99, 'sine', 0.12);
    if (currentTime >= 14.9 && currentTime <= 15.1) playChime(1046.50, 'sine', 0.16);
  }, [currentTime, playChime]);

  // Reset when scenario changes
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(true);
    setHasEnded(false);
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(t);
  }, [scenario.id]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(duration, pos * duration));
    setCurrentTime(parseFloat(newTime.toFixed(1)));
    setHasEnded(newTime >= duration);
  };

  const handleJumpToChapter = (start: number) => {
    setCurrentTime(start);
    setHasEnded(false);
    playChime(600, 'sine', 0.08);
  };

  const handleNextAct = () => {
    const nextChapter = chapters.find(c => c.start > currentTime);
    if (nextChapter) {
      handleJumpToChapter(nextChapter.start);
    } else {
      handleJumpToChapter(15.0);
    }
  };

  const handlePrevAct = () => {
    // find chapter before current
    const currentChap = chapters.slice().reverse().find(c => c.start < currentTime - 0.2);
    if (currentChap) {
      handleJumpToChapter(currentChap.start);
    } else {
      handleJumpToChapter(0);
    }
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setIsPlaying(true);
    setHasEnded(false);
  };

  const handleCopyReport = () => {
    const reportText = `# BugSense Autonomous Triage Report
- **Scenario**: ${scenario.title}
- **Defect ID**: #BUG-240${scenario.id}
- **Status**: AUTONOMOUS_VERIFIED
- **Resolution**: Normalized, Verified with Sandbox Evidence, and Routed.
- **Engine**: BugSense 4-Agent Autonomous Swarm (GENAI-23)`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2500);
    });
  };

  // Keyboard navigation for live presentations
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.code === 'KeyM') {
        setIsMuted((m) => !m);
      } else if (e.code === 'KeyR') {
        handleReplay();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'ArrowRight') {
        handleNextAct();
      } else if (e.code === 'ArrowLeft') {
        handlePrevAct();
      } else if (e.key >= '1' && e.key <= '5') {
        const chapIdx = parseInt(e.key) - 1;
        if (chapters[chapIdx]) handleJumpToChapter(chapters[chapIdx].start);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, currentTime]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Current stage: 1 to 5
  const currentStage = 
    currentTime < 3.0 ? 1 :
    currentTime < 7.0 ? 2 :
    currentTime < 11.5 ? 3 :
    currentTime < 15.0 ? 4 : 5;

  const currentChapter = chapters[currentStage - 1];
  const pitchNotes = SCENARIO_PITCH_NOTES[scenario.id] || SCENARIO_PITCH_NOTES[1];

  // Dynamic presentation subtitles matching executive voiceover
  const getPresentationSubtitle = () => {
    if (currentStage === 1) {
      return `Keynote Presentation: Scenario 0${scenario.id} — ${scenario.title.split(':')[1]?.trim() || scenario.title}`;
    }
    if (currentStage === 2) {
      return 'Raw defect ingested from engineering pipeline. BugSense parses stack traces, titles, and reproduction contexts.';
    }
    if (currentStage === 3) {
      return 'Multi-agent inference activated. Orchestrating Triage, Intelligence, Reproduction, and Routing contracts.';
    }
    if (currentStage === 4) {
      switch (scenario.id) {
        case 1:
          return 'Missing context detected! Triage Agent triggers waiting_for_user and initiates interactive clarification chat.';
        case 2:
          return 'ChromaDB vector query complete: 91.4% cosine similarity match found with historical master issue #BUG-1012.';
        case 3:
          return 'Headless Selenium harness generated & executed. 100% reproduced with DOM snapshot and network trace proof.';
        case 4:
          return 'Root-cause commit #4f981ae isolated. Priority escalated to P0 Critical and routed directly to Lead Elena Rostova.';
        default:
          return 'Agent contracts executing specialized verification rules.';
      }
    }
    return 'Autonomous triage complete. Developer-ready ticket generated with zero human engineering bottleneck.';
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/9] bg-white text-neutral-900 rounded-2xl overflow-hidden border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex flex-col justify-between select-none group font-sans"
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-black border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-neutral-600">Initializing BugSense Presentation Suite...</span>
        </div>
      )}

      {/* Top Application Header (Simulated BugSense Executive Presentation Canvas) */}
      <div className="relative z-20 flex items-center justify-between px-5 py-3 border-b border-black/[0.08] bg-white">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-black flex items-center justify-center p-1 shadow-sm">
            <img src="/bugsense-icon.png" alt="BugSense" className="h-full w-full object-contain" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-neutral-900 text-xs tracking-tight">Bug</span>
            <span className="font-serif italic font-semibold text-neutral-900 text-xs">Sense</span>
            <span className="text-[9px] text-neutral-400 font-mono font-semibold ml-0.5">&reg;</span>
          </div>
          <span className="text-neutral-300 text-xs hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-neutral-100 border border-black/[0.06] px-2.5 py-0.5 text-[10px] font-mono text-neutral-800">
            <span className="h-1.5 w-1.5 rounded-full bg-[#17c964] animate-pulse" />
            <span>AI PRESENTATION DEMO</span>
          </span>
        </div>

        {/* Center: Interactive Chapter Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-neutral-100 p-0.5 rounded-full border border-black/[0.06]">
          {chapters.map((ch) => {
            const isActive = ch.id === currentStage;
            return (
              <button
                key={ch.id}
                onClick={() => handleJumpToChapter(ch.start)}
                className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:text-black hover:bg-neutral-200/60'
                }`}
              >
                {ch.label}
              </button>
            );
          })}
        </div>

        {/* Right: Presentation Mode & Notes Switcher */}
        <div className="flex items-center gap-2">
          {/* Deck Mode Toggle */}
          <button
            onClick={() => {
              setIsDeckMode(!isDeckMode);
              if (!isDeckMode) setIsPlaying(false);
            }}
            className={`hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-mono transition border ${
              isDeckMode 
                ? 'bg-black text-white border-black shadow-sm' 
                : 'bg-neutral-100 text-neutral-700 border-black/[0.06] hover:bg-neutral-200'
            }`}
            title="Step-by-step presentation mode for live pitch"
          >
            <Presentation className="h-3 w-3" />
            <span>{isDeckMode ? 'Deck Mode' : 'Video Mode'}</span>
          </button>

          {/* Speaker Pitch Notes Toggle */}
          <button
            onClick={() => setShowPitchNotes(!showPitchNotes)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-mono transition border ${
              showPitchNotes
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-neutral-50 text-neutral-700 border-black/[0.08] hover:bg-neutral-100'
            }`}
            title="Toggle Speaker Notes & Pitch Highlights"
          >
            <BookOpen className="h-3 w-3" />
            <span className="hidden sm:inline">Pitch Notes</span>
          </button>

          <span className="rounded-full bg-neutral-100 border border-black/[0.08] px-2.5 py-1 text-[10px] font-mono text-neutral-800">
            {currentStage === 5 ? 'VERIFIED' : `ACT 0${currentStage}`}
          </span>
        </div>
      </div>

      {/* Main Presentation Stage Area */}
      <div className="relative z-10 flex-1 px-5 sm:px-10 py-4 flex items-center justify-center overflow-hidden bg-[#fafafa]">
        {/* Subtle Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* ================= ACT 1: KEYNOTE INTRO (0 - 3.0s) ================= */}
        {currentStage === 1 && (
          <div className="text-center max-w-xl mx-auto space-y-3 animate-in fade-in zoom-in-95 duration-400 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-black/[0.08] px-3.5 py-1 text-xs text-neutral-800 font-medium shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-neutral-700" />
              <span>{scenario.tag}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold text-neutral-900 tracking-[-0.04em] leading-tight">
              {scenario.title.split(':')[0]}:{' '}
              <span className="font-serif italic font-normal text-neutral-900">
                {scenario.title.split(':')[1]?.trim() || scenario.title}
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-[#6b6b6b] max-w-lg mx-auto leading-relaxed">
              {scenario.desc}
            </p>

            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-neutral-500">
              <span className="h-2 w-2 rounded-full bg-[#17c964] animate-pulse" />
              <span>Simulating Autonomous Multi-Agent Triage Pipeline...</span>
            </div>
          </div>
        )}

        {/* ================= ACT 2: RAW DEFECT INGESTION (3.0 - 7.0s) ================= */}
        {currentStage === 2 && (
          <div className="w-full max-w-2xl mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-400 relative z-10">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-900 font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#17c964] animate-pulse" />
                <span>INCOMING DEFECT PAYLOAD</span>
              </span>
              <span>ORIGIN: #BUG-240{scenario.id}</span>
            </div>

            {/* Clean White Bug Ticket Card */}
            <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6 shadow-sm relative overflow-hidden">
              {/* Subtle Scanning Beam */}
              {!isDeckMode && (
                <div 
                  className="absolute inset-x-0 h-[2px] bg-neutral-900 shadow-[0_0_8px_rgba(0,0,0,0.3)] transition-all"
                  style={{ top: `${((currentTime - 3.0) / 4.0) * 100}%` }}
                />
              )}

              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                  &ldquo;{scenario.payload.title}&rdquo;
                </h3>
                <span className="rounded-full bg-neutral-100 border border-black/[0.06] px-2.5 py-0.5 text-[10px] font-mono text-neutral-700">
                  Raw Ingestion
                </span>
              </div>

              <div className="bg-neutral-50 border border-black/[0.06] rounded-xl p-3.5 text-xs text-neutral-800 leading-relaxed font-sans line-clamp-3">
                {scenario.payload.raw_description}
              </div>

              <div className="mt-3.5 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-neutral-500">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-neutral-400" />
                  <span>Reported by: Alex (Support Queue)</span>
                </div>
                <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 font-medium text-[10px]">
                  Pending Agent Normalization
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= ACT 3: MULTI-AGENT SWARM SCAN (7.0 - 11.5s) ================= */}
        {currentStage === 3 && (
          <div className="w-full max-w-2xl mx-auto space-y-3 animate-in fade-in duration-400 relative z-10">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-900 font-semibold">
                <Cpu className="h-3.5 w-3.5 text-neutral-800 animate-spin" />
                <span>AUTONOMOUS MULTI-AGENT SWARM INFERENCE</span>
              </span>
              <span>LATENCY: 38ms</span>
            </div>

            {/* 4 Agent Stepper Cards Matching Landing Theme */}
            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-xl border border-black bg-white p-2.5 shadow-sm text-center">
                <div className="h-6 w-6 rounded-lg bg-black text-white flex items-center justify-center mx-auto text-[10px] font-mono">01</div>
                <div className="text-[11px] font-bold text-neutral-900 mt-1">Triage</div>
                <div className="text-[9px] text-emerald-600 font-semibold">● Active</div>
              </div>
              <div className="rounded-xl border border-black/[0.08] bg-white p-2.5 text-center">
                <div className="h-6 w-6 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto text-[10px] font-mono">02</div>
                <div className="text-[11px] font-bold text-neutral-900 mt-1">Intelligence</div>
                <div className="text-[9px] text-neutral-500">Embedding</div>
              </div>
              <div className="rounded-xl border border-black/[0.08] bg-white p-2.5 text-center">
                <div className="h-6 w-6 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto text-[10px] font-mono">03</div>
                <div className="text-[11px] font-bold text-neutral-900 mt-1">Reproduction</div>
                <div className="text-[9px] text-neutral-500">Selenium</div>
              </div>
              <div className="rounded-xl border border-black/[0.08] bg-white p-2.5 text-center">
                <div className="h-6 w-6 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto text-[10px] font-mono">04</div>
                <div className="text-[11px] font-bold text-neutral-900 mt-1">Routing</div>
                <div className="text-[9px] text-neutral-500">Ownership</div>
              </div>
            </div>

            {/* Live Terminal Telemetry Box */}
            <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-3.5 font-mono text-[11px] text-neutral-300 space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-[10px] text-neutral-400 border-b border-neutral-800 pb-1 mb-1">
                <span>PIPELINE REASONING STREAM</span>
                <span className="text-emerald-400">GENAI-23 ENGINE</span>
              </div>
              <div className="text-neutral-400">&gt; Tokenizing description &amp; extracting step indicators...</div>
              <div className="text-neutral-200">&gt; Validating reproduction completeness &amp; environment context...</div>
              {scenario.id === 1 && (
                <div className="text-amber-400 font-semibold">&gt; [INTERRUPT] Missing reproduction steps! Halting with waiting_for_user...</div>
              )}
              {scenario.id === 2 && (
                <div className="text-cyan-300 font-semibold">&gt; Generating 384-dim dense vector embedding. Querying ChromaDB index...</div>
              )}
              {scenario.id === 3 && (
                <div className="text-emerald-400 font-semibold">&gt; Discrete UI actions identified. Preparing headless Selenium sandbox...</div>
              )}
              {scenario.id === 4 && (
                <div className="text-rose-400 font-semibold">&gt; [ALERT] 500 error on checkout correlates with release v2.4.1 commit 4f981ae!</div>
              )}
            </div>
          </div>
        )}

        {/* ================= ACT 4: SCENARIO-SPECIFIC BREAKTHROUGH (11.5 - 15.0s) ================= */}
        {currentStage === 4 && (
          <div className="w-full max-w-2xl mx-auto space-y-3 animate-in zoom-in-95 duration-400 relative z-10">
            {/* Scenario 1: Interactive Clarification Chat Dialog */}
            {scenario.id === 1 && (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-black/[0.06] pb-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-neutral-900">
                    <HelpCircle className="h-4 w-4 text-neutral-700" />
                    <span>HUMAN-IN-THE-LOOP CLARIFICATION DIALOG</span>
                  </span>
                  <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-medium">
                    waiting_for_user
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="bg-neutral-50 border border-black/[0.06] p-3 rounded-xl rounded-tl-sm text-xs">
                    <div className="text-[10px] font-bold text-neutral-500 mb-1 flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span>BugSense Triage Agent:</span>
                    </div>
                    <div className="text-neutral-800">
                      &ldquo;Could you specify what operating system and browser you were using, and whether any error occurred in DevTools?&rdquo;
                    </div>
                  </div>

                  <div className="bg-black text-white p-3 rounded-xl rounded-tr-sm text-xs ml-4 shadow-sm">
                    <div className="text-[10px] text-neutral-400 mb-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Alex (Reporter):</span>
                    </div>
                    <div className="font-medium text-white">
                      &ldquo;Chrome 128 on macOS Sonoma. No console error, just infinite loading spinner after clicking Google SSO.&rdquo;
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-[#17c964] font-semibold pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Clarification received: Steps normalized and pipeline resumed automatically.</span>
                </div>
              </div>
            )}

            {/* Scenario 2: Semantic Duplicate Detection */}
            {scenario.id === 2 && (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-black/[0.06] pb-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-neutral-900">
                    <Copy className="h-4 w-4 text-neutral-700" />
                    <span>CHROMADB VECTOR COSINE SIMILARITY MATCH</span>
                  </span>
                  <span className="rounded-full bg-black text-white px-2.5 py-0.5 text-[10px] font-bold">
                    91.4% SIMILARITY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-50 border border-black/[0.06] p-3.5 rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-neutral-400 mb-1">CURRENT TICKET</div>
                    <div className="font-semibold text-neutral-900 line-clamp-1">Google SSO login button remains in infinite loading state</div>
                    <p className="text-[11px] text-[#6b6b6b] mt-1 line-clamp-2">Auth popup closes without session token</p>
                  </div>

                  <div className="bg-neutral-100 border border-black/[0.1] p-3.5 rounded-xl">
                    <div className="text-[10px] font-bold uppercase text-neutral-900 mb-1">HISTORICAL MASTER #BUG-1012</div>
                    <div className="font-semibold text-neutral-900 line-clamp-1">OAuth token handoff fails on macOS Chrome</div>
                    <p className="text-[11px] text-[#6b6b6b] mt-1 line-clamp-2">Identical session storage token bypass</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-neutral-600 font-mono pt-1">
                  <span>Cosine Distance: 0.086 (Identical Root Cause)</span>
                  <span className="font-semibold text-black">Action: Auto-flagged for Duplicate Merge</span>
                </div>
              </div>
            )}

            {/* Scenario 3: Selenium WebDriver Reproduction */}
            {scenario.id === 3 && (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-black/[0.06] pb-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-neutral-900">
                    <TestTube2 className="h-4 w-4 text-neutral-700" />
                    <span>HEADLESS SELENIUM WEBDRIVER EXECUTION</span>
                  </span>
                  <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                    100% REPRODUCED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-900 text-neutral-200 p-3 rounded-xl font-mono text-[10px] overflow-hidden">
                    <div className="text-neutral-500 mb-1"># Generated reproduce_bug.py</div>
                    <div className="text-neutral-300">driver.get(&apos;/settings/profile&apos;)</div>
                    <div className="text-neutral-300">driver.find(&apos;#photo-input&apos;).send_keys(&apos;avatar_3mb.png&apos;)</div>
                    <div className="text-neutral-300">driver.find(&apos;#save-profile&apos;).click()</div>
                    <div className="text-rose-400 font-semibold mt-1">&gt; HTTP 413: Silent drop detected</div>
                  </div>

                  <div className="bg-neutral-50 rounded-xl border border-black/[0.06] p-3 flex flex-col items-center justify-center text-center">
                    <div className="w-full aspect-video bg-neutral-200 rounded-lg flex items-center justify-center text-[10px] text-neutral-600 font-mono">
                      [ Viewport Screenshot Proof ]
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 mt-1.5">evidence_screenshot_01.png</span>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-700 font-semibold pt-1">
                  ✓ Deterministic proof captured with network traces and viewport diff
                </div>
              </div>
            )}

            {/* Scenario 4: Full Pipeline Regression & Routing */}
            {scenario.id === 4 && (
              <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-black/[0.06] pb-2.5">
                  <span className="flex items-center gap-1.5 font-bold text-neutral-900">
                    <GitPullRequestDraft className="h-4 w-4 text-neutral-700" />
                    <span>REGRESSION COMMIT CORRELATION</span>
                  </span>
                  <span className="rounded-full bg-red-600 text-white px-2.5 py-0.5 text-[10px] font-bold">
                    SEVERITY: P0 CRITICAL
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-neutral-50 border border-black/[0.06] p-3 rounded-xl">
                    <div className="text-[9px] font-mono text-neutral-400 uppercase">CULPRIT COMMIT</div>
                    <div className="font-mono text-xs font-bold text-red-600 mt-0.5">#4f981ae</div>
                    <div className="text-[10px] text-neutral-500">Stripe SDK v2.4</div>
                  </div>

                  <div className="bg-neutral-50 border border-black/[0.06] p-3 rounded-xl">
                    <div className="text-[9px] font-mono text-neutral-400 uppercase">AFFECTED SUBSYSTEM</div>
                    <div className="font-mono text-xs font-bold text-neutral-900 mt-0.5">Payments Core</div>
                    <div className="text-[10px] text-neutral-500">Checkout Intent</div>
                  </div>

                  <div className="bg-neutral-50 border border-black/[0.06] p-3 rounded-xl">
                    <div className="text-[9px] font-mono text-neutral-400 uppercase">ASSIGNED ENGINEER</div>
                    <div className="font-mono text-xs font-bold text-neutral-900 mt-0.5">Elena Rostova</div>
                    <div className="text-[10px] text-neutral-500">Lead Payments</div>
                  </div>
                </div>

                <div className="text-[11px] text-neutral-700 font-semibold pt-1">
                  ✓ Executive Markdown summary prepared with rollback advice for engineering team
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= ACT 5: FINAL RESOLUTION & HANDOFF (15.0 - 18.0s) ================= */}
        {currentStage === 5 && (
          <div className="w-full max-w-xl mx-auto text-center space-y-4 animate-in zoom-in-95 duration-400 relative z-10">
            <div className="h-12 w-12 rounded-full bg-neutral-100 text-[#17c964] border border-black/[0.08] flex items-center justify-center mx-auto shadow-sm">
              <Check className="h-6 w-6 stroke-[3]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-0.5 text-xs font-mono text-neutral-800 border border-black/[0.08] mb-2">
                <span>✓ AUTONOMOUS TRIAGE VERIFIED</span>
                <span>&bull;</span>
                <span>LATENCY: 1.2s</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-neutral-900 tracking-[-0.03em]">
                Ready for Developer Review
              </h3>
              <p className="text-xs sm:text-sm text-[#6b6b6b] max-w-md mx-auto mt-1 leading-relaxed">
                The defect has been fully normalized, verified with reproduction proof, and routed to the exact code owner with zero manual triage overhead.
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleReplay}
                className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-900 shadow-sm transition active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Replay Demonstration</span>
              </button>

              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-900 shadow-sm transition active:scale-95"
                title="Copy triage markdown summary to clipboard"
              >
                {copiedReport ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#17c964]" />
                    <span className="text-[#17c964] font-semibold">Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Triage Report</span>
                  </>
                )}
              </button>

              {onNext && (
                <button
                  onClick={onNext}
                  className="flex items-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-medium text-white shadow-sm transition active:scale-95"
                >
                  <span>Next Scenario</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Presenter Pitch Notes Drawer (Collapsible) */}
      {showPitchNotes && (
        <div className="relative z-30 px-6 py-3 bg-neutral-900 text-white border-t border-neutral-800 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#17c964] font-bold">
                  Executive Pitch Highlights &bull; Scenario {scenario.id}
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {pitchNotes.metrics}
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                <strong className="text-white">Solution:</strong> {pitchNotes.solution}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-400 pt-0.5">
                {pitchNotes.talkingPoints.map((pt, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-[#17c964]" />
                    <span>{pt}</span>
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowPitchNotes(false)}
              className="text-neutral-400 hover:text-white text-xs font-mono shrink-0 p-1"
            >
              &times; Close Notes
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Subtitle Ticker Bar (Presentation Voiceover Banner) */}
      <div className="relative z-20 px-6 py-2.5 bg-white border-t border-black/[0.06] flex items-center justify-between text-xs text-neutral-700">
        <div className="flex items-center gap-2 truncate">
          <span className="flex h-2 w-2 rounded-full bg-[#17c964] shrink-0" />
          <span className="font-sans font-medium truncate text-neutral-900">
            {getPresentationSubtitle()}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-3">
          {/* Deck Stepper Arrows when in Deck Mode */}
          {isDeckMode && (
            <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-0.5 border border-black/[0.06]">
              <button
                onClick={handlePrevAct}
                className="p-1 hover:bg-neutral-200 rounded-full transition"
                title="Previous Act (Left Arrow)"
              >
                <ChevronLeft className="h-3.5 w-3.5 text-neutral-700" />
              </button>
              <span className="text-[10px] font-mono px-1.5 text-neutral-800">
                Act {currentStage} / 5
              </span>
              <button
                onClick={handleNextAct}
                className="p-1 hover:bg-neutral-200 rounded-full transition"
                title="Next Act (Right Arrow)"
              >
                <ChevronRight className="h-3.5 w-3.5 text-neutral-700" />
              </button>
            </div>
          )}

          <span className="text-[10px] font-mono text-neutral-400 uppercase hidden sm:inline">
            {currentChapter.label} ({formatTime(currentTime)} / {formatTime(duration)})
          </span>
        </div>
      </div>

      {/* Bottom Video Controls Bar */}
      <div className="relative z-20 px-5 py-3 border-t border-black/[0.06] bg-white flex flex-col gap-2">
        {/* Scrubber Progress Bar */}
        <div 
          onClick={handleSeek}
          className="relative h-1.5 w-full bg-neutral-200 hover:h-2 rounded-full cursor-pointer transition-all overflow-hidden"
          title="Click to seek"
        >
          <div 
            className="h-full bg-black rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        {/* Control Buttons & Timestamps */}
        <div className="flex items-center justify-between text-xs text-neutral-600">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play / Pause */}
            <button
              onClick={() => {
                if (hasEnded) handleReplay();
                else setIsPlaying(!isPlaying);
              }}
              className="p-1 rounded-full hover:bg-neutral-100 text-neutral-900 transition"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {hasEnded ? (
                <RotateCcw className="h-4 w-4" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-black" />
              )}
            </button>

            {/* Replay */}
            <button
              onClick={handleReplay}
              className="p-1 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition"
              title="Replay (R)"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Step navigation in Deck Mode */}
            <button
              onClick={handlePrevAct}
              className="p-1 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition"
              title="Previous Act"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleNextAct}
              className="p-1 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition"
              title="Next Act"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Time Indicator */}
            <div className="font-mono text-[11px] text-neutral-500">
              <span className="text-neutral-900 font-semibold">{formatTime(currentTime)}</span>
              <span> / </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Playback Speed Selector */}
            <div className="flex items-center rounded-full bg-neutral-100 p-0.5 border border-black/[0.06] text-[10px] font-mono">
              {[0.75, 1, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded-full transition ${
                    playbackSpeed === spd 
                      ? 'bg-black text-white shadow-sm' 
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center gap-1 p-1 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition"
              title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5 text-neutral-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-black" />
              )}
              <span className="text-[10px] font-mono hidden sm:inline">
                {isMuted ? 'Muted' : 'Audio On'}
              </span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
