import { waidesKIHiddenVision } from './waidesKIHiddenVision';
import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKILiveFeed } from './waidesKILiveFeed';
import { waidesKISituationalIntelligence } from './waidesKISituationalIntelligence';

interface ShadowDNA {
  dna_id: string;
  ema_short: number;
  ema_long: number;
  rsi_entry: number;
  rsi_exit: number;
  volume_threshold: number;
  profit_target: number;
  stop_loss: number;
  time_window: number;
  creation_timestamp: number;
  mutation_generation: number;
  parent_dna_id?: string;
}

interface StrategyVariant {
  variant_id: string;
  dna: ShadowDNA;
  demo_score: number;
  win_rate: number;
  profit_loss: number;
  max_drawdown: number;
  risk_score: number;
  stability_score: number;
  vision_approval: boolean;
  konslang_blessing: string[];
  shadow_ranking: number;
  elite_status: 'ELITE' | 'PROMISING' | 'AVERAGE' | 'REJECTED';
  test_results: any;
}

interface ShadowLabSession {
  session_id: string;
  timestamp: number;
  generation_count: number;
  tested_variants: number;
  elite_discovered: number;
  vault_ready: number;
  session_duration: number;
  market_conditions: any;
  best_performing_dna: string;
  evolution_progress: number;
  darkness_level: number; // How deep in shadow evolution
}

interface EliteStrategy {
  strategy_id: string;
  dna: ShadowDNA;
  variant: StrategyVariant;
  vault_ready: boolean;
  vision_validated: boolean;
  konslang_blessed: boolean;
  deployment_ready: boolean;
  birth_timestamp: number;
  shadow_origin: string;
  elite_score: number;
  protection_level: number;
}

export class WaidesKIShadowLab {
  private generatedDNAs: ShadowDNA[] = [];
  private strategyVariants: StrategyVariant[] = [];
  private eliteStrategies: EliteStrategy[] = [];
  private shadowSessions: ShadowLabSession[] = [];
  private isLabActive: boolean = true;
  private currentDarknessLevel: number = 0;
  private evolutionGeneration: number = 1;
  private maxVariantsPerSession: number = 100;
  private eliteThreshold: number = 0.8;
  private vaultThreshold: number = 0.9;

  constructor() {
    this.startEvolutionCycle();
  }

  private startEvolutionCycle(): void {
    // Run evolution cycles every 2 hours
    setInterval(() => {
      this.runAutonomousEvolution();
    }, 2 * 60 * 60 * 1000);

    // Clean old data every 24 hours
    setInterval(() => {
      this.cleanOldSessions();
    }, 24 * 60 * 60 * 1000);
  }

  // CORE SHADOW DNA GENERATION
  private createRandomDNA(): ShadowDNA {
    const dnaId = this.generateDNAId();
    
    return {
      dna_id: dnaId,
      ema_short: 5 + Math.floor(Math.random() * 15), // 5-20
      ema_long: 21 + Math.floor(Math.random() * 79), // 21-100
      rsi_entry: 25 + Math.floor(Math.random() * 20), // 25-45
      rsi_exit: 55 + Math.floor(Math.random() * 20), // 55-75
      volume_threshold: 0.8 + Math.random() * 1.2, // 0.8-2.0x average
      profit_target: 0.015 + Math.random() * 0.035, // 1.5%-5%
      stop_loss: 0.008 + Math.random() * 0.012, // 0.8%-2%
      time_window: 15 + Math.floor(Math.random() * 105), // 15-120 minutes
      creation_timestamp: Date.now(),
      mutation_generation: this.evolutionGeneration
    };
  }

  private mutateDNA(parentDNA: ShadowDNA): ShadowDNA {
    const mutatedDNA: ShadowDNA = {
      ...parentDNA,
      dna_id: this.generateDNAId(),
      creation_timestamp: Date.now(),
      mutation_generation: parentDNA.mutation_generation + 1,
      parent_dna_id: parentDNA.dna_id
    };

    // Apply random mutations with 30% chance per parameter
    if (Math.random() < 0.3) {
      mutatedDNA.ema_short = Math.max(5, Math.min(20, parentDNA.ema_short + (Math.random() - 0.5) * 6));
    }
    if (Math.random() < 0.3) {
      mutatedDNA.ema_long = Math.max(21, Math.min(100, parentDNA.ema_long + (Math.random() - 0.5) * 20));
    }
    if (Math.random() < 0.3) {
      mutatedDNA.rsi_entry = Math.max(20, Math.min(50, parentDNA.rsi_entry + (Math.random() - 0.5) * 10));
    }
    if (Math.random() < 0.3) {
      mutatedDNA.rsi_exit = Math.max(50, Math.min(80, parentDNA.rsi_exit + (Math.random() - 0.5) * 10));
    }
    if (Math.random() < 0.3) {
      mutatedDNA.volume_threshold = Math.max(0.5, Math.min(3.0, parentDNA.volume_threshold + (Math.random() - 0.5) * 0.5));
    }

    return mutatedDNA;
  }

