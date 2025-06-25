import { waidesKIDailyReporter } from './waidesKIDailyReporter';
import { waidesKIDNAEngine } from './waidesKIDNAEngine';

interface DNAResult {
  dna_id: string;
  result: 'WIN' | 'LOSS' | 'PENDING';
  timestamp: number;
  profit_loss: number;
  confidence: number;
  market_conditions: any;
  strategy_engine: string;
}

interface DNAPerformance {
  dna_id: string;
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  avg_profit: number;
  max_drawdown: number;
  consistency_score: number;
  last_trade: number;
  is_stable: boolean;
  is_dangerous: boolean;
  ban_count: number;
}

interface DNAAnomaly {
  dna_id: string;
  anomaly_type: 'SUDDEN_FAILURE' | 'PERFORMANCE_DEGRADATION' | 'CLONE_VIRUS' | 'UNSTABLE_MUTATION' | 'FAKE_SUCCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detection_timestamp: number;
  evidence: string[];
  confidence: number;
  recommended_action: 'MONITOR' | 'QUARANTINE' | 'BAN' | 'INVESTIGATE';
}

interface DNAFirewallRule {
  rule_id: string;
  dna_pattern: string;
  action: 'BLOCK' | 'QUARANTINE' | 'MONITOR' | 'ANALYZE';
  reason: string;
  created_timestamp: number;
  triggered_count: number;
  is_active: boolean;
}

export class WaidesKISignatureTracker {
  private dnaResults: Map<string, DNAResult[]> = new Map();
  private dnaPerformance: Map<string, DNAPerformance> = new Map();
  private detectedAnomalies: DNAAnomaly[] = [];
  private firewallRules: Map<string, DNAFirewallRule> = new Map();
  private blockedDNAList: Set<string> = new Set();
  private maxResultHistory: number = 200;

  constructor() {
    this.initializeTracker();
    this.setupFirewallRules();
  }

  private initializeTracker(): void {
    // Run analysis every 5 minutes
    setInterval(() => {
      this.performPerformanceAnalysis();
      this.detectAnomalies();
      this.updateFirewallRules();
    }, 5 * 60 * 1000);

    // Cleanup old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);
  }

  private setupFirewallRules(): void {
    // Default firewall rules
    const defaultRules: Omit<DNAFirewallRule, 'rule_id' | 'created_timestamp' | 'triggered_count'>[] = [
      {
        dna_pattern: 'RISK_LEVEL:CRITICAL',
        action: 'QUARANTINE',
        reason: 'Critical risk level DNA requires careful monitoring',
        is_active: true
      },
      {
        dna_pattern: 'CATEGORY:OVERBOUGHT_CONTINUATION',
        action: 'MONITOR',
        reason: 'Overbought continuation patterns need close observation',
        is_active: true
      },
      {
        dna_pattern: 'MUTATION_COUNT:>5',
        action: 'ANALYZE',
        reason: 'Highly mutated DNA patterns may be unstable',
        is_active: true
      }
    ];

    defaultRules.forEach((rule, index) => {
      const ruleId = `DEFAULT_${index + 1}`;
      this.firewallRules.set(ruleId, {
        rule_id: ruleId,
        created_timestamp: Date.now(),
        triggered_count: 0,
        ...rule
      });
    });
  }

  // CORE DNA RESULT TRACKING
  recordResult(dnaId: string, result: 'WIN' | 'LOSS' | 'PENDING', profitLoss: number, confidence: number, marketConditions: any, strategyEngine: string): void {
    const dnaResult: DNAResult = {
      dna_id: dnaId,
      result,
      timestamp: Date.now(),
      profit_loss: profitLoss,
      confidence,
      market_conditions: marketConditions,
      strategy_engine: strategyEngine
    };

    // Add to results history
    if (!this.dnaResults.has(dnaId)) {
      this.dnaResults.set(dnaId, []);
    }
    
    const results = this.dnaResults.get(dnaId)!;
    results.push(dnaResult);
    
    // Maintain history size
    if (results.length > this.maxResultHistory) {
      results.splice(0, results.length - this.maxResultHistory);
    }

    // Update performance metrics
    this.updateDNAPerformance(dnaId);

    // Check firewall rules
    this.checkFirewallRules(dnaId);

    // Log significant results
    if (result === 'LOSS' && profitLoss < -50) {
      waidesKIDailyReporter.recordLesson(
        `Significant loss recorded for DNA ${dnaId}: ${profitLoss.toFixed(2)}`,
        'PATTERN',
        'HIGH',
        'DNA Signature Tracker'
      );
    }
  }

