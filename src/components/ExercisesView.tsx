import React, { useState } from 'react';
import { Wind, Sparkles, Clock, Play, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { MicroExercise, UserProfile } from '../types';
import { MICRO_EXERCISES } from '../constants/resources';
import { THEMES } from '../utils/theme';

interface ExercisesViewProps {
  onSelectExercise: (ex: MicroExercise) => void;
  onOpenWayfinder: () => void;
  userProfile: UserProfile;
}

export const ExercisesView: React.FC<ExercisesViewProps> = ({
  onSelectExercise,
  onOpenWayfinder,
  userProfile,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const filtered = MICRO_EXERCISES.filter(ex => {
    if (selectedCat === 'all') return true;
    return ex.category === selectedCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">
                Micro-Resets & Practices
              </h1>
              <p className="text-xs text-slate-500">
                Short 2–5 minute nervous system resets, sensory grounders, and academic de-clutter tools.
              </p>
            </div>
          </div>
        </div>

        {/* Guided Wayfinder Link */}
        <button
          onClick={onOpenWayfinder}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need guidance? Try Wayfinder</span>
        </button>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'breathing', 'grounding', 'focus', 'reframe', 'sleep'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              selectedCat === cat
                ? currentTheme.pillActive
                : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Exercises */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(ex => (
          <div
            key={ex.id}
            className={`rounded-3xl p-6 ${currentTheme.cardBg} border border-white/70 shadow-md flex flex-col justify-between space-y-4 hover:shadow-lg transition-all group`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  {ex.category}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> {ex.durationMinutes} min
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 font-outfit text-base group-hover:text-indigo-600 transition-colors">
                  {ex.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{ex.tagline}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-3 rounded-2xl border border-slate-100">
                {ex.description}
              </p>

              {ex.targetFactor && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <span>Helps with:</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                    {ex.targetFactor}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                id={`start-exercise-${ex.id}`}
                onClick={() => onSelectExercise(ex)}
                className={`w-full py-2.5 px-4 rounded-2xl ${currentTheme.accentBg} text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Begin Reset</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
