import { waidesKIShadowLab } from './waidesKIShadowLab';
import { waidesKIHiddenVision } from './waidesKIHiddenVision';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKILiveFeed } from './waidesKILiveFeed';

interface VaultedDNA {
  dna_id: string;
  strategy_id: string;
  vault_entry_timestamp: number;
  dna_parameters: {
    ema_short: number;
    ema_long: number;
    rsi_entry: number;
    rsi_exit: number;
    volume_threshold: number;
    profit_target: number;
    stop_loss: number;
    time_window: number;
  };
  elite_metrics: {
    shadow_ranking: number;
    win_rate: number;
    profit_loss: number;
    max_drawdown: number;
    risk_score: number;
    stability_score: number;
  };
  konslang_protection: {
    blessing_phrases: string[];
    protection_level: number;
    sacred_key: string;
    spiritual_strength: number;
  };
  lifecycle_status: 'VAULTED' | 'ACTIVATED' | 'LIVE' | 'RETIRED' | 'TERMINATED';
  activation_conditions: string[];
  performance_tracking: {
    live_trades: number;
    live_wins: number;
    live_losses: number;
    live_profit_loss: number;
    live_win_rate: number;
    last_performance_check: number;
  };
}

interface LiveStrategy {
  strategy_id: string;
  vaulted_dna: VaultedDNA;
  activation_timestamp: number;
  live_session_id: string;
  execution_count: number;
  current_performance: {
    trades_executed: number;
    successful_trades: number;
    total_profit_loss: number;
    current_streak: number;
    streak_type: 'WIN' | 'LOSS' | 'NONE';
  };
  health_status: 'HEALTHY' | 'DECLINING' | 'CRITICAL' | 'TERMINATED';
  termination_criteria: {
    max_losses: number;
    min_win_rate: number;
    max_drawdown: number;
    max_live_duration: number;
  };
  konslang_monitor: {
    active_blessings: string[];
    protection_failures: number;
    last_blessing_check: number;
  };
}

interface DNALifecycleEvent {
  event_id: string;
  timestamp: number;
  event_type: 'VAULT_ENTRY' | 'ACTIVATION' | 'LIVE_DEPLOYMENT' | 'PERFORMANCE_UPDATE' | 'RETIREMENT' | 'TERMINATION';
  strategy_id: string;
  description: string;
  performance_data?: any;
  konslang_data?: any;
  reason?: string;
}

interface VaultStatistics {
  total_vaulted: number;
  currently_active: number;
  currently_live: number;
  retired_strategies: number;
  terminated_strategies: number;
  average_vault_to_live: number; // days
  best_performing_strategy: string;
  vault_success_rate: number;
  total_vault_profit: number;
}

export class WaidesKIStrategyVault {
  private vaultedStrategies: Map<string, VaultedDNA> = new Map();
  private liveStrategies: Map<string, LiveStrategy> = new Map();
  private lifecycleEvents: DNALifecycleEvent[] = [];
  private isVaultActive: boolean = true;
  private vaultSecurity: number = 95;
  private maxLiveStrategies: number = 5;
  private autoPromotionEnabled: boolean = true;

  constructor() {
    this.startVaultCycle();
  }

  private startVaultCycle(): void {
    // Check for elite promotion every 30 minutes
    setInterval(() => {
      this.checkForElitePromotion();
    }, 30 * 60 * 1000);

    // Monitor live strategy performance every 10 minutes
    setInterval(() => {
      this.monitorLivePerformance();
    }, 10 * 60 * 1000);

    // Clean old lifecycle events every 24 hours
    setInterval(() => {
      this.cleanOldEvents();
    }, 24 * 60 * 60 * 1000);
  }