  private updateDNAPerformance(dnaId: string): void {
    const results = this.dnaResults.get(dnaId) || [];
    if (results.length === 0) return;

    const completedResults = results.filter(r => r.result !== 'PENDING');
    const wins = completedResults.filter(r => r.result === 'WIN').length;
    const losses = completedResults.filter(r => r.result === 'LOSS').length;
    const totalTrades = completedResults.length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
    
    const totalPnl = completedResults.reduce((sum, r) => sum + r.profit_loss, 0);
    const avgProfit = totalTrades > 0 ? totalPnl / totalTrades : 0;
    
    // Calculate max drawdown
    let maxDrawdown = 0;
    let runningPnl = 0;
    let peak = 0;
    
    for (const result of completedResults) {
      runningPnl += result.profit_loss;
      if (runningPnl > peak) peak = runningPnl;
      const drawdown = peak - runningPnl;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    }

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(completedResults);

    // Determine stability and danger status
    const isStable = this.isDNAStable(dnaId, results);
    const isDangerous = this.isDNADangerous(dnaId, results);

    const performance: DNAPerformance = {
      dna_id: dnaId,
      total_trades: totalTrades,
      wins,
      losses,
      win_rate: winRate,
      total_pnl: totalPnl,
      avg_profit: avgProfit,
      max_drawdown: maxDrawdown,
      consistency_score: consistencyScore,
      last_trade: results[results.length - 1].timestamp,
      is_stable: isStable,
      is_dangerous: isDangerous,
      ban_count: this.blockedDNAList.has(dnaId) ? 1 : 0
    };

    this.dnaPerformance.set(dnaId, performance);
  }

  private calculateConsistencyScore(results: DNAResult[]): number {
    if (results.length < 3) return 50; // Not enough data

    const profits = results.map(r => r.profit_loss);
    const mean = profits.reduce((sum, p) => sum + p, 0) / profits.length;
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / profits.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    const consistencyScore = Math.max(0, 100 - (stdDev / Math.abs(mean)) * 100);
    return Math.min(100, consistencyScore);
  }

  // DNA STABILITY AND DANGER ASSESSMENT
  isDNAStable(dnaId: string, results?: DNAResult[]): boolean {
    const dnaResults = results || this.dnaResults.get(dnaId) || [];
    const recentResults = dnaResults.slice(-10); // Last 10 trades
    
    if (recentResults.length < 5) return false; // Not enough data
    
    const completedResults = recentResults.filter(r => r.result !== 'PENDING');
    const winRate = completedResults.filter(r => r.result === 'WIN').length / completedResults.length;
    
    // Stable if: win rate > 60%, consistent performance, no recent major losses
    const hasConsistentPerformance = completedResults.every(r => Math.abs(r.profit_loss) < 100);
    const hasNoRecentMajorLosses = !completedResults.some(r => r.result === 'LOSS' && r.profit_loss < -50);
    
    return winRate > 0.6 && hasConsistentPerformance && hasNoRecentMajorLosses;
  }

  isDNADangerous(dnaId: string, results?: DNAResult[]): boolean {
    const dnaResults = results || this.dnaResults.get(dnaId) || [];
    const recentResults = dnaResults.slice(-5); // Last 5 trades
    
    if (recentResults.length < 3) return false;
    
    const completedResults = recentResults.filter(r => r.result !== 'PENDING');
    const lossCount = completedResults.filter(r => r.result === 'LOSS').length;
    const majorLossCount = completedResults.filter(r => r.result === 'LOSS' && r.profit_loss < -30).length;
    
    // Dangerous if: 3+ recent losses or 2+ major losses
    return lossCount >= 3 || majorLossCount >= 2;
  }

