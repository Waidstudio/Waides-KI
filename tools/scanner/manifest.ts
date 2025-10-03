import * as fs from 'fs';
import * as path from 'path';
import type { ScanResult, FileMetadata } from './index';

export interface ComponentSpec {
  id: string;
  name: string;
  category: 'bot' | 'exchange' | 'service' | 'route' | 'ui';
  priority: 'critical' | 'important' | 'optional';
  status: 'exists' | 'partial' | 'missing';
  existingFiles: string[];
  requiredFeatures: string[];
  implementedFeatures: string[];
  dependencies: string[];
}

export interface ManifestData {
  generatedAt: Date;
  projectName: string;
  components: ComponentSpec[];
  summary: {
    total: number;
    exists: number;
    partial: number;
    missing: number;
    criticalMissing: number;
  };
  proposedStructure: {
    newModules: string[];
    modifications: string[];
    deletions: string[];
  };
}

export class ManifestGenerator {
  private scanResult: ScanResult;
  private components: ComponentSpec[] = [];

  constructor(scanResult: ScanResult) {
    this.scanResult = scanResult;
  }

  generate(): ManifestData {
    console.log('📋 Generating component manifest...');

    // Analyze all required components
    this.analyzeBots();
    this.analyzeExchanges();
    this.analyzeServices();
    this.analyzeRoutes();
    this.analyzeUI();

    // Generate summary
    const summary = this.generateSummary();

    // Propose new structure
    const proposedStructure = this.proposeStructure();

    const manifest: ManifestData = {
      generatedAt: new Date(),
      projectName: 'Waides KI',
      components: this.components,
      summary,
      proposedStructure
    };

    console.log('✅ Manifest generated successfully');
    return manifest;
  }

  private analyzeBots(): void {
    const requiredBots = [
      {
        id: 'maibot',
        name: 'Maibot',
        features: ['binary_options', 'free_tier', 'demo_mode', 'basic_strategies']
      },
      {
        id: 'waidbot',
        name: 'WaidBot α',
        features: ['binary_options', 'standard_tier', 'advanced_strategies', 'risk_management']
      },
      {
        id: 'waidbot-pro',
        name: 'WaidBot Pro β',
        features: ['binary_options', 'pro_tier', 'ml_strategies', 'position_cap_5k']
      },
      {
        id: 'autonomous-trader',
        name: 'Autonomous Trader γ',
        features: ['forex', 'mt4_mt5', 'autonomous_execution', '24_7_scanner']
      },
      {
        id: 'full-engine',
        name: 'Full Engine Ω',
        features: ['spot_trading', 'multi_exchange', 'ml_engine', 'risk_engine']
      },
      {
        id: 'nwaora-chigozie',
        name: 'Nwaora Chigozie ε',
        features: ['admin_account', 'autonomous', 'binary_spot_switch', 'treasury_integration']
      },
      {
        id: 'smai-chinnikstah',
        name: 'SmaiChinnikstah δ',
        features: ['divine_trading', 'energy_distribution', 'sacred_patterns']
      }
    ];

    requiredBots.forEach(bot => {
      const existingFiles = this.findBotFiles(bot.id);
      const status = existingFiles.length > 0 ? 'exists' : 'missing';

      this.components.push({
        id: bot.id,
        name: bot.name,
        category: 'bot',
        priority: bot.id === 'maibot' || bot.id === 'nwaora-chigozie' ? 'critical' : 'important',
        status,
        existingFiles,
        requiredFeatures: bot.features,
        implementedFeatures: [], // TODO: Analyze actual implementation
        dependencies: ['exchange_connectors', 'risk_manager', 'smaisika_ledger']
      });
    });
  }

  private analyzeExchanges(): void {
    const requiredExchanges = [
      { id: 'deriv', name: 'Deriv', type: 'binary', priority: 'critical' as const },
      { id: 'quotex', name: 'Quotex', type: 'binary', priority: 'important' as const },
      { id: 'pocketoption', name: 'Pocket Option', type: 'binary', priority: 'important' as const },
      { id: 'iqoption', name: 'IQ Option', type: 'binary', priority: 'optional' as const },
      { id: 'mt5', name: 'MT5 Bridge', type: 'forex', priority: 'critical' as const },
      { id: 'binance', name: 'Binance', type: 'spot', priority: 'critical' as const },
      { id: 'bybit', name: 'Bybit', type: 'spot', priority: 'important' as const },
      { id: 'kucoin', name: 'KuCoin', type: 'spot', priority: 'important' as const },
      { id: 'okx', name: 'OKX', type: 'spot', priority: 'optional' as const }
    ];

    requiredExchanges.forEach(exchange => {
      const existingFiles = this.findExchangeFiles(exchange.id);
      const status = existingFiles.length > 0 ? 'exists' : 'missing';

      this.components.push({
        id: `exchange_${exchange.id}`,
        name: exchange.name,
        category: 'exchange',
        priority: exchange.priority,
        status,
        existingFiles,
        requiredFeatures: [
          'testConnection',
          'encrypted_api_keys',
          'health_check',
          'rate_limiting'
        ],
        implementedFeatures: [],
        dependencies: ['credential_manager', 'api_client']
      });
    });
  }