  // CORE VAULT OPERATIONS
  async storeEliteDNA(
    strategyId: string,
    eliteStrategy: any,
    konsLangBlessing: string[] = []
  ): Promise<string> {
    if (!this.isVaultActive) {
      throw new Error('Strategy Vault is currently inactive');
    }

    // Generate vault DNA ID
    const dnaId = this.generateVaultDNAId();
    
    // Get KonsLang protection
    const konsLangProtection = await this.generateKonsLangProtection(konsLangBlessing);
    
    // Create vaulted DNA
    const vaultedDNA: VaultedDNA = {
      dna_id: dnaId,
      strategy_id: strategyId,
      vault_entry_timestamp: Date.now(),
      dna_parameters: {
        ema_short: eliteStrategy.dna.ema_short,
        ema_long: eliteStrategy.dna.ema_long,
        rsi_entry: eliteStrategy.dna.rsi_entry,
        rsi_exit: eliteStrategy.dna.rsi_exit,
        volume_threshold: eliteStrategy.dna.volume_threshold,
        profit_target: eliteStrategy.dna.profit_target,
        stop_loss: eliteStrategy.dna.stop_loss,
        time_window: eliteStrategy.dna.time_window
      },
      elite_metrics: {
        shadow_ranking: eliteStrategy.variant.shadow_ranking,
        win_rate: eliteStrategy.variant.win_rate,
        profit_loss: eliteStrategy.variant.profit_loss,
        max_drawdown: eliteStrategy.variant.max_drawdown,
        risk_score: eliteStrategy.variant.risk_score,
        stability_score: eliteStrategy.variant.stability_score
      },
      konslang_protection: konsLangProtection,
      lifecycle_status: 'VAULTED',
      activation_conditions: this.generateActivationConditions(eliteStrategy),
      performance_tracking: {
        live_trades: 0,
        live_wins: 0,
        live_losses: 0,
        live_profit_loss: 0,
        live_win_rate: 0,
        last_performance_check: Date.now()
      }
    };

    // Store in vault
    this.vaultedStrategies.set(dnaId, vaultedDNA);
    
    // Record lifecycle event
    this.recordLifecycleEvent(
      'VAULT_ENTRY',
      strategyId,
      `Elite strategy vaulted with KonsLang protection: ${konsLangBlessing.join(', ')}`,
      eliteStrategy.variant,
      { blessing_phrases: konsLangBlessing, protection_level: konsLangProtection.protection_level }
    );

    waidesKIDailyReporter.recordLesson(
      `Elite strategy vaulted: ${strategyId} with ${Math.round(eliteStrategy.variant.shadow_ranking)}% ranking`,
      'VAULT',
      'HIGH',
      'Strategy Vault'
    );

    return dnaId;
  }

  async activateStrategy(dnaId: string, forceActivation: boolean = false): Promise<boolean> {
    const vaultedDNA = this.vaultedStrategies.get(dnaId);
    if (!vaultedDNA) {
      throw new Error(`Strategy with DNA ID ${dnaId} not found in vault`);
    }

    if (vaultedDNA.lifecycle_status !== 'VAULTED') {
      throw new Error(`Strategy ${dnaId} is not in vaulted status (current: ${vaultedDNA.lifecycle_status})`);
    }

    // Check activation conditions unless forced
    if (!forceActivation) {
      const conditionsMet = await this.checkActivationConditions(vaultedDNA);
      if (!conditionsMet.canActivate) {
        waidesKIDailyReporter.recordLesson(
          `Strategy activation blocked: ${conditionsMet.reason}`,
          'VAULT',
          'MEDIUM',
          'Strategy Vault'
        );
        return false;
      }
    }

    // Check live strategy limits
    if (this.liveStrategies.size >= this.maxLiveStrategies) {
      const retired = await this.retireLowestPerformer();
      if (!retired) {
        throw new Error('Cannot activate strategy: live limit reached and no strategies can be retired');
      }
    }

    // Create live strategy
    const liveStrategy: LiveStrategy = {
      strategy_id: vaultedDNA.strategy_id,
      vaulted_dna: vaultedDNA,
      activation_timestamp: Date.now(),
      live_session_id: this.generateLiveSessionId(),
      execution_count: 0,
      current_performance: {
        trades_executed: 0,
        successful_trades: 0,
        total_profit_loss: 0,
        current_streak: 0,
        streak_type: 'NONE'
      },
      health_status: 'HEALTHY',
      termination_criteria: {
        max_losses: 5,
        min_win_rate: 0.4,
        max_drawdown: 0.05,
        max_live_duration: 7 * 24 * 60 * 60 * 1000 // 7 days
      },
      konslang_monitor: {
        active_blessings: [...vaultedDNA.konslang_protection.blessing_phrases],
        protection_failures: 0,
        last_blessing_check: Date.now()
      }
    };

    // Update vault status and add to live strategies
    vaultedDNA.lifecycle_status = 'ACTIVATED';
    this.liveStrategies.set(dnaId, liveStrategy);

    // Record lifecycle event
    this.recordLifecycleEvent(
      'ACTIVATION',
      vaultedDNA.strategy_id,
      `Strategy activated and moved to live trading pool`,
      vaultedDNA.elite_metrics,
      { protection_level: vaultedDNA.konslang_protection.protection_level }
    );

    waidesKIDailyReporter.recordLesson(
      `Strategy activated: ${vaultedDNA.strategy_id} now live with KonsLang protection`,
      'ACTIVATION',
      'HIGH',
      'Strategy Vault'
    );

    return true;
  }

