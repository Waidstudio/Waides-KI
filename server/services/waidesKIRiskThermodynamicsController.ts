/**
 * STEP 49: Risk-Thermodynamics Controller
 * Controls trading decisions based on emotional temperature and thermodynamic balance
 * Prevents overtrading, revenge trading, and emotional decision-making
 */

import { waidesKIEmotionalCore } from './waidesKIEmotionalCore.js';

interface ThermoDecision {
  should_trade: boolean;
  position_adjustment: 'none' | 'reduce_25' | 'reduce_50' | 'reduce_75' | 'micro_only';
  risk_multiplier: number; // 0.1 to 1.0
  reasoning: string;
  konslang_guidance: string;
  thermodynamic_state: string;
  cooling_required: boolean;
}

interface ThermoMetrics {
  current_temperature: number;
  pressure_reading: number;
  stress_level: number;
  balance_factor: number;
  safety_threshold: number;
  optimal_range: { min: number; max: number };
}

export class WaidesKIRiskThermodynamicsController {
  private safetyThresholds = {
    overheated_temp: 35,
    hot_temp: 20,
    cold_temp: -15,
    frozen_temp: -30,
    max_stress: 80,
    max_pressure: 150
  };

  private optimalTradingRange = {
    temp_min: -10,
    temp_max: 15,
    stress_max: 40,
    pressure_max: 75
  };

  /**
   * Analyze current emotional state and provide trading decision
   */
  analyzeThermalState(): ThermoDecision {
    const emotionalState = waidesKIEmotionalCore.getEmotionalState();
    const temperature = waidesKIEmotionalCore.getEmotionalTemperature();
    const assessment = waidesKIEmotionalCore.getEmotionalAssessment();

    // Check for critical thermal conditions
    if (this.isCriticalOverheating(emotionalState)) {
      return this.createCriticalCooldownDecision(temperature);
    }

    if (this.isDangerousFreeze(emotionalState)) {
      return this.createOverconfidenceWarningDecision(temperature);
    }

    // Normal thermal analysis
    return this.createNormalThermalDecision(emotionalState, temperature, assessment);
  }

  /**
   * Check if system is critically overheated
   */
  private isCriticalOverheating(state: any): boolean {
    return state.emotional_temperature >= this.safetyThresholds.overheated_temp ||
           state.stress_level >= this.safetyThresholds.max_stress ||
           state.loss_streak >= 4;
  }

  /**
   * Check if system is dangerously frozen (overconfidence)
   */
  private isDangerousFreeze(state: any): boolean {
    return state.emotional_temperature <= this.safetyThresholds.frozen_temp ||
           state.win_streak >= 6;
  }

  /**
   * Create critical cooldown decision
   */
  private createCriticalCooldownDecision(temperature: any): ThermoDecision {
    return {
      should_trade: false,
      position_adjustment: 'micro_only',
      risk_multiplier: 0.1,
      reasoning: 'Critical thermal overload detected - mandatory cooldown required',
      konslang_guidance: temperature.konslang_echo,
      thermodynamic_state: 'CRITICAL_OVERHEATED',
      cooling_required: true
    };
  }

  /**
   * Create overconfidence warning decision
   */
  private createOverconfidenceWarningDecision(temperature: any): ThermoDecision {
    return {
      should_trade: true,
      position_adjustment: 'reduce_75',
      risk_multiplier: 0.25,
      reasoning: 'Overconfidence freeze detected - extreme position reduction required',
      konslang_guidance: temperature.konslang_echo,
      thermodynamic_state: 'OVERCONFIDENCE_FREEZE',
      cooling_required: false
    };
  }

  /**
   * Create normal thermal decision
   */
  private createNormalThermalDecision(state: any, temperature: any, assessment: any): ThermoDecision {
    let adjustment: ThermoDecision['position_adjustment'] = 'none';
    let multiplier = 1.0;
    let reasoning = '';

    // Determine position adjustment based on thermal state
    if (state.emotional_temperature >= this.safetyThresholds.hot_temp) {
      adjustment = 'reduce_50';
      multiplier = 0.5;
      reasoning = 'Elevated thermal readings - reducing position size for safety';
    } else if (state.emotional_temperature <= this.safetyThresholds.cold_temp) {
      adjustment = 'reduce_25';
      multiplier = 0.75;
      reasoning = 'Cold phase detected - moderate position reduction to prevent overconfidence';
    } else if (this.isInOptimalRange(state)) {
      adjustment = 'none';
      multiplier = 1.0;
      reasoning = 'Thermal equilibrium achieved - normal trading parameters';
    } else {
      adjustment = 'reduce_25';
      multiplier = 0.75;
      reasoning = 'Minor thermal deviation - light position adjustment';
    }

    return {
      should_trade: assessment.should_trade,
      position_adjustment: adjustment,
      risk_multiplier: multiplier,
      reasoning,
      konslang_guidance: temperature.konslang_echo,
      thermodynamic_state: temperature.state.toUpperCase(),
      cooling_required: assessment.cooldown_required
    };
  }