  isUnstable(dnaId: string): boolean {
    const results = this.dnaResults.get(dnaId) || [];
    const recent = results.slice(-5);
    const losses = recent.filter(r => r.result === 'LOSS').length;
    
    return recent.length >= 3 && losses >= 3;
  }

  // ANOMALY DETECTION SYSTEM
  private performPerformanceAnalysis(): void {
    for (const [dnaId, performance] of this.dnaPerformance.entries()) {
      this.analyzePerformanceAnomalies(dnaId, performance);
    }
  }

  private analyzePerformanceAnomalies(dnaId: string, performance: DNAPerformance): void {
    const anomalies: DNAAnomaly[] = [];
    
    // Sudden failure detection
    if (performance.total_trades >= 10 && performance.win_rate < 30 && performance.avg_profit < -20) {
      anomalies.push({
        dna_id: dnaId,
        anomaly_type: 'SUDDEN_FAILURE',
        severity: 'HIGH',
        detection_timestamp: Date.now(),
        evidence: [`Win rate: ${performance.win_rate.toFixed(1)}%`, `Avg profit: ${performance.avg_profit.toFixed(2)}`],
        confidence: 90,
        recommended_action: 'BAN'
      });
    }

    // Performance degradation
    if (performance.consistency_score < 30 && performance.max_drawdown > 100) {
      anomalies.push({
        dna_id: dnaId,
        anomaly_type: 'PERFORMANCE_DEGRADATION',
        severity: 'MEDIUM',
        detection_timestamp: Date.now(),
        evidence: [`Consistency: ${performance.consistency_score.toFixed(1)}`, `Max drawdown: ${performance.max_drawdown.toFixed(2)}`],
        confidence: 75,
        recommended_action: 'QUARANTINE'
      });
    }

    // Add anomalies to detection list
    anomalies.forEach(anomaly => {
      this.detectedAnomalies.push(anomaly);
      
      waidesKIDailyReporter.recordLesson(
        `DNA anomaly detected: ${anomaly.anomaly_type} in ${dnaId}`,
        'RISK',
        anomaly.severity === 'HIGH' || anomaly.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        'Signature Tracker'
      );
    });
  }

  private detectAnomalies(): void {
    // Check for clone virus patterns
    this.detectCloneVirus();
    
    // Check for unstable mutations
    this.detectUnstableMutations();
    
    // Check for fake success patterns
    this.detectFakeSuccess();
  }

  private detectCloneVirus(): void {
    const dnaInfos = waidesKIDNAEngine.getAllRegisteredDNA();
    
    for (const dnaInfo of dnaInfos) {
      const clones = waidesKIDNAEngine.detectClones(dnaInfo.dna_id, 95);
      
      if (clones.length > 2) { // Multiple clones detected
        const isDangerous = clones.some(cloneId => this.isDNADangerous(cloneId));
        
        if (isDangerous) {
          this.detectedAnomalies.push({
            dna_id: dnaInfo.dna_id,
            anomaly_type: 'CLONE_VIRUS',
            severity: 'CRITICAL',
            detection_timestamp: Date.now(),
            evidence: [`${clones.length} clones detected`, 'Dangerous performance in clone family'],
            confidence: 95,
            recommended_action: 'BAN'
          });
        }
      }
    }
  }

  private detectUnstableMutations(): void {
    const mutationHistory = waidesKIDNAEngine.getMutationHistory();
    const recentMutations = mutationHistory.filter(m => Date.now() - m.timestamp < 24 * 60 * 60 * 1000);
    
    const mutationCounts = new Map<string, number>();
    recentMutations.forEach(mutation => {
      mutationCounts.set(mutation.original_dna, (mutationCounts.get(mutation.original_dna) || 0) + 1);
    });
    
    for (const [dnaId, count] of mutationCounts.entries()) {
      if (count > 5) { // Too many mutations in 24 hours
        this.detectedAnomalies.push({
          dna_id: dnaId,
          anomaly_type: 'UNSTABLE_MUTATION',
          severity: 'HIGH',
          detection_timestamp: Date.now(),
          evidence: [`${count} mutations in 24 hours`],
          confidence: 85,
          recommended_action: 'QUARANTINE'
        });
      }
    }
  }

