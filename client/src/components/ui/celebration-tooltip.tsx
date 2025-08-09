/**
 * Micro-Interaction Success Celebration Tooltips
 * Provides delightful feedback for successful actions across the platform
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles, TrendingUp, Zap, Star, Trophy } from 'lucide-react';

export interface CelebrationTooltipProps {
  isVisible: boolean;
  message: string;
  type?: 'success' | 'profit' | 'achievement' | 'activation' | 'milestone' | 'divine';
  position?: 'top' | 'bottom' | 'left' | 'right';
  duration?: number;
  onComplete?: () => void;
  children?: React.ReactNode;
}

const celebrationIcons = {
  success: CheckCircle,
  profit: TrendingUp,
  achievement: Trophy,
  activation: Zap,
  milestone: Star,
  divine: Sparkles
};

const celebrationColors = {
  success: 'from-green-400 to-emerald-500',
  profit: 'from-yellow-400 to-orange-500',
  achievement: 'from-purple-400 to-pink-500',
  activation: 'from-blue-400 to-cyan-500',
  milestone: 'from-indigo-400 to-purple-500',
  divine: 'from-pink-400 via-purple-500 to-indigo-600'
};

const particleVariants = {
  initial: { 
    opacity: 0, 
    scale: 0, 
    x: 0, 
    y: 0,
    rotate: 0
  },
  animate: (i: number) => ({
    opacity: [0, 1, 1, 0],
    scale: [0, 1.2, 0.8, 0],
    x: Math.cos(i * 60 * Math.PI / 180) * (50 + Math.random() * 30),
    y: Math.sin(i * 60 * Math.PI / 180) * (50 + Math.random() * 30),
    rotate: 360 + Math.random() * 180,
    transition: {
      duration: 1.5,
      ease: "easeOut",
      delay: i * 0.1
    }
  })
};

const tooltipVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.8, 
    y: 10,
    filter: "blur(4px)"
  },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      duration: 0.4
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: -10,
    filter: "blur(2px)",
    transition: {
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

const pulseVariants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export function CelebrationTooltip({
  isVisible,
  message,
  type = 'success',
  position = 'top',
  duration = 3000,
  onComplete,
  children
}: CelebrationTooltipProps) {
  const [showParticles, setShowParticles] = useState(false);
  const Icon = celebrationIcons[type];

  useEffect(() => {
    if (isVisible) {
      setShowParticles(true);
      const timer = setTimeout(() => {
        setShowParticles(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  const getTooltipPosition = () => {
    switch (position) {
      case 'bottom':
        return 'top-full mt-2';
      case 'left':
        return 'right-full mr-2 top-1/2 -translate-y-1/2';
      case 'right':
        return 'left-full ml-2 top-1/2 -translate-y-1/2';
      default:
        return 'bottom-full mb-2';
    }
  };

  return (
    <div className="relative inline-block">
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            variants={tooltipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`absolute z-50 ${getTooltipPosition()}`}
          >
            {/* Main Tooltip */}
            <div className={`
              relative px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm
              bg-gradient-to-r ${celebrationColors[type]}
              border border-white/20 text-white font-medium text-sm
              max-w-xs text-center
            `}>
              {/* Glow Effect */}
              <motion.div
                variants={pulseVariants}
                animate="animate"
                className={`
                  absolute inset-0 rounded-xl blur-md opacity-50
                  bg-gradient-to-r ${celebrationColors[type]}
                `}
              />
              
              {/* Content */}
              <div className="relative flex items-center justify-center gap-2">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{message}</span>
              </div>
              
              {/* Arrow */}
              <div className={`
                absolute w-2 h-2 bg-gradient-to-r ${celebrationColors[type]}
                transform rotate-45 border-r border-b border-white/20
                ${position === 'top' ? 'top-full -mt-1 left-1/2 -ml-1' : ''}
                ${position === 'bottom' ? 'bottom-full -mb-1 left-1/2 -ml-1' : ''}
                ${position === 'left' ? 'left-full -ml-1 top-1/2 -mt-1' : ''}
                ${position === 'right' ? 'right-full -mr-1 top-1/2 -mt-1' : ''}
              `} />
            </div>

            {/* Celebration Particles */}
            <AnimatePresence>
              {showParticles && (
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      variants={particleVariants}
                      initial="initial"
                      animate="animate"
                      custom={i}
                      className="absolute top-1/2 left-1/2"
                    >
                      <Sparkles className={`w-3 h-3 text-yellow-300`} />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing celebration state
export function useCelebrationTooltip() {
  const [celebrations, setCelebrations] = useState<{
    [key: string]: {
      isVisible: boolean;
      message: string;
      type: CelebrationTooltipProps['type'];
    }
  }>({});

  const triggerCelebration = (
    id: string, 
    message: string, 
    type: CelebrationTooltipProps['type'] = 'success',
    duration = 3000
  ) => {
    setCelebrations(prev => ({
      ...prev,
      [id]: { isVisible: true, message, type }
    }));

    setTimeout(() => {
      setCelebrations(prev => ({
        ...prev,
        [id]: { ...prev[id], isVisible: false }
      }));
    }, duration);
  };

  const clearCelebration = (id: string) => {
    setCelebrations(prev => {
      const newCelebrations = { ...prev };
      delete newCelebrations[id];
      return newCelebrations;
    });
  };

  return {
    celebrations,
    triggerCelebration,
    clearCelebration
  };
}

// Pre-built celebration messages
export const celebrationMessages = {
  botActivated: (botName: string) => `${botName} activated successfully!`,
  botStopped: (botName: string) => `${botName} stopped safely`,
  tradeExecuted: (profit: number) => `Trade executed! ${profit > 0 ? `+$${profit.toFixed(2)} profit` : 'Position opened'}`,
  profitAchieved: (amount: number) => `Profit milestone! +$${amount.toFixed(2)}`,
  winStreak: (count: number) => `${count} win streak! 🔥`,
  levelUp: (level: string) => `Level up! Now ${level}`,
  goalReached: (goal: string) => `Goal achieved: ${goal}`,
  divineSignal: 'Divine signal detected ✨',
  riskMitigated: 'Risk successfully mitigated',
  portfolioOptimized: 'Portfolio optimized!',
  emergencyStop: 'Emergency stop activated - funds protected',
  smartExecution: 'Smart execution completed',
  dataRefreshed: 'Real-time data refreshed',
  systemHealed: 'System auto-healed successfully'
};