  /**
   * Check if thermal readings are in optimal trading range
   */
  private isInOptimalRange(state: any): boolean {
    return state.emotional_temperature >= this.optimalTradingRange.temp_min &&
           state.emotional_temperature <= this.optimalTradingRange.temp_max &&
           state.stress_level <= this.optimalTradingRange.stress_max &&
           state.pressure_points <= this.optimalTradingRange.pressure_max;
  }

  /**
   * Get current thermodynamic metrics
   */
  getThermoMetrics(): ThermoMetrics {
    const state = waidesKIEmotionalCore.getEmotionalState();
    const temperature = waidesKIEmotionalCore.getEmotionalTemperature();

    return {
      current_temperature: state.emotional_temperature,
      pressure_reading: state.pressure_points,
      stress_level: state.stress_level,
      balance_factor: state.balance_factor,
      safety_threshold: this.safetyThresholds.overheated_temp,
      optimal_range: {
        min: this.optimalTradingRange.temp_min,
        max: this.optimalTradingRange.temp_max
      }
    };
  }

  /**
   * Force thermal adjustment (emergency cooling)
   */
  emergencyThermalReset(): void {
    waidesKIEmotionalCore.triggerCooldown();
    console.log('🌡️ Emergency thermal reset activated - system cooling initiated');
  }

  /**
   * Check if trade should be allowed based on thermal state
   */
  shouldAllowTrade(trade_amount: number = 100): { 
    allowed: boolean; 
    adjusted_amount: number; 
    reasoning: string; 
    konslang_echo: string;
  } {
    const decision = this.analyzeThermalState();
    const adjusted_amount = trade_amount * decision.risk_multiplier;

    return {
      allowed: decision.should_trade,
      adjusted_amount,
      reasoning: decision.reasoning,
      konslang_echo: decision.konslang_guidance
    };
  }

  /**
   * Simulate thermal stress for testing
   */
  simulateThermalCondition(condition: 'overheat' | 'freeze' | 'normal'): ThermoDecision {
    switch (condition) {
      case 'overheat':
        waidesKIEmotionalCore.simulateEmotionalStress('loss_streak');
        break;
      case 'freeze':
        // Simulate win streak
        for (let i = 0; i < 6; i++) {
          waidesKIEmotionalCore.updateEmotion('win', 100);
        }
        break;
      case 'normal':
        waidesKIEmotionalCore.resetEmotionalState();
        break;
    }

    return this.analyzeThermalState();
  }

  /**
   * Get thermal safety report
   */
  getThermalSafetyReport(): any {
    const metrics = this.getThermoMetrics();
    const decision = this.analyzeThermalState();
    
    return {
      thermal_status: decision.thermodynamic_state,
      safety_level: this.calculateSafetyLevel(metrics),
      recommendations: this.generateThermalRecommendations(metrics),
      current_limits: {
        position_size: decision.risk_multiplier,
        adjustment: decision.position_adjustment,
        trading_allowed: decision.should_trade
      },
      thermal_readings: metrics,
      emergency_protocols: {
        cooling_required: decision.cooling_required,
        override_available: !decision.cooling_required
      }
    };
  }

  /**
   * Calculate overall safety level
   */
  private calculateSafetyLevel(metrics: ThermoMetrics): string {
    const tempScore = Math.abs(metrics.current_temperature) / 50 * 100;
    const stressScore = metrics.stress_level;
    const pressureScore = metrics.pressure_reading / 200 * 100;
    
    const overallRisk = (tempScore + stressScore + pressureScore) / 3;
    
    if (overallRisk <= 25) return 'SAFE';
    if (overallRisk <= 50) return 'CAUTION';
    if (overallRisk <= 75) return 'WARNING';
    return 'CRITICAL';
  }

  /**
   * Generate thermal recommendations
   */
  private generateThermalRecommendations(metrics: ThermoMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.current_temperature > 25) {
      recommendations.push('Reduce trading frequency to cool emotional temperature');
    }
    
    if (metrics.stress_level > 60) {
      recommendations.push('Take mandatory trading break to reduce stress levels');
    }
    
    if (metrics.pressure_reading > 100) {
      recommendations.push('Avoid large position sizes until pressure normalizes');
    }
    
    if (metrics.current_temperature < -20) {
      recommendations.push('Exercise caution - overconfidence risk detected');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Thermal state optimal - normal trading parameters recommended');
    }
    
    return recommendations;
  }
}

export const waidesKIRiskThermodynamicsController = new WaidesKIRiskThermodynamicsController();