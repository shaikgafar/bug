'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  BrainCircuit, 
  TestTube2, 
  GitPullRequestDraft, 
  CheckCircle2, 
  Activity,
  Layers,
  Terminal,
  Zap,
  Code2
} from 'lucide-react';

interface AgentDetail {
  id: string;
  name: string;
  stage: string;
  badge: string;
  metric: string;
  detail: string;
  tech: string;
}

const AGENT_DATA: Record<string, AgentDetail> = {
  triage: {
    id: 'triage',
    name: 'Triage Agent',
    stage: '01',
    badge: 'STAGE 1: PARSE & NORMALIZE',
    metric: '99.4% Parsing Accuracy',
    detail: 'Ingests raw reports, GitHub issues, & Slack complaints. Validates completeness, normalizes steps to reproduce, and formulates clarifying questions.',
    tech: 'NLP LLM Pipeline + Schema Validator'
  },
  intelligence: {
    id: 'intelligence',
    name: 'Intelligence Agent',
    stage: '02',
    badge: 'STAGE 2: VECTOR CLUSTER & DEDUP',
    metric: '0.94 ChromaDB Similarity',
    detail: 'Embeds issue context to detect duplicates against known bug database. Computes architectural component blast radius and determines real priority.',
    tech: 'ChromaDB Vector Store + Cosine Clustering'
  },
  reproduction: {
    id: 'reproduction',
    name: 'Reproduction Agent',
    stage: '03',
    badge: 'STAGE 3: HEADLESS VERIFICATION',
    metric: '100% Deterministic Run',
    detail: 'Synthesizes automated Selenium headless scripts. Executes in isolated sandbox, asserts visual defect, and captures replay frames & DOM traces.',
    tech: 'Headless Chrome + DOM Assertion Engine'
  },
  routing: {
    id: 'routing',
    name: 'Routing & Analysis Agent',
    stage: '04',
    badge: 'STAGE 4: GIT BLAME & RESOLUTION',
    metric: '42s Total Resolution Time',
    detail: 'Performs Git commit regression analysis, identifies owning developer & squad, drafts triage report, and creates verified Jira / GitHub pull request.',
    tech: 'Git Blame Engine + Team Ownership Matrix'
  }
};