  private analyzeServices(): void {
    const requiredServices = [
      {
        id: 'smaisika_ledger',
        name: 'Smaisika Ledger System',
        priority: 'critical' as const,
        features: ['creditSmaisika', 'debitSmaisika', 'convertToSmaisika', 'convertFromSmaisika', 'balance_tracking', 'audit_trail']
      },
      {
        id: 'profit_sharing',
        name: 'Profit Sharing Engine',
        priority: 'critical' as const,
        features: ['50_50_split', 'configurable_rate', 'automatic_deduction', 'treasury_crediting', 'audit_logging']
      },
      {
        id: 'risk_manager',
        name: 'Risk Management System',
        priority: 'critical' as const,
        features: ['2_percent_rule', 'per_user_overrides', 'position_caps', 'loss_limits']
      },
      {
        id: 'gamification',
        name: 'Gamification Engine',
        priority: 'important' as const,
        features: ['achievements', 'badges', 'leaderboards', 'tournaments', 'daily_streaks']
      },
      {
        id: 'membership',
        name: 'Membership Tier System',
        priority: 'important' as const,
        features: ['bronze_silver_gold_pro', 'tier_benefits', 'expiry_renewal', 'smaisika_pricing']
      },
      {
        id: 'referral',
        name: 'Referral System',
        priority: 'important' as const,
        features: ['referral_codes', 'referral_tree', 'automatic_rewards', 'configurable_payouts']
      }
    ];

    requiredServices.forEach(service => {
      const existingFiles = this.findServiceFiles(service.id);
      const status = existingFiles.length > 0 ? 'exists' : 'missing';

      this.components.push({
        id: service.id,
        name: service.name,
        category: 'service',
        priority: service.priority,
        status,
        existingFiles,
        requiredFeatures: service.features,
        implementedFeatures: [],
        dependencies: []
      });
    });
  }

  private analyzeRoutes(): void {
    const requiredRoutes = [
      {
        id: 'user_routes',
        name: 'User Management Routes',
        endpoints: ['/user/register', '/user/login', '/user/link-exchange', '/user/dashboard/:userId']
      },
      {
        id: 'trade_routes',
        name: 'Trade Execution Routes',
        endpoints: ['/trade/binary', '/trade/forex', '/trade/spot']
      },
      {
        id: 'admin_routes',
        name: 'Admin Control Routes',
        endpoints: ['/admin/risk-settings', '/admin/profit-sharing', '/admin/nwaora-controls']
      }
    ];

    requiredRoutes.forEach(route => {
      const existingFiles = this.findRouteFiles(route.id);
      const status = existingFiles.length > 0 ? 'partial' : 'missing';

      this.components.push({
        id: route.id,
        name: route.name,
        category: 'route',
        priority: 'critical',
        status,
        existingFiles,
        requiredFeatures: route.endpoints,
        implementedFeatures: [],
        dependencies: ['authentication', 'authorization']
      });
    });
  }

  private analyzeUI(): void {
    const requiredUI = [
      {
        id: 'scanner_dashboard',
        name: 'Scanner/Builder Dashboard',
        features: ['view_scan_results', 'component_status', 'trigger_rescans', 'review_proposed_changes']
      },
      {
        id: 'admin_connector_health',
        name: 'Connector Health Dashboard',
        features: ['connection_status', 'automatic_alerts', 'health_checks']
      }
    ];

    requiredUI.forEach(ui => {
      const existingFiles = this.findUIFiles(ui.id);
      const status = existingFiles.length > 0 ? 'exists' : 'missing';

      this.components.push({
        id: ui.id,
        name: ui.name,
        category: 'ui',
        priority: 'important',
        status,
        existingFiles,
        requiredFeatures: ui.features,
        implementedFeatures: [],
        dependencies: ['admin_authentication']
      });
    });
  }

  private findBotFiles(botId: string): string[] {
    const bots = this.scanResult.categories.bots;
    // Handle both FileMetadata[] and string[] formats
    if (typeof bots[0] === 'string') {
      return (bots as string[]).filter(path => 
        path.toLowerCase().includes(botId.toLowerCase())
      );
    }
    return (bots as FileMetadata[])
      .filter(f => f.relativePath.toLowerCase().includes(botId.toLowerCase()))
      .map(f => f.relativePath);
  }

