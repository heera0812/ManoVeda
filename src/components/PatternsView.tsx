import React, { useState } from 'react';
import {
  Sparkles,
  Info,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Compass,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Moon,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { PatternObservation, UserProfile } from '../types';
import { THEMES } from '../utils/theme';

interface PatternsViewProps {
  patterns: PatternObservation[];
  onDismissPattern: (id: string) => void;
  onPatternFeedback: (id: string, feedback: 'accurate' | 'inaccurate') => void;
  userProfile: UserProfile;
  totalCheckInCount: number;
  onOpenCounseling: () => void;
}

export const PatternsView: React.FC<PatternsViewProps> = ({
  patterns,
  onDismissPattern,
  onPatternFeedback,
  userProfile,
  totalCheckInCount,
  onOpenCounseling,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const visiblePatterns = patterns.filter(p => !p.dismissed);
  const filteredPatterns = visiblePatterns.filter(p => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const hasEnoughData = totalCheckInCount >= 5;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sleep':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'academics':
        return <GraduationCap className="w-4 h-4 text-sky-500" />;
      case 'energy':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-rose-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">
                Your Patterns
              </h1>
              <p className="text-xs text-slate-500">
                Data-informed personal insights to help you understand your emotional rhythm.
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'academics', 'sleep', 'energy', 'mood'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                activeCategory === cat
                  ? currentTheme.pillActive
                  : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Philosophy Banner */}
      <div className="p-4 rounded-3xl bg-blue-50/80 border border-blue-200/70 text-blue-900 flex items-start gap-3 shadow-2xs">
        <Compass className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <p className="font-bold text-blue-950">
            These are observations based on your check-ins, not medical diagnoses.
          </p>
          <p className="text-blue-800 leading-relaxed">
            Patterns reflect statistical correlations in what you choose to report. You know your experience best — if an observation feels off, mark it as "not quite right" below.
          </p>
        </div>
      </div>

      {/* Minimum Data Threshold Check */}
      {!hasEnoughData && (
        <div className={`p-8 rounded-3xl ${currentTheme.cardBg} border border-white/80 shadow-md text-center space-y-3`}>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold font-outfit text-slate-900">Gathering Your Baseline Data</h3>
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Patterns require at least 5 check-ins to prevent premature conclusions. You currently have {totalCheckInCount} recorded.
          </p>
          <div className="w-48 mx-auto bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${(totalCheckInCount / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Pattern Cards Grid */}
      {hasEnoughData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPatterns.map(pattern => (
            <div
              key={pattern.id}
              className={`rounded-3xl p-6 ${currentTheme.cardBg} border border-white/70 shadow-md flex flex-col justify-between space-y-4 relative group`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100/80 text-slate-700 text-xs font-semibold">
                    {getCategoryIcon(pattern.category)}
                    <span className="capitalize">{pattern.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{pattern.detectedDate}</span>
                    <button
                      onClick={() => onDismissPattern(pattern.id)}
                      title="Dismiss pattern"
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold font-outfit text-slate-900">{pattern.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{pattern.description}</p>
              </div>

              {/* Feedback Loop ("Not quite right" button from blueprint) */}
              <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">Does this resonate?</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPatternFeedback(pattern.id, 'accurate')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      pattern.userFeedback === 'accurate'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" /> Resonates
                  </button>
                  <button
                    onClick={() => onPatternFeedback(pattern.id, 'inaccurate')}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      pattern.userFeedback === 'inaccurate'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <ThumbsDown className="w-3 h-3" /> Not quite right
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredPatterns.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-500">
              No patterns found for this filter category.
            </div>
          )}
        </div>
      )}

      {/* Support Connection Action Callout */}
      <div className={`p-6 rounded-3xl bg-gradient-to-r from-indigo-50/80 to-blue-50/80 border border-indigo-200/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1 max-w-md">
          <h4 className="font-bold text-slate-900 text-base font-outfit">Want to explore these patterns with someone?</h4>
          <p className="text-xs text-slate-600">
            A campus counselor can help unpack recurring academic stress or sleep blockers without judgment.
          </p>
        </div>
        <button
          onClick={onOpenCounseling}
          className={`px-5 py-3 rounded-2xl ${currentTheme.accentBg} text-xs font-bold flex items-center gap-2 shadow-sm transition-all shrink-0`}
        >
          <span>Schedule a 1-on-1 Chat</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