  async deployToLive(dnaId: string): Promise<boolean> {
    const liveStrategy = this.liveStrategies.get(dnaId);
    if (!liveStrategy) {
      throw new Error(`Live strategy with DNA ID ${dnaId} not found`);
    }

    if (liveStrategy.vaulted_dna.lifecycle_status !== 'ACTIVATED') {
      throw new Error(`Strategy ${dnaId} is not in activated status`);
    }

    // Final KonsLang blessing check
    const blessingCheck = await this.checkKonsLangBlessing(liveStrategy);
    if (!blessingCheck.blessed) {
      waidesKIDailyReporter.recordLesson(
        `Live deployment blocked: KonsLang blessing failed - ${blessingCheck.reason}`,
        'VAULT',
        'HIGH',
        'Strategy Vault'
      );
      return false;
    }

    // Deploy to live
    liveStrategy.vaulted_dna.lifecycle_status = 'LIVE';

    // Record lifecycle event
    this.recordLifecycleEvent(
      'LIVE_DEPLOYMENT',
      liveStrategy.strategy_id,
      `Strategy deployed to live trading with full KonsLang protection`,
      liveStrategy.current_performance,
      { active_blessings: liveStrategy.konslang_monitor.active_blessings }
    );

    waidesKIDailyReporter.recordLesson(
      `Strategy deployed live: ${liveStrategy.strategy_id} - KonsLang blessed and protected`,
      'DEPLOYMENT',
      'HIGH',
      'Strategy Vault'
    );

    return true;
  }

  // PERFORMANCE MONITORING
  async updateStrategyPerformance(
    dnaId: string,
    tradeResult: {
      success: boolean;
      profit_loss: number;
      execution_time: number;
    }
  ): Promise<void> {
    const liveStrategy = this.liveStrategies.get(dnaId);
    if (!liveStrategy) return;

    // Update performance metrics
    liveStrategy.execution_count++;
    liveStrategy.current_performance.trades_executed++;
    liveStrategy.current_performance.total_profit_loss += tradeResult.profit_loss;

    if (tradeResult.success) {
      liveStrategy.current_performance.successful_trades++;
      liveStrategy.current_performance.current_streak = 
        liveStrategy.current_performance.streak_type === 'WIN' ? 
        liveStrategy.current_performance.current_streak + 1 : 1;
      liveStrategy.current_performance.streak_type = 'WIN';
    } else {
      liveStrategy.current_performance.current_streak = 
        liveStrategy.current_performance.streak_type === 'LOSS' ? 
        liveStrategy.current_performance.current_streak + 1 : 1;
      liveStrategy.current_performance.streak_type = 'LOSS';
    }

    // Update vault DNA performance tracking
    const vaultedDNA = liveStrategy.vaulted_dna;
    vaultedDNA.performance_tracking.live_trades++;
    vaultedDNA.performance_tracking.live_profit_loss += tradeResult.profit_loss;
    
    if (tradeResult.success) {
      vaultedDNA.performance_tracking.live_wins++;
    } else {
      vaultedDNA.performance_tracking.live_losses++;
    }
    
    vaultedDNA.performance_tracking.live_win_rate = 
      vaultedDNA.performance_tracking.live_wins / vaultedDNA.performance_tracking.live_trades;
    vaultedDNA.performance_tracking.last_performance_check = Date.now();

    // Check health status
    await this.updateHealthStatus(liveStrategy);

    // Record performance update event
    this.recordLifecycleEvent(
      'PERFORMANCE_UPDATE',
      liveStrategy.strategy_id,
      `Performance updated: ${tradeResult.success ? 'WIN' : 'LOSS'} (${(tradeResult.profit_loss * 100).toFixed(2)}%)`,
      liveStrategy.current_performance
    );
  }

