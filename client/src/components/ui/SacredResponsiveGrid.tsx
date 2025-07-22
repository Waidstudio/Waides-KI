import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SacredGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

export const SacredGrid = ({ 
  children, 
  columns = 7, 
  gap = 'md',
  className = "",
  animated = false 
}: SacredGridProps) => {
  const getGapClass = () => {
    switch (gap) {
      case 'sm': return 'gap-2';
      case 'md': return 'gap-4';
      case 'lg': return 'gap-6';
      case 'xl': return 'gap-8';
      default: return 'gap-4';
    }
  };

  const getColumnsClass = () => {
    return `grid-cols-1 sm:grid-cols-${Math.min(columns, 2)} md:grid-cols-${Math.min(columns, 3)} lg:grid-cols-${Math.min(columns, 4)} xl:grid-cols-${columns}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  if (animated) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`grid ${getColumnsClass()} ${getGapClass()} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`grid ${getColumnsClass()} ${getGapClass()} ${className}`}>
      {children}
    </div>
  );
};

interface SacredGridItemProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  className?: string;
  animated?: boolean;
}

export const SacredGridItem = ({ 
  children, 
  span = 1, 
  className = "",
  animated = false 
}: SacredGridItemProps) => {
  const getSpanClass = () => {
    return `col-span-1 sm:col-span-${Math.min(span, 2)} md:col-span-${Math.min(span, 3)} lg:col-span-${Math.min(span, 4)} xl:col-span-${span}`;
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (animated) {
    return (
      <motion.div
        variants={itemVariants}
        className={`${getSpanClass()} ${className}`}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${getSpanClass()} ${className}`}>
      {children}
    </div>
  );
};

// Sacred Container Component
interface SacredContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  center?: boolean;
}

export const SacredContainer = ({ 
  children, 
  size = 'xl', 
  className = "",
  center = false 
}: SacredContainerProps) => {
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-2xl';
      case 'md': return 'max-w-4xl';
      case 'lg': return 'max-w-6xl';
      case 'xl': return 'max-w-7xl';
      case 'full': return 'max-w-none';
      default: return 'max-w-7xl';
    }
  };

  return (
    <div className={`${getSizeClass()} mx-auto px-4 sm:px-6 lg:px-8 ${center ? 'text-center' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Sacred Section Component
interface SacredSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  gradient?: 'none' | 'purple' | 'cosmic' | 'divine';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const SacredSection = ({ 
  children, 
  id,
  className = "",
  gradient = 'none',
  padding = 'lg'
}: SacredSectionProps) => {
  const getGradientClass = () => {
    switch (gradient) {
      case 'purple': return 'bg-gradient-to-r from-purple-900/20 to-violet-900/20';
      case 'cosmic': return 'bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900';
      case 'divine': return 'bg-gradient-to-r from-purple-600/10 via-cyan-600/10 to-purple-600/10';
      default: return '';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'py-8';
      case 'md': return 'py-12';
      case 'lg': return 'py-16';
      case 'xl': return 'py-24';
      default: return 'py-16';
    }
  };

  return (
    <section 
      id={id}
      className={`relative ${getGradientClass()} ${getPaddingClass()} ${className}`}
    >
      {children}
    </section>
  );
};

// Sacred Responsive Text Component
interface SacredTextProps {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  className?: string;
  gradient?: boolean;
}

export const SacredText = ({ 
  children, 
  variant = 'body', 
  className = "",
  gradient = false 
}: SacredTextProps) => {
  const getVariantClass = () => {
    const gradientClass = gradient ? 'bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent' : '';
    
    switch (variant) {
      case 'h1': return `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${gradientClass}`;
      case 'h2': return `text-3xl sm:text-4xl md:text-5xl font-bold leading-tight ${gradientClass}`;
      case 'h3': return `text-2xl sm:text-3xl md:text-4xl font-bold leading-tight ${gradientClass}`;
      case 'h4': return `text-xl sm:text-2xl md:text-3xl font-semibold leading-tight ${gradientClass}`;
      case 'body': return `text-base sm:text-lg leading-relaxed ${gradient ? gradientClass : 'text-gray-300'}`;
      case 'caption': return `text-sm sm:text-base text-gray-400 ${gradientClass}`;
      default: return `text-base leading-relaxed ${gradient ? gradientClass : 'text-gray-300'}`;
    }
  };

  const Tag = variant.startsWith('h') ? variant as keyof JSX.IntrinsicElements : 'p';

  return (
    <Tag className={`${getVariantClass()} ${className}`}>
      {children}
    </Tag>
  );
};