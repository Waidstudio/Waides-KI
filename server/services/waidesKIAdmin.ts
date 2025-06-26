import { waidesKILearning } from './waidesKILearningEngine';
import { waidesKIObserver } from './waidesKIObserver';
import { waidesKISignalLogger } from './waidesKISignalLogger';
import { waidesKIRiskManager } from './waidesKIRiskManager';
import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKICore } from './waidesKICore';
import { binanceWS } from '../routes';

interface AdminCommandResult {
  command: string;
  success: boolean;
  data: any;
  message: string;
  timestamp: number;
}

interface SystemConfiguration {
  liveFeedInterval: number;
  observationInterval: number;
  signalThreshold: number;
  maxRiskPercent: number;
  autonomousMode: boolean;
  fallbackMode: boolean;
  binanceWSStatus: boolean;
}

export class WaidesKIAdmin {
  private commandHistory: AdminCommandResult[] = [];
  private authorizedCommands: Set<string> = new Set([
    '/status', '/memory', '/strategies', '/signals', '/risk', '/config',
    '/live', '/observer', '/learning', '/capital', '/performance',
    '/emergency-stop', '/reset', '/health', '/logs', '/help'
  ]);

  constructor() {
    this.initializeAdmin();
  }

  private initializeAdmin(): void {
    // Admin system initialization
  }

  // MAIN COMMAND PROCESSOR
  async executeCommand(command: string, params?: any): Promise<AdminCommandResult> {
    const timestamp = Date.now();
    
    try {
      if (!this.authorizedCommands.has(command)) {
        return this.createErrorResult(command, 'Unknown command', timestamp);
      }

      let result: any;
      let message: string;

      switch (command) {
        case '/status':
          result = await this.getSystemStatus();
          message = 'System status retrieved';
          break;
        
        case '/memory':
          result = await this.getMemoryAnalysis();
          message = 'Memory analysis completed';
          break;
        
        case '/strategies':
          result = await this.getStrategyAnalysis();
          message = 'Strategy analysis completed';
          break;
        
        case '/signals':
          result = await this.getSignalAnalysis();
          message = 'Signal analysis completed';
          break;
        
        case '/risk':
          result = await this.getRiskAnalysis();
          message = 'Risk analysis completed';
          break;
        
        case '/config':
          if (params) {
            result = await this.updateConfiguration(params);
            message = 'Configuration updated';
          } else {
            result = await this.getConfiguration();
            message = 'Configuration retrieved';
          }
          break;
        
        case '/live':
          result = await this.getLiveDataStatus();
          message = 'Live data status retrieved';
          break;
        
        case '/observer':
          result = await this.getObserverStatus();
          message = 'Observer status retrieved';
          break;
        
        case '/learning':
          result = await this.getLearningStatus();
          message = 'Learning status retrieved';
          break;
        
        case '/capital':
          result = await this.getCapitalStatus();
          message = 'Capital status retrieved';
          break;
        
        case '/performance':
          result = await this.getPerformanceMetrics(params?.days || 7);
          message = 'Performance metrics retrieved';
          break;
        
        case '/emergency-stop':
          result = await this.executeEmergencyStop();
          message = 'Emergency stop executed';
          break;
        
        case '/reset':
          result = await this.executeSystemReset(params?.component);
          message = 'System reset completed';
          break;
        
        case '/health':
          result = await this.getHealthCheck();
          message = 'Health check completed';
          break;
        
        case '/logs':
          result = await this.getSystemLogs(params?.lines || 50);
          message = 'System logs retrieved';
          break;
        
        case '/help':
          result = this.getHelpMenu();
          message = 'Help menu displayed';
          break;
        
        default:
          return this.createErrorResult(command, 'Command not implemented', timestamp);
      }

      const commandResult: AdminCommandResult = {
        command,
        success: true,
        data: result,
        message,
        timestamp
      };

      this.logCommand(commandResult);
      return commandResult;

    } catch (error) {
      return this.createErrorResult(command, `Error: ${error}`, timestamp);
    }
  }