  private detectFakeSuccess(): void {
    for (const [dnaId, performance] of this.dnaPerformance.entries()) {
      if (performance.win_rate > 90 && performance.total_trades < 5) {
        // Suspiciously high win rate with low trade count
        this.detectedAnomalies.push({
          dna_id: dnaId,
          anomaly_type: 'FAKE_SUCCESS',
          severity: 'MEDIUM',
          detection_timestamp: Date.now(),
          evidence: [`${performance.win_rate.toFixed(1)}% win rate`, `Only ${performance.total_trades} trades`],
          confidence: 70,
          recommended_action: 'MONITOR'
        });
      }
    }
  }

  // FIREWALL SYSTEM
  private checkFirewallRules(dnaId: string): void {
    const dnaInfo = waidesKIDNAEngine.getDNAInfo(dnaId);
    const performance = this.dnaPerformance.get(dnaId);
    
    for (const rule of this.firewallRules.values()) {
      if (!rule.is_active) continue;
      
      if (this.matchesFirewallRule(rule, dnaInfo, performance)) {
        rule.triggered_count++;
        this.executeFirewallAction(rule, dnaId);
      }
    }
  }

  private matchesFirewallRule(rule: DNAFirewallRule, dnaInfo: any, performance?: DNAPerformance): boolean {
    const pattern = rule.dna_pattern;
    
    if (pattern.startsWith('RISK_LEVEL:') && dnaInfo) {
      const riskLevel = pattern.split(':')[1];
      return dnaInfo.risk_level === riskLevel;
    }
    
    if (pattern.startsWith('CATEGORY:') && dnaInfo) {
      const category = pattern.split(':')[1];
      return dnaInfo.strategy_category === category;
    }
    
    if (pattern.startsWith('MUTATION_COUNT:') && dnaInfo) {
      const condition = pattern.split(':')[1];
      const threshold = parseInt(condition.replace('>', ''));
      return dnaInfo.mutation_count > threshold;
    }
    
    return false;
  }

  private executeFirewallAction(rule: DNAFirewallRule, dnaId: string): void {
    switch (rule.action) {
      case 'BLOCK':
        this.blockedDNAList.add(dnaId);
        waidesKIDailyReporter.logEmotionalState('CAUTIOUS', `DNA ${dnaId} blocked by firewall`, 'Security', 80);
        break;
      case 'QUARANTINE':
        // Mark for special monitoring
        waidesKIDailyReporter.recordLesson(`DNA ${dnaId} quarantined: ${rule.reason}`, 'RISK', 'MEDIUM', 'DNA Firewall');
        break;
      case 'MONITOR':
        // Increase monitoring frequency
        break;
      case 'ANALYZE':
        // Trigger deep analysis
        break;
    }
  }

  addFirewallRule(pattern: string, action: DNAFirewallRule['action'], reason: string): string {
    const ruleId = `CUSTOM_${Date.now()}`;
    
    this.firewallRules.set(ruleId, {
      rule_id: ruleId,
      dna_pattern: pattern,
      action,
      reason,
      created_timestamp: Date.now(),
      triggered_count: 0,
      is_active: true
    });
    
    return ruleId;
  }

  private updateFirewallRules(): void {
    // Auto-create rules based on detected anomalies
    const recentAnomalies = this.detectedAnomalies.filter(a => 
      Date.now() - a.detection_timestamp < 60 * 60 * 1000 // Last hour
    );
    
    for (const anomaly of recentAnomalies) {
      if (anomaly.severity === 'CRITICAL' && anomaly.recommended_action === 'BAN') {
        const pattern = `DNA_ID:${anomaly.dna_id}`;
        const existingRule = Array.from(this.firewallRules.values())
          .find(rule => rule.dna_pattern === pattern);
        
        if (!existingRule) {
          this.addFirewallRule(pattern, 'BLOCK', `Auto-generated from ${anomaly.anomaly_type} anomaly`);
        }
      }
    }
  }