  // STRATEGY TESTING AND EVALUATION
  private async testStrategyVariant(dna: ShadowDNA): Promise<StrategyVariant> {
    const variantId = this.generateVariantId();
    
    try {
      // Run demo test through Hidden Vision Core
      const demoResult = await waidesKIHiddenVision.runDemoTest(
        `SHADOW_${variantId}`,
        dna.dna_id,
        60 // 1 hour demo test
      );
      
      // Calculate additional scores
      const riskScore = this.calculateRiskScore(dna, demoResult);
      const stabilityScore = this.calculateStabilityScore(demoResult);
      const shadowRanking = this.calculateShadowRanking(demoResult, riskScore, stabilityScore);
      
      // Get vision approval
      const visionApproval = await this.getVisionApproval(dna, demoResult);
      const konsLangBlessing = visionApproval.konslang_blessing || [];
      
      // Determine elite status
      const eliteStatus = this.determineEliteStatus(shadowRanking, demoResult.win_rate);
      
      const variant: StrategyVariant = {
        variant_id: variantId,
        dna: dna,
        demo_score: demoResult.confidence_score,
        win_rate: demoResult.win_rate,
        profit_loss: demoResult.total_return,
        max_drawdown: demoResult.max_drawdown,
        risk_score: riskScore,
        stability_score: stabilityScore,
        vision_approval: visionApproval.approved,
        konslang_blessing: konsLangBlessing,
        shadow_ranking: shadowRanking,
        elite_status: eliteStatus,
        test_results: demoResult
      };
      
      return variant;
      
    } catch (error) {
      console.error('Error testing strategy variant:', error);
      
      // Return failed variant
      return {
        variant_id: variantId,
        dna: dna,
        demo_score: 0,
        win_rate: 0,
        profit_loss: -1,
        max_drawdown: 1,
        risk_score: 100,
        stability_score: 0,
        vision_approval: false,
        konslang_blessing: [],
        shadow_ranking: 0,
        elite_status: 'REJECTED',
        test_results: { demo_passed: false, failure_reasons: ['Test execution failed'] }
      };
    }
  }

  private calculateRiskScore(dna: ShadowDNA, demoResult: any): number {
    // Lower score = lower risk (better)
    let riskScore = 0;
    
    // Drawdown risk
    riskScore += demoResult.max_drawdown * 100;
    
    // Parameter extremes risk
    if (dna.rsi_entry < 25 || dna.rsi_entry > 45) riskScore += 10;
    if (dna.rsi_exit < 55 || dna.rsi_exit > 75) riskScore += 10;
    if (dna.stop_loss > 0.02) riskScore += 15; // Too wide stop loss
    if (dna.profit_target < 0.015) riskScore += 10; // Too tight profit target
    
    // Win rate risk
    if (demoResult.win_rate < 0.6) riskScore += 20;
    
    return Math.min(100, Math.max(0, riskScore));
  }

  private calculateStabilityScore(demoResult: any): number {
    // Higher score = more stable (better)
    let stabilityScore = 50; // Base score
    
    // Win rate stability
    if (demoResult.win_rate > 0.7) stabilityScore += 20;
    if (demoResult.win_rate > 0.8) stabilityScore += 10;
    
    // Drawdown stability
    if (demoResult.max_drawdown < 0.02) stabilityScore += 15;
    if (demoResult.max_drawdown < 0.01) stabilityScore += 10;
    
    // Return consistency
    if (demoResult.total_return > 0.02) stabilityScore += 15;
    if (demoResult.total_return > 0.05) stabilityScore += 10;
    
    // Signal count (not too few, not too many)
    if (demoResult.total_signals >= 5 && demoResult.total_signals <= 15) {
      stabilityScore += 10;
    }
    
    return Math.min(100, Math.max(0, stabilityScore));
  }