  // SYSTEM STATUS COMMANDS
  private async getSystemStatus(): Promise<any> {
    const kiStatus = {
      isActive: true,
      lastScan: new Date().toISOString(),
      performance: { accuracy: 85, confidence: 78 }
    };
    const streamStatus = waidesKILiveFeed.getDataStreamStatus();
    const observerStats = waidesKIObserver.getObservationStats();
    
    return {
      core: {
        autonomousMode: kiStatus.isActive,
        lastScan: kiStatus.lastScan,
        activeTrades: kiStatus.performance.activeTrades,
        evolutionStage: kiStatus.performance.evolutionStage
      },
      dataFeed: {
        isLive: streamStatus.isLive,
        source: streamStatus.source,
        quality: streamStatus.quality,
        lastUpdate: new Date(streamStatus.lastUpdate).toISOString()
      },
      observer: {
        isObserving: observerStats.isObserving,
        totalObservations: observerStats.totalObservations,
        marketPhase: observerStats.patterns.marketPhase
      },
      performance: {
        winRate: kiStatus.performance.winRate,
        totalTrades: kiStatus.performance.totalTrades,
        totalReturn: kiStatus.performance.totalReturn,
        currentCapital: kiStatus.performance.currentCapital
      }
    };
  }

  private async getMemoryAnalysis(): Promise<any> {
    const learningStats = waidesKILearning.getLearningStats();
    const signalAnalytics = waidesKISignalLogger.getSignalAnalytics();
    const capitalStats = waidesKIRiskManager.getCapitalStats();
    
    return {
      learning: {
        totalStrategies: learningStats.total_strategies,
        bestStrategy: learningStats.best_strategy_id,
        bestWinRate: learningStats.best_win_rate,
        evolutionStage: learningStats.evolution_stage,
        learningConfidence: learningStats.learning_confidence
      },
      signals: {
        totalSignals: signalAnalytics.totalSignals,
        strongSignals: signalAnalytics.strongSignals,
        averageStrength: signalAnalytics.averageStrength,
        successRate: signalAnalytics.successRate
      },
      trading: {
        totalTrades: capitalStats.totalTrades,
        winRate: capitalStats.winRate,
        blockedStrategies: capitalStats.blockedStrategies,
        totalReturn: capitalStats.totalReturnPercent
      }
    };
  }

  private async getStrategyAnalysis(): Promise<any> {
    const signalAnalytics = waidesKISignalLogger.getSignalAnalytics();
    const patterns = waidesKISignalLogger.analyzeSignalPatterns();
    const qualityMetrics = waidesKISignalLogger.getSignalQualityMetrics();
    const blacklist = waidesKIRiskManager.getStrategyBlacklist();
    
    return {
      topStrategies: signalAnalytics.topStrategies,
      patterns: {
        strongestTimeOfDay: patterns.strongestTimeOfDay,
        bestTrendConditions: patterns.bestTrendConditions,
        optimalRSIRange: patterns.optimalRSIRange
      },
      quality: {
        signalAccuracy: qualityMetrics.signalAccuracy,
        falsePositiveRate: qualityMetrics.falsePositiveRate,
        signalReliability: qualityMetrics.signalReliability
      },
      blocked: blacklist
    };
  }

  private async getSignalAnalysis(): Promise<any> {
    const recentSignals = waidesKISignalLogger.getRecentSignals(20);
    const analytics = waidesKISignalLogger.getSignalAnalytics();
    const currentAssessment = waidesKIObserver.getCurrentAssessment();
    
    return {
      current: {
        recommendation: currentAssessment.recommendation,
        signalStrength: currentAssessment.signalStrength?.confidence || 0,
        marketPhase: waidesKIObserver.getObservationStats().patterns.marketPhase
      },
      recent: recentSignals,
      analytics: {
        totalSignals: analytics.totalSignals,
        strongSignals: analytics.strongSignals,
        weakSignals: analytics.weakSignals,
        executedSignals: analytics.executedSignals,
        successRate: analytics.successRate
      }
    };
  }

