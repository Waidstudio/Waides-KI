import { WaidesKICommandProcessor } from './waidesKICommandProcessor.js';

interface VoiceCommand {
  command: string;
  confidence: number;
  timestamp: string;
  userId?: string;
}

interface VoiceResponse {
  text: string;
  action?: string;
  data?: any;
  confidence: number;
  processingTime: number;
}

interface VoiceSession {
  sessionId: string;
  userId?: string;
  startTime: string;
  lastActivity: string;
  commandCount: number;
  commands: VoiceCommand[];
}

export class VoiceProcessor {
  private sessions: Map<string, VoiceSession> = new Map();
  private commandProcessor: WaidesKICommandProcessor;
  private voicePatterns: Map<string, RegExp> = new Map();
  private responseTemplates: Map<string, string[]> = new Map();

  constructor() {
    this.commandProcessor = new WaidesKICommandProcessor();
    this.initializeVoicePatterns();
    this.initializeResponseTemplates();
  }

  private initializeVoicePatterns() {
    // Trading commands
    this.voicePatterns.set('start_trading', /(?:start|begin|activate|enable).*(?:trading|bot|auto)/i);
    this.voicePatterns.set('stop_trading', /(?:stop|halt|disable|pause).*(?:trading|bot|auto)/i);
    this.voicePatterns.set('emergency_stop', /(?:emergency|urgent|immediate).*(?:stop|halt|shutdown)/i);
    
    // Status commands
    this.voicePatterns.set('show_status', /(?:show|display|what.*is|get).*(?:status|state|condition)/i);
    this.voicePatterns.set('check_balance', /(?:check|show|what.*is).*(?:balance|money|funds|capital)/i);
    this.voicePatterns.set('portfolio_summary', /(?:portfolio|holdings|positions|investments).*(?:summary|overview|status)/i);
    
    // Market analysis
    this.voicePatterns.set('predict_eth', /(?:predict|forecast|analyze).*(?:eth|ethereum).*(?:price|movement|direction)/i);
    this.voicePatterns.set('market_analysis', /(?:analyze|check|what.*is).*(?:market|trend|condition)/i);
    this.voicePatterns.set('get_signals', /(?:get|show|what.*are).*(?:signals|recommendations|advice)/i);
    
    // Risk management
    this.voicePatterns.set('set_risk', /(?:set|change|adjust).*(?:risk|position.*size|amount)/i);
    this.voicePatterns.set('set_stop_loss', /(?:set|change|adjust).*(?:stop.*loss|exit|protection)/i);
    this.voicePatterns.set('set_take_profit', /(?:set|change|adjust).*(?:take.*profit|target|goal)/i);
    
    // System commands
    this.voicePatterns.set('help', /(?:help|what.*can|commands|options)/i);
    this.voicePatterns.set('reset', /(?:reset|restart|clear|fresh.*start)/i);
    this.voicePatterns.set('save_settings', /(?:save|store|remember).*(?:settings|preferences|configuration)/i);
  }

  private initializeResponseTemplates() {
    this.responseTemplates.set('start_trading', [
      'Activating autonomous trading mode. Waides KI is now scanning markets.',
      'Trading system online. Beginning market analysis and position management.',
      'Autonomous trading activated. All systems monitoring ETH markets.'
    ]);

    this.responseTemplates.set('stop_trading', [
      'Trading halted. All positions will be maintained until manual intervention.',
      'Autonomous trading disabled. Waides KI entering observation mode.',
      'Trading stopped. System now in protective monitoring state.'
    ]);

    this.responseTemplates.set('emergency_stop', [
      'Emergency protocol activated. All trading immediately halted.',
      'Emergency stop executed. All systems in lockdown mode.',
      'Critical halt engaged. Trading suspended for safety.'
    ]);

    this.responseTemplates.set('show_status', [
      'System status: {status}. Trading mode: {trading_mode}. Current balance: {balance} dollars.',
      'Waides KI status report: {status}. Active trades: {active_trades}. Portfolio value: {portfolio_value}.',
      'Current state: {status}. Market analysis: {market_condition}. Risk level: {risk_level}.'
    ]);

    this.responseTemplates.set('predict_eth', [
      'ETH prediction: {prediction}. Confidence: {confidence} percent. Target: {target} dollars.',
      'Ethereum forecast: {direction} movement expected. Probability: {confidence} percent.',
      'Market analysis suggests ETH will {prediction} with {confidence} percent confidence.'
    ]);

    this.responseTemplates.set('market_analysis', [
      'Market analysis complete. Trend: {trend}. Volatility: {volatility}. Sentiment: {sentiment}.',
      'Current market: {condition}. RSI: {rsi}. Volume: {volume_analysis}.',
      'Market state: {market_phase}. Recommendation: {recommendation}.'
    ]);

    this.responseTemplates.set('error', [
      'Unable to process that command. Please try again.',
      'Command not recognized. Say help for available options.',
      'Processing error occurred. Please rephrase your request.'
    ]);

    this.responseTemplates.set('help', [
      'Available commands: start trading, stop trading, show status, predict ETH, analyze market, check balance.',
      'Voice commands ready. Try: activate trading, show portfolio, market analysis, or emergency stop.',
      'Waides KI listening. Supported: trading controls, status checks, market predictions, risk management.'
    ]);
  }

