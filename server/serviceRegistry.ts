/**
 * Service Registry - Lazy Loading System for Waides KI
 * Prevents memory leaks by only loading services when needed
 */

type ServiceConstructor = () => Promise<any>;

class ServiceRegistry {
  private services: Map<string, any> = new Map();
  private serviceLoaders: Map<string, ServiceConstructor> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  /**
   * Register a service with lazy loading
   */
  register(name: string, loader: ServiceConstructor): void {
    this.serviceLoaders.set(name, loader);
  }

  /**
   * Get a service instance (loads if not already loaded)
   */
  async get<T = any>(name: string): Promise<T> {
    // Return existing instance if available
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    // Return loading promise if already loading
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }

    // Load the service
    const loader = this.serviceLoaders.get(name);
    if (!loader) {
      throw new Error(`Service '${name}' not registered`);
    }

    const loadingPromise = this.loadService(name, loader);
    this.loadingPromises.set(name, loadingPromise);

    return loadingPromise;
  }

  /**
   * Load a service and handle errors gracefully
   */
  private async loadService(name: string, loader: ServiceConstructor): Promise<any> {
    try {
      console.log(`Loading service: ${name}`);
      const service = await loader();
      this.services.set(name, service);
      this.loadingPromises.delete(name);
      return service;
    } catch (error) {
      console.error(`Failed to load service '${name}':`, error);
      this.loadingPromises.delete(name);
      // Return a stub service to prevent crashes
      return this.createStubService(name);
    }
  }

  /**
   * Create a stub service that prevents crashes
   */
  private createStubService(name: string): any {
    const stub: any = {
      name: `${name}-stub`,
      isStub: true,
      async initialize() { return stub; },
      async start() { return stub; },
      async stop() { return stub; },
      async process() { return null; },
      async analyze() { return null; },
      async execute() { return null; },
      getStatus() { return { active: false, error: `Service ${name} failed to load` }; }
    };

    // Add common method stubs
    const commonMethods = [
      'performVirtualScan', 'evaluateTradeEntry', 'generateSignal', 'analyzeTrend',
      'calculateRisk', 'processData', 'updateState', 'getMetrics', 'reset',
      'processMessage', 'generateEnhancedResponse', 'getCurrentData', 'getConnectionStatus',
      'getRandomQuestions', 'getCurrentStatus'
    ];

    commonMethods.forEach(method => {
      stub[method] = async () => null;
    });

    return stub;
  }

  /**
   * Get list of loaded services
   */
  getLoadedServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): { totalServices: number, loadedServices: number, memoryUsage: string } {
    const totalServices = this.serviceLoaders.size;
    const loadedServices = this.services.size;
    const memoryUsage = process.memoryUsage();
    
    return {
      totalServices,
      loadedServices,
      memoryUsage: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
    };
  }

  /**
   * Clean up unused services to free memory
   */
  cleanup(): void {
    let cleaned = 0;
    this.services.forEach((service, name) => {
      if (service.isStub || (service.lastUsed && Date.now() - service.lastUsed > 300000)) { // 5 minutes
        this.services.delete(name);
        cleaned++;
      }
    });
    console.log(`Cleaned up ${cleaned} unused services`);
  }
}

// Create global service registry
export const serviceRegistry = new ServiceRegistry();

// Register core services with lazy loading
serviceRegistry.register('ethMonitor', async () => {
  const { EthMonitor } = await import('./services/ethMonitor.js');
  return new EthMonitor();
});

serviceRegistry.register('signalAnalyzer', async () => {
  const { SignalAnalyzer } = await import('./services/signalAnalyzer.js');
  return new SignalAnalyzer();
});

serviceRegistry.register('binanceWebSocket', async () => {
  const { BinanceWebSocketService } = await import('./services/binanceWebSocket.js');
  return new BinanceWebSocketService();
});

serviceRegistry.register('konsaiEngine', async () => {
  const { KonsaiEngineStandalone } = await import('./services/konsaiEngineStandalone.js');
  return new KonsaiEngineStandalone();
});

serviceRegistry.register('waidesCore', async () => {
  const { waidesKICore } = await import('./services/waidesKICore.js');
  return waidesKICore;
});

serviceRegistry.register('tradingBrain', async () => {
  try {
    const { tradingBrain } = await import('./services/tradingBrainEngine.js');
    return tradingBrain;
  } catch (error) {
    console.log('Trading brain service not available, using stub');
    return {
      getRandomQuestions: async (count: number) => [
        { question: "What is risk management?", category: "Risk" },
        { question: "How do you calculate position size?", category: "Strategy" }
      ]
    };
  }
});

// Cleanup interval to prevent memory leaks
setInterval(() => serviceRegistry.cleanup(), 300000); // Every 5 minutes

export default serviceRegistry;