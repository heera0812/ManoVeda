import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Map, ChevronRight, Loader2, MessagesSquare, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalChatModal } from './GlobalChatModal';
import { AriaChatModal } from './AriaChatModal';

// Lazy-load the 3D canvas to avoid blocking the page
const RobotSceneLazy = React.lazy(() => 
  import('./ui/robot-mascot').then(mod => ({ default: mod.RobotScene || (() => null) }))
);

interface DashboardRobotProps {
  onStartTour: () => void;
}

export const DashboardRobot: React.FC<DashboardRobotProps> = ({ onStartTour }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChatSoon, setShowChatSoon] = useState(false);
  const [globalChatOpen, setGlobalChatOpen] = useState(false);
  const [ariaChatOpen, setAriaChatOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setShowChatSoon(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return createPortal(
    <div ref={wrapperRef} className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      
      {/* Popover Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden w-64"
          >
            {showChatSoon ? (
              <div className="p-5 text-center">
                <div className="text-3xl mb-2">🤖</div>
                <h4 className="font-bold text-[#325343] text-sm mb-1">AI Chat Coming Soon!</h4>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">I'm currently training my brain to have meaningful conversations with you.</p>
                <button 
                  onClick={() => setShowChatSoon(false)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Got it!
                </button>
              </div>
            ) : (
              <>
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">How can I help?</p>
                </div>
                <div className="px-2 pb-2 space-y-1">
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      onStartTour();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 hover:bg-[#325343]/5 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#325343]/10 flex items-center justify-center shrink-0 group-hover:bg-[#325343]/20 transition-colors">
                      <Map className="w-4 h-4 text-[#325343]" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Guide me through</span>
                      <span className="text-[10px] text-slate-400">Learn what each section does</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                  </button>
                  
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      setAriaChatOpen(true);
                    }}
                    className="flex items-center gap-3 w-full px-3 py-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#325343]/10 flex items-center justify-center shrink-0 group-hover:bg-[#325343]/20 transition-colors">
                      <MessageCircle className="w-4 h-4 text-[#325343]" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-slate-800 block">Chat with Aria</span>
                      <span className="text-[10px] text-slate-400">Wellness check-in & support</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Robot - Uses the actual 3D Robot model */}
      <button 
        onClick={() => {
          setMenuOpen(!menuOpen);
          setShowChatSoon(false);
        }}
        className="group relative w-20 h-20 rounded-full overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-[#FAF8F5] to-white border-2 border-[#325343]/20"
      >
        {/* Subtle pulse ring behind */}
        <div className="absolute inset-0 rounded-full bg-[#325343]/10 animate-ping opacity-30 pointer-events-none" />
        
        {/* 3D Robot Scene */}
        <div className="absolute inset-[-20px] pointer-events-none">
          <React.Suspense fallback={
            <div className="w-full h-full flex flex-col items-center justify-center pt-10">
              <Loader2 className="w-6 h-6 text-[#325343]/40 animate-spin absolute" />
            </div>
          }>
            <RobotSceneLazy />
          </React.Suspense>
        </div>
      </button>

      {/* Global Chat Icon */}
      <button
        onClick={() => setGlobalChatOpen(!globalChatOpen)}
        className={`group relative w-12 h-12 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center ${
          globalChatOpen
            ? 'bg-[#325343] border-2 border-[#325343]'
            : 'bg-white border-2 border-[#325343]/20 hover:border-[#325343]/40'
        }`}
      >
        <MessagesSquare className={`w-5 h-5 transition-colors ${globalChatOpen ? 'text-white' : 'text-[#325343]'}`} />
        {/* Notification dot */}
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
      </button>

      {/* Mind Scan Icon */}
      <a
        href="https://manoveda-mind-scan.base44.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-12 h-12 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 border-2 border-violet-400/30"
        title="Mind Scan — Check your mood via face scan"
      >
        <ScanFace className="w-5 h-5 text-white" />
        {/* Subtle pulse */}
        <span className="absolute inset-0 rounded-full bg-violet-400/30 animate-ping pointer-events-none" />
      </a>

      {/* Global Chat Modal */}
      <GlobalChatModal
        isOpen={globalChatOpen}
        onClose={() => setGlobalChatOpen(false)}
      />

      {/* Aria AI Chat Modal */}
      <AriaChatModal
        isOpen={ariaChatOpen}
        onClose={() => setAriaChatOpen(false)}
      />
    </div>,
    document.body
  );
};