  private async updateHealthStatus(liveStrategy: LiveStrategy): Promise<void> {
    const performance = liveStrategy.current_performance;
    const criteria = liveStrategy.termination_criteria;
    
    // Calculate current win rate
    const currentWinRate = performance.trades_executed > 0 ? 
      performance.successful_trades / performance.trades_executed : 0;
    
    // Calculate current drawdown
    const currentDrawdown = Math.abs(Math.min(0, performance.total_profit_loss));
    
    // Determine health status
    let newHealthStatus: LiveStrategy['health_status'] = 'HEALTHY';
    
    if (performance.current_streak >= criteria.max_losses && liveStrategy.current_performance.streak_type === 'LOSS') {
      newHealthStatus = 'CRITICAL';
    } else if (currentWinRate < criteria.min_win_rate && performance.trades_executed >= 10) {
      newHealthStatus = 'DECLINING';
    } else if (currentDrawdown > criteria.max_drawdown) {
      newHealthStatus = 'CRITICAL';
    } else if (Date.now() - liveStrategy.activation_timestamp > criteria.max_live_duration) {
      newHealthStatus = 'CRITICAL';
    }
    
    // Update health status if changed
    if (newHealthStatus !== liveStrategy.health_status) {
      liveStrategy.health_status = newHealthStatus;
      
      // Auto-terminate if critical
      if (newHealthStatus === 'CRITICAL') {
        await this.terminateStrategy(liveStrategy.vaulted_dna.dna_id, 'Performance criteria exceeded');
      }
    }
  }

  // STRATEGY LIFECYCLE MANAGEMENT
  async retireStrategy(dnaId: string, reason: string = 'Manual retirement'): Promise<boolean> {
    const liveStrategy = this.liveStrategies.get(dnaId);
    if (!liveStrategy) return false;

    // Update status
    liveStrategy.vaulted_dna.lifecycle_status = 'RETIRED';
    
    // Remove from live strategies
    this.liveStrategies.delete(dnaId);

    // Record lifecycle event
    this.recordLifecycleEvent(
      'RETIREMENT',
      liveStrategy.strategy_id,
      `Strategy retired: ${reason}`,
      liveStrategy.current_performance,
      undefined,
      reason
    );

    waidesKIDailyReporter.recordLesson(
      `Strategy retired: ${liveStrategy.strategy_id} - ${reason}`,
      'RETIREMENT',
      'MEDIUM',
      'Strategy Vault'
    );

    return true;
  }

  async terminateStrategy(dnaId: string, reason: string = 'Performance failure'): Promise<boolean> {
    const liveStrategy = this.liveStrategies.get(dnaId);
    if (!liveStrategy) return false;

    // Update status
    liveStrategy.vaulted_dna.lifecycle_status = 'TERMINATED';
    liveStrategy.health_status = 'TERMINATED';
    
    // Remove from live strategies
    this.liveStrategies.delete(dnaId);

    // Record lifecycle event
    this.recordLifecycleEvent(
      'TERMINATION',
      liveStrategy.strategy_id,
      `Strategy terminated: ${reason}`,
      liveStrategy.current_performance,
      undefined,
      reason
    );

    waidesKIDailyReporter.recordLesson(
      `Strategy terminated: ${liveStrategy.strategy_id} - ${reason}`,
      'TERMINATION',
      'HIGH',
      'Strategy Vault'
    );

    return true;
  }

