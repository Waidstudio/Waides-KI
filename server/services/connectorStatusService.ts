/**
 * Connector Status Service
 * Monitors and reports status of all connectors across market types
 */

import { MarketTypeManager, MarketType, BotType } from './connectors/marketTypeManager';
import { BINARY_BROKER_CONFIGS } from './connectors/binary';
import { FOREX_PLATFORM_CONFIGS } from './connectors/forex';
import { EXCHANGE_CONFIGS } from './connectors/spot';

export interface ConnectorStatus {
  code: string;
  name: string;
  marketType: MarketType;
  status: 'connected' | 'disconnected' | 'error' | 'not_configured';
  lastChecked: number;
  latency?: number;
  error?: string;
}

export interface MarketTypeStatus {
  marketType: MarketType;
  totalConnectors: number;
  connectedCount: number;
  disconnectedCount: number;
  errorCount: number;
  connectors: ConnectorStatus[];
  associatedBots: BotType[];
}

export class ConnectorStatusService {
  private static statuses: Map<string, ConnectorStatus> = new Map();

  /**
   * Get status of all connectors across all market types
   */
  static async getAllConnectorStatuses(): Promise<{
    binary: MarketTypeStatus;
    forex: MarketTypeStatus;
    spot: MarketTypeStatus;
    summary: {
      totalConnectors: number;
      totalConnected: number;
      totalDisconnected: number;
      totalErrors: number;
    };
  }> {
    const binaryStatuses = this.getBinaryConnectorStatuses();
    const forexStatuses = this.getForexConnectorStatuses();
    const spotStatuses = this.getSpotConnectorStatuses();

    const summary = {
      totalConnectors: binaryStatuses.totalConnectors + forexStatuses.totalConnectors + spotStatuses.totalConnectors,
      totalConnected: binaryStatuses.connectedCount + forexStatuses.connectedCount + spotStatuses.connectedCount,
      totalDisconnected: binaryStatuses.disconnectedCount + forexStatuses.disconnectedCount + spotStatuses.disconnectedCount,
      totalErrors: binaryStatuses.errorCount + forexStatuses.errorCount + spotStatuses.errorCount
    };

    return {
      binary: binaryStatuses,
      forex: forexStatuses,
      spot: spotStatuses,
      summary
    };
  }

  /**
   * Get binary options connector statuses
   */
  private static getBinaryConnectorStatuses(): MarketTypeStatus {
    const connectors: ConnectorStatus[] = Object.entries(BINARY_BROKER_CONFIGS).map(([code, config]) => {
      const cached = this.statuses.get(code);
      return cached || {
        code,
        name: config.name,
        marketType: MarketType.BINARY,
        status: 'not_configured',
        lastChecked: Date.now()
      };
    });

    return {
      marketType: MarketType.BINARY,
      totalConnectors: connectors.length,
      connectedCount: connectors.filter(c => c.status === 'connected').length,
      disconnectedCount: connectors.filter(c => c.status === 'disconnected').length,
      errorCount: connectors.filter(c => c.status === 'error').length,
      connectors,
      associatedBots: [BotType.WAIDBOT, BotType.WAIDBOT_PRO, BotType.MAIBOT]
    };
  }

  /**
   * Get forex connector statuses
   */
  private static getForexConnectorStatuses(): MarketTypeStatus {
    const connectors: ConnectorStatus[] = Object.entries(FOREX_PLATFORM_CONFIGS).map(([code, config]) => {
      const cached = this.statuses.get(code);
      return cached || {
        code,
        name: config.name,
        marketType: MarketType.FOREX,
        status: 'not_configured',
        lastChecked: Date.now()
      };
    });

    return {
      marketType: MarketType.FOREX,
      totalConnectors: connectors.length,
      connectedCount: connectors.filter(c => c.status === 'connected').length,
      disconnectedCount: connectors.filter(c => c.status === 'disconnected').length,
      errorCount: connectors.filter(c => c.status === 'error').length,
      connectors,
      associatedBots: [BotType.AUTONOMOUS]
    };
  }

  /**
   * Get spot exchange connector statuses
   */
  private static getSpotConnectorStatuses(): MarketTypeStatus {
    const connectors: ConnectorStatus[] = Object.entries(EXCHANGE_CONFIGS).map(([code, config]) => {
      const cached = this.statuses.get(code);
      return cached || {
        code,
        name: config.name,
        marketType: MarketType.SPOT,
        status: 'not_configured',
        lastChecked: Date.now()
      };
    });

    return {
      marketType: MarketType.SPOT,
      totalConnectors: connectors.length,
      connectedCount: connectors.filter(c => c.status === 'connected').length,
      disconnectedCount: connectors.filter(c => c.status === 'disconnected').length,
      errorCount: connectors.filter(c => c.status === 'error').length,
      connectors,
      associatedBots: [BotType.FULL_ENGINE]
    };
  }

  /**
   * Test connection for a specific connector
   */
  static async testConnector(code: string, marketType: MarketType): Promise<ConnectorStatus> {
    const startTime = Date.now();

    try {
      // TODO: Implement actual connector testing
      // For now, simulate connection test
      const status: ConnectorStatus = {
        code,
        name: this.getConnectorName(code, marketType),
        marketType,
        status: 'disconnected', // Default to disconnected (not yet implemented)
        lastChecked: Date.now(),
        latency: Date.now() - startTime
      };

      this.statuses.set(code, status);
      return status;
    } catch (error) {
      const status: ConnectorStatus = {
        code,
        name: this.getConnectorName(code, marketType),
        marketType,
        status: 'error',
        lastChecked: Date.now(),
        error: String(error),
        latency: Date.now() - startTime
      };

      this.statuses.set(code, status);
      return status;
    }
  }

  /**
   * Get connector name from code and market type
   */
  private static getConnectorName(code: string, marketType: MarketType): string {
    if (marketType === MarketType.BINARY) {
      return BINARY_BROKER_CONFIGS[code]?.name || code;
    } else if (marketType === MarketType.FOREX) {
      return FOREX_PLATFORM_CONFIGS[code]?.name || code;
    } else if (marketType === MarketType.SPOT) {
      return EXCHANGE_CONFIGS[code]?.name || code;
    }
    return code;
  }

  /**
   * Get market type summary with strategies
   */
  static getMarketTypeSummary() {
    return MarketTypeManager.getMarketSummary();
  }

  /**
   * Validate bot-connector pairing
   */
  static validateBotConnector(botType: BotType, connectorCode: string) {
    return MarketTypeManager.validateBotConnector(botType, connectorCode);
  }
}

export default ConnectorStatusService;
