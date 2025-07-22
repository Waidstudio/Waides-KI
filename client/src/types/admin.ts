export interface AdminStatus {
  success: boolean;
  data: {
    engineStatus: {
      isRunning: boolean;
      uptime: string;
      version: string;
    };
    dataFeed: {
      isLive: boolean;
      source: string;
      quality: string;
    };
    observer: {
      isObserving: boolean;
      totalObservations: number;
      marketPhase: string;
    };
    performance: {
      winRate: number;
      totalTrades: number;
      currentCapital: number;
      totalReturn: number;
    };
  };
}

export interface AdminConfig {
  success: boolean;
  data: {
    signalThreshold: number;
    maxRiskPercent: number;
    autonomousMode: boolean;
    binanceWSStatus: boolean;
  };
}

export interface MemoryAnalysis {
  success: boolean;
  data: {
    totalMemoryUsage: string;
    activeModules: number;
    memoryOptimization: string;
    cacheHitRate: number;
  };
}

export interface StrategyAnalysis {
  success: boolean;
  data: {
    activeStrategies: number;
    bestPerforming: string;
    worstPerforming: string;
    avgPerformance: number;
    patterns?: {
      strongestTimeOfDay: string;
      bestTrendConditions: string;
      optimalRSIRange: string;
    };
    blocked?: Array<{
      strategyId: string;
      reason: string;
    }>;
  };
}

export interface CommandResponse {
  success: boolean;
  message: string;
  data?: any;
}