  private findExchangeFiles(exchangeId: string): string[] {
    const exchanges = this.scanResult.categories.exchanges;
    if (typeof exchanges[0] === 'string') {
      return (exchanges as string[]).filter(path => 
        path.toLowerCase().includes(exchangeId.toLowerCase())
      );
    }
    return (exchanges as FileMetadata[])
      .filter(f => f.relativePath.toLowerCase().includes(exchangeId.toLowerCase()))
      .map(f => f.relativePath);
  }

  private findServiceFiles(serviceId: string): string[] {
    const services = this.scanResult.categories.services;
    const searchTerms = serviceId.split('_');
    
    if (typeof services[0] === 'string') {
      return (services as string[]).filter(path => {
        const lower = path.toLowerCase();
        return searchTerms.some(term => lower.includes(term.toLowerCase()));
      });
    }
    return (services as FileMetadata[])
      .filter(f => {
        const lower = f.relativePath.toLowerCase();
        return searchTerms.some(term => lower.includes(term.toLowerCase()));
      })
      .map(f => f.relativePath);
  }

  private findRouteFiles(routeId: string): string[] {
    const routes = this.scanResult.categories.routes;
    const searchTerms = routeId.split('_');
    
    if (typeof routes[0] === 'string') {
      return (routes as string[]).filter(path => {
        const lower = path.toLowerCase();
        return searchTerms.some(term => lower.includes(term.toLowerCase()));
      });
    }
    return (routes as FileMetadata[])
      .filter(f => {
        const lower = f.relativePath.toLowerCase();
        return searchTerms.some(term => lower.includes(term.toLowerCase()));
      })
      .map(f => f.relativePath);
  }

  private findUIFiles(uiId: string): string[] {
    const ui = this.scanResult.categories.ui;
    const searchTerms = uiId.split('_');
    
    if (typeof ui[0] === 'string') {
      return (ui as string[]).filter(path => {
        const lower = path.toLowerCase();
        return searchTerms.some(term => lower.includes(term.toLowerCase()));
      });
    }
    return (ui as FileMetadata[])
      .filter(f => {
        const lower = f.relativePath.toLowerCase();
        return searchTerms.some(term => lower.includes(term.toLowerCase()));
      })
      .map(f => f.relativePath);
  }

  private generateSummary() {
    const total = this.components.length;
    const exists = this.components.filter(c => c.status === 'exists').length;
    const partial = this.components.filter(c => c.status === 'partial').length;
    const missing = this.components.filter(c => c.status === 'missing').length;
    const criticalMissing = this.components.filter(
      c => c.status === 'missing' && c.priority === 'critical'
    ).length;

    return { total, exists, partial, missing, criticalMissing };
  }

  private proposeStructure() {
    const newModules: string[] = [];
    const modifications: string[] = [];

    this.components.forEach(component => {
      if (component.status === 'missing') {
        const proposedPath = this.getProposedPath(component);
        newModules.push(proposedPath);
      } else if (component.status === 'partial') {
        component.existingFiles.forEach(file => {
          modifications.push(file);
        });
      }
    });

    return {
      newModules,
      modifications,
      deletions: [] // We never delete in non-destructive mode
    };
  }

  private getProposedPath(component: ComponentSpec): string {
    const category = component.category;
    const id = component.id;

    switch (category) {
      case 'bot':
        return `proposed/new/server/services/${id}Bot.ts`;
      case 'exchange':
        return `proposed/new/server/connectors/${id.replace('exchange_', '')}.ts`;
      case 'service':
        return `proposed/new/server/lib/${id}.ts`;
      case 'route':
        return `proposed/new/server/routes/${id}.ts`;
      case 'ui':
        return `proposed/new/client/src/pages/${id}Page.tsx`;
      default:
        return `proposed/new/${id}.ts`;
    }
  }
}

export async function saveManifest(manifest: ManifestData, outputPath: string): Promise<void> {
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log(`📋 Manifest saved to: ${outputPath}`);
}

export async function generateManifestFromScan(scanReportPath: string): Promise<ManifestData> {
  console.log('📖 Loading scan report...');
  const scanData = await fs.promises.readFile(scanReportPath, 'utf-8');
  const scanResult = JSON.parse(scanData) as ScanResult;

  const generator = new ManifestGenerator(scanResult);
  const manifest = generator.generate();

  await saveManifest(manifest, 'manifest.json');

  return manifest;
}