  private async retireLowestPerformer(): Promise<boolean> {
    const liveStrategiesList = Array.from(this.liveStrategies.values());
    if (liveStrategiesList.length === 0) return false;

    // Find strategy with lowest performance
    const lowestPerformer = liveStrategiesList.reduce((worst, current) => {
      const currentWinRate = current.current_performance.trades_executed > 0 ? 
        current.current_performance.successful_trades / current.current_performance.trades_executed : 0;
      const worstWinRate = worst.current_performance.trades_executed > 0 ? 
        worst.current_performance.successful_trades / worst.current_performance.trades_executed : 0;
      
      return currentWinRate < worstWinRate ? current : worst;
    });

    return await this.retireStrategy(
      lowestPerformer.vaulted_dna.dna_id, 
      'Auto-retired to make room for new strategy'
    );
  }

  // AUTOMATED PROCESSES
  private async checkForElitePromotion(): Promise<void> {
    if (!this.autoPromotionEnabled || !this.isVaultActive) return;

    try {
      // Get vault-ready elite strategies from Shadow Lab
      const vaultReadyStrategies = waidesKIShadowLab.getVaultReadyStrategies();
      
      for (const eliteStrategy of vaultReadyStrategies) {
        // Check if already vaulted
        const alreadyVaulted = Array.from(this.vaultedStrategies.values())
          .some(v => v.strategy_id === eliteStrategy.strategy_id);
          
        if (!alreadyVaulted) {
          await this.storeEliteDNA(
            eliteStrategy.strategy_id,
            eliteStrategy,
            eliteStrategy.variant.konslang_blessing
          );
        }
      }
      
      // Check for strategies ready for activation
      for (const [dnaId, vaultedDNA] of this.vaultedStrategies.entries()) {
        if (vaultedDNA.lifecycle_status === 'VAULTED') {
          const conditionsMet = await this.checkActivationConditions(vaultedDNA);
          if (conditionsMet.canActivate && this.liveStrategies.size < this.maxLiveStrategies) {
            await this.activateStrategy(dnaId);
          }
        }
      }
      
    } catch (error) {
      console.error('Error in elite promotion check:', error);
    }
  }

  private async monitorLivePerformance(): Promise<void> {
    for (const [dnaId, liveStrategy] of this.liveStrategies.entries()) {
      // Check KonsLang protection
      const blessingCheck = await this.checkKonsLangBlessing(liveStrategy);
      if (!blessingCheck.blessed) {
        liveStrategy.konslang_monitor.protection_failures++;
        
        if (liveStrategy.konslang_monitor.protection_failures >= 3) {
          await this.terminateStrategy(dnaId, 'KonsLang protection failed multiple times');
        }
      }
      
      // Deploy activated strategies to live if conditions are met
      if (liveStrategy.vaulted_dna.lifecycle_status === 'ACTIVATED' && blessingCheck.blessed) {
        await this.deployToLive(dnaId);
      }
    }
  }

  // UTILITY METHODS
  private async generateKonsLangProtection(blessingPhrases: string[]): Promise<VaultedDNA['konslang_protection']> {
    const sacredKey = this.generateSacredKey();
    const protectionLevel = Math.min(100, 50 + (blessingPhrases.length * 15));
    const spiritualStrength = Math.random() * 40 + 60; // 60-100
    
    return {
      blessing_phrases: blessingPhrases,
      protection_level: protectionLevel,
      sacred_key: sacredKey,
      spiritual_strength: spiritualStrength
    };
  }

  private generateActivationConditions(eliteStrategy: any): string[] {
    const conditions: string[] = [];
    
    conditions.push('KonsLang blessing confirmed');
    conditions.push('Market volatility < 5%');
    conditions.push('No active crash warnings');
    
    if (eliteStrategy.variant.win_rate >= 0.8) {
      conditions.push('High win rate elite - immediate activation');
    } else {
      conditions.push('Additional market confirmation required');
    }
    
    return conditions;
  }

