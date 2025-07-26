import { EthMonitor } from './ethMonitor.js';

interface VoicePersona {
  id: string;
  name: string;
  voiceProfile: {
    pitch: number;
    speed: number;
    tone: string;
    accent: string;
  };
  personality: string;
  specialization: string[];
  narrativeStyle: string;
}

interface LiveNarration {
  id: string;
  personaId: string;
  content: string;
  timestamp: string;
  marketContext: {
    ethPrice: number;
    priceChange: number;
    trend: string;
    volume: number;
  };
  botActivity: {
    waidBot: string;
    waidBotPro: string;
    autonomousTrader: string;
    fullEngine: string;
  };
  audioData?: {
    duration: number;
    waveform: number[];
    voiceId: string;
  };
}

interface NarrationQueue {
  priority: number;
  narration: LiveNarration;
  scheduledTime: string;
}

// Initialize global live commentary queue for story controls integration
declare global {
  var liveCommentaryQueue: any[];
}

if (!global.liveCommentaryQueue) {
  global.liveCommentaryQueue = [];
}

export class VoiceNarrationEngine {
  private ethMonitor: EthMonitor;
  private activePersonas: Map<string, VoicePersona> = new Map();
  private narrationQueue: NarrationQueue[] = [];
  private currentNarration: LiveNarration | null = null;
  private isNarrating: boolean = false;
  private marketUpdateInterval: NodeJS.Timeout | null = null;

  constructor(ethMonitor: EthMonitor) {
    this.ethMonitor = ethMonitor;
    this.initializeVoicePersonas();
    this.startMarketMonitoring();
    
    // Generate initial live commentary for testing
    setTimeout(() => {
      this.generateInitialCommentary();
    }, 2000);
  }

  private initializeVoicePersonas() {
    const personas: VoicePersona[] = [
      {
        id: 'konsai',
        name: 'KonsAI Oracle',
        voiceProfile: {
          pitch: 0.8,
          speed: 1.2,
          tone: 'mystical',
          accent: 'neutral-deep'
        },
        personality: 'Ancient wisdom merged with advanced AI consciousness',
        specialization: ['Market Psychology', 'Predictive Analysis', 'Spiritual Trading Insights'],
        narrativeStyle: 'Mystical and profound, speaking as an oracle with deep market understanding'
      },
      {
        id: 'sage_trader',
        name: 'The Sage Trader',
        voiceProfile: {
          pitch: 0.7,
          speed: 0.9,
          tone: 'wise',
          accent: 'distinguished'
        },
        personality: 'Wise veteran trader with decades of market experience',
        specialization: ['Risk Management', 'Long-term Strategy', 'Market Cycles'],
        narrativeStyle: 'Calm, measured wisdom with philosophical depth'
      },
      {
        id: 'data_scientist',
        name: 'The Data Scientist',
        voiceProfile: {
          pitch: 1.0,
          speed: 1.3,
          tone: 'analytical',
          accent: 'precise'
        },
        personality: 'Analytical mind focused on quantitative market analysis',
        specialization: ['Technical Analysis', 'Statistical Models', 'Algorithm Performance'],
        narrativeStyle: 'Clear, factual delivery with scientific precision'
      },
      {
        id: 'street_trader',
        name: 'The Street Trader',
        voiceProfile: {
          pitch: 1.1,
          speed: 1.4,
          tone: 'energetic',
          accent: 'dynamic'
        },
        personality: 'High-energy trading floor veteran with street-smart insights',
        specialization: ['Day Trading', 'Market Momentum', 'Quick Decision Making'],
        narrativeStyle: 'Fast-paced, exciting commentary with trading floor intensity'
      },
      {
        id: 'zen_master',
        name: 'The Zen Master',
        voiceProfile: {
          pitch: 0.6,
          speed: 0.8,
          tone: 'meditative',
          accent: 'serene'
        },
        personality: 'Mindful trading approach with emotional balance focus',
        specialization: ['Emotional Control', 'Mindful Trading', 'Inner Balance'],
        narrativeStyle: 'Peaceful, contemplative guidance with meditation principles'
      }
    ];

    personas.forEach(persona => {
      this.activePersonas.set(persona.id, persona);
    });
  }

