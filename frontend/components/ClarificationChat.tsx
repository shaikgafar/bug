'use client';

import React, { useState } from 'react';
import { Send, Bot, User as UserIcon, HelpCircle, Loader2, Sparkles } from 'lucide-react';
import { ClarificationMessage } from '@/types';

interface ClarificationChatProps {
  bugId: string;
  messages: ClarificationMessage[];
  isWaitingForUser: boolean;
  onSendClarification: (message: string) => Promise<void>;
}

export default function ClarificationChat({
  bugId,
  messages,
  isWaitingForUser,
  onSendClarification,
}: ClarificationChatProps) {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const quickAnswers = [
    'Chrome 128 on macOS Sonoma. No console errors visible.',
    '1. Open /login, 2. Click Google SSO, 3. Authorize in popup, 4. Main page spinner spins forever.',
    'Firefox 129 on Ubuntu 24.04. File upload was avatar_3mb.png.',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSendClarification(inputText.trim());
      setInputText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAnswer = async (text: string) => {
    setInputText(text);
  };

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 shadow-sm">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Interactive Clarification Loop</h3>
            <p className="text-[11px] text-[#6b6b6b]">Agent requests specific missing parameters to finalize triage</p>
          </div>
        </div>
        {isWaitingForUser && (
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 border border-amber-200">
            Input Required
          </span>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-[220px] max-h-[360px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-neutral-400">
            <Bot className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-xs font-medium text-neutral-600">No clarification required for this bug report.</p>
            <p className="text-[11px] text-[#6b6b6b] mt-0.5">The report contained all necessary steps and environment markers.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
              >
                {isAgent && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 shadow-sm">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    isAgent
                      ? 'bg-neutral-50 text-neutral-800 border border-black/[0.06] rounded-tl-sm shadow-sm'
                      : 'bg-black text-white rounded-tr-sm shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-70 mb-1 gap-4 font-medium">
                    <span>{isAgent ? 'AI Triage Agent' : 'Reporter'}</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="whitespace-pre-line">{msg.message}</div>
                </div>
                {!isAgent && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-neutral-800 shadow-sm">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Suggested Quick Chips */}
      {isWaitingForUser && (
        <div className="mt-3 pt-3 border-t border-black/[0.06]">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mb-1.5 font-medium">
            <Sparkles className="h-3 w-3 text-amber-600" />
            <span>Suggested replies for instant testing:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickAnswers.map((ans, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickAnswer(ans)}
                className="rounded-full bg-neutral-50 hover:bg-neutral-100 border border-black/[0.08] px-3 py-1 text-[11px] text-neutral-700 hover:text-black transition text-left truncate max-w-full shadow-sm"
              >
                &ldquo;{ans}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isWaitingForUser ? "Type your clarification response..." : "Provide additional context..."}
          className="flex-1 rounded-full bg-neutral-50 border border-black/[0.1] px-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className="flex items-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-medium text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
        >
          {isSubmitting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
