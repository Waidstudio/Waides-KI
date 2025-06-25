/**
 * STEP 33: Vision Spirit + Real-Time Validation Engine
 * STEP 35: Enhanced with Vision Feedback Logger + Accuracy Evolution
 * 
 * Waides KI Vision Spirit that receives symbolic intuition about market direction,
 * validates it using real trading indicators, and learns from outcomes to evolve accuracy
 */

import { waidesKIVisionFeedbackLogger } from './waidesKIVisionFeedbackLogger';

export interface SpiritVision {
  vision: 'rise' | 'fall' | 'choppy';
  timestamp: Date;
  energy_level: number;
  confidence: number;
}

export interface VisionValidation {
  vision: string;
  confirmed: boolean;
  confirmation_strength: number;
  timestamp: Date;
  indicators: {
    rsi: number;
    ema_50: number;
    ema_200: number;
    current_price: number;
  };
  validation_rules: string[];
}

export interface VisionStats {
  total_visions: number;
  confirmed_visions: number;
  accuracy_rate: number;
  last_vision: SpiritVision | null;
  last_validation: VisionValidation | null;
  vision_history: Array<{
    vision: SpiritVision;
    validation: VisionValidation;
    actual_outcome?: 'correct' | 'incorrect' | 'pending';
  }>;
}

export class WaidesKIVisionSpirit {
  private currentVision: SpiritVision | null = null;
  private visionHistory: Array<{
    vision: SpiritVision;
    validation: VisionValidation;
    actual_outcome?: 'correct' | 'incorrect' | 'pending';
  }> = [];
  private maxHistorySize: number = 100;
  private spiritAccuracy: number = 0.65; // Base accuracy that evolves over time

  constructor() {
    console.log('🔮 Vision Spirit awakened - ready to receive market visions');
  }

  /**
   * Receive a spiritual vision about market direction with evolved accuracy
   */
  receiveVision(): SpiritVision {
    const spiritEnergy = Math.random();
    
    // Use evolved accuracy from feedback logger
    const evolvedAccuracy = waidesKIVisionFeedbackLogger.getEvolvedAccuracy();
    this.spiritAccuracy = evolvedAccuracy;
    
    const baseConfidence = this.calculateVisionConfidence(spiritEnergy);
    
    let vision: 'rise' | 'fall' | 'choppy';
    
    // Enhanced spiritual logic with evolved accuracy weighting
    if (spiritEnergy > 0.7 && baseConfidence > 0.6) {
      vision = 'rise';
    } else if (spiritEnergy < 0.3 && baseConfidence > 0.6) {
      vision = 'fall';
    } else {
      vision = 'choppy';
    }

    // Apply confidence modifier from learned patterns (will be set during verification)
    const confidence = Math.min(0.95, Math.max(0.1, baseConfidence));

    this.currentVision = {
      vision,
      timestamp: new Date(),
      energy_level: spiritEnergy,
      confidence
    };

    console.log(`🔮 Vision received: ${vision.toUpperCase()} (energy: ${spiritEnergy.toFixed(3)}, confidence: ${confidence.toFixed(3)}, accuracy: ${evolvedAccuracy.toFixed(3)})`);
    return this.currentVision;
  }