  private async checkActivationConditions(vaultedDNA: VaultedDNA): Promise<{ canActivate: boolean; reason: string }> {
    // Check KonsLang blessing
    if (vaultedDNA.konslang_protection.blessing_phrases.length === 0) {
      return { canActivate: false, reason: 'No KonsLang blessing found' };
    }
    
    // Check for crash warnings
    const activePredictions = waidesKIHiddenVision.getActivePredictions();
    const crashWarnings = activePredictions.filter(p => p.prediction_type === 'CRASH_WARNING');
    if (crashWarnings.length > 0) {
      return { canActivate: false, reason: 'Active crash warnings detected' };
    }
    
    // Check elite metrics
    if (vaultedDNA.elite_metrics.win_rate < 0.75) {
      return { canActivate: false, reason: 'Win rate below activation threshold' };
    }
    
    return { canActivate: true, reason: 'All activation conditions met' };
  }

  private async checkKonsLangBlessing(liveStrategy: LiveStrategy): Promise<{ blessed: boolean; reason: string }> {
    try {
      // Get current market context for KonsLang check
      const marketContext = await this.createMarketContext();
      const predictions = await waidesKIHiddenVision.predictWithVision(marketContext);
      
      // Check if any current predictions match our blessing phrases
      const currentBlessings = predictions.map(p => p.konslang_phrase);
      const hasActiveBlessing = liveStrategy.konslang_monitor.active_blessings.some(
        blessing => currentBlessings.includes(blessing)
      );
      
      liveStrategy.konslang_monitor.last_blessing_check = Date.now();
      
      if (hasActiveBlessing) {
        return { blessed: true, reason: 'Active KonsLang blessing confirmed' };
      } else {
        return { blessed: false, reason: 'No active KonsLang blessings match current predictions' };
      }
      
    } catch (error) {
      return { blessed: false, reason: 'Error checking KonsLang blessing' };
    }
  }

  private async createMarketContext(): Promise<any> {
    try {
      const ethData = await waidesKILiveFeed.getLatestEthData();
      return {
        price: ethData.price,
        volume: ethData.volume,
        rsi: ethData.rsi || 50,
        ema_50: ethData.ema50 || ethData.price * 0.98,
        ema_200: ethData.ema200 || ethData.price * 0.95,
        momentum: 0.5,
        volume_rise: ethData.volume > 1000000,
        buy_support: ethData.price > (ethData.ema50 || ethData.price * 0.98)
      };
    } catch (error) {
      return {
        price: 2400,
        volume: 1000000,
        rsi: 50,
        ema_50: 2390,
        ema_200: 2380,
        momentum: 0.5,
        volume_rise: true,
        buy_support: true
      };
    }
  }

  private recordLifecycleEvent(
    eventType: DNALifecycleEvent['event_type'],
    strategyId: string,
    description: string,
    performanceData?: any,
    konsLangData?: any,
    reason?: string
  ): void {
    const event: DNALifecycleEvent = {
      event_id: this.generateEventId(),
      timestamp: Date.now(),
      event_type: eventType,
      strategy_id: strategyId,
      description,
      performance_data: performanceData,
      konslang_data: konsLangData,
      reason
    };
    
    this.lifecycleEvents.push(event);
    
    // Maintain event history size
    if (this.lifecycleEvents.length > 1000) {
      this.lifecycleEvents = this.lifecycleEvents.slice(-1000);
    }
  }

  private cleanOldEvents(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.lifecycleEvents = this.lifecycleEvents.filter(e => e.timestamp > thirtyDaysAgo);
  }

