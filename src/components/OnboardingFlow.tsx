import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  Check,
  HeartPulse,
  Lock,
  Moon,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { RobotMascot } from './ui/robot-mascot';
import { AgeRange, GenderOption, ThemeId, UserBaseline, UserProfile } from '../types';
import { getLocalDateKey } from '../utils/date';

interface OnboardingFlowProps {
  onComplete: (profile: UserProfile) => void;
  onQuickDemoLogin: () => void;
}

type TextQuestion = {
  kind: 'text';
  title: string;
  helper: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

type SingleChoiceQuestion = {
  kind: 'single';
  title: string;
  helper: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
};

type MultiChoiceQuestion = {
  kind: 'multi';
  title: string;
  helper: string;
  value: string[];
  options: string[];
  onToggle: (value: string) => void;
};

type Question = TextQuestion | SingleChoiceQuestion | MultiChoiceQuestion;

const ageOptions: AgeRange[] = ['16-18', '19-21', '22-24', '25+'];
const concernOptions = [
  'Studies',
  'Career/future',
  'Family',
  'Relationships',
  'Friendships',
  'Loneliness',
  'Money',
  'Self-confidence',
  'Sleep',
  'Other',
  'Not sure',
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onQuickDemoLogin,
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(0);

  const [name, setName] = useState<string>('');
  const [gender, setGender] = useState<GenderOption>('male');
  const [theme] = useState<ThemeId>('blue');
  const [ageRange, setAgeRange] = useState<AgeRange>('19-21');

  const [overallMood, setOverallMood] = useState<string>('Good');
  const [stress, setStress] = useState<string>('Moderate');
  const [sleep, setSleep] = useState<string>('Okay');
  const [energy, setEnergy] = useState<string>('Moderate');
  const [socialConnection, setSocialConnection] = useState<string>('Somewhat connected');
  const [academicPressure, setAcademicPressure] = useState<string>('Moderate');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selfWorth, setSelfWorth] = useState<string>('Okay');
  const [supportNetwork, setSupportNetwork] = useState<string>('Sometimes');
  const [dailyFunctioning, setDailyFunctioning] = useState<string>('Some days');

  const displayName = name.trim() || 'friend';

  const toggleConcern = (item: string) => {
    setSelectedConcerns(prev =>
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  };

  const buildBaseline = (): UserBaseline => ({
    overallMood,
    stress,
    sleep,
    energy,
    socialConnection,
    academicPressure,
    mainConcerns: selectedConcerns.length ? selectedConcerns : ['General wellbeing'],
    selfWorth,
    supportNetwork,
    dailyFunctioning,
    previousExperience: 'Not asked',
    createdAt: getLocalDateKey(),
  });

  const handleFinishOnboarding = () => {
    const finalProfile: UserProfile = {
      name: name.trim() || 'Guest',
      gender,
      theme,
      ageRange,
      completedOnboarding: true,
      baseline: buildBaseline(),
      notificationFrequency: 'few_times_week',
      quietHoursEnabled: true,
      quietHoursStart: '23:00',
      quietHoursEnd: '08:00',
      privacy: {
        shareMoodByDefault: false,
        anonymousCampusAnalytics: true,
        encryptedLocalOnly: true,
      },
    };

    onComplete(finalProfile);
  };

  const questions: Question[] = [
    {
      kind: 'text',
      title: 'What should we call you?',
      helper: 'Use your first name or a nickname, not your full legal name.',
      value: name,
      placeholder: 'First name or nickname',
      onChange: setName,
    },
    {
      kind: 'single',
      title: 'How old are you?',
      helper: 'A simple range is enough.',
      value: ageRange,
      options: ageOptions,
      onSelect: value => setAgeRange(value as AgeRange),
    },
    {
      kind: 'single',
      title: 'How have you generally been feeling the past couple of weeks?',
      helper: 'Choose the answer that feels closest.',
      value: overallMood,
      options: ['Very good', 'Good', 'Okay', 'Low'],
      onSelect: setOverallMood,
    },
    {
      kind: 'single',
      title: 'How stressed have you been recently?',
      helper: 'No need to overthink it.',
      value: stress,
      options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
      onSelect: setStress,
    },
    {
      kind: 'single',
      title: 'How has your sleep been lately?',
      helper: 'Think about both quality and consistency.',
      value: sleep,
      options: ['Poor', 'Okay', 'Good', 'Very good'],
      onSelect: setSleep,
    },
    {
      kind: 'single',
      title: 'How has your energy felt recently?',
      helper: 'Physical energy, mental energy, or both.',
      value: energy,
      options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
      onSelect: setEnergy,
    },
    {
      kind: 'single',
      title: 'How connected do you feel to the people around you right now?',
      helper: 'Friends, family, classmates, coworkers, or anyone you trust.',
      value: socialConnection,
      options: ['Very disconnected', 'Disconnected', 'Somewhat connected', 'Connected', 'Very connected'],
      onSelect: setSocialConnection,
    },
    {
      kind: 'single',
      title: 'How much pressure are you feeling from school or work right now?',
      helper: 'Pressure can be visible or quiet.',
      value: academicPressure,
      options: ['Very low', 'Low', 'Moderate', 'High', 'Very high'],
      onSelect: setAcademicPressure,
    },
    {
      kind: 'multi',
      title: "What's been weighing on you most lately?",
      helper: 'Select anything that fits. You can choose more than one.',
      value: selectedConcerns,
      options: concernOptions,
      onToggle: toggleConcern,
    },
    {
      kind: 'single',
      title: 'Lately, how do you generally feel about yourself?',
      helper: 'This helps ManoVeda understand how kindly your inner voice has been treating you.',
      value: selfWorth,
      options: ['Very good', 'Good', 'Okay', 'Struggling'],
      onSelect: setSelfWorth,
    },
    {
      kind: 'single',
      title: 'Do you have someone you can talk to when things feel hard?',
      helper: 'A person, a group, or even one reliable contact counts.',
      value: supportNetwork,
      options: ['Yes, definitely', 'Sometimes', 'Not really', "I'm not sure"],
      onSelect: setSupportNetwork,
    },
    {
      kind: 'single',
      title: 'Lately, has it felt hard to keep up with daily things like classes, meals, or getting out of bed?',
      helper: 'This is about everyday load, not judgment.',
      value: dailyFunctioning,
      options: ['Not at all', 'Rarely', 'Some days', 'Most days'],
      onSelect: setDailyFunctioning,
    },
  ];

  const currentQuestion = questions[step - 1];
  const isReviewStep = step === questions.length + 1;
  const progress = Math.min(step, questions.length);
  const canContinue = currentQuestion?.kind !== 'multi' || currentQuestion.value.length > 0;

  const reflection = useMemo(() => {
    const isHighStress = ['High', 'Very high'].includes(stress);
    const isLowMood = overallMood === 'Low';
    const sleepNeedsCare = ['Poor', 'Okay'].includes(sleep);
    const pressureHigh = ['High', 'Very high'].includes(academicPressure);
    const supportFeelsThin = ['Not really', "I'm not sure"].includes(supportNetwork);
    const functioningHard = ['Some days', 'Most days'].includes(dailyFunctioning);

    const headline =
      isLowMood || (isHighStress && functioningHard)
        ? 'You may be carrying more than you are letting yourself admit.'
        : isHighStress || pressureHigh
          ? 'Your mind seems alert, responsible, and a little overloaded.'
          : 'Your baseline looks steady, with a few places worth protecting.';

    const body =
      isLowMood || functioningHard
        ? `From what you shared, ${displayName}, your system may be asking for gentleness and structure. This does not define you, and it is not a diagnosis. It simply suggests that daily life has been taking real energy lately.`
        : isHighStress || pressureHigh
          ? `From what you shared, ${displayName}, you seem to be pushing through a season with meaningful pressure. You may be functioning, but your body and mind still deserve recovery before everything feels urgent.`
          : `From what you shared, ${displayName}, there is a thoughtful steadiness in your current baseline. ManoVeda can help you notice the small shifts early, before they become loud.`;

    const focus = [
      pressureHigh ? 'school or work pressure' : null,
      sleepNeedsCare ? 'sleep and restoration' : null,
      supportFeelsThin ? 'support and connection' : null,
      selfWorth === 'Struggling' ? 'self-confidence' : null,
      selectedConcerns[0] ? selectedConcerns.slice(0, 2).join(' and ') : null,
    ].filter(Boolean);

    return {
      headline,
      body,
      tone:
        isLowMood || functioningHard
          ? 'Needs gentleness'
          : isHighStress || pressureHigh
            ? 'Under pressure'
            : 'Mostly steady',
      focus:
        focus.length > 0
          ? focus.join(', ')
          : 'your mood, energy, and daily rhythm',
      nextStep:
        supportFeelsThin
          ? 'Start by noticing one person, place, or routine that feels even slightly safe.'
          : sleepNeedsCare
            ? 'Your first useful signal may come from sleep, rest, and how your mornings feel.'
            : pressureHigh
              ? 'Watch how pressure shows up in your body before it becomes a crisis.'
              : 'Keep tracking the small changes. That is where self-knowledge gets honest.',
    };
  }, [
    academicPressure,
    dailyFunctioning,
    displayName,
    overallMood,
    selectedConcerns,
    selfWorth,
    sleep,
    stress,
    supportNetwork,
  ]);

  const goBack = () => setStep(prev => Math.max(0, prev - 1));
  const goNext = () => setStep(prev => Math.min(questions.length + 1, prev + 1));

  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#2A312B] p-4 sm:p-8 font-sans flex items-center justify-center relative overflow-hidden">
        <RobotMascot />
        <div className="w-full max-w-6xl h-full min-h-[80vh] relative z-10 pt-32 sm:pt-0 flex flex-col">
          <div className="text-center mb-5 sm:mb-7">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Choose Your Gender
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            <button
              onClick={() => {
                setGender('male');
                setStep(1);
              }}
              className="relative rounded-3xl overflow-hidden group transition-transform hover:scale-[1.01] hover:shadow-2xl flex flex-col text-left min-h-[320px]"
              style={{ backgroundColor: '#6B8B77' }}
            >
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 transition-opacity group-hover:opacity-100" style={{ backgroundImage: "url('/male_illustration.png')" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 p-8 sm:p-12 text-white">
                <h2 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Male</h2>
                <div className="flex items-center gap-2 text-lg font-medium opacity-90">
                  <span>For myself</span>
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setGender('female');
                setStep(1);
              }}
              className="relative rounded-3xl overflow-hidden group transition-transform hover:scale-[1.01] hover:shadow-2xl flex flex-col text-left min-h-[320px]"
              style={{ backgroundColor: '#D49A8F' }}
            >
              <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90 transition-opacity group-hover:opacity-100" style={{ backgroundImage: "url('/female_illustration.png')" }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 p-8 sm:p-12 text-white">
                <h2 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">Female</h2>
                <div className="flex items-center gap-2 text-lg font-medium opacity-90">
                  <span>For myself</span>
                  <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="absolute top-6 right-8 z-20">
          <button
            onClick={onQuickDemoLogin}
            className="px-6 py-2.5 rounded-full bg-black/20 text-white font-bold backdrop-blur-md hover:bg-black/30 transition-colors border border-white/10"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 sm:p-8 font-sans text-[#282828]">
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#EAEAEA] flex items-center justify-between px-6 py-4 z-50">
        <img src="/logo.png" alt="ManoVeda Logo" className="h-20 w-auto object-contain" />
        <div className="flex items-center gap-4">
          {!isReviewStep && (
            <div className="text-xs font-semibold text-[#666666]">
              {progress} / {questions.length}
            </div>
          )}
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-full bg-[#325343] text-white text-sm font-bold hover:bg-[#264033] transition-colors"
          >
            Log In
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl mt-32">
        {!isReviewStep && currentQuestion && (
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-6 sm:p-10 shadow-sm">
            <div className="mb-8">
              <div className="h-1.5 rounded-full bg-[#EAEAEA] overflow-hidden mb-6">
                <div
                  className="h-full bg-[#325343] transition-all duration-300"
                  style={{ width: `${(progress / questions.length) * 100}%` }}
                />
              </div>
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-[#325343] font-semibold hover:underline"
              >
                <ChevronLeft className="w-5 h-5" /> Back
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                  {currentQuestion.title}
                </h2>
                <p className="text-[#666666] text-sm sm:text-base">
                  {currentQuestion.helper}
                </p>
              </div>

              {currentQuestion.kind === 'text' && (
                <input
                  type="text"
                  value={currentQuestion.value}
                  onChange={e => currentQuestion.onChange(e.target.value)}
                  placeholder={currentQuestion.placeholder}
                  className="w-full p-4 text-lg border border-[#EAEAEA] rounded-xl focus:border-[#325343] focus:outline-none focus:ring-1 focus:ring-[#325343]"
                  autoFocus
                />
              )}

              {currentQuestion.kind === 'single' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentQuestion.options.map(option => {
                    const isSelected = currentQuestion.value === option;

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => currentQuestion.onSelect(option)}
                        className={`p-4 rounded-xl border text-left text-base font-semibold transition-colors ${
                          isSelected
                            ? 'border-[#325343] bg-[#F0F4F2] text-[#325343]'
                            : 'border-[#EAEAEA] bg-white text-[#282828] hover:border-[#325343]'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.kind === 'multi' && (
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options.map(option => {
                    const isSelected = currentQuestion.value.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => currentQuestion.onToggle(option)}
                        className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors ${
                          isSelected
                            ? 'border-[#325343] bg-[#F0F4F2] text-[#325343]'
                            : 'border-[#EAEAEA] bg-white text-[#282828] hover:border-[#325343]'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={goNext}
              disabled={!canContinue}
              className="mt-10 w-full py-4 px-6 rounded-full bg-[#325343] disabled:bg-[#AAB8AF] text-white text-lg font-bold flex items-center justify-center gap-2 hover:bg-[#264033] transition-colors"
            >
              <span>{step === questions.length ? 'See My Reflection' : 'Continue'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {isReviewStep && (
          <div className="bg-white border border-[#EAEAEA] rounded-2xl p-7 sm:p-10 shadow-sm">
            <div className="w-14 h-14 bg-[#F0F4F2] rounded-full flex items-center justify-center mb-6">
              <Check className="w-7 h-7 text-[#325343]" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#325343] mb-3">
              Your ManoVeda reflection
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {reflection.headline}
            </h2>
            <p className="text-[#555] text-base sm:text-lg leading-relaxed mb-6">
              {reflection.body}
            </p>

            <div className="bg-[#FAF8F5] border border-[#EAEAEA] rounded-2xl p-5 sm:p-6 space-y-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                  What ManoVeda will watch gently
                </span>
                <p className="text-[#282828] font-semibold mt-1">
                  {reflection.focus}.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white border border-[#EAEAEA] p-3">
                  <span className="text-[#666666] block">Mood</span>
                  <span className="font-bold">{overallMood}</span>
                </div>
                <div className="rounded-xl bg-white border border-[#EAEAEA] p-3">
                  <span className="text-[#666666] block">Stress</span>
                  <span className="font-bold">{stress}</span>
                </div>
                <div className="rounded-xl bg-white border border-[#EAEAEA] p-3">
                  <span className="text-[#666666] block">Support</span>
                  <span className="font-bold">{supportNetwork}</span>
                </div>
              </div>
            </div>

            <button
              id="enter-manoveda-btn"
              onClick={handleFinishOnboarding}
              className="w-full py-4 px-6 rounded-full bg-[#325343] text-white text-base sm:text-lg font-bold flex items-center justify-center gap-2 hover:bg-[#264033] transition-colors"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 flex items-start gap-2 text-xs text-[#666666]">
              <Lock className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                This is a private self-reflection, not a diagnosis or medical advice. Your check-ins stay in your local wellness space.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