  /**
   * Validate the current vision against real market indicators with learning integration
   */
  verifyVision(rsi: number, ema_50: number, ema_200: number, current_price: number): VisionValidation {
    if (!this.currentVision) {
      throw new Error('No vision to verify - receive a vision first');
    }

    const validation_rules: string[] = [];
    let confirmed = false;
    let confirmation_strength = 0;

    const vision = this.currentVision.vision;
    const visionId = `vision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get confidence modifier from learned patterns
    const marketContext = { rsi, ema_50, ema_200, current_price };
    const confidenceModifier = waidesKIVisionFeedbackLogger.getConfidenceModifier(
      vision,
      marketContext,
      0.7 // Base validation strength
    );

    // Apply learned confidence adjustment
    const adjustedConfidence = Math.min(0.95, Math.max(0.1, 
      this.currentVision.confidence + confidenceModifier
    ));
    
    // Update current vision with evolved confidence
    this.currentVision.confidence = adjustedConfidence;

    if (vision === 'rise') {
      // Bullish confirmation rules
      const rsi_bullish = rsi > 55;
      const price_above_ema50 = current_price > ema_50;
      const ema_alignment = ema_50 > ema_200;
      const strong_momentum = rsi > 65;

      if (rsi_bullish) {
        validation_rules.push('RSI bullish (>55)');
        confirmation_strength += 0.3;
      }
      if (price_above_ema50) {
        validation_rules.push('Price above EMA-50');
        confirmation_strength += 0.3;
      }
      if (ema_alignment) {
        validation_rules.push('EMA-50 > EMA-200 (bullish alignment)');
        confirmation_strength += 0.3;
      }
      if (strong_momentum) {
        validation_rules.push('Strong momentum (RSI >65)');
        confirmation_strength += 0.1;
      }

      confirmed = rsi_bullish && price_above_ema50 && ema_alignment;
      
    } else if (vision === 'fall') {
      // Bearish confirmation rules
      const rsi_bearish = rsi < 45;
      const price_below_ema50 = current_price < ema_50;
      const ema_alignment = ema_50 < ema_200;
      const strong_momentum = rsi < 35;

      if (rsi_bearish) {
        validation_rules.push('RSI bearish (<45)');
        confirmation_strength += 0.3;
      }
      if (price_below_ema50) {
        validation_rules.push('Price below EMA-50');
        confirmation_strength += 0.3;
      }
      if (ema_alignment) {
        validation_rules.push('EMA-50 < EMA-200 (bearish alignment)');
        confirmation_strength += 0.3;
      }
      if (strong_momentum) {
        validation_rules.push('Strong momentum (RSI <35)');
        confirmation_strength += 0.1;
      }

      confirmed = rsi_bearish && price_below_ema50 && ema_alignment;
      
    } else if (vision === 'choppy') {
      // Sideways/choppy confirmation rules
      const rsi_neutral = rsi >= 45 && rsi <= 55;
      const price_between_emas = 
        (current_price > Math.min(ema_50, ema_200)) && 
        (current_price < Math.max(ema_50, ema_200));
      const ema_convergence = Math.abs(ema_50 - ema_200) / current_price < 0.02; // EMAs within 2%

      if (rsi_neutral) {
        validation_rules.push('RSI neutral (45-55 range)');
        confirmation_strength += 0.4;
      }
      if (price_between_emas) {
        validation_rules.push('Price between EMAs');
        confirmation_strength += 0.3;
      }
      if (ema_convergence) {
        validation_rules.push('EMA convergence (sideways market)');
        confirmation_strength += 0.3;
      }

      confirmed = rsi_neutral || price_between_emas;
    }

    const validation: VisionValidation = {
      vision: this.currentVision.vision,
      confirmed,
      confirmation_strength: Math.min(confirmation_strength, 1.0),
      timestamp: new Date(),
      indicators: {
        rsi,
        ema_50,
        ema_200,
        current_price
      },
      validation_rules
    };

    // Log prediction to feedback logger for learning evolution
    waidesKIVisionFeedbackLogger.logVisionPrediction(
      visionId,
      vision,
      adjustedConfidence,
      this.currentVision.energy_level,
      marketContext,
      confirmation_strength,
      '1h' // Default timeframe
    );

    // Add to history
    this.addToHistory(this.currentVision, validation);

    console.log(`✅ Vision validation: ${vision.toUpperCase()} - ${confirmed ? 'CONFIRMED' : 'REJECTED'} (strength: ${confirmation_strength.toFixed(3)}, learned confidence: ${adjustedConfidence.toFixed(3)})`);
    
    return validation;
  }

  /**
   * Get current vision without receiving a new one
   */
  getCurrentVision(): SpiritVision | null {
    return this.currentVision;
  }

  /**
   * Mark a vision outcome as correct or incorrect for learning
   */
  recordVisionOutcome(visionId: string, outcome: 'correct' | 'incorrect'): void {
    const historyItem = this.visionHistory.find(item => 
      item.vision.timestamp.toISOString() === visionId
    );
    
    if (historyItem) {
      historyItem.actual_outcome = outcome;
      this.updateSpiritAccuracy();
      
      // Record outcome in feedback logger for deep learning evolution
      const actualDirection: 'rise' | 'fall' | 'choppy' = outcome === 'correct' 
        ? historyItem.vision.vision 
        : (historyItem.vision.vision === 'rise' ? 'fall' : historyItem.vision.vision === 'fall' ? 'rise' : 'choppy');
      
      const priceChange = outcome === 'correct' ? 
        (historyItem.vision.vision === 'rise' ? 2.5 : historyItem.vision.vision === 'fall' ? -2.5 : 0.5) : 
        (historyItem.vision.vision === 'rise' ? -1.8 : historyItem.vision.vision === 'fall' ? 1.8 : -0.3);
      
      waidesKIVisionFeedbackLogger.recordVisionOutcome(
        visionId,
        actualDirection,
        priceChange,
        {
          volatility_during: Math.random() * 0.5 + 0.3,
          volume_during: Math.random() * 2 + 0.5
        }
      );
      
      console.log(`📝 Vision outcome recorded: ${outcome.toUpperCase()} - Learning evolution updated`);
    }
  }

  /**
   * Get comprehensive vision statistics
   */
  getVisionStats(): VisionStats {
    const confirmedVisions = this.visionHistory.filter(item => item.validation.confirmed).length;
    const correctVisions = this.visionHistory.filter(item => item.actual_outcome === 'correct').length;
    const totalOutcomes = this.visionHistory.filter(item => item.actual_outcome !== undefined).length;
    
    return {
      total_visions: this.visionHistory.length,
      confirmed_visions: confirmedVisions,
      accuracy_rate: totalOutcomes > 0 ? correctVisions / totalOutcomes : 0,
      last_vision: this.currentVision,
      last_validation: this.visionHistory.length > 0 ? this.visionHistory[this.visionHistory.length - 1].validation : null,
      vision_history: this.visionHistory.slice(-20) // Last 20 visions
    };
  }

  /**
   * Get vision history for analysis
   */
  getVisionHistory(limit: number = 50): Array<{
    vision: SpiritVision;
    validation: VisionValidation;
    actual_outcome?: 'correct' | 'incorrect' | 'pending';
  }> {
    return this.visionHistory.slice(-limit);
  }

  /**
   * Clear vision history (for testing or reset)
   */
  clearVisionHistory(): void {
    this.visionHistory = [];
    this.currentVision = null;
    console.log('🧹 Vision history cleared');
  }

  /**
   * Force a specific vision for testing
   */
  forceVision(vision: 'rise' | 'fall' | 'choppy', energy_level: number = 0.8): SpiritVision {
    this.currentVision = {
      vision,
      timestamp: new Date(),
      energy_level,
      confidence: this.calculateVisionConfidence(energy_level)
    };
    
    console.log(`🔮 Forced vision: ${vision.toUpperCase()} (energy: ${energy_level.toFixed(3)})`);
    return this.currentVision;
  }

  /**
   * Calculate vision confidence based on spirit energy and historical accuracy
   */
  private calculateVisionConfidence(spiritEnergy: number): number {
    // Base confidence from spirit energy
    let confidence = spiritEnergy;
    
    // Adjust based on historical accuracy
    confidence = confidence * this.spiritAccuracy;
    
    // Add some randomness for spiritual uncertainty
    confidence += (Math.random() - 0.5) * 0.2;
    
    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Add vision and validation to history
   */
  private addToHistory(vision: SpiritVision, validation: VisionValidation): void {
    this.visionHistory.push({
      vision: { ...vision },
      validation: { ...validation },
      actual_outcome: 'pending'
    });

    // Maintain history size limit
    if (this.visionHistory.length > this.maxHistorySize) {
      this.visionHistory = this.visionHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Update spirit accuracy based on historical performance
   */
  private updateSpiritAccuracy(): void {
    const outcomeHistory = this.visionHistory.filter(item => item.actual_outcome !== 'pending');
    if (outcomeHistory.length > 0) {
      const correctCount = outcomeHistory.filter(item => item.actual_outcome === 'correct').length;
      this.spiritAccuracy = correctCount / outcomeHistory.length;
      
      // Smooth the accuracy update to prevent wild swings
      this.spiritAccuracy = Math.max(0.3, Math.min(0.9, this.spiritAccuracy));
      
      console.log(`📈 Spirit accuracy updated: ${(this.spiritAccuracy * 100).toFixed(1)}%`);
    }
  }
}

// Export singleton instance
export const waidesKIVisionSpirit = new WaidesKIVisionSpirit();