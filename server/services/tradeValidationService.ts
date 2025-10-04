/**
 * Trade Validation Service
 * Enforces bot-to-market validation across all trading operations
 */

import { MarketTypeManager, BotType, MarketType } from './connectors/marketTypeManager';

export interface TradeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  requiredMarketType?: MarketType;
  providedConnector?: string;
}

export interface TradeRequest {
  botType: BotType | string;
  connectorCode: string;
  symbol?: string;
  amount?: number;
  orderType?: string;
  tradingMode?: 'demo' | 'real';
}

export class TradeValidationService {
  /**
   * Validate a trade request before execution
   */
  static validateTradeRequest(request: TradeRequest): TradeValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate bot type
    const botType = this.parseBotType(request.botType);
    if (!botType) {
      errors.push(`Invalid bot type: ${request.botType}`);
      return {
        valid: false,
        errors,
        warnings,
        providedConnector: request.connectorCode
      };
    }

    // Validate bot-to-market connector pairing
    const validation = MarketTypeManager.validateBotConnector(botType, request.connectorCode);
    
    if (!validation.valid) {
      errors.push(validation.reason || 'Bot-connector validation failed');
      errors.push(`Expected market type: ${validation.marketType}`);
      errors.push(`Use one of the compatible connectors for ${validation.marketType} market`);
    }

    // Add warnings for demo mode trades
    if (request.tradingMode === 'demo') {
      warnings.push('Demo mode trade - no real funds will be used');
    }

    // Validate amount if provided
    if (request.amount !== undefined && request.amount <= 0) {
      errors.push('Trade amount must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      requiredMarketType: validation.marketType,
      providedConnector: request.connectorCode
    };
  }

  /**
   * Parse bot type string to BotType enum
   */
  private static parseBotType(botTypeStr: string): BotType | null {
    const normalized = botTypeStr.toUpperCase().replace(/[^A-Z_]/g, '_');
    
    const mapping: Record<string, BotType> = {
      'WAIDBOT': BotType.WAIDBOT,
      'WAIDBOT_ALPHA': BotType.WAIDBOT,
      'ALPHA': BotType.WAIDBOT,
      'WAIDBOT_PRO': BotType.WAIDBOT_PRO,
      'WAIDBOT_PRO_BETA': BotType.WAIDBOT_PRO,
      'BETA': BotType.WAIDBOT_PRO,
      'MAIBOT': BotType.MAIBOT,
      'AUTONOMOUS': BotType.AUTONOMOUS,
      'AUTONOMOUS_TRADER': BotType.AUTONOMOUS,
      'GAMMA': BotType.AUTONOMOUS,
      'FULL_ENGINE': BotType.FULL_ENGINE,
      'FULL_ENGINE_OMEGA': BotType.FULL_ENGINE,
      'OMEGA': BotType.FULL_ENGINE
    };

    return mapping[normalized] || null;
  }

  /**
   * Get recommended connectors for a bot
   */
  static getRecommendedConnectors(botType: BotType | string): {
    botType: BotType | null;
    marketType?: MarketType;
    connectors: Array<{ code: string; name: string; }>;
    strategy?: any;
  } {
    const bot = typeof botType === 'string' ? this.parseBotType(botType) : botType;
    
    if (!bot) {
      return {
        botType: null,
        connectors: []
      };
    }

    const marketType = MarketTypeManager.getMarketTypeForBot(bot);
    const connectorsData = MarketTypeManager.getConnectorsForMarket(marketType);
    const strategy = MarketTypeManager.getStrategyForMarket(marketType);

    let connectors: Array<{ code: string; name: string; }> = [];

    if ('brokers' in connectorsData && connectorsData.brokers) {
      connectors = Object.entries(connectorsData.brokers).map(([code, config]) => ({
        code,
        name: config.name
      }));
    } else if ('platforms' in connectorsData && connectorsData.platforms) {
      connectors = Object.entries(connectorsData.platforms).map(([code, config]) => ({
        code,
        name: config.name
      }));
    } else if ('exchanges' in connectorsData && connectorsData.exchanges) {
      connectors = Object.entries(connectorsData.exchanges).map(([code, config]) => ({
        code,
        name: config.name
      }));
    }

    return {
      botType: bot,
      marketType,
      connectors,
      strategy
    };
  }

  /**
   * Validate multiple trade requests in batch
   */
  static validateBatch(requests: TradeRequest[]): {
    valid: boolean;
    results: TradeValidationResult[];
    totalErrors: number;
    totalWarnings: number;
  } {
    const results = requests.map(req => this.validateTradeRequest(req));
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
    const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

    return {
      valid: results.every(r => r.valid),
      results,
      totalErrors,
      totalWarnings
    };
  }

  /**
   * Create detailed validation report
   */
  static createValidationReport(request: TradeRequest): string {
    const validation = this.validateTradeRequest(request);
    
    let report = `=== Trade Validation Report ===\n`;
    report += `Bot Type: ${request.botType}\n`;
    report += `Connector: ${request.connectorCode}\n`;
    report += `Status: ${validation.valid ? '✅ VALID' : '❌ INVALID'}\n`;
    
    if (validation.requiredMarketType) {
      report += `Required Market Type: ${validation.requiredMarketType}\n`;
    }
    
    if (validation.errors.length > 0) {
      report += `\nErrors:\n`;
      validation.errors.forEach((error, i) => {
        report += `  ${i + 1}. ${error}\n`;
      });
    }
    
    if (validation.warnings.length > 0) {
      report += `\nWarnings:\n`;
      validation.warnings.forEach((warning, i) => {
        report += `  ${i + 1}. ${warning}\n`;
      });
    }
    
    if (!validation.valid) {
      const recommendations = this.getRecommendedConnectors(request.botType);
      if (recommendations.connectors.length > 0) {
        report += `\nRecommended Connectors:\n`;
        recommendations.connectors.forEach((conn, i) => {
          report += `  ${i + 1}. ${conn.name} (${conn.code})\n`;
        });
      }
    }
    
    return report;
  }
}

export default TradeValidationService;
