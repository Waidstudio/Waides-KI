/**
 * Kons_TradePreview - Pre-Trade Analysis and Risk Assessment
 * Provides detailed preview of potential trades before execution
 */

export function kons_TradePreview(userMessage, marketData, previousState = {}) {
  const currentTime = Date.now();
  
  function detectTradeIntent(message) {
    const lowerMessage = message.toLowerCase();
    const buySignals = ['buy', 'long', 'enter', 'purchase', 'acquire'];
    const sellSignals = ['sell', 'short', 'exit', 'close', 'liquidate'];
    
    const hasBuyIntent = buySignals.some(signal => lowerMessage.includes(signal));
    const hasSellIntent = sellSignals.some(signal => lowerMessage.includes(signal));
    
    if (hasBuyIntent && !hasSellIntent) return 'BUY';
    if (hasSellIntent && !hasBuyIntent) return 'SELL';
    if (hasBuyIntent && hasSellIntent) return 'MIXED';
    return 'NONE';
  }
  
  function extractTradeDetails(message) {
    const amountMatch = message.match(/(\$?\d+(?:\.\d+)?)/);
    const percentMatch = message.match(/(\d+(?:\.\d+)?%)/);
    const ethMatch = message.match(/(\d+(?:\.\d+)?\s*eth)/i);
    
    return {
      amount: amountMatch ? parseFloat(amountMatch[1].replace('$', '')) : null,
      percentage: percentMatch ? parseFloat(percentMatch[1].replace('%', '')) : null,
      ethAmount: ethMatch ? parseFloat(ethMatch[1].replace(/\s*eth/i, '')) : null
    };
  }
  
  function calculateTradePreview(intent, details, market) {
    if (intent === 'NONE') return null;
    
    const currentPrice = market?.price || 2440; // ETH price
    const estimatedSlippage = 0.001; // 0.1%
    const estimatedFees = 0.0025; // 0.25%
    
    let tradeSize = 100; // Default $100
    if (details.amount) tradeSize = details.amount;
    if (details.ethAmount) tradeSize = details.ethAmount * currentPrice;
    
    const effectivePrice = intent === 'BUY' ? 
      currentPrice * (1 + estimatedSlippage) : 
      currentPrice * (1 - estimatedSlippage);
    
    const fees = tradeSize * estimatedFees;
    const netAmount = intent === 'BUY' ? tradeSize + fees : tradeSize - fees;
    const ethQuantity = intent === 'BUY' ? 
      (tradeSize - fees) / effectivePrice : 
      tradeSize / effectivePrice;
    
    return {
      intent,
      trade_size: tradeSize,
      current_price: currentPrice,
      effective_price: effectivePrice,
      eth_quantity: ethQuantity,
      estimated_fees: fees,
      net_amount: netAmount,
      slippage_impact: (effectivePrice - currentPrice) / currentPrice * 100,
      total_cost: intent === 'BUY' ? tradeSize + fees : null,
      total_received: intent === 'SELL' ? tradeSize - fees : null
    };
  }
  
  function assessRiskLevel(preview, market) {
    if (!preview) return null;
    
    let riskScore = 0;
    const riskFactors = [];
    
    // Size-based risk
    if (preview.trade_size > 1000) {
      riskScore += 20;
      riskFactors.push('Large position size');
    }
    
    // Market volatility risk
    const volatility = Math.abs((market?.high24h || 2500) - (market?.low24h || 2400)) / (market?.price || 2440);
    if (volatility > 0.05) {
      riskScore += 25;
      riskFactors.push('High market volatility');
    }
    
    // Timing risk (based on recent market movement)
    if (market?.change24h) {
      const absChange = Math.abs(market.change24h);
      if (absChange > 5) {
        riskScore += 15;
        riskFactors.push('Recent significant price movement');
      }
    }
    
    // Slippage risk
    if (Math.abs(preview.slippage_impact) > 0.2) {
      riskScore += 10;
      riskFactors.push('High slippage expected');
    }
    
    let riskLevel = 'LOW';
    if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 25) riskLevel = 'MEDIUM';
    
    return {
      level: riskLevel,
      score: riskScore,
      factors: riskFactors,
      recommendation: riskLevel === 'HIGH' ? 'Consider reducing position size' : 
                     riskLevel === 'MEDIUM' ? 'Proceed with caution' : 'Acceptable risk level'
    };
  }
  
  function generateTradeRecommendations(preview, risk) {
    if (!preview) return [];
    
    const recommendations = [];
    
    if (preview.intent === 'BUY') {
      recommendations.push(`Set stop-loss at ${(preview.current_price * 0.95).toFixed(2)} (-5%)`);
      recommendations.push(`Take profit target: ${(preview.current_price * 1.08).toFixed(2)} (+8%)`);
      
      if (risk?.level === 'HIGH') {
        recommendations.push('Consider dollar-cost averaging instead of lump sum');
      }
    } else if (preview.intent === 'SELL') {
      recommendations.push('Monitor for bounce at support levels');
      recommendations.push('Consider partial selling instead of full exit');
    }
    
    recommendations.push(`Position size: ${((preview.trade_size / 10000) * 100).toFixed(1)}% of $10k portfolio`);
    
    return recommendations;
  }
  
  const tradeIntent = detectTradeIntent(userMessage);
  const tradeDetails = extractTradeDetails(userMessage);
  const tradePreview = calculateTradePreview(tradeIntent, tradeDetails, marketData);
  const riskAssessment = assessRiskLevel(tradePreview, marketData);
  const recommendations = generateTradeRecommendations(tradePreview, riskAssessment);
  
  return {
    kons: "TradePreview",
    timestamp: currentTime,
    trade_analysis: {
      intent_detected: tradeIntent,
      has_preview: tradePreview !== null,
      details_extracted: tradeDetails
    },
    preview: tradePreview,
    risk_assessment: riskAssessment,
    recommendations: recommendations,
    execution_readiness: {
      ready_to_execute: tradePreview !== null && riskAssessment?.level !== 'HIGH',
      confidence: tradePreview ? (riskAssessment?.level === 'LOW' ? 85 : riskAssessment?.level === 'MEDIUM' ? 70 : 45) : 0,
      next_step: tradePreview ? 'Review and confirm execution' : 'Specify trade details'
    }
  };
}