import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    // Sequence the animation phases
    // Phase 0: Logo fades in (0-2s)
    const t1 = setTimeout(() => setPhase(1), 2000); 
    
    // Phase 1: Logo fades out (2-3s)
    const t2 = setTimeout(() => setPhase(2), 3000);
    
    // Phase 2: Green bg + "We Care" fades in (3-5s)
    const t3 = setTimeout(() => setPhase(3), 5000);
    
    // Phase 3: "We Care" fades out (5-6s)
    const t4 = setTimeout(() => {
      setPhase(4);
      // Wait for exit animation to complete before unmounting
      setTimeout(onComplete, 800);
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        
        {/* Phase 0 & 1: Logo on White Background */}
        {phase < 2 && (
          <motion.div
            key="logo-phase"
            className="absolute inset-0 bg-[#FAF8F5] flex items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 0 ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.img 
              src="/logo.png" 
              alt="ManoVeda Logo" 
              className="w-96 sm:w-[36rem] h-auto object-contain drop-shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: phase === 0 ? 1 : 0.95, opacity: phase === 0 ? 1 : 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {/* Phase 2 & 3: Green Background + "We Care" */}
        {phase >= 2 && phase < 4 && (
          <motion.div
            key="we-care-phase"
            className="absolute inset-0 bg-[#325343] flex items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 2 ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-black font-outfit text-white tracking-tight"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: phase === 2 ? 0 : -20, opacity: phase === 2 ? 1 : 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              We Care.
            </motion.h1>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
