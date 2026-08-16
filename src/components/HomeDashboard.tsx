import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Compass,
  ArrowRight,
  BrainCircuit,
  Gamepad2,
  CalendarHeart,
  Sparkles,
  Activity,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ActiveTab, Booking, CheckInRecord, MicroExercise, PatternObservation, UserProfile, WeeklyReflection } from '../types';
import { getLocalDateKey } from '../utils/date';
import { THEMES } from '../utils/theme';
import { QuestionnaireModal } from './QuestionnaireModal';
import { DashboardRobot } from './DashboardRobot';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeDashboardProps {
  userProfile: UserProfile;
  checkIns: CheckInRecord[];
  patterns: PatternObservation[];
  bookings: Booking[];
  weeklyReflection: WeeklyReflection | null;
  exercises: MicroExercise[];
  onOpenCheckIn: () => void;
  onOpenCrisis: () => void;
  onOpenWayfinder: () => void;
  onSelectExercise: (ex: MicroExercise) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenWeeklyReflection: () => void;
}

// Tour step definitions
const TOUR_STEPS = [
  {
    title: "Daily Check-in",
    description: "This is your core wellness check-in. It takes just 10 seconds — log how you're feeling today with zero pressure or judgment.",
    emoji: "📋",
  },
  {
    title: "7-Day Pulse",
    description: "See your emotional rhythm over the past week at a glance. Click here anytime to dive into deeper trends.",
    emoji: "📊",
  },
  {
    title: "Self-Discovery",
    description: "Take interactive quizzes to understand your underlying thought patterns and emotional triggers.",
    emoji: "🧠",
  },
  {
    title: "Cognitive Gym",
    description: "Coming soon! Fun, interactive games designed to sharpen your focus and relieve stress.",
    emoji: "🎮",
  },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  userProfile,
  checkIns,
  onOpenCheckIn,
  setActiveTab,
}) => {
  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;
  const todayStr = getLocalDateKey();
  const todayCheckIn = checkIns.find(c => c.dateStr === todayStr);
  
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0); // 0 = off, 1-4 = active steps

  // Refs for each section to calculate position for the spotlight
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Position state for the floating tooltip
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; width: number } | null>(null);

  // Calculate tooltip position when tour step changes
  useEffect(() => {
    if (tourStep === 0) {
      setTooltipPos(null);
      return;
    }
    const el = sectionRefs.current[tourStep - 1];
    if (el) {
      const rect = el.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + 16,
        left: rect.left + rect.width / 2,
        width: rect.width,
      });
    }
  }, [tourStep]);

  const isTourActive = tourStep > 0;

  const advanceTour = useCallback(() => {
    if (tourStep < TOUR_STEPS.length) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(0);
    }
  }, [tourStep]);

  const endTour = useCallback(() => {
    setTourStep(0);
  }, []);

  // Generate mini 7-day trend data
  const now = new Date();
  const trendSlots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = getLocalDateKey(d);
    const label = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const match = checkIns.find(c => c.dateStr === dateStr);
    return { label, match };
  });

  const currentTour = tourStep > 0 ? TOUR_STEPS[tourStep - 1] : null;

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative">
      
      {/* TOUR OVERLAY */}
      <AnimatePresence>
        {isTourActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] pointer-events-auto"
            onClick={endTour}
          >
            {/* Dark backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Tooltip - Floating card that follows the highlighted section */}
      <AnimatePresence>
        {isTourActive && currentTour && tooltipPos && (
          <motion.div
            key={tourStep}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="fixed z-[80] pointer-events-auto"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translateX(-50%)',
              maxWidth: '360px',
              width: '90vw',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 relative">
              {/* Arrow pointing up */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{currentTour.emoji}</span>
                  <div>
                    <h4 className="font-bold text-[#325343] text-base font-outfit">{currentTour.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Step {tourStep} of {TOUR_STEPS.length}</p>
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-4">{currentTour.description}</p>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={endTour}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors"
                  >
                    Skip tour
                  </button>

                  <div className="flex items-center gap-3">
                    {/* Progress dots */}
                    <div className="flex gap-1">
                      {TOUR_STEPS.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === tourStep ? 'w-5 bg-[#325343]' : 'w-1.5 bg-slate-200'}`} 
                        />
                      ))}
                    </div>
                    
                    <button
                      onClick={advanceTour}
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#325343] hover:bg-[#264033] text-white text-xs font-bold rounded-xl transition-all hover:scale-105 shadow-sm"
                    >
                      {tourStep < TOUR_STEPS.length ? 'Next' : 'Finish'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold font-outfit text-slate-900 tracking-tight">
              Hey, {userProfile.name}
            </h1>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Welcome back to your personal wellness space.
          </p>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        
        {/* COLUMN 1 */}
        <div className="md:col-span-2 space-y-6 flex flex-col relative">
          
          {/* Section 1: Main Action: Check-in */}
          <div 
            ref={el => { sectionRefs.current[0] = el; }}
            className={`transition-all duration-500 rounded-[2rem] relative ${
              isTourActive && tourStep === 1 ? 'z-[70] ring-2 ring-white/80 shadow-2xl scale-[1.01]' : 
              isTourActive ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            <button
              onClick={onOpenCheckIn}
              className={`w-full h-full relative overflow-hidden group rounded-[2rem] p-8 text-left transition-all hover:-translate-y-1 hover:shadow-xl border border-white/50 bg-gradient-to-br ${todayCheckIn ? 'from-green-100 to-green-50' : 'from-[#325343]/10 to-[#325343]/5'}`}
            >
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700">
                {todayCheckIn ? <CheckCircle2 className="w-32 h-32 text-green-700" /> : <Compass className="w-32 h-32 text-[#325343]" />}
              </div>
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div>
                  <div className={`inline-flex p-3 rounded-2xl mb-4 ${todayCheckIn ? 'bg-green-200 text-green-800' : 'bg-[#325343] text-white'}`}>
                    {todayCheckIn ? <Sparkles className="w-6 h-6" /> : <CalendarHeart className="w-6 h-6" />}
                  </div>
                  <h2 className="text-2xl font-bold font-outfit text-slate-900 mb-2">
                    {todayCheckIn ? "You've checked in today" : "How are you feeling today?"}
                  </h2>
                  <p className="text-slate-600 font-medium max-w-sm">
                    {todayCheckIn 
                      ? "Great job prioritizing your mental well-being. Feel free to update it anytime." 
                      : "Take a moment to center yourself and log your emotional pulse."}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 font-bold text-slate-800 group-hover:gap-4 transition-all">
                  {todayCheckIn ? 'Update Check-in' : 'Start Check-in'} <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </button>
          </div>

          {/* Section 2: Mini Trend (Pulse) */}
          <div 
            ref={el => { sectionRefs.current[1] = el; }}
            className={`transition-all duration-500 rounded-[2rem] relative ${
              isTourActive && tourStep === 2 ? 'z-[70] ring-2 ring-white/80 shadow-2xl scale-[1.01]' :
              isTourActive ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            <div 
              onClick={() => setActiveTab('pulse')}
              className="w-full bg-white rounded-[2rem] p-6 border border-[#EAEAEA] shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between h-full"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Activity className="text-[#325343] w-5 h-5" />
                  <h3 className="font-bold font-outfit text-slate-900">7-Day Pulse</h3>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#325343] group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className="flex justify-between items-end h-16 px-2">
                {trendSlots.map((slot, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-slate-50 border border-slate-100">
                      {slot.match ? (
                        <span className="text-lg">{slot.match.emoji || '✨'}</span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{slot.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Discovery & Activities */}
        <div className="space-y-6 flex flex-col relative">
          
          {/* Section 3: Questionnaires / Discovery */}
          <div 
            ref={el => { sectionRefs.current[2] = el; }}
            className={`flex-1 flex flex-col transition-all duration-500 rounded-[2rem] relative ${
              isTourActive && tourStep === 3 ? 'z-[70] ring-2 ring-white/80 shadow-2xl scale-[1.01]' :
              isTourActive ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            <button
              onClick={() => setIsQuestionnaireOpen(true)}
              className="w-full h-full flex-1 bg-gradient-to-br from-[#FAF8F5] to-amber-50/50 rounded-[2rem] p-6 border border-[#EAEAEA] hover:border-amber-200 shadow-sm hover:shadow-lg transition-all text-left group relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
                <BrainCircuit className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold font-outfit text-slate-900 mb-2">Self-Discovery</h3>
                  <p className="text-sm text-slate-600 font-medium">
                    Take interactive quizzes to understand your underlying thought patterns.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-bold text-amber-700 group-hover:gap-3 transition-all text-sm">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>

          {/* Section 4: Activities / Games */}
          <div 
            ref={el => { sectionRefs.current[3] = el; }}
            className={`flex-1 flex flex-col transition-all duration-500 rounded-[2rem] relative ${
              isTourActive && tourStep === 4 ? 'z-[70] ring-2 ring-white/80 shadow-2xl scale-[1.01]' :
              isTourActive ? 'opacity-30 pointer-events-none' : ''
            }`}
          >
            <button
              className="w-full h-full flex-1 bg-gradient-to-br from-indigo-50/50 to-[#FAF8F5] rounded-[2rem] p-6 border border-[#EAEAEA] hover:border-indigo-200 shadow-sm hover:shadow-lg transition-all text-left group relative overflow-hidden"
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:-rotate-12 transition-all duration-500">
                <Gamepad2 className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                    <Gamepad2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold font-outfit text-slate-900">Cognitive Gym</h3>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Soon</span>
                  </div>
                  <p className="text-sm text-slate-600 font-medium">
                    Fun, interactive games designed to improve focus and relieve stress.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-bold text-indigo-700 group-hover:gap-3 transition-all text-sm">
                  View Games <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <QuestionnaireModal 
        isOpen={isQuestionnaireOpen}
        onClose={() => setIsQuestionnaireOpen(false)}
        userProfile={userProfile}
      />

      {/* Floating Robot - always bottom-right, hidden during tour */}
      {!isTourActive && (
        <DashboardRobot 
          onStartTour={() => setTourStep(1)} 
        />
      )}
    </div>
  );
};