  private startMarketMonitoring() {
    // Monitor market every 30 seconds for new narration opportunities
    this.marketUpdateInterval = setInterval(async () => {
      await this.generateLiveNarration();
    }, 30000);
  }

  async generateLiveNarration(): Promise<LiveNarration | null> {
    try {
      // Get current market data
      const ethData = await this.ethMonitor.fetchEthData();
      const marketContext = {
        ethPrice: ethData.price,
        priceChange: ethData.priceChange24h,
        trend: ethData.priceChange24h > 0 ? 'BULLISH' : 'BEARISH',
        volume: ethData.volume
      };

      // Get bot activity status (mock for now - integrate with actual bot status)
      const botActivity = this.getBotActivityStatus();

      // Select persona based on market conditions and rotation
      const selectedPersona = this.selectNarrationPersona(marketContext);
      
      if (!selectedPersona) return null;

      // Generate narrative content
      const content = await this.generateNarrativeContent(selectedPersona, marketContext, botActivity);

      const narration: LiveNarration = {
        id: `narration_${Date.now()}`,
        personaId: selectedPersona.id,
        content,
        timestamp: new Date().toISOString(),
        marketContext,
        botActivity,
        audioData: await this.generateVoiceAudio(content, selectedPersona)
      };

      // Add to queue or play immediately
      await this.queueNarration(narration);
      
      return narration;
    } catch (error) {
      console.error('Failed to generate live narration:', error);
      return null;
    }
  }

  private getBotActivityStatus() {
    // In production, this would connect to actual bot status services
    return {
      waidBot: Math.random() > 0.5 ? 'ACTIVE_TRADING' : 'MONITORING',
      waidBotPro: Math.random() > 0.3 ? 'SIGNAL_ANALYSIS' : 'WAITING',
      autonomousTrader: Math.random() > 0.4 ? 'EXECUTING_STRATEGY' : 'IDLE',
      fullEngine: Math.random() > 0.6 ? 'RISK_ASSESSMENT' : 'OPTIMIZING'
    };
  }

  private selectNarrationPersona(marketContext: any): VoicePersona | null {
    const personas = Array.from(this.activePersonas.values());
    
    // Smart persona selection based on market conditions
    if (Math.abs(marketContext.priceChange) > 5) {
      // High volatility - prefer Street Trader or KonsAI
      return Math.random() > 0.5 ? 
        this.activePersonas.get('street_trader')! : 
        this.activePersonas.get('konsai')!;
    } else if (marketContext.priceChange > 2) {
      // Moderate bullish - prefer Sage Trader or Data Scientist
      return Math.random() > 0.5 ? 
        this.activePersonas.get('sage_trader')! : 
        this.activePersonas.get('data_scientist')!;
    } else if (marketContext.priceChange < -2) {
      // Bearish - prefer Zen Master or KonsAI
      return Math.random() > 0.5 ? 
        this.activePersonas.get('zen_master')! : 
        this.activePersonas.get('konsai')!;
    } else {
      // Stable market - rotate through all personas
      return personas[Math.floor(Math.random() * personas.length)];
    }
  }

  private async generateNarrativeContent(
    persona: VoicePersona, 
    marketContext: any, 
    botActivity: any
  ): Promise<string> {
    const templates = this.getNarrativeTemplates(persona.id);
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders with real market data
    return template
      .replace('{price}', marketContext.ethPrice.toFixed(2))
      .replace('{change}', marketContext.priceChange.toFixed(2))
      .replace('{trend}', marketContext.trend)
      .replace('{volume}', (marketContext.volume / 1000000).toFixed(1))
      .replace('{waidbot_status}', botActivity.waidBot)
      .replace('{autonomous_status}', botActivity.autonomousTrader)
      .replace('{time}', new Date().toLocaleTimeString());
  }