  private generateVaultDNAId(): string {
    return `VAULT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateLiveSessionId(): string {
    return `LIVE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateEventId(): string {
    return `EVENT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateSacredKey(): string {
    const keys = ['shai\'lor', 'dom\'kaan', 'mel\'zek', 'krai\'nor', 'zi\'anth', 'vaed\'uun', 'thel\'vari', 'nyx\'ara'];
    return keys[Math.floor(Math.random() * keys.length)];
  }

  // PUBLIC INTERFACE METHODS
  getVaultedStrategies(): VaultedDNA[] {
    return Array.from(this.vaultedStrategies.values());
  }

  getLiveStrategies(): LiveStrategy[] {
    return Array.from(this.liveStrategies.values());
  }

  getStrategyByStatus(status: VaultedDNA['lifecycle_status']): VaultedDNA[] {
    return Array.from(this.vaultedStrategies.values()).filter(s => s.lifecycle_status === status);
  }

  getLifecycleEvents(limit: number = 100): DNALifecycleEvent[] {
    return this.lifecycleEvents.slice(-limit).reverse();
  }

  getVaultStatistics(): VaultStatistics {
    const allStrategies = Array.from(this.vaultedStrategies.values());
    const liveStrategies = Array.from(this.liveStrategies.values());
    
    const totalProfit = allStrategies.reduce((sum, s) => sum + s.performance_tracking.live_profit_loss, 0);
    const successfulStrategies = allStrategies.filter(s => s.performance_tracking.live_win_rate > 0.5).length;
    const vaultSuccessRate = allStrategies.length > 0 ? successfulStrategies / allStrategies.length : 0;
    
    const bestPerformer = allStrategies.reduce((best, current) => 
      current.performance_tracking.live_profit_loss > best.performance_tracking.live_profit_loss ? current : best,
      allStrategies[0]
    );
    
    return {
      total_vaulted: allStrategies.length,
      currently_active: this.getStrategyByStatus('ACTIVATED').length,
      currently_live: this.getStrategyByStatus('LIVE').length,
      retired_strategies: this.getStrategyByStatus('RETIRED').length,
      terminated_strategies: this.getStrategyByStatus('TERMINATED').length,
      average_vault_to_live: this.calculateAverageVaultToLive(),
      best_performing_strategy: bestPerformer?.strategy_id || 'NONE',
      vault_success_rate: Math.round(vaultSuccessRate * 100),
      total_vault_profit: Math.round(totalProfit * 10000) / 10000
    };
  }

  private calculateAverageVaultToLive(): number {
    const liveStrategies = this.getStrategyByStatus('LIVE');
    if (liveStrategies.length === 0) return 0;
    
    const totalDays = liveStrategies.reduce((sum, strategy) => {
      const days = (Date.now() - strategy.vault_entry_timestamp) / (24 * 60 * 60 * 1000);
      return sum + days;
    }, 0);
    
    return Math.round((totalDays / liveStrategies.length) * 10) / 10;
  }

  activateVault(): void {
    this.isVaultActive = true;
    this.autoPromotionEnabled = true;
    
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Strategy Vault activated - birth chamber ready for elite DNA',
      'Vault Activation',
      90
    );
  }

  deactivateVault(): void {
    this.isVaultActive = false;
    this.autoPromotionEnabled = false;
    
    waidesKIDailyReporter.logEmotionalState(
      'CALM',
      'Strategy Vault deactivated - elite promotion paused',
      'Vault Deactivation',
      70
    );
  }

  configureVault(config: {
    maxLiveStrategies?: number;
    autoPromotion?: boolean;
    vaultSecurity?: number;
  }): void {
    if (config.maxLiveStrategies) {
      this.maxLiveStrategies = Math.max(1, Math.min(10, config.maxLiveStrategies));
    }
    if (config.autoPromotion !== undefined) {
      this.autoPromotionEnabled = config.autoPromotion;
    }
    if (config.vaultSecurity) {
      this.vaultSecurity = Math.max(50, Math.min(100, config.vaultSecurity));
    }
  }

  exportVaultData(): any {
    return {
      vault_statistics: this.getVaultStatistics(),
      vaulted_strategies: this.getVaultedStrategies(),
      live_strategies: this.getLiveStrategies(),
      lifecycle_events: this.getLifecycleEvents(200),
      vault_config: {
        is_active: this.isVaultActive,
        auto_promotion_enabled: this.autoPromotionEnabled,
        max_live_strategies: this.maxLiveStrategies,
        vault_security: this.vaultSecurity
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIStrategyVault = new WaidesKIStrategyVault();