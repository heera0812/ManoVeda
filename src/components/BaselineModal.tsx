import React from 'react';
import { X, Compass, Sparkles, Check, Edit2 } from 'lucide-react';
import { UserBaseline, UserProfile } from '../types';
import { THEMES } from '../utils/theme';

interface BaselineModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseline: UserBaseline | null;
  userProfile: UserProfile;
}

export const BaselineModal: React.FC<BaselineModalProps> = ({
  isOpen,
  onClose,
  baseline,
  userProfile,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;

  if (!isOpen || !baseline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div
        id="baseline-modal-container"
        className={`relative w-full max-w-lg ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-outfit">
                Personal Wellness Baseline
              </h3>
              <p className="text-[11px] text-slate-500">Established on {baseline.createdAt}</p>
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
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-blue-900">
            <p className="italic">
              "This will update as you check in — it's not fixed, and neither are you."
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Mood</span>
              <span className="font-bold text-slate-800 text-sm">{baseline.overallMood}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Stress Level</span>
              <span className="font-bold text-slate-800 text-sm">{baseline.stress}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sleep Quality</span>
              <span className="font-bold text-slate-800 text-sm">{baseline.sleep}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Energy</span>
              <span className="font-bold text-slate-800 text-sm">{baseline.energy}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Social Sense</span>
              <span className="font-bold text-slate-800 text-sm">{baseline.socialConnection}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Pressure</span>
              <span className="font-bold text-slate-800 text-sm">{baseline.academicPressure}</span>
            </div>
          </div>

          {baseline.mainConcerns.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Focus Areas</span>
              <div className="flex flex-wrap gap-1.5">
                {baseline.mainConcerns.map(c => (
                  <span key={c} className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
