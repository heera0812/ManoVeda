import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  ActiveTab,
  Booking,
  CheckInRecord,
  MicroExercise,
  PatternObservation,
  UserProfile,
  WeeklyReflection,
} from './types';
import {
  INITIAL_BASELINE,
  INITIAL_BOOKINGS,
  INITIAL_PATTERNS,
  INITIAL_USER_PROFILE,
  INITIAL_WEEKLY_REFLECTION,
  generateSeedCheckIns,
} from './constants/seedData';
import { MICRO_EXERCISES } from './constants/resources';
import { getLocalDateKey } from './utils/date';
import { THEMES } from './utils/theme';
import { analyzePatterns, shouldTriggerSupportRecommendation } from './utils/patternEngine';

// Components
import { Navigation } from './components/Navigation';
import { OnboardingFlow } from './components/OnboardingFlow';
import { HomeDashboard } from './components/HomeDashboard';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { MyPulseView } from './components/MyPulseView';
import { PatternsView } from './components/PatternsView';
import { CounselingView } from './components/CounselingView';
import { ExercisesView } from './components/ExercisesView';
import { ProfilePrivacyView } from './components/ProfilePrivacyView';
import { CrisisModal } from './components/CrisisModal';
import { WayfinderModal } from './components/WayfinderModal';
import { ExerciseModal } from './components/ExerciseModal';
import { SupportRecommendationModal } from './components/SupportRecommendationModal';
import { WeeklyReflectionModal } from './components/WeeklyReflectionModal';
import { BaselineModal } from './components/BaselineModal';
import { SplashScreen } from './components/SplashScreen';
import { AuthGatePage } from './pages/AuthGatePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { InstructorPortal } from './pages/InstructorPortal';
import { AdminPanel } from './pages/AdminPanel';
import { useAuth } from './context/AuthContext';

const LEGACY_STORAGE_KEYS = {
  profile: 'mindpulse_profile_v2',
  checkIns: 'mindpulse_checkins_v2',
  patterns: 'mindpulse_patterns_v2',
  bookings: 'mindpulse_bookings_v2',
  reflection: 'mindpulse_reflection_v2',
} as const;

const STORAGE_KEYS = {
  profile: 'manoveda_profile_v2',
  checkIns: 'manoveda_checkins_v2',
  patterns: 'manoveda_patterns_v2',
  bookings: 'manoveda_bookings_v2',
  reflection: 'manoveda_reflection_v2',
} as const;

const getStoredValue = (key: keyof typeof STORAGE_KEYS) =>
  localStorage.getItem(STORAGE_KEYS[key]) ?? localStorage.getItem(LEGACY_STORAGE_KEYS[key]);