  async processVoiceCommand(command: string, sessionId?: string): Promise<VoiceResponse> {
    const startTime = Date.now();
    const session = this.getOrCreateSession(sessionId);
    
    const voiceCommand: VoiceCommand = {
      command: command.toLowerCase().trim(),
      confidence: 0.85, // Default confidence
      timestamp: new Date().toISOString()
    };

    // Add to session
    session.commands.push(voiceCommand);
    session.commandCount++;
    session.lastActivity = new Date().toISOString();

    try {
      // Pattern matching for voice commands
      const matchedPattern = this.matchVoicePattern(voiceCommand.command);
      
      if (matchedPattern) {
        const response = await this.executeVoiceCommand(matchedPattern, voiceCommand.command);
        const processingTime = Date.now() - startTime;

        return {
          text: response.text,
          action: response.action,
          data: response.data,
          confidence: response.confidence || 0.85,
          processingTime
        };
      } else {
        // Fallback to command processor
        const result = await this.commandProcessor.processCommand(voiceCommand.command);
        const processingTime = Date.now() - startTime;

        return {
          text: result.response || this.getRandomTemplate('error'),
          action: result.action,
          data: result,
          confidence: 0.7,
          processingTime
        };
      }
    } catch (error) {
      console.error('Voice command processing error:', error);
      const processingTime = Date.now() - startTime;

      return {
        text: this.getRandomTemplate('error'),
        confidence: 0.0,
        processingTime
      };
    }
  }

  private matchVoicePattern(command: string): string | null {
    for (const [patternName, regex] of this.voicePatterns) {
      if (regex.test(command)) {
        return patternName;
      }
    }
    return null;
  }

  private async executeVoiceCommand(pattern: string, command: string): Promise<{text: string, action?: string, data?: any, confidence?: number}> {
    switch (pattern) {
      case 'start_trading':
        return {
          text: this.getRandomTemplate('start_trading'),
          action: 'START_TRADING',
          confidence: 0.9
        };

      case 'stop_trading':
        return {
          text: this.getRandomTemplate('stop_trading'),
          action: 'STOP_TRADING',
          confidence: 0.9
        };

      case 'emergency_stop':
        return {
          text: this.getRandomTemplate('emergency_stop'),
          action: 'EMERGENCY_STOP',
          confidence: 0.95
        };

      case 'show_status':
        const statusData = await this.getSystemStatus();
        return {
          text: this.formatTemplate('show_status', statusData),
          action: 'SHOW_STATUS',
          data: statusData,
          confidence: 0.9
        };

      case 'predict_eth':
        const prediction = await this.getEthPrediction();
        return {
          text: this.formatTemplate('predict_eth', prediction),
          action: 'PREDICT_ETH',
          data: prediction,
          confidence: 0.85
        };

      case 'market_analysis':
        const analysis = await this.getMarketAnalysis();
        return {
          text: this.formatTemplate('market_analysis', analysis),
          action: 'MARKET_ANALYSIS',
          data: analysis,
          confidence: 0.85
        };

      case 'check_balance':
        const balance = await this.getBalance();
        return {
          text: `Current portfolio balance is ${balance.total} dollars. Available for trading: ${balance.available} dollars.`,
          action: 'CHECK_BALANCE',
          data: balance,
          confidence: 0.9
        };

      case 'help':
        return {
          text: this.getRandomTemplate('help'),
          action: 'HELP',
          confidence: 0.95
        };

      default:
        return {
          text: this.getRandomTemplate('error'),
          confidence: 0.3
        };
    }
  }

  private getRandomTemplate(templateName: string): string {
    const templates = this.responseTemplates.get(templateName) || ['Command processed.'];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private formatTemplate(templateName: string, data: any): string {
    let template = this.getRandomTemplate(templateName);
    
    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
      const placeholder = `{${key}}`;
      if (template.includes(placeholder)) {
        template = template.replace(new RegExp(placeholder, 'g'), data[key]?.toString() || 'unknown');
      }
    });

