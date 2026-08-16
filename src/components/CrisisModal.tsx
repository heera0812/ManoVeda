import React, { useState } from 'react';
import { HeartHandshake, Phone, MessageSquare, ShieldAlert, Sparkles, X, Check, Users, ArrowRight } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExercise?: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose, onOpenExercise }) => {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div
        id="crisis-safety-modal"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 p-6 text-white relative">
          <button
            id="close-crisis-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-rose-100 bg-white/10 px-2 py-0.5 rounded-full">
                Confidential & Immediate
              </span>
              <h2 className="text-xl font-bold font-outfit">Support & Crisis Resources</h2>
            </div>
          </div>
          <p className="text-sm text-rose-100 mt-1">
            If you are feeling overwhelmed, unsafe, or in distress, real human support is available 24/7. You don't have to carry this alone.
          </p>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800">
          {/* 1. Campus Wellness 24/7 */}
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/80 hover:bg-rose-50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">Campus 24/7 Urgent Wellness Line</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Free, confidential student crisis counselors</p>
                  <p className="text-sm font-bold text-rose-700 mt-1">1-800-273-TALK (Ext. 4 - Campus)</p>
                </div>
              </div>
              <button
                onClick={() => handleCopy('1-800-273-8255')}
                className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 flex items-center gap-1 shadow-sm transition-all"
              >
                {copiedNumber === '1-800-273-8255' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  'Call / Copy'
                )}
              </button>
            </div>
          </div>

          {/* 2. 988 Lifeline */}
          <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200/80 hover:bg-sky-50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">988 Suicide & Crisis Lifeline</h4>
                  <p className="text-xs text-slate-600 mt-0.5">National 24/7 call or text service</p>
                  <p className="text-sm font-bold text-sky-700 mt-1">Call or Text 988</p>
                </div>
              </div>
              <button
                onClick={() => handleCopy('988')}
                className="px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-xs font-semibold text-sky-700 hover:bg-sky-100 flex items-center gap-1 shadow-sm transition-all"
              >
                {copiedNumber === '988' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  'Call / Text 988'
                )}
              </button>
            </div>
          </div>

          {/* 3. Crisis Text Line */}
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 hover:bg-indigo-50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-base">Crisis Text Line</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Free 24/7 text support with trained crisis volunteer</p>
                  <p className="text-sm font-bold text-indigo-700 mt-1">Text HOME to 741741</p>
                </div>
              </div>
              <button
                onClick={() => handleCopy('741741')}
                className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 flex items-center gap-1 shadow-sm transition-all"
              >
                {copiedNumber === '741741' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  'Text HOME'
                )}
              </button>
            </div>
          </div>

          {/* Calming grounder shortcut */}
          {onOpenExercise && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Need a 2-minute breath right now?</h4>
                  <p className="text-xs text-slate-600">Gentle box breathing to calm the nervous system</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenExercise();
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition-all shrink-0"
              >
                Start Breath <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Trusted contact reminder */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p>
              Remember that reaching out to a roommate, trusted professor, residence hall advisor, or family member can also provide immediate grounding.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300 transition-colors"
          >
            I'm in a safe space now
          </button>
        </div>
      </div>
    </div>
  );
};
