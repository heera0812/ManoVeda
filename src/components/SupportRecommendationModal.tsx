import React from 'react';
import { HeartHandshake, X, ArrowRight, ShieldCheck, Wind, CalendarHeart, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { THEMES } from '../utils/theme';

interface SupportRecommendationModalProps {
  isOpen: boolean;
  onClose: (dismissDays?: number) => void;
  onSelectResources: () => void;
  onSelectCrisis: () => void;
  onSelectCounseling: () => void;
  userProfile: UserProfile;
}

export const SupportRecommendationModal: React.FC<SupportRecommendationModalProps> = ({
  isOpen,
  onClose,
  onSelectResources,
  onSelectCrisis,
  onSelectCounseling,
  userProfile,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;

  if (!isOpen) return null;

  const handleImOkay = () => {
    // Dismiss for 10 days
    onClose(10);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div
        id="support-recommendation-container"
        className={`relative w-full max-w-lg ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 p-6 text-white relative">
          <button
            onClick={() => onClose()}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-100 bg-white/15 px-2.5 py-0.5 rounded-full">
                Gentle Support Check-in
              </span>
              <h3 className="text-xl font-bold font-outfit mt-0.5">Checking in with you</h3>
            </div>
          </div>
          <p className="text-sm text-blue-100 mt-1 leading-relaxed">
            You've been feeling different from your usual pattern lately. Would some support help?
          </p>
        </div>

        {/* 4 Choices defined in Blueprint Section 11 */}
        <div className="p-6 space-y-3">
          {/* 1. I'm okay */}
          <button
            type="button"
            onClick={handleImOkay}
            className="w-full p-3.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200 text-left transition-all flex items-center justify-between group"
          >
            <div>
              <span className="font-bold text-slate-800 text-sm block">I'm okay</span>
              <span className="text-[11px] text-slate-500">I appreciate the check-in, but I am handling things.</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-700">Dismiss</span>
          </button>

          {/* 2. Show me something helpful */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectResources();
            }}
            className="w-full p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-200 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Wind className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">Show me something helpful</span>
                <span className="text-[11px] text-slate-600">Quick 2-minute breathing, focus, or grounding exercises</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 3. I want to talk to someone */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectCrisis();
            }}
            className="w-full p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-50 border border-rose-200 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">I want to talk to someone right now</span>
                <span className="text-[11px] text-slate-600">24/7 confidential campus crisis line or text hotline</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* 4. Book a counselor */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectCounseling();
            }}
            className="w-full p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CalendarHeart className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm block">Book a Campus Counselor</span>
                <span className="text-[11px] text-slate-600">Schedule a 1-on-1 confidential chat on campus or video</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          We respect your choice — selecting "I'm okay" will pause this prompt.
        </div>
      </div>
    </div>
  );
};
