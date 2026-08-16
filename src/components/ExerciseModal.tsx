import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Sparkles, Wind, Eye, CheckCircle2 } from 'lucide-react';
import { MicroExercise, UserProfile } from '../types';
import { THEMES } from '../utils/theme';

interface ExerciseModalProps {
  exercise: MicroExercise | null;
  onClose: () => void;
  userProfile: UserProfile;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose, userProfile }) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;

  // Breathing Box Timer State
  const [breathingPhase, setBreathingPhase] = useState<number>(0); // 0: Inhale, 1: Hold, 2: Exhale, 3: Rest
  const [breathCount, setBreathCount] = useState<number>(4);
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(true);
  const [cycleCount, setCycleCount] = useState<number>(0);

  // Sensory Grounding Interactive Checklists
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!exercise) return;
    setBreathingPhase(0);
    setBreathCount(4);
    setIsBreathingActive(true);
    setCycleCount(0);
    setCheckedItems({});
  }, [exercise]);

  // Box Breathing Interval Loop
  useEffect(() => {
    if (!exercise || exercise.id !== 'box-breathing' || !isBreathingActive) return;

    const timer = setInterval(() => {
      setBreathCount(prev => {
        if (prev <= 1) {
          setBreathingPhase(currPhase => {
            const nextPhase = (currPhase + 1) % 4;
            if (nextPhase === 0) setCycleCount(c => c + 1);
            return nextPhase;
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exercise, isBreathingActive, breathingPhase]);

  if (!exercise) return null;

  const phaseNames = ['Inhale through nose', 'Hold gently', 'Exhale through mouth', 'Stillness rest'];
  const phaseScale = breathingPhase === 0 ? 'scale-125' : breathingPhase === 1 ? 'scale-125' : breathingPhase === 2 ? 'scale-90' : 'scale-90';

  const toggleCheckItem = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div
        id="exercise-modal-container"
        className={`relative w-full max-w-lg ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[92vh]`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-outfit">{exercise.title}</h3>
              <p className="text-[11px] text-slate-500">{exercise.durationMinutes} min reset · {exercise.tagline}</p>
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Dynamic Interactive Box Breathing Experience */}
          {exercise.id === 'box-breathing' ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-6 text-center">
              <div className="relative w-52 h-52 flex items-center justify-center">
                {/* Expanding circle halo */}
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-1000 ease-in-out opacity-20 ${phaseScale}`}
                  style={{ backgroundColor: currentTheme.previewColor }}
                />
                <div
                  className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all duration-1000 ease-in-out ${phaseScale}`}
                  style={{
                    background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #6366F1 100%)',
                  }}
                >
                  <span className="text-4xl font-extrabold font-outfit">{breathCount}</span>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-white/90">
                    {phaseNames[breathingPhase].split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold font-outfit text-slate-900">
                  {phaseNames[breathingPhase]}
                </h4>
                <p className="text-xs text-slate-500">Completed cycles: {cycleCount} / 4</p>
              </div>

              {/* Play / Pause / Reset Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBreathingActive(!isBreathingActive)}
                  className={`px-5 py-2.5 rounded-2xl ${currentTheme.accentBg} text-xs font-bold flex items-center gap-2 shadow-xs transition-all`}
                >
                  {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isBreathingActive ? 'Pause' : 'Resume'}</span>
                </button>
                <button
                  onClick={() => {
                    setBreathingPhase(0);
                    setBreathCount(4);
                    setCycleCount(0);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  title="Reset timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Step-by-Step for other exercises (5-4-3-2-1, Reframe, Focus, Sleep) */
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed bg-white/70 p-3.5 rounded-2xl border border-slate-100">
                {exercise.description}
              </p>

              <div className="space-y-3">
                {exercise.steps.map((step, idx) => {
                  const isChecked = Boolean(checkedItems[idx]);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheckItem(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChecked
                          ? 'bg-emerald-50/70 border-emerald-200 text-slate-700'
                          : 'bg-white/80 border-slate-200/80 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isChecked ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-xs font-bold">{idx + 1}</span>}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold ${isChecked ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'}`}>
                            {step.title}
                          </h4>
                          {step.durationSeconds && (
                            <span className="text-[10px] text-slate-400">{step.durationSeconds}s</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{step.instruction}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Gentle pause complete</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            Finished Reset
          </button>
        </div>
      </div>
    </div>
  );
};