  private calculateShadowRanking(demoResult: any, riskScore: number, stabilityScore: number): number {
    // Composite score from 0-100
    const winRateScore = demoResult.win_rate * 30;
    const returnScore = Math.min(20, Math.max(0, demoResult.total_return * 400)); // Scale 5% return to 20 points
    const riskPenalty = riskScore * 0.2; // Risk reduces ranking
    const stabilityBonus = stabilityScore * 0.3;
    
    const ranking = winRateScore + returnScore - riskPenalty + stabilityBonus;
    return Math.min(100, Math.max(0, ranking));
  }

  private determineEliteStatus(ranking: number, winRate: number): StrategyVariant['elite_status'] {
    if (ranking >= 90 && winRate >= 0.85) return 'ELITE';
    if (ranking >= 75 && winRate >= 0.75) return 'PROMISING';
    if (ranking >= 50 && winRate >= 0.6) return 'AVERAGE';
    return 'REJECTED';
  }

  private async getVisionApproval(dna: ShadowDNA, demoResult: any): Promise<{ approved: boolean; konslang_blessing?: string[] }> {
    try {
      // Create market context for vision prediction
      const marketContext = await this.createMarketContext();
      const predictions = await waidesKIHiddenVision.predictWithVision(marketContext);
      
      // Check for blocking predictions
      const blockingPredictions = predictions.filter(p => 
        p.prediction_type === 'CRASH_WARNING' || 
        (p.prediction_type === 'FUTURE_DOWN' && p.confidence_level > 80)
      );
      
      if (blockingPredictions.length > 0) {
        return { approved: false };
      }
      
      // Check for positive predictions
      const positivePredictions = predictions.filter(p => 
        p.prediction_type === 'FUTURE_UP' || 
        p.prediction_type === 'STABILITY'
      );
      
      const konsLangBlessing = positivePredictions.map(p => p.konslang_phrase);
      
      // Approve if demo passed and no blocking predictions
      const approved = demoResult.demo_passed && blockingPredictions.length === 0;
      
      return { approved, konslang_blessing: konsLangBlessing };
      
    } catch (error) {
      console.error('Error getting vision approval:', error);
      return { approved: false };
    }
  }

  private async createMarketContext(): Promise<any> {
    try {
      const ethData = await waidesKILiveFeed.getLatestEthData();
      const situationalContext = waidesKISituationalIntelligence.getCurrentContext();
      
      return {
        price: ethData.price,
        volume: ethData.volume,
        rsi: ethData.rsi || 50,
        ema_50: ethData.ema50 || ethData.price * 0.98,
        ema_200: ethData.ema200 || ethData.price * 0.95,
        momentum: 0.5 + (Math.random() - 0.5) * 0.4,
        volume_rise: ethData.volume > 1000000,
        buy_support: ethData.price > (ethData.ema50 || ethData.price * 0.98),
        market_zone: situationalContext.current_zone,
        volatility_regime: situationalContext.market_phase
      };
    } catch (error) {
      // Fallback context
      return {
        price: 2400,
        volume: 1000000,
        rsi: 50,
        ema_50: 2390,
        ema_200: 2380,
        momentum: 0.5,
        volume_rise: true,
        buy_support: true,
        market_zone: 'ACTIVE',
        volatility_regime: 'NORMAL'
      };
    }
  }

