import React, { useState } from 'react';
import { Sparkles, X, Check, TrendingUp, Moon, Zap, Tag, Calendar, Feather } from 'lucide-react';
import { UserProfile, WeeklyReflection } from '../types';
import { THEMES } from '../utils/theme';

interface WeeklyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reflection: WeeklyReflection | null;
  onSaveReflectionNote: (note: string) => void;
  userProfile: UserProfile;
}

export const WeeklyReflectionModal: React.FC<WeeklyReflectionModalProps> = ({
  isOpen,
  onClose,
  reflection,
  onSaveReflectionNote,
  userProfile,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;
  const [reflectionNote, setReflectionNote] = useState<string>(
    reflection?.userReflectionNote || ''
  );
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveReflectionNote(reflectionNote);
    setIsSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div
        id="weekly-reflection-container"
        className={`relative w-full max-w-lg ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-outfit">Your Week in Review</h3>
              <p className="text-[11px] text-slate-500">{reflection?.weekLabel || 'Past 7 Days Snapshot'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Average Mood</span>
              <span className="text-xl font-extrabold text-slate-900 font-outfit">
                {reflection?.avgMoodScore || 3.8} / 6.0
              </span>
              <p className="text-[10px] text-slate-500">{reflection?.avgMoodLabel || 'Steady / Okay'}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Check-ins</span>
              <span className="text-xl font-extrabold text-slate-900 font-outfit">
                {reflection?.checkInCount || 6} Days
              </span>
              <p className="text-[10px] text-slate-500">Consistent logging</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/70 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Baseline Shift</span>
              <span className="text-sm font-bold text-slate-800">
                {reflection?.changeFromLastWeek || 'Stable rhythm'}
              </span>
              <p className="text-[10px] text-slate-400">vs. initial benchmark</p>
            </div>
          </div>

          {/* Qualitative Trends */}
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Primary Context Factor:</span>
              </div>
              <p className="text-slate-600 pl-5">
                {reflection?.topFactor || 'Academics (noted in majority of check-ins)'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sleep Rhythm:</span>
              </div>
              <p className="text-slate-600 pl-5">
                {reflection?.sleepTrend || 'Restorative recovery over the weekend'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Energy Trend:</span>
              </div>
              <p className="text-slate-600 pl-5">
                {reflection?.energyTrend || 'Dipping mid-week during lectures'}
              </p>
            </div>
          </div>

          {/* Open Reflection Prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Feather className="w-3.5 h-3.5 text-indigo-600" />
              <span>How do you feel looking back at your week?</span>
            </div>
            <textarea
              value={reflectionNote}
              onChange={e => setReflectionNote(e.target.value)}
              rows={3}
              placeholder="What went well? What was heavy? Anything you'd like to adjust for next week?"
              className="w-full p-3.5 rounded-2xl bg-white/90 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl ${currentTheme.accentBg} text-xs font-bold shadow-xs transition-all flex items-center gap-1.5`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" /> Saved
              </>
            ) : (
              'Save Reflection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
