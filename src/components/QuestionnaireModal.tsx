import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, ArrowRight, BrainCircuit, Activity, ChevronRight, ArrowLeft } from 'lucide-react';
import { UserProfile, WellnessCheckin } from '../types';
import { campusWellnessCheckins } from '../data/wellnessCheckins';

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const SCORE_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: 'Sometimes', value: 1 },
  { label: 'Often', value: 2 },
  { label: 'Almost always', value: 3 },
];

export const QuestionnaireModal: React.FC<QuestionnaireModalProps> = ({
  isOpen,
  onClose,
  userProfile
}) => {
  const [activeCheckin, setActiveCheckin] = useState<WellnessCheckin | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; percentage: number; label: string; type: 'concern' | 'positive' } | null>(null);
  
  // Reflection Tracker State
  const [reflectionMood, setReflectionMood] = useState<string | null>(null);
  const [reflectionNote, setReflectionNote] = useState<string>('');

  if (!isOpen) return null;

  const handleReset = () => {
    setActiveCheckin(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    setReflectionMood(null);
    setReflectionNote('');
  };

  const handleFullClose = () => {
    handleReset();
    onClose();
  };

  const handleAnswer = (value: number) => {
    if (!activeCheckin) return;
    
    const isReverse = activeCheckin.questions[currentQuestionIndex].reverseScore;
    const finalValue = isReverse ? 3 - value : value;
    
    const newAnswers = [...answers, finalValue];
    setAnswers(newAnswers);

    if (currentQuestionIndex < activeCheckin.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate results
      const totalScore = newAnswers.reduce((a, b) => a + b, 0);
      const maxScore = activeCheckin.questions.length * 3;
      const percentage = Math.round((totalScore / maxScore) * 100);
      
      let categoryIndex = 0;
      if (percentage >= 75) categoryIndex = 3;
      else if (percentage >= 50) categoryIndex = 2;
      else if (percentage >= 25) categoryIndex = 1;
      
      setResult({
        score: totalScore,
        percentage,
        label: activeCheckin.interpretation.labels[categoryIndex],
        type: activeCheckin.interpretation.type
      });
    }
  };

  const getRecommendation = () => {
    if (!result || !activeCheckin) return null;
    
    const isHighConcern = result.type === 'concern' && result.percentage >= 75;
    const isLowPositive = result.type === 'positive' && result.percentage <= 24;
    
    if (!isHighConcern && !isLowPositive) {
      return "Consider reflecting on these results as part of your overall wellness journey. Keep up the good practices you already have in place.";
    }

    switch (activeCheckin.id) {
      case 'academic_pressure':
        return "Consider taking a short break, reviewing your workload, speaking with an academic advisor, or talking with a campus counselor.";
      case 'connection':
      case 'relationships':
        return "Consider connecting with a student club, trusted friend, mentor, or campus support service.";
      case 'sleep':
        return "Consider reviewing your sleep routine. If difficulties persist or significantly affect your daily life, consider speaking with a healthcare professional.";
      case 'stress':
      case 'burnout':
      case 'anger_control':
        return "Try a short Calm Challenge or speak with a counselor if this is becoming difficult to manage.";
      default:
        return "Consider reaching out to campus support services or a counselor for additional guidance.";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={handleFullClose} />
      
      <div className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-3xl shadow-2xl overflow-hidden animate-fadeIn flex flex-col" style={{ maxHeight: '85vh' }}>
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-center p-6 border-b border-[#EAEAEA] bg-white relative z-10">
          <div className="flex items-center gap-3 text-[#325343]">
            {activeCheckin ? (
              <button onClick={handleReset} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="bg-[#325343]/10 p-2 rounded-xl">
                <BrainCircuit className="h-6 w-6" />
              </div>
            )}
            <h2 className="text-xl font-bold font-outfit text-slate-900">
              {activeCheckin ? activeCheckin.title : 'Campus Wellness Check-In'}
            </h2>
          </div>
          <button onClick={handleFullClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-slate-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 md:pb-12 overflow-y-auto flex-1 min-h-0">
          {!activeCheckin ? (
            // Selection View
            <div className="space-y-6 pb-6">
              <div className="mb-6">
                <p className="text-slate-600 font-medium">Take a few minutes to reflect on different areas of your student life.</p>
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800 leading-relaxed">
                  <strong>Important:</strong> These are original self-reflection tools designed for early awareness. They are <strong>not</strong> standardized clinical instruments and must not be used as clinical diagnoses.
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campusWellnessCheckins.map(checkin => (
                  <button
                    key={checkin.id}
                    onClick={() => setActiveCheckin(checkin)}
                    className="flex flex-col text-left p-6 rounded-[1.5rem] bg-white border-2 border-[#EAEAEA] hover:border-[#325343] hover:shadow-[0_12px_40px_-12px_rgba(50,83,67,0.15)] hover:-translate-y-1 transition-all duration-300 ease-out group relative overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-[#325343]/20"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#325343]/[0.03] rounded-bl-full -mr-12 -mt-12 transition-transform duration-500 ease-out group-hover:scale-110" />
                    <div className="flex items-center justify-between w-full mb-3 relative z-10">
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#325343] transition-colors">{checkin.title}</h3>
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-[#325343]/10 transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#325343]" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 relative z-10">{checkin.subtitle}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : !result ? (
            // Question View
            <div className="space-y-8 max-w-xl mx-auto">
              <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                <span>Question {currentQuestionIndex + 1} of {activeCheckin.questions.length}</span>
                <span>{Math.round((currentQuestionIndex / activeCheckin.questions.length) * 100)}%</span>
              </div>
              
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#325343] transition-all duration-300"
                  style={{ width: `${(currentQuestionIndex / activeCheckin.questions.length) * 100}%` }}
                />
              </div>

              <div className="py-8">
                <h3 className="text-3xl font-bold font-outfit text-slate-800 leading-tight">
                  {activeCheckin.questions[currentQuestionIndex].text}
                </h3>
              </div>

              <div className="space-y-4">
                {SCORE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    className="w-full text-left p-5 rounded-2xl bg-white border-2 border-[#EAEAEA] hover:border-[#325343] hover:bg-[#FAF8F5] hover:shadow-sm transition-all duration-200 group flex justify-between items-center outline-none focus-visible:ring-4 focus-visible:ring-[#325343]/20"
                  >
                    <span className="font-semibold text-slate-700 text-lg group-hover:text-[#325343] transition-colors">{opt.label}</span>
                    <div className="h-6 w-6 rounded-full border-2 border-slate-300 group-hover:border-[#325343] transition-colors flex items-center justify-center bg-white">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#325343] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Results View
            <div className="text-center py-4 space-y-6 animate-fadeIn max-w-xl mx-auto">
              <div className="mx-auto w-20 h-20 bg-[#325343]/10 rounded-full flex items-center justify-center mb-4">
                <Activity className="h-10 w-10 text-[#325343]" />
              </div>
              
              <div>
                <h3 className="text-3xl font-bold text-slate-900 font-outfit mb-2">Your Check-In Result</h3>
                <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-slate-600 font-medium text-sm mb-6">
                  {result.score} / 24 ({result.percentage}%)
                </div>
              </div>

              <div className={`p-6 rounded-3xl ${result.type === 'concern' ? (result.percentage >= 75 ? 'bg-rose-50 text-rose-900 border border-rose-200' : 'bg-slate-50 text-slate-800 border border-slate-200') : (result.percentage <= 24 ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-green-50 text-green-900 border border-green-200')}`}>
                <div className="text-xl font-bold mb-2">{result.label}</div>
                <p className="text-sm opacity-90 leading-relaxed">
                  Your responses suggest that this area may deserve {
                    result.type === 'concern' 
                      ? (result.percentage >= 75 ? 'more' : result.percentage >= 50 ? 'some' : 'little')
                      : (result.percentage <= 24 ? 'more' : result.percentage <= 49 ? 'some' : 'little')
                  } attention.
                </p>
              </div>
              
              <div className="text-left bg-white p-6 rounded-2xl border border-[#EAEAEA]">
                <h4 className="font-bold text-slate-800 mb-2">Recommended Next Step</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {getRecommendation()}
                </p>
              </div>

              {/* Reflection Tracker */}
              <div className="text-left bg-white p-6 rounded-2xl border border-[#EAEAEA]">
                <h4 className="font-bold text-slate-800 mb-4">How do you feel about this result?</h4>
                <div className="flex justify-between gap-2 mb-6">
                  {['Very Low', 'Low', 'Okay', 'Good', 'Great'].map((m, i) => (
                    <button
                      key={m}
                      onClick={() => setReflectionMood(m)}
                      className={`flex-1 py-3 px-1 sm:px-2 rounded-xl border text-center text-sm font-semibold transition-all ${
                        reflectionMood === m 
                          ? 'border-[#325343] bg-[#325343]/10 text-[#325343] shadow-inner' 
                          : 'border-[#EAEAEA] hover:border-[#325343] text-slate-600 hover:bg-[#FAF8F5]'
                      }`}
                    >
                       <div className="text-2xl sm:text-xl mb-1">{['😞', '🙁', '😐', '🙂', '😊'][i]}</div>
                       <span className="hidden sm:block text-xs">{m}</span>
                    </button>
                  ))}
                </div>
                <h4 className="font-bold text-slate-800 mb-2">Assessment Notes</h4>
                <textarea 
                  value={reflectionNote}
                  onChange={(e) => setReflectionNote(e.target.value)}
                  placeholder="Keep any necessary details or thoughts about this assessment here..."
                  className="w-full bg-[#FAF8F5] border border-[#EAEAEA] rounded-xl p-4 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#325343]/20 focus:border-[#325343] min-h-[100px] resize-none transition-shadow"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-white border border-[#EAEAEA] text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Take Another Check-In
                </button>
                <button
                  onClick={handleFullClose}
                  className="px-6 py-3 bg-[#325343] text-white font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Return to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
