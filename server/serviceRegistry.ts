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
      const service = await loader();
      this.services.set(name, service);
      this.loadingPromises.delete(name);
      return service;
    } catch (error) {
      this.loadingPromises.delete(name);
      console.error(`Failed to load service '${name}':`, error);
      
      // Return a stub service that prevents crashes
      const stub = this.createStubService(name);
      this.services.set(name, stub);
      return stub;
    }
  }

  /**
   * Create a stub service that prevents crashes
   */
  private createStubService(name: string): any {
    const stub = {
      async initialize() { return stub; },
      async start() { return stub; },
      async stop() { return stub; },
      async process() { return null; },
      async analyze() { return null; },
      async execute() { return null; },
      getStatus() { return { active: false, error: `Service ${name} failed to load` }; }
    };
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
    return {
      totalServices: this.serviceLoaders.size,
      loadedServices: this.services.size,
      memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
    };
  }

  /**
   * Clean up unused services to free memory
   */
  cleanup(): void {
    // Keep core services, clean up others
    const coreServices = ['ethMonitor', 'konsaiEngine', 'storage', 'binanceWebSocket'];
    for (const [name, service] of this.services.entries()) {
      if (!coreServices.includes(name)) {
        this.services.delete(name);
      }
    }
  }
}

export const serviceRegistry = new ServiceRegistry();

// Register all core services
serviceRegistry.register('storage', async () => {
  const { DatabaseStorage } = await import('./storage.js');
  return new DatabaseStorage();
});

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

// Register SINGLE unified KonsAi Intelligence Engine
serviceRegistry.register('konsaiEngine', async () => {
  console.log('Loading service: KonsAi Intelligence Engine - Unified System');
  try {
    // Load the single unified KonsAi Intelligence Engine
    const konsaiModule = await import('./services/konsaiIntelligenceEngine.js');
    const KonsaiIntelligenceEngine = konsaiModule.default || konsaiModule.KonsaiIntelligenceEngine;
    const konsaiEngine = new KonsaiIntelligenceEngine();
    
    console.log('Successfully loaded unified KonsAi Intelligence Engine');
    
    return konsaiEngine;
    
  } catch (error) {
    console.log('Error loading unified KonsAi engine, using fallback:', (error as Error).message);
    // Fallback to standalone engine if main engine fails
    const { KonsaiEngineStandalone } = await import('./services/konsaiEngineStandalone.js');
    return new KonsaiEngineStandalone();
  }
});

// Fallback KonsAi engine that works completely independently 
serviceRegistry.register('konsaiEngineStandalone', async () => {
  const { KonsaiEngineStandalone } = await import('./services/konsaiEngineStandalone.js');
  
  return {
      async generateEnhancedResponse(message: string, context?: any): Promise<string> {
        const engine = new KonsaiEngineStandalone();
        return await engine.generateEnhancedResponse(message, context);
      },

    async processQuery(query: string, context?: any): Promise<string> {
      const engine = new KonsaiEngineStandalone();
      return await engine.processQuery(query, context);
    },

    getStatus() {
      return {
        status: 'active', 
        engine: 'Standalone KonsAi Engine',
        capabilities: ['Trading Analysis', 'Risk Management', 'Market Intelligence', 'Educational Support']
      };
    }
  };
});

export { serviceRegistry };