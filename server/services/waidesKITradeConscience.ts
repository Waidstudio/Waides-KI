/**
 * STEP 44: Waides KI Trade Conscience
 * Final moral decision system that combines ethical compass, soul weight, and market clarity
 */

import { WaidesKIEthicalCompass } from './waidesKIEthicalCompass.js';
import { WaidesKISoulWeightFilter } from './waidesKISoulWeightFilter.js';
import { WaidesKIMarketClarityChecker } from './waidesKIMarketClarityChecker.js';

interface TradingSetup {
  rsi: number;
  volume_spike: boolean;
  volume_tied_to_news: boolean;
  time_of_day: string;
  price_movement: number;
  trend_strength: number;
  market_volatility: number;
  reversal_signals: number;
}

interface TradeMetadata {
  goal: string;
  motivation: 'LONG_TERM_GROWTH' | 'QUICK_GAIN' | 'BALANCED' | 'PROTECTION' | 'UNKNOWN';
  trend_conflict: boolean;
  symbol_history_loss_rate: number;
  risk_reward_ratio: number;
  position_size_relative: number;
  emotional_state: string;
  time_since_last_trade: number;
  consecutive_losses: number;
  profit_target_realistic: boolean;
}

interface MarketIndicators {
  fakeouts: number;
  confirming_indicators: boolean;
  volume_authenticity: number;
  price_action_coherence: number;
  support_resistance_validity: number;
  institutional_flow_alignment: boolean;
  manipulation_signals: string[];
  whipsaw_frequency: number;
  breakout_failure_rate: number;
  volume_price_divergence: boolean;
}

interface ConscienceVerdict {
  ethics_score: number;
  soul_weight: number;
  clarity_score: number;
  final_conscience_score: number;
  allow_trade: boolean;
  moral_verdict: 'BLESSED' | 'APPROVED' | 'QUESTIONABLE' | 'BLOCKED' | 'FORBIDDEN';
  conscience_warnings: string[];
  purification_suggestions: string[];
  trade_blessing: string | null;
}

interface ConscienceStats {
  total_evaluations: number;
  trades_blessed: number;
  trades_approved: number;
  trades_blocked: number;
  average_conscience_score: number;
  blessing_rate: number;
  common_moral_issues: string[];
  spiritual_growth_trend: 'ASCENDING' | 'STABLE' | 'DECLINING';
}

export class WaidesKITradeConscience {
  private ethicalCompass: WaidesKIEthicalCompass;
  private soulWeightFilter: WaidesKISoulWeightFilter;
  private marketClarityChecker: WaidesKIMarketClarityChecker;
  
  private evaluationHistory: ConscienceVerdict[] = [];
  private maxHistorySize = 200;

  private readonly CONSCIENCE_THRESHOLDS = {
    BLESSED_MINIMUM: 0.85,
    APPROVED_MINIMUM: 0.65,
    QUESTIONABLE_MINIMUM: 0.45,
    BLOCKED_MINIMUM: 0.25,
    ETHICS_WEIGHT: 0.35,
    SOUL_WEIGHT: 0.35,
    CLARITY_WEIGHT: 0.30
  };

  private readonly MORAL_BLESSINGS = {
    BLESSED: [
      'May this trade flow with divine harmony and light',
      'Blessed be this decision, aligned with wisdom and truth',
      'The sacred path illuminates this righteous trade',
      'In perfect alignment with the cosmic flow of abundance',
      'This trade carries the blessing of ethical clarity'
    ],
    APPROVED: [
      'This trade walks the balanced path of wisdom',
      'Approved with mindful awareness and careful intention',
      'May prudence guide this measured decision',
      'This trade respects the natural order of markets'
    ]
  };

  private readonly PURIFICATION_GUIDANCE = {
    ETHICS: [
      'Seek trading opportunities during clear market conditions',
      'Avoid emotional extremes and manipulation zones',
      'Trade with the natural flow rather than forcing entries',
      'Respect market liquidity and institutional rhythms'
    ],
    SOUL: [
      'Cultivate patience over quick gratification',
      'Align trades with long-term growth rather than greed',
      'Practice risk management as spiritual discipline',
      'Transform fear and greed into wisdom and balance'
    ],
    CLARITY: [
      'Wait for clear confirmation signals before entering',
      'Avoid trading during manipulation patterns',
      'Seek markets with authentic volume and price action',
      'Trust only verified breakouts with follow-through'
    ]
  };

