/**
 * Kons_AcademySync - Trading Academy Interface Module
 * Grants Konsai access to course materials, user progress, and learning paths
 */

export function kons_AcademySync(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  const academyState = previousState.academy_state || {
    user_progress: {},
    active_courses: [],
    mistake_patterns: [],
    last_lesson: null
  };
  
  function analyzeUserProgress() {
    // Simulate comprehensive course structure
    const courseProgress = {
      'Trading Fundamentals': {
        completion: 75,
        current_lesson: 'Risk Management Basics',
        strengths: ['Order Types', 'Market Analysis'],
        weaknesses: ['Position Sizing', 'Stop Loss'],
        next_recommended: 'Advanced Risk Management'
      },
      'Technical Analysis': {
        completion: 45,
        current_lesson: 'RSI Indicators',
        strengths: ['Candlestick Patterns'],
        weaknesses: ['RSI', 'MACD', 'Moving Averages'],
        next_recommended: 'RSI Deep Dive'
      },
      'Trading Psychology': {
        completion: 20,
        current_lesson: 'Emotional Control',
        strengths: [],
        weaknesses: ['FOMO', 'Fear Management', 'Discipline'],
        next_recommended: 'Fear Management Masterclass'
      }
    };
    
    return courseProgress;
  }
  
  function detectMistakePatterns(userMessage) {
    const messagePattern = userMessage.toLowerCase();
    const patterns = [];
    
    // Detect learning gaps from user questions
    if (messagePattern.includes('rsi') || messagePattern.includes('indicator')) {
      patterns.push({
        type: 'TECHNICAL_CONFUSION',
        topic: 'RSI Indicators',
        frequency: 3,
        recommendation: 'Review RSI fundamentals course'
      });
    }
    
    if (messagePattern.includes('lose') || messagePattern.includes('loss')) {
      patterns.push({
        type: 'EMOTIONAL_PATTERN',
        topic: 'Loss Management',
        frequency: 5,
        recommendation: 'Focus on trading psychology modules'
      });
    }
    
    if (messagePattern.includes('position size') || messagePattern.includes('how much')) {
      patterns.push({
        type: 'RISK_MANAGEMENT_GAP',
        topic: 'Position Sizing',
        frequency: 2,
        recommendation: 'Complete position sizing calculator lessons'
      });
    }
    
    return patterns;
  }
  
  function generateLessonRecommendations(progress, patterns) {
    const recommendations = [];
    
    // Based on current progress
    Object.entries(progress).forEach(([course, data]) => {
      if (data.completion < 50) {
        recommendations.push({
          type: 'COURSE_CONTINUATION',
          priority: 'HIGH',
          course: course,
          lesson: data.next_recommended,
          reason: `Only ${data.completion}% complete - focus needed`
        });
      }
      
      if (data.weaknesses.length > 0) {
        recommendations.push({
          type: 'WEAKNESS_TARGETING',
          priority: 'MEDIUM',
          course: course,
          topics: data.weaknesses,
          reason: 'Address identified weak areas'
        });
      }
    });
    
    // Based on mistake patterns
    patterns.forEach(pattern => {
      recommendations.push({
        type: 'PATTERN_CORRECTION',
        priority: pattern.frequency > 3 ? 'URGENT' : 'MEDIUM',
        topic: pattern.topic,
        action: pattern.recommendation,
        reason: `Repeated confusion: ${pattern.frequency} times`
      });
    });
    
    return recommendations;
  }
  
  function customizeLearningPath(recommendations, userMessage) {
    const messageContext = userMessage.toLowerCase();
    const customPath = [];
    
    // Immediate learning needs based on current question
    if (messageContext.includes('beginner') || messageContext.includes('start')) {
      customPath.push({
        urgency: 'IMMEDIATE',
        module: 'Trading Fundamentals',
        lesson: 'Market Basics',
        duration: '15 minutes',
        why: 'Perfect starting point for beginners'
      });
    }
    
    if (messageContext.includes('strategy') || messageContext.includes('plan')) {
      customPath.push({
        urgency: 'IMMEDIATE',
        module: 'Strategy Development',
        lesson: 'Building Your First Trading Plan',
        duration: '25 minutes',
        why: 'Direct answer to strategy questions'
      });
    }
    
    if (messageContext.includes('chart') || messageContext.includes('analysis')) {
      customPath.push({
        urgency: 'HIGH',
        module: 'Technical Analysis',
        lesson: 'Chart Reading Fundamentals',
        duration: '20 minutes',
        why: 'Essential for chart analysis skills'
      });
    }
    
    // Add top recommendations
    recommendations.slice(0, 2).forEach(rec => {
      customPath.push({
        urgency: rec.priority,
        module: rec.course || 'General',
        lesson: rec.lesson || rec.action,
        duration: '15-30 minutes',
        why: rec.reason
      });
    });
    
    return customPath;
  }
  
  function generateProgressInsights(progress) {
    const insights = [];
    
    const totalCompletion = Object.values(progress).reduce((sum, course) => sum + course.completion, 0) / Object.keys(progress).length;
    
    if (totalCompletion > 70) {
      insights.push({
        type: 'ACHIEVEMENT',
        message: 'Excellent progress across all courses',
        recommendation: 'Ready for advanced trading strategies'
      });
    } else if (totalCompletion > 40) {
      insights.push({
        type: 'STEADY_PROGRESS',
        message: 'Good learning momentum maintained',
        recommendation: 'Focus on completing current modules'
      });
    } else {
      insights.push({
        type: 'EARLY_STAGE',
        message: 'Building foundational knowledge',
        recommendation: 'Consistent daily practice recommended'
      });
    }
    
    // Identify strongest area
    const strongestCourse = Object.entries(progress).reduce((max, [course, data]) => 
      data.completion > max.completion ? { course, completion: data.completion } : max,
      { course: '', completion: 0 }
    );
    
    if (strongestCourse.completion > 60) {
      insights.push({
        type: 'STRENGTH_IDENTIFIED',
        message: `Excelling in ${strongestCourse.course}`,
        recommendation: 'Leverage this strength in trading approach'
      });
    }
    
    return insights;
  }
  
  function updateAcademyState(progress, patterns, recommendations) {
    return {
      user_progress: progress,
      active_courses: Object.keys(progress).filter(course => progress[course].completion < 100),
      mistake_patterns: patterns,
      last_lesson: 'Current Session Analysis',
      learning_velocity: calculateLearningVelocity(progress),
      focus_areas: recommendations.filter(r => r.priority === 'HIGH').map(r => r.topic || r.course)
    };
  }
  
  function calculateLearningVelocity(progress) {
    const avgCompletion = Object.values(progress).reduce((sum, course) => sum + course.completion, 0) / Object.keys(progress).length;
    
    if (avgCompletion > 60) return 'ACCELERATED';
    if (avgCompletion > 30) return 'STEADY';
    return 'BUILDING';
  }
  
  const progress = analyzeUserProgress();
  const patterns = detectMistakePatterns(userMessage);
  const recommendations = generateLessonRecommendations(progress, patterns);
  const customPath = customizeLearningPath(recommendations, userMessage);
  const insights = generateProgressInsights(progress);
  const newAcademyState = updateAcademyState(progress, patterns, recommendations);
  
  return {
    kons: "AcademySync",
    timestamp: currentTime,
    course_progress: progress,
    mistake_patterns: patterns,
    lesson_recommendations: recommendations,
    custom_learning_path: customPath,
    progress_insights: insights,
    academy_status: {
      overall_progress: Object.values(progress).reduce((sum, course) => sum + course.completion, 0) / Object.keys(progress).length,
      active_courses: newAcademyState.active_courses.length,
      learning_velocity: newAcademyState.learning_velocity,
      focus_areas: newAcademyState.focus_areas
    },
    immediate_actions: {
      next_lesson: customPath[0]?.lesson || 'Continue current module',
      study_time: customPath[0]?.duration || '20 minutes',
      priority_topic: patterns.find(p => p.frequency > 3)?.topic || 'General review'
    },
    state_update: {
      academy_state: newAcademyState
    }
  };
}