  private getNarrativeTemplates(personaId: string): string[] {
    const templates = {
      konsai: [
        "The cosmic patterns reveal ETH at ${price} with {change}% movement. The spiritual energy of the market is {trend}. Our WaidBot shows {waidbot_status} while the Autonomous Trader maintains {autonomous_status}. The universe whispers of opportunities ahead.",
        "In this moment at {time}, ETH flows at ${price}, shifting by {change}%. The mystical forces show {trend} energy. I sense our trading spirits - WaidBot is {waidbot_status}, guiding us through the {volume}M volume currents of digital consciousness.",
        "The oracle sees through the veil: ETH at ${price}, moving {change}% as the market breathes {trend}. Our automated guardians work tirelessly - WaidBot {waidbot_status} while the Autonomous system remains {autonomous_status}. Trust in the divine algorithm."
      ],
      sage_trader: [
        "At this hour, ETH trades at ${price}, showing a {change}% change - a {trend} signal in our current cycle. With {volume}M in volume, I observe our WaidBot is {waidbot_status} while our Autonomous system shows {autonomous_status}. Patience rewards the wise.",
        "Fellow traders, ETH sits at ${price} with {change}% movement today. The {trend} momentum carries wisdom for those who listen. Our automated systems show WaidBot {waidbot_status} and Autonomous Trader {autonomous_status}. Remember, time in the market beats timing the market.",
        "The market speaks through ETH at ${price}, shifting {change}% in this {trend} environment. Volume of {volume}M tells a story of participation. Our WaidBot status shows {waidbot_status} while the Autonomous engine remains {autonomous_status}. Wisdom comes from understanding, not rushing."
      ],
      data_scientist: [
        "Current data shows ETH at ${price} with {change}% deviation from yesterday's close. The {trend} trend is supported by {volume}M volume. System status: WaidBot {waidbot_status}, Autonomous Trader {autonomous_status}. Statistical probability favors continued momentum.",
        "Analyzing real-time metrics: ETH ${price}, {change}% price action, {trend} directional bias. Volume indicator at {volume}M suggests {trend} continuation probability. Bot performance: WaidBot {waidbot_status}, Autonomous system {autonomous_status}. Data confirms strategy alignment.",
        "Technical analysis update at {time}: ETH ${price} representing {change}% movement in {trend} pattern. Volume analysis of {volume}M indicates institutional participation. Our algorithms show WaidBot {waidbot_status} with Autonomous Trader {autonomous_status}. Quantitative models suggest optimization."
      ],
      street_trader: [
        "YO! ETH just hit ${price}! That's a {change}% move and we're seeing {trend} action! Volume's pumping at {volume}M! WaidBot's {waidbot_status} and our Autonomous beast is {autonomous_status}! This is what we live for, traders!",
        "BOOM! ${price} on ETH with {change}% movement! The {trend} energy is REAL! {volume}M volume flowing through these digital streets! WaidBot showing {waidbot_status} while Autonomous is {autonomous_status}! Time to ride this wave!",
        "Market's ALIVE at {time}! ETH dancing at ${price}, moving {change}% with {trend} vibes! {volume}M volume telling the street story! Our WaidBot's {waidbot_status} and Autonomous engine {autonomous_status}! This is pure trading adrenaline!"
      ],
      zen_master: [
        "Breathe... ETH flows peacefully at ${price}, changing {change}% in this {trend} stream. The {volume}M volume represents the collective consciousness trading. Our WaidBot meditates in {waidbot_status} while Autonomous finds balance in {autonomous_status}. Inner peace guides outer success.",
        "In stillness, we observe ETH at ${price} with {change}% movement, flowing {trend} like a mountain stream. The {volume}M volume carries the market's breathing. WaidBot maintains {waidbot_status} harmony while Autonomous achieves {autonomous_status} balance. Mindful trading, mindful profits.",
        "The present moment shows ETH at ${price}, shifting {change}% in {trend} meditation. {volume}M volume reflects the market's heartbeat. Our digital companions: WaidBot in {waidbot_status} state, Autonomous Trader finding {autonomous_status} center. Peace within chaos, profit within patience."
      ]
    };

    return templates[personaId as keyof typeof templates] || templates.konsai;
  }