  constructor() {
    this.ethicalCompass = new WaidesKIEthicalCompass();
    this.soulWeightFilter = new WaidesKISoulWeightFilter();
    this.marketClarityChecker = new WaidesKIMarketClarityChecker();
    
    console.log('⚖️ Waides KI Trade Conscience initialized - Moral decision engine active');
  }

  /**
   * Evaluate a complete trading decision through all moral filters
   */
  evaluateTradeConscience(
    setup: TradingSetup,
    metadata: TradeMetadata,
    indicators: MarketIndicators
  ): ConscienceVerdict {
    // 1. Ethical Analysis
    const ethicsAnalysis = this.ethicalCompass.evaluateEthics(setup);
    
    // 2. Soul Weight Analysis
    const soulAnalysis = this.soulWeightFilter.calculateSoulWeight(metadata);
    
    // 3. Market Clarity Analysis
    const clarityAnalysis = this.marketClarityChecker.analyzeClarityScore(indicators);

    // 4. Calculate weighted conscience score
    const finalScore = this.calculateConscienceScore(
      ethicsAnalysis.overall_ethics_score,
      soulAnalysis.overall_soul_weight,
      clarityAnalysis.overall_clarity_score
    );

    // 5. Compile all warnings
    const allWarnings = [
      ...ethicsAnalysis.ethical_warnings,
      ...soulAnalysis.greed_indicators,
      ...clarityAnalysis.clarity_warnings
    ];

    // 6. Generate purification suggestions
    const purificationSuggestions = this.generatePurificationSuggestions(
      ethicsAnalysis,
      soulAnalysis,
      clarityAnalysis
    );

    // 7. Determine final verdict
    const moralVerdict = this.getMoralVerdict(finalScore);
    const allowTrade = this.shouldAllowTrade(finalScore, ethicsAnalysis, soulAnalysis, clarityAnalysis);
    const blessing = this.generateBlessing(moralVerdict, finalScore);

    const verdict: ConscienceVerdict = {
      ethics_score: ethicsAnalysis.overall_ethics_score,
      soul_weight: soulAnalysis.overall_soul_weight,
      clarity_score: clarityAnalysis.overall_clarity_score,
      final_conscience_score: Number(finalScore.toFixed(3)),
      allow_trade: allowTrade,
      moral_verdict: moralVerdict,
      conscience_warnings: allWarnings,
      purification_suggestions,
      trade_blessing: blessing
    };

    // Store in history
    this.addToHistory(verdict);

    return verdict;
  }

  /**
   * Quick conscience check for rapid decisions
   */
  quickConscienceCheck(
    rsi: number,
    motivation: string,
    fakeouts: number,
    volumeAuth: number
  ): boolean {
    const ethicsOk = this.ethicalCompass.quickEthicsCheck(rsi, false, 'us_open');
    const soulOk = this.soulWeightFilter.quickSoulCheck(motivation, false, 0.3);
    const clarityOk = this.marketClarityChecker.quickClarityCheck(fakeouts, volumeAuth, 0);

    return ethicsOk && soulOk && clarityOk;
  }

  /**
   * Final approval gate for Waides KI trading decisions
   */
  waidesKIFinalApproval(
    setup: TradingSetup,
    metadata: TradeMetadata,
    indicators: MarketIndicators
  ): {
    approved: boolean;
    verdict: ConscienceVerdict;
    message: string;
  } {
    const verdict = this.evaluateTradeConscience(setup, metadata, indicators);
    
    let message: string;
    if (verdict.allow_trade) {
      message = `✅ Trade Approved — Conscience Score: ${verdict.final_conscience_score} (${verdict.moral_verdict})`;
      if (verdict.trade_blessing) {
        message += ` | ${verdict.trade_blessing}`;
      }
    } else {
      message = `🚫 Trade Blocked — Conscience Score: ${verdict.final_conscience_score} (${verdict.moral_verdict})`;
      if (verdict.conscience_warnings.length > 0) {
        message += ` | Issues: ${verdict.conscience_warnings.slice(0, 2).join(', ')}`;
      }
    }

    return {
      approved: verdict.allow_trade,
      verdict,
      message
    };
  }