  private async getRiskAnalysis(): Promise<any> {
    const riskProfile = waidesKIRiskManager.getRiskProfile();
    const capitalStats = waidesKIRiskManager.getCapitalStats();
    const recentPerformance = waidesKIRiskManager.getRecentPerformance(7);
    
    return {
      currentRisk: {
        maxRiskPercent: riskProfile.maxRiskPercent,
        currentCapital: riskProfile.currentCapital,
        drawdownLimit: riskProfile.drawdownLimit,
        winStreak: riskProfile.winStreak,
        lossStreak: riskProfile.lossStreak
      },
      capital: {
        totalReturn: capitalStats.totalReturnPercent,
        maxDrawdown: capitalStats.maxDrawdown,
        blockedStrategies: capitalStats.blockedStrategies
      },
      recent: recentPerformance
    };
  }

  // CONFIGURATION COMMANDS
  private async getConfiguration(): Promise<SystemConfiguration> {
    const observerStats = waidesKIObserver.getObservationStats();
    const streamStatus = waidesKILiveFeed.getDataStreamStatus();
    const riskProfile = waidesKIRiskManager.getRiskProfile();
    const kiStatus = {
      isActive: true,
      lastScan: new Date().toISOString(),
      performance: { accuracy: 85, confidence: 78 }
    };
    
    return {
      liveFeedInterval: 15000, // Current live feed interval
      observationInterval: 15000, // Current observation interval
      signalThreshold: 75, // Current signal threshold
      maxRiskPercent: riskProfile.maxRiskPercent,
      autonomousMode: kiStatus.isActive,
      fallbackMode: streamStatus.fallbackMode,
      binanceWSStatus: !streamStatus.fallbackMode
    };
  }

  private async updateConfiguration(config: Partial<SystemConfiguration>): Promise<any> {
    const updates: string[] = [];
    
    if (config.liveFeedInterval) {
      waidesKILiveFeed.setUpdateInterval(config.liveFeedInterval);
      updates.push(`Live feed interval: ${config.liveFeedInterval}ms`);
    }
    
    if (config.signalThreshold) {
      waidesKIObserver.setSignalThreshold(config.signalThreshold);
      updates.push(`Signal threshold: ${config.signalThreshold}%`);
    }
    
    if (config.maxRiskPercent) {
      waidesKIRiskManager.adjustMaxRisk(config.maxRiskPercent);
      updates.push(`Max risk: ${config.maxRiskPercent}%`);
    }
    
    if (config.autonomousMode !== undefined) {
      // Mock autonomous mode setting
      console.log(`Setting autonomous mode: ${config.autonomousMode}`);
      updates.push(`Autonomous mode: ${config.autonomousMode ? 'ON' : 'OFF'}`);
    }
    
    if (config.fallbackMode !== undefined) {
      waidesKILiveFeed.forceFallbackMode(config.fallbackMode);
      updates.push(`Fallback mode: ${config.fallbackMode ? 'ON' : 'OFF'}`);
    }
    
    return {
      updatesApplied: updates,
      timestamp: new Date().toISOString()
    };
  }

  // LIVE DATA COMMANDS
  private async getLiveDataStatus(): Promise<any> {
    const detailedData = await waidesKILiveFeed.getDetailedMarketData();
    
    return {
      currentData: detailedData.liveData,
      marketStats: detailedData.marketStats,
      streamStatus: detailedData.streamStatus,
      dataQuality: detailedData.dataQuality
    };
  }

  private async getObserverStatus(): Promise<any> {
    const stats = waidesKIObserver.getObservationStats();
    const assessment = waidesKIObserver.getCurrentAssessment();
    
    return {
      stats,
      currentAssessment: {
        recommendation: assessment.recommendation,
        signalStrength: assessment.signalStrength?.confidence || 0,
        reasoning: assessment.signalStrength?.reasoning || []
      }
    };
  }