export default function App() {
  const { user, profile, loading } = useAuth();
  const [showSplash, setShowSplash] = useState<boolean>(window.location.pathname === '/');
  const navigate = useNavigate();

  // Local state initialized from localStorage or rich defaults
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = getStoredValue('profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Start with onboarding view if fresh, or preloaded
    return {
      ...INITIAL_USER_PROFILE,
      completedOnboarding: false, // shows beautiful welcome landing on fresh boot
    };
  });

  const [checkIns, setCheckIns] = useState<CheckInRecord[]>(() => {
    const saved = getStoredValue('checkIns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return generateSeedCheckIns();
  });

  const [patterns, setPatterns] = useState<PatternObservation[]>(() => {
    const saved = getStoredValue('patterns');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_PATTERNS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = getStoredValue('bookings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [weeklyReflection, setWeeklyReflection] = useState<WeeklyReflection | null>(() => {
    const saved = getStoredValue('reflection');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_WEEKLY_REFLECTION;
  });

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isCheckInOpen, setIsCheckInOpen] = useState<boolean>(false);

  // Sync Supabase profile username to local userProfile when it loads
  useEffect(() => {
    if (profile?.username && profile.username !== userProfile.name) {
      setUserProfile(prev => ({
        ...prev,
        name: profile.username
      }));
    }
  }, [profile?.username]);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [isWayfinderOpen, setIsWayfinderOpen] = useState<boolean>(false);
  const [isSupportRecOpen, setIsSupportRecOpen] = useState<boolean>(false);
  const [isWeeklyRecOpen, setIsWeeklyRecOpen] = useState<boolean>(false);
  const [isBaselineOpen, setIsBaselineOpen] = useState<boolean>(false);
  const [activeExercise, setActiveExercise] = useState<MicroExercise | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.checkIns, JSON.stringify(checkIns));
    // Run pattern engine dynamically on check-in updates
    const analysis = analyzePatterns(checkIns);
    if (analysis.hasSufficientData && analysis.patterns.length > 0) {
      setPatterns(prev => {
        // preserve feedback
        const feedbackMap = new Map<string, PatternObservation>(prev.map(p => [p.id, p]));
        return analysis.patterns.map(p => {
          const existing = feedbackMap.get(p.id);
          if (existing) {
            return { ...p, dismissed: existing.dismissed, userFeedback: existing.userFeedback };
          }
          return p;
        });
      });
    }
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.patterns, JSON.stringify(patterns));
  }, [patterns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    if (weeklyReflection) {
      localStorage.setItem(STORAGE_KEYS.reflection, JSON.stringify(weeklyReflection));
    }
  }, [weeklyReflection]);

  // Check if today has been checked in
  const todayStr = getLocalDateKey();
  const hasUncheckedToday = !checkIns.some(c => c.dateStr === todayStr);

  // Trigger support recommendation if recent low mood occurs
  useEffect(() => {
    if (
      userProfile.completedOnboarding &&
      shouldTriggerSupportRecommendation(
        checkIns,
        userProfile.baseline,
        userProfile.supportPromptDismissedUntil
      )
    ) {
      // Small timeout so it doesn't jarringly block
      const timer = setTimeout(() => {
        setIsSupportRecOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [checkIns, userProfile.completedOnboarding, userProfile.supportPromptDismissedUntil]);

  // Handlers
  const handleSaveCheckIn = (newRecord: CheckInRecord) => {
    setCheckIns(prev => {
      const filtered = prev.filter(c => c.dateStr !== newRecord.dateStr);
      return [newRecord, ...filtered];
    });
  };

  const handleAddBooking = (booking: Booking) => {
    setBookings(prev => [booking, ...prev]);
  };

  const handleCancelBooking = (id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );
  };

  const handleDismissPattern = (id: string) => {
    setPatterns(prev => prev.map(p => (p.id === id ? { ...p, dismissed: true } : p)));
  };

  const handlePatternFeedback = (id: string, feedback: 'accurate' | 'inaccurate') => {
    setPatterns(prev => prev.map(p => (p.id === id ? { ...p, userFeedback: feedback } : p)));
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updated }));
  };

  const handleResetAllData = () => {
    [...Object.values(STORAGE_KEYS), ...Object.values(LEGACY_STORAGE_KEYS)].forEach(key =>
      localStorage.removeItem(key)
    );
    setUserProfile({
      ...INITIAL_USER_PROFILE,
      completedOnboarding: false,
    });
    setCheckIns(generateSeedCheckIns());
    setPatterns(INITIAL_PATTERNS);
    setBookings(INITIAL_BOOKINGS);
    setWeeklyReflection(INITIAL_WEEKLY_REFLECTION);
    setActiveTab('home');
  };

  const handleSaveReflectionNote = (note: string) => {
    if (weeklyReflection) {
      setWeeklyReflection({
        ...weeklyReflection,
        userReflectionNote: note,
        completedAt: Date.now(),
      });
    }
  };

  const currentTheme = THEMES[userProfile.theme] || THEMES.blue;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#325343]"></div>
      </div>
    );
  }

  if (showSplash) {
    return (
      <SplashScreen onComplete={() => setShowSplash(false)} />
    );
  }

  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/auth" element={<AuthGatePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Instructor & Admin Portals */}
      <Route path="/instructor" element={<InstructorPortal />} />
      <Route path="/admin" element={<AdminPanel />} />

      {/* Main App Route */}
      <Route path="/" element={
        !user && !userProfile.completedOnboarding ? (
          <OnboardingFlow
            onComplete={profile => {
              setUserProfile(profile);
              navigate('/signup');
            }}
            onQuickDemoLogin={() => {
              navigate('/login');
            }} // Legacy
          />
        ) : (
          <div className={`min-h-screen ${currentTheme.bgGradient} transition-colors duration-500 flex flex-col lg:flex-row relative text-slate-900 font-sans`}>
              {/* Dashboard Content */}
              {/* Theme Preview Bar */}
              <div className="fixed top-0 left-0 right-0 h-1.5 z-50 transition-colors duration-500" style={{ backgroundColor: currentTheme.previewColor }} />

              {/* Navigation (Sidebar on Desktop, Bottom bar on mobile) */}
              <div className="relative z-30">
                <Navigation
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onOpenCrisis={() => setIsCrisisOpen(true)}
                  onOpenWayfinder={() => setIsWayfinderOpen(true)}
                  userProfile={userProfile}
                  hasUncheckedToday={hasUncheckedToday}
                />
              </div>

              {/* Main Content Area */}
              <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative z-10">
                {activeTab === 'home' && (
                  <HomeDashboard
                    userProfile={userProfile}
                    checkIns={checkIns}
                    patterns={patterns}
                    bookings={bookings}
                    weeklyReflection={weeklyReflection}
                    exercises={MICRO_EXERCISES}
                    onOpenCheckIn={() => setIsCheckInOpen(true)}
                    onOpenCrisis={() => setIsCrisisOpen(true)}
                    onOpenWayfinder={() => setIsWayfinderOpen(true)}
                    onSelectExercise={ex => setActiveExercise(ex)}
                    setActiveTab={setActiveTab}
                    onOpenWeeklyReflection={() => setIsWeeklyRecOpen(true)}
                  />
                )}

                {activeTab === 'checkin' && (
                  <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
                    <div className={`rounded-3xl p-8 ${currentTheme.cardBg} border border-white/70 shadow-lg text-center space-y-4`}>
                      <h2 className="text-2xl font-bold font-outfit text-slate-900">Daily Mood Check-In</h2>
                      <p className="text-xs text-slate-600 max-w-md mx-auto">
                        Check in with yourself in 10–20 seconds. No pressure, no judgment.
                      </p>
                      <button
                        onClick={() => setIsCheckInOpen(true)}
                        className={`py-3.5 px-6 rounded-2xl ${currentTheme.accentBg} text-sm font-bold shadow-md transition-all`}
                      >
                        Open Check-In Flow
                      </button>
                    </div>

                    {/* Recent Check-Ins Preview */}
                    <MyPulseView
                      checkIns={checkIns}
                      userProfile={userProfile}
                      onOpenCheckIn={() => setIsCheckInOpen(true)}
                    />
                  </div>
                )}

                {activeTab === 'pulse' && (
                  <MyPulseView
                    checkIns={checkIns}
                    userProfile={userProfile}
                    onOpenCheckIn={() => setIsCheckInOpen(true)}
                  />
                )}

                {activeTab === 'patterns' && (
                  <PatternsView
                    patterns={patterns}
                    onDismissPattern={handleDismissPattern}
                    onPatternFeedback={handlePatternFeedback}
                    userProfile={userProfile}
                    totalCheckInCount={checkIns.length}
                    onOpenCounseling={() => setActiveTab('counseling')}
                  />
                )}

                {activeTab === 'counseling' && (
                  <CounselingView
                    bookings={bookings}
                    onAddBooking={handleAddBooking}
                    onCancelBooking={handleCancelBooking}
                    userProfile={userProfile}
                  />
                )}

                {activeTab === 'exercises' && (
                  <ExercisesView
                    onSelectExercise={ex => setActiveExercise(ex)}
                    onOpenWayfinder={() => setIsWayfinderOpen(true)}
                    userProfile={userProfile}
                  />
                )}

                {activeTab === 'profile' && (
                  <ProfilePrivacyView
                    userProfile={userProfile}
                    onUpdateProfile={handleUpdateProfile}
                    checkIns={checkIns}
                    onResetAllData={handleResetAllData}
                    onOpenBaseline={() => setIsBaselineOpen(true)}
                  />
                )}
              </main>

              {/* Global Modals */}
              <DailyCheckInModal
                isOpen={isCheckInOpen}
                onClose={() => setIsCheckInOpen(false)}
                onSaveCheckIn={handleSaveCheckIn}
                userProfile={userProfile}
                onOpenCrisis={() => {
                  setIsCheckInOpen(false);
                  setIsCrisisOpen(true);
                }}
              />
              <CrisisModal
                isOpen={isCrisisOpen}
                onClose={() => setIsCrisisOpen(false)}
                onOpenExercise={() => {
                  setIsCrisisOpen(false);
                  setActiveExercise(MICRO_EXERCISES[0]);
                }}
              />
              <WayfinderModal
                isOpen={isWayfinderOpen}
                onClose={() => setIsWayfinderOpen(false)}
                onSelectExercise={ex => {
                  setIsWayfinderOpen(false);
                  setActiveExercise(ex);
                }}
                onOpenCounseling={() => {
                  setIsWayfinderOpen(false);
                  setActiveTab('counseling');
                }}
                onOpenCrisis={() => {
                  setIsWayfinderOpen(false);
                  setIsCrisisOpen(true);
                }}
                userProfile={userProfile}
              />
              <ExerciseModal
                exercise={activeExercise}
                onClose={() => setActiveExercise(null)}
                userProfile={userProfile}
              />
              <SupportRecommendationModal
                isOpen={isSupportRecOpen}
                onClose={(dismissDays = 7) => {
                  setIsSupportRecOpen(false);
                  setUserProfile(prev => ({
                    ...prev,
                    supportPromptDismissedUntil: Date.now() + 86400000 * dismissDays,
                  }));
                }}
                onSelectResources={() => {
                  setIsSupportRecOpen(false);
                  setActiveTab('exercises');
                }}
                onSelectCrisis={() => {
                  setIsSupportRecOpen(false);
                  setIsCrisisOpen(true);
                }}
                onSelectCounseling={() => {
                  setIsSupportRecOpen(false);
                  setActiveTab('counseling');
                }}
                userProfile={userProfile}
              />
              <WeeklyReflectionModal
                isOpen={isWeeklyRecOpen}
                onClose={() => setIsWeeklyRecOpen(false)}
                reflection={weeklyReflection}
                onSaveReflectionNote={handleSaveReflectionNote}
                userProfile={userProfile}
              />
              <BaselineModal
                isOpen={isBaselineOpen}
                onClose={() => setIsBaselineOpen(false)}
                baseline={userProfile.baseline}
                userProfile={userProfile}
              />
          </div>
        )
      } />
    </Routes>
  );
}