  private async generateVoiceAudio(content: string, persona: VoicePersona) {
    // Simulate voice generation (in production, integrate with speech synthesis API)
    const duration = Math.ceil(content.length / 10); // Rough estimation
    const waveform = Array.from({length: 50}, () => Math.random() * 100);
    
    return {
      duration,
      waveform,
      voiceId: `${persona.id}_voice_${Date.now()}`
    };
  }

  private async queueNarration(narration: LiveNarration) {
    const priority = this.calculateNarrationPriority(narration);
    
    this.narrationQueue.push({
      priority,
      narration,
      scheduledTime: new Date(Date.now() + (this.narrationQueue.length * 5000)).toISOString()
    });

    // Sort by priority (higher first)
    this.narrationQueue.sort((a, b) => b.priority - a.priority);

    // Add to global commentary queue for story controls integration
    this.addToGlobalCommentaryQueue(narration);

    // Start narration if not currently playing
    if (!this.isNarrating) {
      await this.playNextNarration();
    }
  }

  private addToGlobalCommentaryQueue(narration: LiveNarration): void {
    // Add to global queue for story controls access
    const commentaryItem = {
      id: narration.id,
      title: `${this.activePersonas.get(narration.personaId)?.name || narration.personaId} Commentary`,
      content: narration.content,
      personaId: narration.personaId,
      timestamp: narration.timestamp,
      audioData: narration.audioData,
      duration: narration.audioData?.duration || 10,
      marketContext: narration.marketContext,
      botActivity: narration.botActivity
    };

    // Keep only the 10 most recent commentary items
    global.liveCommentaryQueue.unshift(commentaryItem);
    if (global.liveCommentaryQueue.length > 10) {
      global.liveCommentaryQueue = global.liveCommentaryQueue.slice(0, 10);
    }

    console.log(`📢 [Voice Engine] Added live commentary to global queue: ${commentaryItem.title} (${global.liveCommentaryQueue.length} total)`);
  }

  private async generateInitialCommentary(): Promise<void> {
    console.log('📢 [Voice Engine] Generating initial live commentary for testing...');
    
    // Generate initial commentary from different personas
    const personas = ['konsai', 'sage_trader', 'street_trader'];
    
    for (const personaId of personas) {
      const persona = this.activePersonas.get(personaId);
      if (persona) {
        await this.generateLiveNarration(persona);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between generations
      }
    }
  }

  private async sendToStoryControls(narration: LiveNarration): Promise<void> {
    try {
      // Convert voice narration to story chapter format for playback
      const storyChapter = {
        id: narration.id,
        title: `Live Commentary - ${this.activePersonas.get(narration.personaId)?.name || narration.personaId}`,
        timeframe: 'Real-time',
        narrative: narration.content,
        priceAction: {
          from: narration.marketContext.ethPrice * 0.99, // Simulate previous price
          to: narration.marketContext.ethPrice,
          change: narration.marketContext.priceChange,
          volume: narration.marketContext.volume
        },
        keyEvents: [`Live ${narration.personaId} commentary at ${new Date(narration.timestamp).toLocaleTimeString()}`],
        emotions: {
          fear: Math.random() * 30,
          greed: Math.random() * 40,
          hope: Math.random() * 60,
          panic: Math.random() * 20
        },
        technicalSignals: {
          rsi: Math.random() * 100,
          macd: narration.marketContext.trend === 'BULLISH' ? 'BULLISH' : 'BEARISH',
          support: narration.marketContext.ethPrice * 0.95,
          resistance: narration.marketContext.ethPrice * 1.05
        },
        nextChapterPreview: 'Continue listening to live market commentary...',
        audioData: narration.audioData,
        personaId: narration.personaId,
        timestamp: narration.timestamp,
        isLiveCommentary: true
      };
      
      // Store in global story queue for story controls access
      global.liveCommentaryQueue = global.liveCommentaryQueue || [];
      global.liveCommentaryQueue.unshift(storyChapter); // Add to beginning for latest first
      
      // Keep only last 20 commentary chapters
      if (global.liveCommentaryQueue.length > 20) {
        global.liveCommentaryQueue = global.liveCommentaryQueue.slice(0, 20);
      }
      
    } catch (error) {
      console.error('Failed to send narration to story controls:', error);
    }
  }

