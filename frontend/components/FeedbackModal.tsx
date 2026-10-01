'use client';

import React, { useState } from 'react';
import { Star, MessageSquare, Check, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface FeedbackModalProps {
  bugId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function FeedbackModal({
  bugId,
  isOpen,
  onClose,
  onSubmitted,
}: FeedbackModalProps) {
  const [ratingSummary, setRatingSummary] = useState(5);
  const [ratingDuplicate, setRatingDuplicate] = useState(5);
  const [ratingComponent, setRatingComponent] = useState(5);
  const [ratingReproduction, setRatingReproduction] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.submitFeedback({
        bug_id: bugId,
        rating_summary: ratingSummary,
        rating_duplicate: ratingDuplicate,
        rating_component: ratingComponent,
        rating_reproduction: ratingReproduction,
        comments: comments.trim() ? comments.trim() : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onSubmitted) onSubmitted();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const renderStars = (value: number, setValue: (v: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className="p-1 text-neutral-300 hover:text-black transition"
          >
            <Star
              className={`h-4 w-4 ${
                star <= value ? 'fill-black text-black' : 'text-neutral-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-xs font-bold text-neutral-900">{value}/5</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-black/[0.08] bg-white shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-400 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 shadow-sm">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight">Developer Triage Feedback</h3>
            <p className="text-xs text-[#6b6b6b]">Rate the accuracy of the multi-agent decisions</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-[#17c964] border border-black/[0.08] mb-3">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-neutral-900">Thank you for your feedback!</h4>
            <p className="text-xs text-[#6b6b6b] mt-1">Ratings recorded for telemetry and accuracy tracking.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl bg-neutral-50 border border-black/[0.06] p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-800">Triage Summary Quality</div>
                  <div className="text-[10px] text-neutral-500">Normalization and extracted steps</div>
                </div>
                {renderStars(ratingSummary, setRatingSummary)}
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.06] pt-3">
                <div>
                  <div className="text-xs font-semibold text-neutral-800">Duplicate Match Accuracy</div>
                  <div className="text-[10px] text-neutral-500">Vector similarity relevance</div>
                </div>
                {renderStars(ratingDuplicate, setRatingDuplicate)}
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.06] pt-3">
                <div>
                  <div className="text-xs font-semibold text-neutral-800">Component Classification</div>
                  <div className="text-[10px] text-neutral-500">Correct subsystem identified</div>
                </div>
                {renderStars(ratingComponent, setRatingComponent)}
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.06] pt-3">
                <div>
                  <div className="text-xs font-semibold text-neutral-800">Reproduction Utility</div>
                  <div className="text-[10px] text-neutral-500">Selenium script &amp; evidence</div>
                </div>
                {renderStars(ratingReproduction, setRatingReproduction)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                Developer Comments &amp; Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Reproduction script accurately highlighted the infinite button spinner..."
                className="w-full rounded-xl bg-neutral-50/50 border border-black/[0.1] p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-black transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-black/[0.1] bg-white hover:bg-neutral-50 px-4 py-2 text-xs font-medium text-neutral-700 transition shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-full bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-medium text-white shadow-sm disabled:opacity-50 transition active:scale-95"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