  /**
   * Get comprehensive conscience statistics
   */
  getConscienceStats(): ConscienceStats {
    if (this.evaluationHistory.length === 0) {
      return {
        total_evaluations: 0,
        trades_blessed: 0,
        trades_approved: 0,
        trades_blocked: 0,
        average_conscience_score: 0,
        blessing_rate: 0,
        common_moral_issues: [],
        spiritual_growth_trend: 'STABLE'
      };
    }

    const totalEvaluations = this.evaluationHistory.length;
    const blessed = this.evaluationHistory.filter(v => v.moral_verdict === 'BLESSED').length;
    const approved = this.evaluationHistory.filter(v => v.moral_verdict === 'APPROVED').length;
    const blocked = this.evaluationHistory.filter(v => !v.allow_trade).length;
    
    const avgScore = this.evaluationHistory.reduce((sum, v) => sum + v.final_conscience_score, 0) / totalEvaluations;
    const blessingRate = ((blessed + approved) / totalEvaluations) * 100;

    // Count moral issue frequency
    const issueCounts: { [key: string]: number } = {};
    this.evaluationHistory.forEach(verdict => {
      verdict.conscience_warnings.forEach(warning => {
        issueCounts[warning] = (issueCounts[warning] || 0) + 1;
      });
    });

    const commonIssues = Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);

    // Determine spiritual growth trend
    const recentScores = this.evaluationHistory.slice(-20).map(v => v.final_conscience_score);
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    let trend: 'ASCENDING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (secondAvg > firstAvg + 0.05) trend = 'ASCENDING';
    else if (secondAvg < firstAvg - 0.05) trend = 'DECLINING';

