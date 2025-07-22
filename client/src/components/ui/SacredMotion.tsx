import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

// Sacred Motion Components for Waides KI UI/UX Transformation

export const SacredPageTransition = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className={`${className}`}
    >
      {children}
    </motion.div>
  );
};

export const SacredHover = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)",
        filter: "brightness(1.1)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const SacredBreath = ({ children, intensity = 1, className = "" }: { 
  children: ReactNode, 
  intensity?: number,
  className?: string 
}) => {
  return (
    <motion.div
      animate={{
        scale: [1, 1 + (0.02 * intensity), 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FloatingElement = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
        rotate: [0, 1, 0, -1, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SacredGlow = ({ children, color = "purple", className = "" }: { 
  children: ReactNode, 
  color?: "purple" | "cyan" | "gold" | "green",
  className?: string 
}) => {
  const glowColors = {
    purple: "drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]",
    cyan: "drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]",
    gold: "drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]",
    green: "drop-shadow-[0_0_20px_rgba(34,197,94,0.6)]"
  };

  return (
    <motion.div
      animate={{
        filter: [
          glowColors[color],
          `${glowColors[color]} brightness(1.2)`,
          glowColors[color]
        ]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const SacredSparkle = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      className={`relative ${className}`}
      whileHover="hover"
    >
      {children}
      <motion.div
        className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
        variants={{
          hover: {
            scale: [1, 1.5, 1],
            opacity: [0.7, 1, 0.7],
            rotate: [0, 180, 360]
          }
        }}
        transition={{ duration: 0.6 }}
      />
    </motion.div>
  );
};

export const CosmicBackground = ({ children, className = "" }: { children: ReactNode, className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Animated cosmic particles */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r ${
              i % 4 === 0 ? 'from-purple-400 to-pink-400' :
              i % 4 === 1 ? 'from-cyan-400 to-blue-400' :
              i % 4 === 2 ? 'from-yellow-400 to-orange-400' :
              'from-green-400 to-emerald-400'
            } rounded-full`}
            style={{
              left: `${(i * 8.33) % 100}%`,
              top: `${(i * 7.14) % 100}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + (i * 0.5),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Flowing energy lines */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
          animate={{
            x: ['100%', '-100%']
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {children}
    </div>
  );
};

export const SacredLoadingRitual = ({ text = "Connecting to the Sacred..." }: { text?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-16 h-16 border-2 border-purple-500/30 rounded-full" />
        <motion.div
          className="absolute top-0 left-0 w-16 h-16 border-2 border-transparent border-t-cyan-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-2 left-2 w-12 h-12 border-2 border-transparent border-t-purple-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Sacred center symbol */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      
      <motion.p
        className="mt-4 text-sm text-purple-300 font-medium"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
};