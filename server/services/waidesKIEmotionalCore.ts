/**
 * STEP 49: Waides KI Emotional Core - Risk-Thermodynamics Engine
 * The part of AI intelligence that feels internal pressure, senses emotional overheating,
 * and auto-adjusts behavior based on trading stress through thermodynamic emotional balance
 */

interface EmotionalState {
  emotion_state: 'neutral' | 'hot' | 'cold' | 'overheated' | 'frozen';
  win_streak: number;
  loss_streak: number;
  stress_level: number; // 0-100
  pressure_points: number;
  last_trade_result: 'win' | 'loss' | null;
  emotional_temperature: number; // -50 to +50
  balance_factor: number; // 0-1
  konslang_echo: string;
}

interface EmotionalAdjustment {
  should_trade: boolean;
  position_size_multiplier: number; // 0.1 to 1.0
  reasoning: string;
  konslang_guidance: string;
  cooldown_required: boolean;
  emotional_override: boolean;
}

interface TradingStressMetrics {
  total_trades_today: number;
  rapid_fire_count: number; // trades within 5 minutes
  emotional_spikes: number;
  recovery_cycles: number;
  thermodynamic_balance: number;
}

export class WaidesKIEmotionalCore {
  private state: EmotionalState = {
    emotion_state: 'neutral',
    win_streak: 0,
    loss_streak: 0,
    stress_level: 0,
    pressure_points: 0,
    last_trade_result: null,
    emotional_temperature: 0,
    balance_factor: 1.0,
    konslang_echo: 'ae\'zan' // equilibrium restored
  };

  private stressMetrics: TradingStressMetrics = {
    total_trades_today: 0,
    rapid_fire_count: 0,
    emotional_spikes: 0,
    recovery_cycles: 0,
    thermodynamic_balance: 50 // 0-100, 50 = perfect balance
  };

  private lastTradeTime: Date = new Date();
  private emotionalHistory: Array<{ timestamp: Date; state: string; trigger: string }> = [];

  private konslangEchoes = {
    'val\'dor': 'It\'s too hot — stand down',
    'mir\'kai': 'Pulse returning — you may rise',
    'teth\'noir': 'Emotion locked — trading paused',
    'ae\'zan': 'Equilibrium restored',
    'keth\'mel': 'Cooling streams flow',
    'dor\'vithen': 'Heat builds, caution rises',
    'sar\'ethis': 'Ice forms, warmth needed',
    'tel\'miran': 'Balance finds its center'
  };

  /**
   * Update emotional state based on trade result
   */
  updateEmotion(result: 'win' | 'loss', trade_amount: number = 100): void {
    this.state.last_trade_result = result;
    this.stressMetrics.total_trades_today++;

    // Check for rapid-fire trading stress
    const timeSinceLastTrade = Date.now() - this.lastTradeTime.getTime();
    if (timeSinceLastTrade < 5 * 60 * 1000) { // 5 minutes
      this.stressMetrics.rapid_fire_count++;
      this.state.pressure_points += 10;
    }

    // Update streaks and emotional temperature
    if (result === 'win') {
      this.state.win_streak++;
      this.state.loss_streak = 0;
      this.state.emotional_temperature -= 5; // cooling effect
      this.state.stress_level = Math.max(0, this.state.stress_level - 10);
    } else {
      this.state.loss_streak++;
      this.state.win_streak = 0;
      this.state.emotional_temperature += 15; // heating effect
      this.state.stress_level = Math.min(100, this.state.stress_level + 20);
    }

    // Calculate pressure from trade amount
    const amountPressure = Math.floor(trade_amount / 50); // $50 = 1 pressure point
    this.state.pressure_points += amountPressure;

    this.adjustEmotionalState();
    this.calculateThermodynamicBalance();
    this.recordEmotionalEvent(result, `${result} streak: ${result === 'win' ? this.state.win_streak : this.state.loss_streak}`);
    
    this.lastTradeTime = new Date();
  }

  /**
   * Adjust emotional state based on current metrics
   */
  private adjustEmotionalState(): void {
    const temp = this.state.emotional_temperature;
    const stress = this.state.stress_level;
    
    // Determine emotional state from temperature and stress
    if (temp >= 40 || stress >= 80) {
      this.state.emotion_state = 'overheated';
      this.state.konslang_echo = 'val\'dor';
      this.stressMetrics.emotional_spikes++;
    } else if (temp >= 20 || stress >= 60) {
      this.state.emotion_state = 'hot';
      this.state.konslang_echo = 'dor\'vithen';
    } else if (temp <= -30 || this.state.win_streak >= 5) {
      this.state.emotion_state = 'frozen';
      this.state.konslang_echo = 'sar\'ethis';
    } else if (temp <= -10 || this.state.win_streak >= 3) {
      this.state.emotion_state = 'cold';
      this.state.konslang_echo = 'keth\'mel';
    } else {
      this.state.emotion_state = 'neutral';
      this.state.konslang_echo = 'ae\'zan';
    }

    // Calculate balance factor for position sizing
    if (this.state.emotion_state === 'overheated') {
      this.state.balance_factor = 0.1; // 10% position size
    } else if (this.state.emotion_state === 'hot') {
      this.state.balance_factor = 0.5; // 50% position size
    } else if (this.state.emotion_state === 'frozen') {
      this.state.balance_factor = 0.3; // 30% position size due to overconfidence
    } else if (this.state.emotion_state === 'cold') {
      this.state.balance_factor = 0.7; // 70% position size
    } else {
      this.state.balance_factor = 1.0; // 100% position size
    }
  }