    return template;
  }

  private async getSystemStatus(): Promise<any> {
    try {
      // Simulate system status call
      return {
        status: 'active',
        trading_mode: 'autonomous',
        balance: '10000',
        active_trades: '2',
        portfolio_value: '10245',
        market_condition: 'bullish',
        risk_level: 'moderate'
      };
    } catch (error) {
      return {
        status: 'unknown',
        trading_mode: 'offline',
        balance: '0',
        active_trades: '0',
        portfolio_value: '0',
        market_condition: 'unknown',
        risk_level: 'unknown'
      };
    }
  }

  private async getEthPrediction(): Promise<any> {
    try {
      // Simulate ETH prediction
      const predictions = [
        { prediction: 'rise 3-5%', direction: 'upward', confidence: '78', target: '2650' },
        { prediction: 'consolidate', direction: 'sideways', confidence: '65', target: '2500' },
        { prediction: 'decline 2-4%', direction: 'downward', confidence: '72', target: '2350' }
      ];
      
      return predictions[Math.floor(Math.random() * predictions.length)];
    } catch (error) {
      return {
        prediction: 'uncertain',
        direction: 'unknown',
        confidence: '0',
        target: 'unknown'
      };
    }
  }

  private async getMarketAnalysis(): Promise<any> {
    try {
      return {
        trend: 'bullish',
        volatility: 'moderate',
        sentiment: 'positive',
        condition: 'healthy',
        rsi: '62',
        volume_analysis: 'above average',
        market_phase: 'accumulation',
        recommendation: 'cautiously optimistic'
      };
    } catch (error) {
      return {
        trend: 'unknown',
        volatility: 'unknown',
        sentiment: 'unknown',
        condition: 'unknown',
        rsi: 'unknown',
        volume_analysis: 'unknown',
        market_phase: 'unknown',
        recommendation: 'wait'
      };
    }
  }

  private async getBalance(): Promise<any> {
    try {
      return {
        total: '10245',
        available: '8500',
        invested: '1745',
        profit_loss: '+245'
      };
    } catch (error) {
      return {
        total: '0',
        available: '0',
        invested: '0',
        profit_loss: '0'
      };
    }
  }

  private getOrCreateSession(sessionId?: string): VoiceSession {
    const id = sessionId || `session_${Date.now()}`;
    
    if (!this.sessions.has(id)) {
      const session: VoiceSession = {
        sessionId: id,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        commandCount: 0,
        commands: []
      };
      this.sessions.set(id, session);
    }

    return this.sessions.get(id)!;
  }

  getSessionStats(sessionId: string): VoiceSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllSessions(): VoiceSession[] {
    return Array.from(this.sessions.values());
  }

  clearSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  getVoiceStatus(): any {
    return {
      activeSessions: this.sessions.size,
      totalCommands: Array.from(this.sessions.values()).reduce((sum, session) => sum + session.commandCount, 0),
      supportedPatterns: Array.from(this.voicePatterns.keys()),
      lastActivity: Array.from(this.sessions.values()).reduce((latest, session) => {
        return session.lastActivity > latest ? session.lastActivity : latest;
      }, ''),
      systemStatus: 'online'
    };
  }

  // Enhanced natural language processing
  extractParameters(command: string, pattern: string): any {
    const params: any = {};

    switch (pattern) {
      case 'set_risk':
        const riskMatch = command.match(/(\d+(?:\.\d+)?)\s*(?:percent|%)/i);
        if (riskMatch) {
          params.riskPercentage = parseFloat(riskMatch[1]);
        }
        break;

      case 'set_stop_loss':
        const stopMatch = command.match(/(\d+(?:\.\d+)?)/);
        if (stopMatch) {
          params.stopLossPrice = parseFloat(stopMatch[1]);
        }
        break;

      case 'set_take_profit':
        const profitMatch = command.match(/(\d+(?:\.\d+)?)/);
        if (profitMatch) {
          params.takeProfitPrice = parseFloat(profitMatch[1]);
        }
        break;
    }

    return params;
  }

  // Voice synthesis optimization
  optimizeResponseForSpeech(text: string): string {
    // Replace numbers with speech-friendly versions
    let optimized = text
      .replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 dollars')
      .replace(/(\d+)%/g, '$1 percent')
      .replace(/ETH/g, 'Ethereum')
      .replace(/BTC/g, 'Bitcoin')
      .replace(/USD/g, 'dollars');

    // Add natural pauses
    optimized = optimized
      .replace(/\./g, '. ')
      .replace(/,/g, ', ')
      .replace(/:/g, ': ');

    return optimized.trim();
  }
}