import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ChevronRight,
  Check,
  Heart,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Feather,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CheckInRecord, MoodFactor, MoodValue, UserProfile } from '../types';
import { ALL_MOOD_FACTORS, JOURNAL_PROMPTS, MOOD_CONFIGS } from '../constants/moods';
import { getLocalDateKey } from '../utils/date';
import { THEMES } from '../utils/theme';
import { detectCrisisIndicators } from '../utils/crisisDetector';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCheckIn: (record: CheckInRecord) => void;
  userProfile: UserProfile;
  onOpenCrisis: () => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  onSaveCheckIn,
  userProfile,
  onOpenCrisis,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;

  // Selected state
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [selectedFactors, setSelectedFactors] = useState<MoodFactor[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number>(3);
  const [sleepLevel, setSleepLevel] = useState<number>(3);
  const [journalText, setJournalText] = useState<string>('');
  const [currentPromptIdx, setCurrentPromptIdx] = useState<number>(0);
  const [showOptionalDetails, setShowOptionalDetails] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Real-time gentle crisis indicator check
  const crisisCheck = detectCrisisIndicators(journalText);

  useEffect(() => {
    if (isOpen) {
      setSelectedMood(null);
      setSelectedFactors([]);
      setEnergyLevel(3);
      setSleepLevel(3);
      setJournalText('');
      setShowOptionalDetails(false);
      setSavedSuccess(false);
      setCurrentPromptIdx(Math.floor(Math.random() * JOURNAL_PROMPTS.length));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMoodSelect = (val: MoodValue) => {
    setSelectedMood(val);
  };

  const toggleFactor = (factor: MoodFactor) => {
    if (factor === 'Nothing specific' || factor === 'I\'m not sure') {
      setSelectedFactors([factor]);
      return;
    }

    const filtered = selectedFactors.filter(f => f !== 'Nothing specific' && f !== 'I\'m not sure');
    if (filtered.includes(factor)) {
      setSelectedFactors(filtered.filter(f => f !== factor));
    } else {
      setSelectedFactors([...filtered, factor]);
    }
  };

  const handleSave = (isQuick = false) => {
    if (!selectedMood) return;

    const now = new Date();
    const dateStr = getLocalDateKey(now);
    const dayLabel = now.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const newRecord: CheckInRecord = {
      id: `checkin-${Date.now()}`,
      timestamp: now.getTime(),
      dateStr,
      dayLabel,
      mood: selectedMood,
      moodLabel: MOOD_CONFIGS[selectedMood].label,
      factors: isQuick ? [] : selectedFactors,
      energy: isQuick ? undefined : energyLevel,
      sleep: isQuick ? undefined : sleepLevel,
      journalText: isQuick ? '' : journalText.trim(),
      journalPrompt: isQuick || !journalText.trim() ? '' : JOURNAL_PROMPTS[currentPromptIdx],
    };

    setSavedSuccess(true);
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#60A5FA', '#F472B6', '#34D399', '#A78BFA'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      onSaveCheckIn(newRecord);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
      <div
        id="daily-checkin-container"
        className={`relative w-full max-w-xl ${currentTheme.cardBg} rounded-3xl shadow-2xl border border-white/80 overflow-hidden flex flex-col max-h-[92vh]`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-outfit">Daily Mind Check-In</h3>
              <p className="text-[11px] text-slate-500">10–20 seconds · 100% private to you</p>
            </div>
          </div>
          <button
            id="close-checkin-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {savedSuccess ? (
            <div className="py-12 text-center space-y-3 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-slate-900">Check-in Recorded</h3>
              <p className="text-sm text-slate-600 max-w-xs mx-auto">
                Thanks for checking in with yourself today. Recorded with care.
              </p>
            </div>
          ) : (
            <>
              {/* Main Emoji Scale (Only required step) */}
              <div className="space-y-3 text-center">
                <h4 className="text-xl sm:text-2xl font-bold font-outfit text-slate-900">
                  How are you feeling today?
                </h4>
                <p className="text-xs text-slate-500">
                  Choose the emoji that fits closest right now
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                  {([6, 5, 4, 3, 2, 1] as MoodValue[]).map(val => {
                    const cfg = MOOD_CONFIGS[val];
                    const isSelected = selectedMood === val;
                    return (
                      <button
                        key={val}
                        id={`mood-btn-${val}`}
                        type="button"
                        onClick={() => handleMoodSelect(val)}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 ${
                          isSelected
                            ? `${cfg.bgClass} ring-2 ring-indigo-500/40 shadow-md scale-105 font-bold`
                            : 'bg-white/70 hover:bg-white border border-slate-200/70 text-slate-700'
                        }`}
                      >
                        <span className="text-3xl filter drop-shadow-xs">{cfg.emoji}</span>
                        <span className="text-xs font-semibold">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedMood && (
                  <div className="pt-1">
                    <p className="text-xs font-medium text-slate-600 italic">
                      "{MOOD_CONFIGS[selectedMood].description}"
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Submit Option if only mood selected */}
              {selectedMood && !showOptionalDetails && (
                <div className="space-y-2 pt-2">
                  <div className="flex gap-2">
                    <button
                      id="save-quick-checkin-btn"
                      onClick={() => handleSave(true)}
                      className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-4 h-4" /> Save Quick Check-In (Done in 10s)
                    </button>
                    <button
                      id="add-context-checkin-btn"
                      onClick={() => setShowOptionalDetails(true)}
                      className={`py-3 px-4 rounded-2xl ${currentTheme.accentBg} text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm`}
                    >
                      <span>Add context</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Contextual Follow-Up & Optional Details (Sections 6 & 7) */}
              {selectedMood && showOptionalDetails && (
                <div className="space-y-5 pt-3 border-t border-slate-100 animate-fadeIn">
                  {/* Contextual Factor Question */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {selectedMood >= 5
                        ? "What's making today feel good?"
                        : "What's affecting your mood today?"}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_MOOD_FACTORS.map(factor => {
                        const isSel = selectedFactors.includes(factor);
                        return (
                          <button
                            key={factor}
                            type="button"
                            onClick={() => toggleFactor(factor)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              isSel
                                ? `${currentTheme.pillActive}`
                                : 'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white'
                            }`}
                          >
                            {factor}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Energy & Sleep Levels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Energy */}
                    <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">Energy Level</span>
                        <span className="text-slate-500 font-medium">
                          {['Very low', 'Low', 'Moderate', 'Good', 'High'][energyLevel - 1]}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setEnergyLevel(lvl)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              energyLevel === lvl
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sleep */}
                    <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">Last Night's Sleep</span>
                        <span className="text-slate-500 font-medium">
                          {['Poor', 'Fair', 'Okay', 'Good', 'Restorative'][sleepLevel - 1]}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(lvl => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setSleepLevel(lvl)}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              sleepLevel === lvl
                                ? 'bg-indigo-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Soft Journal Entry Point with Rotating Prompts */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                        <Feather className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Want to say a little more? (Optional)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPromptIdx((currentPromptIdx + 1) % JOURNAL_PROMPTS.length)
                        }
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Change prompt ↻
                      </button>
                    </div>

                    <div className="relative">
                      <textarea
                        value={journalText}
                        onChange={e => setJournalText(e.target.value)}
                        placeholder={JOURNAL_PROMPTS[currentPromptIdx]}
                        rows={3}
                        className="w-full p-3.5 rounded-2xl bg-white/90 border border-slate-200 text-slate-800 text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Gentle Safety Net Notification if risk keywords detected */}
                  {crisisCheck.hasRiskIndicator && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start justify-between gap-3 animate-fadeIn">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <p>{crisisCheck.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={onOpenCrisis}
                        className="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-bold hover:bg-rose-700 shrink-0 shadow-xs"
                      >
                        View Support
                      </button>
                    </div>
                  )}

                  {/* Complete Check-in CTA */}
                  <button
                    id="submit-full-checkin-btn"
                    onClick={() => handleSave(false)}
                    className={`w-full py-3.5 px-6 rounded-2xl ${currentTheme.accentBg} text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all`}
                  >
                    <span>Complete Check-In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
