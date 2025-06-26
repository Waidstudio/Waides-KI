/**
 * MODULE 2 — Sentry Interpreter
 * Translates low-level order data into higher-level feelings
 */

export class WaidesKIOrderBookInterpreter {
  private pressureMapping: Map<string, string>;

  constructor() {
    this.initializePressureMapping();
  }

  /**
   * Initialize pressure to feeling mapping
   */
  private initializePressureMapping(): void {
    this.pressureMapping = new Map([
      ['buy_pressure', 'crowd gathering — ETH ready to rise'],
      ['sell_pressure', 'crowd leaving — ETH preparing to descend'],
      ['balanced', 'neutral field — no movement'],
      ['neutral', 'mute signal']
    ]);
  }

  /**
   * Interpret order book pressure into human-readable description
   */
  interpret(pressure: string): string {
    return this.pressureMapping.get(pressure) || 'mute signal';
  }

  /**
   * Get enhanced interpretation with market context
   */
  interpretEnhanced(pressure: string, analytics: any): {
    basic_description: string;
    crowd_behavior: string;
    trading_implication: string;
    confidence: number;
  } {
    const basicDescription = this.interpret(pressure);
    
    let crowdBehavior = '';
    let tradingImplication = '';
    let confidence = 50;

    switch (pressure) {
      case 'buy_pressure':
        crowdBehavior = 'Buyers are stepping in with size, creating demand walls';
        tradingImplication = 'Consider long positions, momentum building upward';
        confidence = this.calculateConfidence(analytics, 'bullish');
        break;
        
      case 'sell_pressure':
        crowdBehavior = 'Sellers are unloading positions, creating supply walls';
        tradingImplication = 'Consider short positions, momentum building downward';
        confidence = this.calculateConfidence(analytics, 'bearish');
        break;
        
      case 'balanced':
        crowdBehavior = 'Equal buying and selling interest, market in equilibrium';
        tradingImplication = 'Wait for clearer directional bias before trading';
        confidence = this.calculateConfidence(analytics, 'neutral');
        break;
        
      default:
        crowdBehavior = 'Insufficient data to determine crowd behavior';
        tradingImplication = 'Avoid trading until order flow becomes clear';
        confidence = 20;
    }

    return {
      basic_description: basicDescription,
      crowd_behavior: crowdBehavior,
      trading_implication: tradingImplication,
      confidence
    };
  }

  /**
   * Calculate confidence based on order book analytics
   */
  private calculateConfidence(analytics: any, bias: 'bullish' | 'bearish' | 'neutral'): number {
    if (!analytics) return 30;

    let confidence = 50;

    // Factor in liquidity ratio strength
    if (analytics.liquidity_ratio) {
      const ratio = analytics.liquidity_ratio;
      if (bias === 'bullish' && ratio > 1.2) confidence += 20;
      if (bias === 'bearish' && ratio < 0.8) confidence += 20;
      if (bias === 'neutral' && ratio >= 0.9 && ratio <= 1.1) confidence += 15;
    }

    // Factor in trade flow bias
    if (analytics.flow_bias) {
      const flowBias = Math.abs(analytics.flow_bias);
      if (flowBias > 0.3) confidence += 15;
      if (flowBias > 0.5) confidence += 10;
    }

    // Factor in data quality
    if (analytics.trade_flow_summary?.total_trades > 30) confidence += 10;
    if (analytics.recent_bids?.length > 3 && analytics.recent_asks?.length > 3) confidence += 5;

    return Math.min(95, Math.max(20, confidence));
  }

  /**
   * Generate narrative description of market sentiment
   */
  generateOrderBookNarrative(pressure: string, analytics: any): string {
    const enhanced = this.interpretEnhanced(pressure, analytics);
    
    let narrative = `The order book reveals ${enhanced.basic_description}. `;
    narrative += `${enhanced.crowd_behavior}. `;
    
    if (analytics?.trade_flow_summary) {
      const { buy_trades, sell_trades, total_trades } = analytics.trade_flow_summary;
      const buyPercentage = Math.round((buy_trades / total_trades) * 100);
      narrative += `Recent trade flow shows ${buyPercentage}% buying vs ${100 - buyPercentage}% selling activity. `;
    }

    if (analytics?.liquidity_ratio) {
      const ratio = analytics.liquidity_ratio;
      if (ratio > 1.2) {
        narrative += 'Bid liquidity significantly outweighs ask liquidity, suggesting strong support. ';
      } else if (ratio < 0.8) {
        narrative += 'Ask liquidity dominates bid liquidity, indicating potential resistance. ';
      } else {
        narrative += 'Bid and ask liquidity are relatively balanced. ';
      }
    }

    narrative += enhanced.trading_implication;
    
    return narrative;
  }