  // PUBLIC INTERFACE METHODS
  getHistory(dnaId: string): DNAResult[] {
    return this.dnaResults.get(dnaId) || [];
  }

  getDNAPerformance(dnaId: string): DNAPerformance | null {
    return this.dnaPerformance.get(dnaId) || null;
  }

  getAllPerformances(): DNAPerformance[] {
    return Array.from(this.dnaPerformance.values());
  }

  getDetectedAnomalies(): DNAAnomaly[] {
    return [...this.detectedAnomalies];
  }

  getFirewallRules(): DNAFirewallRule[] {
    return Array.from(this.firewallRules.values());
  }

  isBlocked(dnaId: string): boolean {
    return this.blockedDNAList.has(dnaId);
  }

  unblockDNA(dnaId: string): boolean {
    return this.blockedDNAList.delete(dnaId);
  }

  getTopPerformingDNA(limit: number = 10): DNAPerformance[] {
    return Array.from(this.dnaPerformance.values())
      .filter(p => p.total_trades >= 5)
      .sort((a, b) => b.win_rate - a.win_rate)
      .slice(0, limit);
  }

  getWorstPerformingDNA(limit: number = 10): DNAPerformance[] {
    return Array.from(this.dnaPerformance.values())
      .filter(p => p.total_trades >= 5)
      .sort((a, b) => a.win_rate - b.win_rate)
      .slice(0, limit);
  }

  getDNAStatistics(): {
    total_dna_tracked: number;
    blocked_dna_count: number;
    stable_dna_count: number;
    dangerous_dna_count: number;
    anomalies_detected: number;
    firewall_rules_active: number;
  } {
    const stableDNACount = Array.from(this.dnaPerformance.values())
      .filter(p => p.is_stable).length;
    
    const dangerousDNACount = Array.from(this.dnaPerformance.values())
      .filter(p => p.is_dangerous).length;
    
    const activeRulesCount = Array.from(this.firewallRules.values())
      .filter(r => r.is_active).length;
    
    return {
      total_dna_tracked: this.dnaPerformance.size,
      blocked_dna_count: this.blockedDNAList.size,
      stable_dna_count: stableDNACount,
      dangerous_dna_count: dangerousDNACount,
      anomalies_detected: this.detectedAnomalies.length,
      firewall_rules_active: activeRulesCount
    };
  }

  // CLEANUP AND MAINTENANCE
  private cleanupOldData(): void {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    // Clean up old anomalies
    this.detectedAnomalies = this.detectedAnomalies.filter(a => 
      a.detection_timestamp > thirtyDaysAgo
    );
    
    // Clean up old DNA results
    for (const [dnaId, results] of this.dnaResults.entries()) {
      const recentResults = results.filter(r => r.timestamp > thirtyDaysAgo);
      if (recentResults.length === 0) {
        this.dnaResults.delete(dnaId);
        this.dnaPerformance.delete(dnaId);
      } else {
        this.dnaResults.set(dnaId, recentResults);
      }
    }
  }

  exportSignatureData(): any {
    return {
      dna_results: Object.fromEntries(this.dnaResults),
      dna_performance: Object.fromEntries(this.dnaPerformance),
      detected_anomalies: this.detectedAnomalies,
      firewall_rules: Object.fromEntries(this.firewallRules),
      blocked_dna: Array.from(this.blockedDNAList),
      statistics: this.getDNAStatistics(),
      export_timestamp: new Date().toISOString()
    };
  }

  resetSignatureTracker(): void {
    this.dnaResults.clear();
    this.dnaPerformance.clear();
    this.detectedAnomalies.length = 0;
    this.blockedDNAList.clear();
    // Keep firewall rules but reset their trigger counts
    for (const rule of this.firewallRules.values()) {
      rule.triggered_count = 0;
    }
  }
}

export const waidesKISignatureTracker = new WaidesKISignatureTracker();