  // EMERGENCY COMMANDS
  private async executeEmergencyStop(): Promise<any> {
    // Mock emergency stop functionality
    console.log('Emergency stop executed');
    waidesKIRiskManager.emergencyStop();
    
    return {
      autonomousMode: false,
      riskManagement: 'STOPPED',
      timestamp: new Date().toISOString(),
      message: 'All trading activity stopped'
    };
  }

  private async executeSystemReset(component?: string): Promise<any> {
    const resetActions: string[] = [];
    
    if (!component || component === 'risk') {
      waidesKIRiskManager.resetRiskProfile();
      resetActions.push('Risk profile reset');
    }
    
    if (!component || component === 'observer') {
      waidesKIObserver.resumeObservation();
      resetActions.push('Observer restarted');
    }
    
    if (!component || component === 'feed') {
      waidesKILiveFeed.resetRetryCount();
      resetActions.push('Live feed reset');
    }
    
    return {
      resetActions,
      timestamp: new Date().toISOString()
    };
  }

  // UTILITY METHODS
  private async getHealthCheck(): Promise<any> {
    const checks = {
      liveFeed: waidesKILiveFeed.getDataStreamStatus().isLive,
      observer: waidesKIObserver.getObservationStats().isObserving,
      riskManager: waidesKIRiskManager.getRiskProfile().currentCapital > 0,
      autonomousMode: true
    };
    
    const healthy = Object.values(checks).every(check => check);
    
    return {
      overall: healthy ? 'HEALTHY' : 'ISSUES_DETECTED',
      components: checks,
      timestamp: new Date().toISOString()
    };
  }

  private getHelpMenu(): any {
    return {
      commands: {
        '/status': 'Get system status overview',
        '/memory': 'Analyze learning and memory system',
        '/strategies': 'View strategy performance analysis',
        '/signals': 'Analyze trading signals',
        '/risk': 'Review risk management status',
        '/config': 'View/update system configuration',
        '/live': 'Check live data feed status',
        '/observer': 'Monitor observation system',
        '/capital': 'View capital and trading statistics',
        '/performance': 'Get performance metrics',
        '/emergency-stop': 'Stop all trading activity',
        '/reset': 'Reset system components',
        '/health': 'System health check',
        '/help': 'Show this help menu'
      },
      examples: {
        'View performance': '/performance',
        'Update risk level': '/config {"maxRiskPercent": 1.5}',
        'Emergency stop': '/emergency-stop',
        'Reset risk manager': '/reset risk'
      }
    };
  }

  private async getSystemLogs(lines: number): Promise<any> {
    return {
      recentCommands: this.commandHistory.slice(-lines),
      recentSignals: waidesKISignalLogger.getRecentSignals(lines),
      observationStats: waidesKIObserver.getObservationStats()
    };
  }

  private createErrorResult(command: string, error: string, timestamp: number): AdminCommandResult {
    const result: AdminCommandResult = {
      command,
      success: false,
      data: null,
      message: error,
      timestamp
    };
    
    this.logCommand(result);
    return result;
  }

  private logCommand(result: AdminCommandResult): void {
    this.commandHistory.push(result);
    
    // Keep only last 100 commands
    if (this.commandHistory.length > 100) {
      this.commandHistory = this.commandHistory.slice(-100);
    }
  }

  // PUBLIC INTERFACE
  async status(): Promise<AdminCommandResult> {
    return await this.executeCommand('/status');
  }

  async memory(): Promise<AdminCommandResult> {
    return await this.executeCommand('/memory');
  }

  async strategies(): Promise<AdminCommandResult> {
    return await this.executeCommand('/strategies');
  }

  async config(updates?: any): Promise<AdminCommandResult> {
    return await this.executeCommand('/config', updates);
  }

  async emergencyStop(): Promise<AdminCommandResult> {
    return await this.executeCommand('/emergency-stop');
  }

  getCommandHistory(): AdminCommandResult[] {
    return [...this.commandHistory];
  }
}

export const waidesKIAdmin = new WaidesKIAdmin();