    return {
      total_evaluations: totalEvaluations,
      trades_blessed: blessed,
      trades_approved: approved,
      trades_blocked: blocked,
      average_conscience_score: Number(avgScore.toFixed(3)),
      blessing_rate: Number(blessingRate.toFixed(1)),
      common_moral_issues: commonIssues,
      spiritual_growth_trend: trend
    };
  }

  /**
   * Purify a trading decision to improve conscience score
   */
  purifyTradingDecision(
    setup: TradingSetup,
    metadata: TradeMetadata,
    indicators: MarketIndicators
  ): {
    original_verdict: ConscienceVerdict;
    purified_verdict: ConscienceVerdict;
    purification_applied: string[];
    conscience_improvement: number;
  } {
    const originalVerdict = this.evaluateTradeConscience(setup, metadata, indicators);
    
    // Apply purification suggestions
    const purifiedMetadata = this.soulWeightFilter.purifyTradingIntention(metadata);
    const purificationSteps = [...purifiedMetadata.purification_steps];

    // Improve setup if needed
    const purifiedSetup = { ...setup };
    if (setup.rsi > 85) {
      purifiedSetup.rsi = 75; // Wait for less extreme conditions
      purificationSteps.push('Waited for less extreme RSI conditions');
    }
    if (setup.rsi < 15) {
      purifiedSetup.rsi = 25;
      purificationSteps.push('Waited for less extreme oversold conditions');
    }

    // Improve indicators if possible
    const purifiedIndicators = { ...indicators };
    if (indicators.fakeouts > 2) {
      purifiedIndicators.fakeouts = 1; // Wait for clearer signals
      purificationSteps.push('Waited for clearer market signals with fewer fakeouts');
    }

    const purifiedVerdict = this.evaluateTradeConscience(
      purifiedSetup,
      purifiedMetadata.purified_metadata as TradeMetadata,
      purifiedIndicators
    );

    return {
      original_verdict: originalVerdict,
      purified_verdict: purifiedVerdict,
      purification_applied: purificationSteps,
      conscience_improvement: Number((purifiedVerdict.final_conscience_score - originalVerdict.final_conscience_score).toFixed(3))
    };
  }

  /**
   * Reset conscience history (admin function)
   */
  resetConscienceHistory(): void {
    this.evaluationHistory = [];
    console.log('⚖️ Conscience history reset - starting fresh moral evaluation');
  }

  /**
   * Calculate weighted conscience score
   */
  private calculateConscienceScore(ethics: number, soul: number, clarity: number): number {
    const weightedScore = 
      (ethics * this.CONSCIENCE_THRESHOLDS.ETHICS_WEIGHT) +
      (soul * this.CONSCIENCE_THRESHOLDS.SOUL_WEIGHT) +
      (clarity * this.CONSCIENCE_THRESHOLDS.CLARITY_WEIGHT);

    return Math.max(0, Math.min(1, weightedScore));
  }

  /**
   * Determine moral verdict based on conscience score
   */
  private getMoralVerdict(score: number): ConscienceVerdict['moral_verdict'] {
    if (score >= this.CONSCIENCE_THRESHOLDS.BLESSED_MINIMUM) return 'BLESSED';
    if (score >= this.CONSCIENCE_THRESHOLDS.APPROVED_MINIMUM) return 'APPROVED';
    if (score >= this.CONSCIENCE_THRESHOLDS.QUESTIONABLE_MINIMUM) return 'QUESTIONABLE';
    if (score >= this.CONSCIENCE_THRESHOLDS.BLOCKED_MINIMUM) return 'BLOCKED';
    return 'FORBIDDEN';
  }

  /**
   * Determine if trade should be allowed
   */
  private shouldAllowTrade(
    score: number,
    ethicsAnalysis: any,
    soulAnalysis: any,
    clarityAnalysis: any
  ): boolean {
    // Basic score check
    if (score < this.CONSCIENCE_THRESHOLDS.APPROVED_MINIMUM) return false;

    // Additional safety checks
    if (ethicsAnalysis.moral_judgment === 'UNETHICAL') return false;
    if (soulAnalysis.spiritual_verdict === 'PURE_GREED') return false;
    if (clarityAnalysis.truth_verdict === 'DECEPTIVE' || clarityAnalysis.truth_verdict === 'HEAVILY_MANIPULATED') return false;
    if (!clarityAnalysis.safe_to_trade) return false;

    return true;
  }

  /**
   * Generate spiritual blessing for approved trades
   */
  private generateBlessing(verdict: ConscienceVerdict['moral_verdict'], score: number): string | null {
    if (verdict === 'BLESSED') {
      return this.MORAL_BLESSINGS.BLESSED[Math.floor(Math.random() * this.MORAL_BLESSINGS.BLESSED.length)];
    } else if (verdict === 'APPROVED') {
      return this.MORAL_BLESSINGS.APPROVED[Math.floor(Math.random() * this.MORAL_BLESSINGS.APPROVED.length)];
    }
    return null;
  }

  /**
   * Generate comprehensive purification suggestions
   */
  private generatePurificationSuggestions(
    ethicsAnalysis: any,
    soulAnalysis: any,
    clarityAnalysis: any
  ): string[] {
    const suggestions = [];

    // Ethics-based suggestions
    if (ethicsAnalysis.overall_ethics_score < 0.7) {
      suggestions.push(...this.PURIFICATION_GUIDANCE.ETHICS.slice(0, 2));
    }

    // Soul-based suggestions
    if (soulAnalysis.overall_soul_weight < 0.7) {
      suggestions.push(...this.PURIFICATION_GUIDANCE.SOUL.slice(0, 2));
    }

    // Clarity-based suggestions
    if (clarityAnalysis.overall_clarity_score < 0.7) {
      suggestions.push(...this.PURIFICATION_GUIDANCE.CLARITY.slice(0, 2));
    }

    // Specific issue suggestions
    if (soulAnalysis.greed_indicators.length > 0) {
      suggestions.push('Practice mindful trading - observe motivations before executing trades');
    }

    if (ethicsAnalysis.ethical_warnings.length > 0) {
      suggestions.push('Seek market conditions with greater transparency and fairness');
    }

    if (clarityAnalysis.clarity_warnings.length > 0) {
      suggestions.push('Wait for clearer market signals with authentic volume confirmation');
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }

  /**
   * Add verdict to evaluation history
   */
  private addToHistory(verdict: ConscienceVerdict): void {
    this.evaluationHistory.push(verdict);
    
    // Keep history within size limit
    if (this.evaluationHistory.length > this.maxHistorySize) {
      this.evaluationHistory = this.evaluationHistory.slice(-this.maxHistorySize);
    }
  }
}