import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  ArrowRight,
  Sparkles,
  Compass,
  Wind,
  CalendarHeart,
  ShieldAlert,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { MicroExercise, UserProfile } from '../types';
import { MICRO_EXERCISES } from '../constants/resources';
import { THEMES } from '../utils/theme';

interface WayfinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (ex: MicroExercise) => void;
  onOpenCounseling: () => void;
  onOpenCrisis: () => void;
  userProfile: UserProfile;
}

export const WayfinderModal: React.FC<WayfinderModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
  onOpenCounseling,
  onOpenCrisis,
  userProfile,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;

  const [step, setStep] = useState<number>(1);
  const [urgency, setUrgency] = useState<string>('');
  const [source, setSource] = useState<string>('');
  const [preferredSupport, setPreferredSupport] = useState<string>('');

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setUrgency('');
    setSource('');
    setPreferredSupport('');
  };

  const getRecommendedAction = () => {
    if (urgency === 'crisis') {
      return {
        title: 'Immediate Crisis Support',
        desc: 'Connect with a real, confidential human right now through the campus crisis line or 988 lifeline.',
        actionLabel: 'Open Crisis Safety Net',
        action: () => {
          onClose();
          onOpenCrisis();
        },
        icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
        bg: 'bg-rose-50 border-rose-200 text-rose-900',
      };
    }

    if (preferredSupport === 'counselor' || urgency === 'ongoing') {
      return {
        title: 'Confidential 1-on-1 Campus Counseling',
        desc: 'Schedule a low-pressure 45-minute conversation with a campus counselor specializing in your area of concern.',
        actionLabel: 'Browse & Book Counselor',
        action: () => {
          onClose();
          onOpenCounseling();
        },
        icon: <CalendarHeart className="w-6 h-6 text-emerald-600" />,
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      };
    }

    // Default to micro-exercise
    const recommendedEx =
      MICRO_EXERCISES.find(e => e.targetFactor?.toLowerCase() === source.toLowerCase()) ||
      MICRO_EXERCISES[0];

    return {
      title: recommendedEx.title,
      desc: recommendedEx.description,
      actionLabel: `Start ${recommendedEx.durationMinutes}-Minute Micro-Reset`,
      action: () => {
        onClose();
        onSelectExercise(recommendedEx);
      },
      icon: <Wind className="w-6 h-6 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    };
  };

  const recommendation = getRecommendedAction();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div
        id="wayfinder-container"
        className={`relative w-full max-w-lg ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-outfit">
                I'm Not Sure What I Need
              </h3>
              <p className="text-[11px] text-slate-500">
                A gentle 30-second guided wayfinder to find your next step.
              </p>
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
          {/* Step 1: Urgency / Timeframe */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question 1 of 3
                </span>
              </div>

              <h4 className="text-xl font-bold font-outfit text-slate-900">
                How acute or immediate does this feeling feel?
              </h4>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrgency('crisis');
                    setStep(4);
                  }}
                  className="w-full p-4 rounded-2xl border border-rose-200 bg-rose-50/60 hover:bg-rose-50 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-rose-900 text-sm block">
                      I feel completely overwhelmed or unsafe right now
                    </span>
                    <span className="text-xs text-rose-700">Immediate human support</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUrgency('acute_today');
                    setStep(2);
                  }}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white/70 hover:bg-white text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      It's high stress today (midterms, presentation, argument)
                    </span>
                    <span className="text-xs text-slate-500">Short-term acute stress</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUrgency('ongoing');
                    setStep(2);
                  }}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white/70 hover:bg-white text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      It's an ongoing, persistent pattern I've carried for weeks
                    </span>
                    <span className="text-xs text-slate-500">Ongoing background weight</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: What's the main domain? */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-slate-500 flex items-center gap-1 hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question 2 of 3
                </span>
              </div>

              <h4 className="text-xl font-bold font-outfit text-slate-900">
                What area of your life feels heaviest right now?
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: 'academics', label: 'Academics & Deadlines', sub: 'Exams, workload, imposter feeling' },
                  { id: 'sleep', label: 'Sleep & Physical Energy', sub: 'Insomnia, exhaustion, somatic tension' },
                  { id: 'relationships', label: 'Friends & Family', sub: 'Roommates, conflict, feeling isolated' },
                  { id: 'career', label: 'Future & Career Dread', sub: 'Internships, graduating, finances' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSource(item.id);
                      setStep(3);
                    }}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-left transition-all flex flex-col justify-between"
                  >
                    <span className="font-bold text-slate-900 text-xs block">{item.label}</span>
                    <span className="text-[11px] text-slate-500 mt-1">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preferred Format */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-slate-500 flex items-center gap-1 hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Question 3 of 3
                </span>
              </div>

              <h4 className="text-xl font-bold font-outfit text-slate-900">
                Would you rather do a quick solo exercise or talk to someone?
              </h4>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreferredSupport('solo');
                    setStep(4);
                  }}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      A quick 2–3 minute solo exercise right on my screen
                    </span>
                    <span className="text-xs text-slate-500">Breathing, grounding, focus reset</span>
                  </div>
                  <Wind className="w-5 h-5 text-indigo-500" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreferredSupport('counselor');
                    setStep(4);
                  }}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white/80 hover:bg-white text-left transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">
                      Book a confidential 1-on-1 conversation with a human
                    </span>
                    <span className="text-xs text-slate-500">Campus wellness counselor</span>
                  </div>
                  <CalendarHeart className="w-5 h-5 text-emerald-500" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Outcome & Direct Next Step */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Wayfinder Recommended Next Step</span>
              </div>

              <div className={`p-6 rounded-3xl border ${recommendation.bg} text-left space-y-3 shadow-xs`}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white shadow-2xs">{recommendation.icon}</div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{recommendation.title}</h4>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">
                      Tailored to your current state
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{recommendation.desc}</p>
              </div>

              <div className="space-y-2">
                <button
                  id="wayfinder-action-btn"
                  onClick={recommendation.action}
                  className={`w-full py-4 px-6 rounded-2xl ${currentTheme.accentBg} text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] transition-all`}
                >
                  <span>{recommendation.actionLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Start wayfinder over ↻
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
