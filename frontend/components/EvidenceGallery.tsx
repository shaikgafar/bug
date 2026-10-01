'use client';

import React, { useState } from 'react';
import { 
  Camera, 
  Terminal, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink,
  ZoomIn
} from 'lucide-react';
import { Evidence, ReproductionAgentOutput } from '@/types';

import { API_BASE_URL } from '@/lib/api';

interface EvidenceGalleryProps {
  evidences?: Evidence[];
  reproductionOutput?: ReproductionAgentOutput | null;
}

export default function EvidenceGallery({
  evidences = [],
  reproductionOutput,
}: EvidenceGalleryProps) {
  const [activeTab, setActiveTab] = useState<'screenshots' | 'logs' | 'script'>('screenshots');
  const [copied, setCopied] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const apiBase = API_BASE_URL;

  const screenshots = evidences.filter((e) => e.type === 'screenshot' || e.file_path.endsWith('.svg') || e.file_path.endsWith('.png'));
  
  const scriptContent = reproductionOutput?.generated_selenium_script || `# No reproduction script generated yet`;
  const consoleLog = reproductionOutput?.execution_log || `[INFO] Headless Chrome test runner awaiting trigger...`;

  const copyScript = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadScript = () => {
    const blob = new Blob([scriptContent], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reproduce_bug_${Date.now()}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm">
      {/* Header and tab buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] pb-4 mb-5">
        <div>
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Automated Reproduction &amp; Evidence</h3>
          <p className="text-[11px] text-[#6b6b6b]">Headless browser artifacts, console traces, and test harness</p>
        </div>

        <div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1 border border-black/[0.06]">
          <button
            onClick={() => setActiveTab('screenshots')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'screenshots'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Screenshots ({screenshots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'logs'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>DevTools Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              activeTab === 'script'
                ? 'bg-black text-white shadow-sm'
                : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Selenium Script</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Screenshots */}
      {activeTab === 'screenshots' && (
        <div>
          {screenshots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/[0.1] bg-neutral-50/50 p-8 text-center text-neutral-500 text-xs">
              <Camera className="h-7 w-7 mx-auto mb-2 text-neutral-400" />
              <span>No browser screenshots captured yet. Run reproduction agent to generate evidence.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {screenshots.map((s, i) => {
                const imgUrl = s.file_path.startsWith('http') ? s.file_path : `${apiBase}${s.file_path}`;
                return (
                  <div key={i} className="group relative rounded-xl border border-black/[0.08] bg-neutral-50 overflow-hidden shadow-sm">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt="Reproduction Evidence Screenshot"
                        className="h-full w-full object-contain object-top group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setModalImage(imgUrl)}
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <span className="flex items-center gap-1 rounded-full bg-black/90 px-3.5 py-1.5 text-xs font-medium text-white shadow-lg">
                          <ZoomIn className="h-3.5 w-3.5 text-white" /> Zoom Screenshot
                        </span>
                      </div>
                    </div>
                    <div className="p-3 border-t border-black/[0.06] flex items-center justify-between text-[11px] text-neutral-500 bg-white">
                      <span>{s.metadata_json?.description || 'Automated Headless Chrome Viewport Capture'}</span>
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-black font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>Open Full</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Logs */}
      {activeTab === 'logs' && (
        <div className="rounded-xl border border-black/[0.08] bg-neutral-900 text-neutral-200 p-4 font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2 mb-3">
            <span>Runtime Execution Log</span>
            <span>UTF-8</span>
          </div>
          <pre className="text-neutral-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72">
            {consoleLog}
          </pre>
        </div>
      )}

      {/* Tab 3: Selenium Script */}
      {activeTab === 'script' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-neutral-500">reproduce.py (Selenium WebDriver 4)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={copyScript}
                className="flex items-center gap-1 rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 transition shadow-sm"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
              <button
                onClick={downloadScript}
                className="flex items-center gap-1 rounded-full bg-black hover:bg-neutral-800 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition"
              >
                <Download className="h-3 w-3" />
                <span>Download .py</span>
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-black/[0.08] bg-neutral-900 text-neutral-100 p-4 font-mono text-xs overflow-x-auto max-h-80 shadow-sm">
            <pre className="leading-relaxed text-emerald-400">{scriptContent}</pre>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-black/20 bg-white shadow-2xl p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={modalImage} alt="Expanded Evidence" className="max-h-[85vh] w-auto rounded-xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