  // MAIN SHADOW LAB OPERATIONS
  async generateAndTestStrategies(count: number = 100): Promise<ShadowLabSession> {
    if (!this.isLabActive) {
      throw new Error('Shadow Lab is currently inactive');
    }

    const sessionId = this.generateSessionId();
    const startTime = Date.now();
    const marketConditions = await this.createMarketContext();
    
    // Enter deeper darkness for this session
    this.currentDarknessLevel = Math.min(10, this.currentDarknessLevel + 1);
    
    const newDNAs: ShadowDNA[] = [];
    const testedVariants: StrategyVariant[] = [];
    let eliteDiscovered = 0;
    let vaultReady = 0;
    
    try {
      // Generate base DNA pool
      for (let i = 0; i < Math.floor(count * 0.7); i++) {
        newDNAs.push(this.createRandomDNA());
      }
      
      // Generate mutations from existing elite strategies
      for (let i = 0; i < Math.floor(count * 0.3); i++) {
        const eliteStrategies = this.getTopEliteStrategies(10);
        if (eliteStrategies.length > 0) {
          const parentStrategy = eliteStrategies[Math.floor(Math.random() * eliteStrategies.length)];
          newDNAs.push(this.mutateDNA(parentStrategy.dna));
        } else {
          newDNAs.push(this.createRandomDNA());
        }
      }
      
      // Test all variants
      for (const dna of newDNAs) {
        const variant = await this.testStrategyVariant(dna);
        testedVariants.push(variant);
        
        if (variant.elite_status === 'ELITE' || variant.elite_status === 'PROMISING') {
          eliteDiscovered++;
          
          // Check if ready for vault
          if (variant.vision_approval && variant.shadow_ranking >= this.vaultThreshold * 100) {
            vaultReady++;
            await this.promoteToElite(variant);
          }
        }
      }
      
      // Store results
      this.generatedDNAs.push(...newDNAs);
      this.strategyVariants.push(...testedVariants);
      
      const sessionDuration = Date.now() - startTime;
      const evolutionProgress = (eliteDiscovered / count) * 100;
      
      const session: ShadowLabSession = {
        session_id: sessionId,
        timestamp: startTime,
        generation_count: count,
        tested_variants: testedVariants.length,
        elite_discovered: eliteDiscovered,
        vault_ready: vaultReady,
        session_duration: sessionDuration,
        market_conditions: marketConditions,
        best_performing_dna: this.findBestPerformingDNA(testedVariants),
        evolution_progress: evolutionProgress,
        darkness_level: this.currentDarknessLevel
      };
      
      this.shadowSessions.push(session);
      
      // Log session results
      waidesKIDailyReporter.recordLesson(
        `Shadow Lab evolution completed: ${eliteDiscovered} elite strategies discovered, ${vaultReady} vault-ready`,
        'EVOLUTION',
        'HIGH',
        'Shadow Lab'
      );
      
      // Advance generation
      this.evolutionGeneration++;
      
      return session;
      
    } catch (error) {
      console.error('Error in shadow lab generation:', error);
      throw error;
    }
  }

  private async promoteToElite(variant: StrategyVariant): Promise<void> {
    const eliteStrategy: EliteStrategy = {
      strategy_id: this.generateEliteId(),
      dna: variant.dna,
      variant: variant,
      vault_ready: true,
      vision_validated: variant.vision_approval,
      konslang_blessed: variant.konslang_blessing.length > 0,
      deployment_ready: variant.vision_approval && variant.shadow_ranking >= 90,
      birth_timestamp: Date.now(),
      shadow_origin: `GEN_${this.evolutionGeneration}_DARKNESS_${this.currentDarknessLevel}`,
      elite_score: variant.shadow_ranking,
      protection_level: this.calculateProtectionLevel(variant)
    };
    
    this.eliteStrategies.push(eliteStrategy);
    
    waidesKIDailyReporter.recordLesson(
      `Elite strategy born: ${eliteStrategy.strategy_id} with ${Math.round(eliteStrategy.elite_score)}% ranking`,
      'BIRTH',
      'HIGH',
      'Shadow Lab'
    );
  }

  private calculateProtectionLevel(variant: StrategyVariant): number {
    let protection = 50; // Base protection
    
    if (variant.vision_approval) protection += 20;
    if (variant.konslang_blessing.length > 0) protection += 15;
    if (variant.win_rate > 0.8) protection += 10;
    if (variant.max_drawdown < 0.015) protection += 5;
    
    return Math.min(100, protection);
  }

  private findBestPerformingDNA(variants: StrategyVariant[]): string {
    if (variants.length === 0) return 'NONE';
    
    const bestVariant = variants.reduce((best, current) => 
      current.shadow_ranking > best.shadow_ranking ? current : best
    );
    
    return bestVariant.dna.dna_id;
  }

  private async runAutonomousEvolution(): Promise<void> {
    if (!this.isLabActive) return;
    
    try {
      await this.generateAndTestStrategies(50); // Smaller autonomous runs
      
      waidesKIDailyReporter.recordLesson(
        'Autonomous shadow evolution cycle completed',
        'EVOLUTION',
        'MEDIUM',
        'Shadow Lab'
      );
      
    } catch (error) {
      console.error('Error in autonomous evolution:', error);
    }
  }

