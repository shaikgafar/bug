'use client';

import React, { useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Sparkles,
  Command
} from 'lucide-react';
import ScenarioVideo, { ScenarioData } from './ScenarioVideo';

interface DemoVideoModalProps {
  scenario: ScenarioData;
  scenarios: ScenarioData[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSelectScenario?: (scenarioId: number) => void;
  onLaunchBackend?: (scenario: ScenarioData) => void;
}

export default function DemoVideoModal({
  scenario,
  scenarios,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
  onSelectScenario,
  onLaunchBackend,
}: DemoVideoModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-scenario-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[1100px] rounded-3xl border border-black/[0.08] bg-white shadow-[0_20px_70px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col my-auto transition-all animate-in zoom-in-95 duration-200">
        {/* Modal Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-black/[0.06] bg-white">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-black text-white px-3 py-1 text-xs font-mono font-medium shadow-sm">
              Scenario 0{currentIndex + 1} of 0{scenarios.length}
            </span>
            <div>
              <h2 id="modal-scenario-title" className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <span>{scenario.title}</span>
              </h2>
              <p className="text-[11px] text-[#6b6b6b] font-mono hidden sm:block">
                {scenario.tag}
              </p>
            </div>
          </div>

          {/* Quick Scenario Selector Pills for Presenters */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1 bg-neutral-100 p-0.5 rounded-full border border-black/[0.06]">
              {scenarios.map((sc, idx) => {
                const isCur = idx === currentIndex;
                return (
                  <button
                    key={sc.id}
                    onClick={() => {
                      if (onSelectScenario) onSelectScenario(sc.id);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition ${
                      isCur 
                        ? 'bg-white text-neutral-900 font-bold shadow-sm' 
                        : 'text-neutral-500 hover:text-black'
                    }`}
                  >
                    Sc 0{sc.id}
                  </button>
                );
              })}
            </div>

            {/* Close button with subtle minimal pill design */}
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white hover:bg-neutral-100 px-3.5 py-1.5 text-xs font-medium text-neutral-800 transition-all shadow-sm active:scale-95 group"
              title="Close video modal (Esc)"
            >
              <span>Close</span>
              <X className="h-3.5 w-3.5 text-neutral-500 group-hover:text-black" />
            </button>
          </div>
        </div>

        {/* Video Player Container */}
        <div className="p-3 sm:p-6 bg-neutral-50/60">
          <ScenarioVideo
            scenario={scenario}
            onNext={currentIndex < scenarios.length - 1 ? onNext : undefined}
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-3.5 border-t border-black/[0.06] bg-white">
          {/* Previous / Next Stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-4 py-1.5 text-xs font-medium text-neutral-700 hover:text-black hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none transition shadow-sm active:scale-95"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            {/* Scenario Dots */}
            <div className="flex items-center gap-1.5 px-2">
              {scenarios.map((sc, i) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    if (onSelectScenario) onSelectScenario(sc.id);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-6 bg-black' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                  }`}
                  title={sc.title}
                />
              ))}
            </div>

            <button
              onClick={onNext}
              disabled={currentIndex === scenarios.length - 1}
              className="flex items-center gap-1.5 rounded-full bg-black text-white hover:bg-neutral-800 px-4 py-1.5 text-xs font-medium disabled:opacity-30 disabled:pointer-events-none transition shadow-sm active:scale-95"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Presentation Keyboard Shortcut Cheatsheet */}
          <div className="hidden md:flex items-center gap-2 text-[10px] font-mono text-neutral-400">
            <Command className="h-3 w-3 text-neutral-400" />
            <span>Space: Play/Pause</span>
            <span>&bull;</span>
            <span>1-5: Jump Act</span>
            <span>&bull;</span>
            <span>&larr; / &rarr;: Step</span>
            <span>&bull;</span>
            <span>M: Mute</span>
            <span>&bull;</span>
            <span>F: Fullscreen</span>
          </div>

          {/* Optional Launch Live Backend Button */}
          {onLaunchBackend && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onLaunchBackend(scenario)}
                className="flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 text-neutral-900 px-3.5 py-1.5 text-xs font-medium shadow-sm transition active:scale-95"
              >
                <Zap className="h-3.5 w-3.5 text-neutral-700" />
                <span>Test Live API &rarr;</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