  /**
   * Check if order book pressure aligns with intended trade direction
   */
  checkOrderBookAlignment(intendedAction: string, pressure: string): {
    aligned: boolean;
    confidence: number;
    recommendation: string;
  } {
    let aligned = false;
    let confidence = 0;
    let recommendation = '';

    const action = intendedAction.toUpperCase();

    if ((action.includes('BUY') || action.includes('LONG')) && pressure === 'buy_pressure') {
      aligned = true;
      confidence = 85;
      recommendation = 'Order book supports bullish action - crowd is gathering';
    } else if ((action.includes('SELL') || action.includes('SHORT')) && pressure === 'sell_pressure') {
      aligned = true;
      confidence = 85;
      recommendation = 'Order book supports bearish action - crowd is leaving';
    } else if (pressure === 'balanced') {
      aligned = false;
      confidence = 30;
      recommendation = 'Order book shows no clear bias - wait for directional clarity';
    } else {
      aligned = false;
      confidence = 20;
      recommendation = 'Order book pressure opposes intended action - consider contrarian timing';
    }

    return { aligned, confidence, recommendation };
  }

  /**
   * Generate trading advice based on order book interpretation
   */
  getTradingAdvice(pressure: string, analytics: any): {
    action: string;
    strength: string;
    reasoning: string;
    risk_warning?: string;
  } {
    const enhanced = this.interpretEnhanced(pressure, analytics);
    
    if (enhanced.confidence < 40) {
      return {
        action: 'WAIT',
        strength: 'NONE',
        reasoning: 'Order book signals unclear, insufficient confidence for trading',
        risk_warning: 'Low data quality or conflicting signals detected'
      };
    }

    switch (pressure) {
      case 'buy_pressure':
        return {
          action: 'BUY',
          strength: enhanced.confidence > 70 ? 'STRONG' : 'MODERATE',
          reasoning: enhanced.trading_implication,
          risk_warning: enhanced.confidence < 60 ? 'Moderate confidence, use smaller position size' : undefined
        };
        
      case 'sell_pressure':
        return {
          action: 'SELL',
          strength: enhanced.confidence > 70 ? 'STRONG' : 'MODERATE',
          reasoning: enhanced.trading_implication,
          risk_warning: enhanced.confidence < 60 ? 'Moderate confidence, use smaller position size' : undefined
        };
        
      default:
        return {
          action: 'WAIT',
          strength: 'NONE',
          reasoning: enhanced.trading_implication,
          risk_warning: 'Balanced or unclear order book pressure'
        };
    }
  }

  /**
   * Get comprehensive order book sentiment analysis
   */
  getComprehensiveAnalysis(pressure: string, analytics: any): {
    interpretation: any;
    narrative: string;
    trading_advice: any;
    alignment_checker: any;
    confidence_breakdown: any;
  } {
    const interpretation = this.interpretEnhanced(pressure, analytics);
    const narrative = this.generateOrderBookNarrative(pressure, analytics);
    const trading_advice = this.getTradingAdvice(pressure, analytics);
    
    // Create alignment checker function
    const alignment_checker = (intendedAction: string) => 
      this.checkOrderBookAlignment(intendedAction, pressure);

    const confidence_breakdown = {
      base_confidence: 50,
      liquidity_factor: analytics?.liquidity_ratio ? 15 : 0,
      flow_bias_factor: analytics?.flow_bias ? Math.abs(analytics.flow_bias) * 25 : 0,
      data_quality_factor: analytics?.trade_flow_summary?.total_trades > 30 ? 10 : 0,
      final_confidence: interpretation.confidence
    };

    return {
      interpretation,
      narrative,
      trading_advice,
      alignment_checker,
      confidence_breakdown
    };
  }
}

export const waidesKIOrderBookInterpreter = new WaidesKIOrderBookInterpreter();