  // UTILITY METHODS
  private generateDNAId(): string {
    return `DNA_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateVariantId(): string {
    return `VAR_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateSessionId(): string {
    return `SHD_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateEliteId(): string {
    return `ELITE_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private cleanOldSessions(): void {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    this.shadowSessions = this.shadowSessions.filter(s => s.timestamp > sevenDaysAgo);
    this.strategyVariants = this.strategyVariants.filter(v => v.dna.creation_timestamp > sevenDaysAgo);
    
    // Keep elite strategies for longer (30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    this.eliteStrategies = this.eliteStrategies.filter(e => e.birth_timestamp > thirtyDaysAgo);
  }

  // PUBLIC INTERFACE METHODS
  getTopEliteStrategies(limit: number = 10): EliteStrategy[] {
    return this.eliteStrategies
      .sort((a, b) => b.elite_score - a.elite_score)
      .slice(0, limit);
  }

  getVaultReadyStrategies(): EliteStrategy[] {
    return this.eliteStrategies.filter(e => e.vault_ready && e.deployment_ready);
  }

  getDeploymentReadyStrategies(): EliteStrategy[] {
    return this.eliteStrategies.filter(e => e.deployment_ready);
  }

  getRecentSessions(limit: number = 10): ShadowLabSession[] {
    return this.shadowSessions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getShadowLabStatistics(): {
    lab_active: boolean;
    total_dna_generated: number;
    total_variants_tested: number;
    elite_strategies: number;
    vault_ready: number;
    deployment_ready: number;
    current_generation: number;
    darkness_level: number;
    best_elite_score: number;
    evolution_sessions: number;
  } {
    const vaultReady = this.eliteStrategies.filter(e => e.vault_ready).length;
    const deploymentReady = this.eliteStrategies.filter(e => e.deployment_ready).length;
    const bestEliteScore = this.eliteStrategies.length > 0 ? 
      Math.max(...this.eliteStrategies.map(e => e.elite_score)) : 0;
    
    return {
      lab_active: this.isLabActive,
      total_dna_generated: this.generatedDNAs.length,
      total_variants_tested: this.strategyVariants.length,
      elite_strategies: this.eliteStrategies.length,
      vault_ready: vaultReady,
      deployment_ready: deploymentReady,
      current_generation: this.evolutionGeneration,
      darkness_level: this.currentDarknessLevel,
      best_elite_score: Math.round(bestEliteScore),
      evolution_sessions: this.shadowSessions.length
    };
  }

  getEliteByScore(minScore: number = 80): EliteStrategy[] {
    return this.eliteStrategies.filter(e => e.elite_score >= minScore);
  }

  getStrategyLineage(strategyId: string): ShadowDNA[] {
    const lineage: ShadowDNA[] = [];
    let currentDNA = this.generatedDNAs.find(d => d.dna_id === strategyId);
    
    while (currentDNA) {
      lineage.push(currentDNA);
      if (currentDNA.parent_dna_id) {
        currentDNA = this.generatedDNAs.find(d => d.dna_id === currentDNA!.parent_dna_id);
      } else {
        break;
      }
    }
    
    return lineage;
  }

  activateLab(): void {
    this.isLabActive = true;
    this.currentDarknessLevel = 1;
    
    waidesKIDailyReporter.logEmotionalState(
      'FOCUSED',
      'Shadow Lab activated - entering darkness to birth genius',
      'Shadow Lab Activation',
      85
    );
  }

  deactivateLab(): void {
    this.isLabActive = false;
    this.currentDarknessLevel = 0;
    
    waidesKIDailyReporter.logEmotionalState(
      'CALM',
      'Shadow Lab deactivated - evolution paused',
      'Shadow Lab Deactivation',
      70
    );
  }

  setEvolutionParameters(params: {
    maxVariantsPerSession?: number;
    eliteThreshold?: number;
    vaultThreshold?: number;
  }): void {
    if (params.maxVariantsPerSession) {
      this.maxVariantsPerSession = Math.max(10, Math.min(500, params.maxVariantsPerSession));
    }
    if (params.eliteThreshold) {
      this.eliteThreshold = Math.max(0.5, Math.min(0.95, params.eliteThreshold));
    }
    if (params.vaultThreshold) {
      this.vaultThreshold = Math.max(0.7, Math.min(0.99, params.vaultThreshold));
    }
  }

  exportShadowLabData(): any {
    return {
      shadow_lab_statistics: this.getShadowLabStatistics(),
      elite_strategies: this.getTopEliteStrategies(20),
      vault_ready_strategies: this.getVaultReadyStrategies(),
      deployment_ready_strategies: this.getDeploymentReadyStrategies(),
      recent_sessions: this.getRecentSessions(10),
      evolution_config: {
        max_variants_per_session: this.maxVariantsPerSession,
        elite_threshold: this.eliteThreshold,
        vault_threshold: this.vaultThreshold,
        current_generation: this.evolutionGeneration,
        darkness_level: this.currentDarknessLevel
      },
      export_timestamp: new Date().toISOString()
    };
  }
}

export const waidesKIShadowLab = new WaidesKIShadowLab();