  private calculateNarrationPriority(narration: LiveNarration): number {
    let priority = 50; // Base priority
    
    // Higher priority for significant price movements
    const priceChange = Math.abs(narration.marketContext.priceChange);
    if (priceChange > 5) priority += 30;
    else if (priceChange > 2) priority += 15;
    
    // Higher priority for KonsAI during volatile times
    if (narration.personaId === 'konsai' && priceChange > 3) priority += 20;
    
    // Higher priority when bots are active
    const activeBots = Object.values(narration.botActivity).filter(status => 
      status.includes('ACTIVE') || status.includes('EXECUTING')
    ).length;
    priority += activeBots * 10;
    
    return priority;
  }

  private async playNextNarration() {
    if (this.narrationQueue.length === 0) {
      this.isNarrating = false;
      return;
    }

    this.isNarrating = true;
    const nextNarration = this.narrationQueue.shift()!;
    this.currentNarration = nextNarration.narration;

    // In production, this would trigger actual voice playback
    console.log(`🎙️ [${nextNarration.narration.personaId}]: ${nextNarration.narration.content}`);

    // Simulate narration duration
    setTimeout(async () => {
      this.currentNarration = null;
      await this.playNextNarration();
    }, (nextNarration.narration.audioData?.duration || 10) * 1000);
  }

  // Public API methods
  async getCurrentNarration(): Promise<LiveNarration | null> {
    return this.currentNarration;
  }

  async getNarrationQueue(): Promise<NarrationQueue[]> {
    return this.narrationQueue;
  }

  async requestPersonaNarration(personaId: string): Promise<LiveNarration | null> {
    const persona = this.activePersonas.get(personaId);
    if (!persona) return null;

    const ethData = await this.ethMonitor.fetchEthData();
    const marketContext = {
      ethPrice: ethData.price,
      priceChange: ethData.priceChange24h,
      trend: ethData.priceChange24h > 0 ? 'BULLISH' : 'BEARISH',
      volume: ethData.volume
    };

    const botActivity = this.getBotActivityStatus();
    const content = await this.generateNarrativeContent(persona, marketContext, botActivity);

    const narration: LiveNarration = {
      id: `request_${Date.now()}`,
      personaId: persona.id,
      content,
      timestamp: new Date().toISOString(),
      marketContext,
      botActivity,
      audioData: await this.generateVoiceAudio(content, persona)
    };

    await this.queueNarration(narration);
    return narration;
  }

  async togglePersonaActive(personaId: string, active: boolean): Promise<boolean> {
    const persona = this.activePersonas.get(personaId);
    if (!persona) return false;

    if (active) {
      this.activePersonas.set(personaId, persona);
    } else {
      this.activePersonas.delete(personaId);
    }

    return true;
  }

  async getVoicePersonas(): Promise<VoicePersona[]> {
    return Array.from(this.activePersonas.values());
  }

  destroy() {
    if (this.marketUpdateInterval) {
      clearInterval(this.marketUpdateInterval);
    }
    this.narrationQueue = [];
    this.currentNarration = null;
    this.isNarrating = false;
  }
}