export default function Hero3DAnimation() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeAgent, setActiveAgent] = useState<string>('triage');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Handle 3D mouse parallax
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay policy fallback
        setIsPlaying(false);
      });
    }
  }, []);

  const curAgent = AGENT_DATA[activeAgent];

  return (
    <div className="w-full max-w-6xl mx-auto my-8 flex flex-col items-center">
      {/* 3D Showcase Frame Container - Clean Minimal White Studio */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative w-full aspect-square md:aspect-[16/10] max-h-[640px] rounded-3xl border border-black/[0.08] bg-[#f9f9fa] p-3 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden group select-none transition-all duration-300"
      >
        {/* Subtle Ambient Radial Lighting */}
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-black/[0.03] blur-3xl pointer-events-none transition-transform duration-500"
          style={{
            transform: `translate3d(${mousePos.x * 30}px, ${mousePos.y * 30}px, 0)`
          }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/[0.03] blur-3xl pointer-events-none transition-transform duration-500"
          style={{
            transform: `translate3d(${mousePos.x * -30}px, ${mousePos.y * -30}px, 0)`
          }}
        />

        {/* Minimal Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Video Canvas Layer */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white border border-black/[0.08] shadow-inner flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onLoadedData={() => setVideoLoaded(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="w-full h-full object-contain md:object-cover scale-100 transition-transform duration-700 ease-out"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 6}deg) rotateX(${mousePos.y * -6}deg) scale(${isHovered ? 1.02 : 1})`
            }}
          >
            <source src="/bugsense-animation.webm?v=studio" type="video/webm" />
            <source src="/bugsense-animation.mp4?v=studio" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Top HUD Status Bar - Clean Minimal Studio Style */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
            <div className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/90 px-3.5 py-1 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#17c964] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#17c964]"></span>
              </span>
              <span className="text-[11px] font-mono font-semibold tracking-wider text-neutral-900 uppercase">
                BUGSENSE 3D INFRASTRUCTURE // LIVE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block rounded-full border border-black/[0.08] bg-white/90 px-3 py-1 text-[10px] font-mono text-neutral-700 backdrop-blur-md shadow-sm">
                60 FPS • 3D ENGINE
              </span>
              <div className="rounded-full border border-black/[0.1] bg-black text-white px-3 py-1 text-[10px] font-mono font-semibold shadow-sm">
                GENAI-23
              </div>
            </div>
          </div>

          {/* Minimal Floating Product HUD Cards (Overlaid with 3D Parallax) */}
          
          {/* Top-Left Floating Card: 4 Autonomous Agents Swarm */}
          <div 
            className="absolute top-16 left-4 sm:left-6 max-w-[210px] sm:max-w-[240px] rounded-2xl border border-black/[0.08] bg-white/95 p-3.5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] pointer-events-auto transition-transform duration-300 hover:scale-105 hidden sm:block text-neutral-900"
            style={{
              transform: `translate3d(${mousePos.x * 24}px, ${mousePos.y * 24}px, 0)`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#17c964] animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-neutral-700 uppercase tracking-wider">
                  Swarm Engine
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">4 Active</span>
            </div>
            <p className="text-xs font-bold text-neutral-900 leading-tight">Autonomous Triage Network</p>
            <div className="mt-2.5 w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-black h-full rounded-full w-[94%]" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500">
              <span>Zero Human Delay</span>
              <span className="font-mono text-neutral-900 font-semibold">99.4% Match</span>
            </div>
          </div>

          {/* Top-Right Floating Card: SEV-1 Defect Identification */}
          <div 
            className="absolute top-16 right-4 sm:right-6 max-w-[210px] sm:max-w-[250px] rounded-2xl border border-rose-200 bg-white/95 p-3.5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] pointer-events-auto transition-transform duration-300 hover:scale-105 hidden sm:block text-neutral-900"
            style={{
              transform: `translate3d(${mousePos.x * -28}px, ${mousePos.y * -28}px, 0)`
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-800 uppercase tracking-wider">
                  Defect Isolated
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                SEV-1
              </span>
            </div>
            <p className="text-xs font-bold text-neutral-900 leading-tight">Null Pointer in Auth Middleware</p>
            <div className="mt-2 font-mono text-[10px] text-neutral-700 bg-neutral-50 rounded-lg px-2.5 py-1 border border-neutral-200">
              <code>auth/service.py:142</code>
            </div>
          </div>

          {/* Bottom-Left Floating Card: Headless Repro Confirmed */}
          <div 
            className="absolute bottom-16 left-4 sm:left-6 max-w-[200px] sm:max-w-[230px] rounded-2xl border border-black/[0.08] bg-white/95 p-3.5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] pointer-events-auto transition-transform duration-300 hover:scale-105 hidden md:block text-neutral-900"
            style={{
              transform: `translate3d(${mousePos.x * 20}px, ${mousePos.y * 20}px, 0)`
            }}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold text-[#17c964] uppercase tracking-wider">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Headless Assertion</span>
            </div>
            <p className="text-xs font-semibold text-neutral-900">Browser Repro: Verified</p>
            <p className="text-[10px] text-neutral-500 mt-1">Selenium headless run confirmed in 0.42s</p>
          </div>

          {/* Bottom-Right Floating Card: Auto-Assign PR Ready */}
          <div 
            className="absolute bottom-16 right-4 sm:right-6 max-w-[200px] sm:max-w-[230px] rounded-2xl border border-black/[0.08] bg-white/95 p-3.5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.12)] pointer-events-auto transition-transform duration-300 hover:scale-105 hidden md:block text-neutral-900"
            style={{
              transform: `translate3d(${mousePos.x * -22}px, ${mousePos.y * -22}px, 0)`
            }}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono font-bold text-neutral-800 uppercase tracking-wider">
              <GitPullRequestDraft className="h-3.5 w-3.5" />
              <span>Auto-Assignment</span>
            </div>
            <p className="text-xs font-semibold text-neutral-900">Target: @sarah-auth</p>
            <p className="text-[10px] text-neutral-500 mt-1">Regression commit identified via Git blame</p>
          </div>

          {/* Interactive Player Controls Bar (Bottom Center) - Minimal White/Black Pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-black/[0.1] bg-white/95 px-4 py-2 shadow-2xl backdrop-blur-xl z-30 transition-all duration-200">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white hover:bg-neutral-800 transition-all duration-200 shadow-sm active:scale-95"
              title={isPlaying ? "Pause 3D Loop" : "Play 3D Loop"}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5 fill-white" />}
            </button>

            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black transition active:scale-95"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            <div className="h-4 w-px bg-neutral-200 mx-1" />

            <button
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-black transition active:scale-95"
              title="Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>

            <span className="hidden sm:inline-block text-[11px] font-mono text-neutral-500 pl-1">
              Loop // 06s 3D Cycle
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 4-Agent Deck Switcher - Minimal Black & White Cards */}
      <div className="w-full mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.values(AGENT_DATA).map((agent) => {
          const isSelected = activeAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => setActiveAgent(agent.id)}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-300 ${
                isSelected 
                  ? 'border-black bg-white shadow-md ring-1 ring-black scale-[1.02]'
                  : 'border-black/[0.08] bg-white hover:border-black/30 hover:bg-neutral-50 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  STAGE {agent.stage}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  Online
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 tracking-tight">{agent.name}</h3>
              <p className="mt-1 text-[11px] font-mono text-neutral-600 font-medium">{agent.metric}</p>
            </button>
          );
        })}
      </div>

      {/* Selected Agent Telemetry Inspector Drawer */}
      <div className="w-full mt-3 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-sm">
            {curAgent.id === 'triage' && <Bot className="h-5 w-5" />}
            {curAgent.id === 'intelligence' && <BrainCircuit className="h-5 w-5" />}
            {curAgent.id === 'reproduction' && <TestTube2 className="h-5 w-5" />}
            {curAgent.id === 'routing' && <GitPullRequestDraft className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-neutral-900">{curAgent.name} Specification</h4>
              <span className="rounded-full bg-neutral-100 border border-black/[0.06] px-2.5 py-0.5 font-mono text-[10px] text-neutral-700">
                {curAgent.badge}
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed max-w-3xl">
              {curAgent.detail}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-start md:items-end gap-1">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Engine Stack</span>
          <span className="rounded-lg border border-black/[0.08] bg-neutral-50 px-3 py-1 text-xs font-mono text-neutral-900 font-semibold shadow-sm">
            {curAgent.tech}
          </span>
        </div>
      </div>
    </div>
  );
}