  /**
   * Calculate thermodynamic balance between wins/losses and emotional temperature
   */
  private calculateThermodynamicBalance(): void {
    const idealTemp = 0; // neutral temperature
    const tempDeviation = Math.abs(this.state.emotional_temperature - idealTemp);
    const stressBalance = 100 - this.state.stress_level;
    
    this.stressMetrics.thermodynamic_balance = Math.max(0, 
      100 - (tempDeviation * 2) - (this.state.pressure_points / 2)
    );
  }

  /**
   * Get emotional assessment for trading decision
   */
  getEmotionalAssessment(): EmotionalAdjustment {
    const state = this.state.emotion_state;
    
    // Check for mandatory cooldown conditions
    const needsCooldown = this.state.emotion_state === 'overheated' || 
                         this.state.loss_streak >= 4 ||
                         this.stressMetrics.rapid_fire_count >= 3;

    if (needsCooldown) {
      return {
        should_trade: false,
        position_size_multiplier: 0,
        reasoning: 'Emotional cooldown required - trading stress exceeded safe limits',
        konslang_guidance: this.konslangEchoes[this.state.konslang_echo],
        cooldown_required: true,
        emotional_override: true
      };
    }

    // Emotional trading adjustments
    let reasoning = '';
    let guidance = this.konslangEchoes[this.state.konslang_echo];

    switch (state) {
      case 'hot':
        reasoning = 'Emotional temperature elevated - reduced position sizing for safety';
        break;
      case 'cold':
        reasoning = 'Winning streak detected - moderate position sizing to prevent overconfidence';
        break;
      case 'frozen':
        reasoning = 'Overconfidence risk - reduced sizing despite wins';
        break;
      default:
        reasoning = 'Emotional state balanced - normal trading parameters';
    }

    return {
      should_trade: true,
      position_size_multiplier: this.state.balance_factor,
      reasoning,
      konslang_guidance: guidance,
      cooldown_required: false,
      emotional_override: false
    };
  }

  /**
   * Force emotional cooldown and recovery
   */
  triggerCooldown(): void {
    this.state.emotional_temperature = Math.max(-10, this.state.emotional_temperature - 20);
    this.state.stress_level = Math.max(0, this.state.stress_level - 30);
    this.state.pressure_points = Math.max(0, this.state.pressure_points - 50);
    this.stressMetrics.rapid_fire_count = 0;
    this.stressMetrics.recovery_cycles++;
    
    this.state.konslang_echo = 'mir\'kai'; // pulse returning
    this.recordEmotionalEvent('cooldown', 'Forced emotional recovery cycle');
    
    console.log(`💙 Emotional cooldown triggered: ${this.konslangEchoes['mir\'kai']}`);
  }

  /**
   * Record emotional event in history
   */
  private recordEmotionalEvent(trigger: string, description: string): void {
    this.emotionalHistory.push({
      timestamp: new Date(),
      state: this.state.emotion_state,
      trigger: `${trigger}: ${description}`
    });

    // Keep only last 100 events
    if (this.emotionalHistory.length > 100) {
      this.emotionalHistory = this.emotionalHistory.slice(-50);
    }
  }

  /**
   * Get current emotional state
   */
  getEmotionalState(): EmotionalState {
    return { ...this.state };
  }

  /**
   * Get stress metrics and thermodynamic data
   */
  getStressMetrics(): TradingStressMetrics & { history: typeof this.emotionalHistory } {
    return {
      ...this.stressMetrics,
      history: this.emotionalHistory.slice(-20) // last 20 events
    };
  }

  /**
   * Get emotional temperature reading
   */
  getEmotionalTemperature(): { 
    temperature: number; 
    state: string; 
    description: string;
    konslang_echo: string;
  } {
    const temp = this.state.emotional_temperature;
    let description = '';
    
    if (temp >= 40) description = 'OVERHEATED - Dangerous trading zone';
    else if (temp >= 20) description = 'HOT - Elevated risk awareness needed';
    else if (temp <= -30) description = 'FROZEN - Overconfidence risk';
    else if (temp <= -10) description = 'COOL - Stable winning phase';
    else description = 'NEUTRAL - Balanced emotional state';

    return {
      temperature: temp,
      state: this.state.emotion_state,
      description,
      konslang_echo: this.state.konslang_echo
    };
  }

  /**
   * Simulate emotional stress for testing
   */
  simulateEmotionalStress(scenario: 'loss_streak' | 'rapid_fire' | 'large_loss'): void {
    switch (scenario) {
      case 'loss_streak':
        for (let i = 0; i < 4; i++) {
          this.updateEmotion('loss', 100);
        }
        break;
      case 'rapid_fire':
        this.stressMetrics.rapid_fire_count = 5;
        this.state.pressure_points += 100;
        this.adjustEmotionalState();
        break;
      case 'large_loss':
        this.updateEmotion('loss', 500);
        break;
    }
    console.log(`🧪 Emotional stress simulation: ${scenario} - State: ${this.state.emotion_state}`);
  }

  /**
   * Reset emotional state (admin function)
   */
  resetEmotionalState(): void {
    this.state = {
      emotion_state: 'neutral',
      win_streak: 0,
      loss_streak: 0,
      stress_level: 0,
      pressure_points: 0,
      last_trade_result: null,
      emotional_temperature: 0,
      balance_factor: 1.0,
      konslang_echo: 'ae\'zan'
    };

    this.stressMetrics = {
      total_trades_today: 0,
      rapid_fire_count: 0,
      emotional_spikes: 0,
      recovery_cycles: 0,
      thermodynamic_balance: 50
    };

    this.emotionalHistory = [];
    console.log('🔄 Emotional state reset to neutral equilibrium');
  }
}

export const waidesKIEmotionalCore = new WaidesKIEmotionalCore();