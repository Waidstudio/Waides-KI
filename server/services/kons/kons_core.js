/**
 * KonsCore - Brainstem of Konsai
 * 
 * Central coordination module that connects all other KonsModules
 * and controls the flow of intelligence throughout the system.
 */

import { EventEmitter } from 'events';

class KonsCore extends EventEmitter {
  constructor() {
    super();
    this.isActive = false;
    this.moduleRegistry = new Map();
    this.coordinationState = {
      activeModules: [],
      moduleHealth: new Map(),
      dataFlow: new Map(),
      systemMetrics: {
        totalModules: 0,
        activeConnections: 0,
        processedMessages: 0,
        systemUptime: Date.now()
      }
    };
    
    this.intelligenceFlow = {
      inputQueue: [],
      processingQueue: [],
      outputQueue: [],
      coordinationRules: new Map()
    };
    
    console.log('🧠 KonsCore (Brainstem) initializing...');
  }

  async initializeKonsCore() {
    try {
      this.isActive = true;
      await this.setupCoordinationRules();
      await this.initializeDataFlow();
      this.startCoordinationLoop();
      console.log('🧠✅ KonsCore active and coordinating...');
      return true;
    } catch (error) {
      console.log('🧠❌ KonsCore initialization error:', error.message);
      return false;
    }
  }

  async setupCoordinationRules() {
    // Define how modules interact with each other
    this.coordinationRules.set('bug_detection', {
      trigger_modules: ['kons_sense', 'kons_kid', 'kons_reach'],
      response_modules: ['kons_dev', 'kons_heal', 'kons_patch'],
      coordination_type: 'sequential',
      priority: 'high'
    });

    this.coordinationRules.set('performance_optimization', {
      trigger_modules: ['kons_tune', 'kons_echo'],
      response_modules: ['kons_dev', 'kons_build'],
      coordination_type: 'parallel',
      priority: 'medium'
    });

    this.coordinationRules.set('security_threat', {
      trigger_modules: ['kons_guard'],
      response_modules: ['kons_heal', 'kons_patch', 'kons_tell'],
      coordination_type: 'immediate',
      priority: 'critical'
    });

    this.coordinationRules.set('learning_update', {
      trigger_modules: ['kons_train', 'kons_echo'],
      response_modules: ['kons_mind', 'kons_plan'],
      coordination_type: 'background',
      priority: 'low'
    });
  }

  async initializeDataFlow() {
    // Setup data flow channels between modules
    if (!this.dataFlow) this.dataFlow = new Map();
    this.dataFlow.set('sensor_data', {
      sources: ['kons_sense', 'kons_ais', 'kons_reach'],
      destinations: ['kons_mind', 'kons_plan', 'kons_react'],
      processing: 'real_time'
    });

    this.dataFlow.set('fix_requests', {
      sources: ['kons_kid', 'kons_sense'],
      destinations: ['kons_dev', 'kons_heal'],
      processing: 'priority_queue'
    });

    this.dataFlow.set('system_reports', {
      sources: ['kons_tell', 'kons_tune'],
      destinations: ['kons_mind', 'kons_echo'],
      processing: 'batch'
    });
  }

  registerModule(moduleName, moduleInstance) {
    this.moduleRegistry.set(moduleName, moduleInstance);
    this.coordinationState.activeModules.push(moduleName);
    this.coordinationState.moduleHealth.set(moduleName, 'healthy');
    this.coordinationState.systemMetrics.totalModules++;
    
    console.log(`🔗 KonsCore: Registered ${moduleName}`);
    this.emit('module_registered', { moduleName, timestamp: Date.now() });
  }

  async coordinateModules(event, data) {
    const relevantRules = Array.from(this.coordinationRules.entries())
      .filter(([_, rule]) => this.matchesEvent(event, rule));

    for (const [ruleName, rule] of relevantRules) {
      await this.executeCoordinationRule(ruleName, rule, data);
    }
  }

  matchesEvent(event, rule) {
    // Check if event matches any trigger conditions
    return rule.trigger_modules.some(module => 
      event.source === module || event.type.includes(module.split('_')[1])
    );
  }

  async executeCoordinationRule(ruleName, rule, data) {
    const { response_modules, coordination_type, priority } = rule;
    
    switch (coordination_type) {
      case 'sequential':
        await this.executeSequential(response_modules, data);
        break;
      case 'parallel':
        await this.executeParallel(response_modules, data);
        break;
      case 'immediate':
        await this.executeImmediate(response_modules, data);
        break;
      case 'background':
        this.executeBackground(response_modules, data);
        break;
    }

    this.emit('rule_executed', { ruleName, modules: response_modules, timestamp: Date.now() });
  }

  async executeSequential(modules, data) {
    for (const moduleName of modules) {
      const module = this.moduleRegistry.get(moduleName);
      if (module && module.processCoordinatedRequest) {
        await module.processCoordinatedRequest(data);
      }
    }
  }

  async executeParallel(modules, data) {
    const promises = modules.map(moduleName => {
      const module = this.moduleRegistry.get(moduleName);
      return module && module.processCoordinatedRequest ? 
        module.processCoordinatedRequest(data) : Promise.resolve();
    });
    
    await Promise.all(promises);
  }

  async executeImmediate(modules, data) {
    // High priority immediate execution
    const promises = modules.map(moduleName => {
      const module = this.moduleRegistry.get(moduleName);
      if (module && module.processUrgentRequest) {
        return module.processUrgentRequest(data);
      }
      return module && module.processCoordinatedRequest ? 
        module.processCoordinatedRequest(data) : Promise.resolve();
    });
    
    await Promise.all(promises);
  }

  executeBackground(modules, data) {
    // Non-blocking background execution
    setTimeout(() => {
      modules.forEach(moduleName => {
        const module = this.moduleRegistry.get(moduleName);
        if (module && module.processBackgroundRequest) {
          module.processBackgroundRequest(data);
        }
      });
    }, 100);
  }

  startCoordinationLoop() {
    setInterval(async () => {
      await this.processIntelligenceFlow();
      await this.updateSystemMetrics();
      await this.performHealthChecks();
    }, 5000); // Every 5 seconds
  }

  async processIntelligenceFlow() {
    // Process queued intelligence requests
    while (this.intelligenceFlow.inputQueue.length > 0) {
      const request = this.intelligenceFlow.inputQueue.shift();
      this.intelligenceFlow.processingQueue.push(request);
      
      await this.coordinateModules(request.event, request.data);
      
      const processedIndex = this.intelligenceFlow.processingQueue.indexOf(request);
      if (processedIndex > -1) {
        this.intelligenceFlow.processingQueue.splice(processedIndex, 1);
        this.intelligenceFlow.outputQueue.push({
          ...request,
          processed: true,
          timestamp: Date.now()
        });
      }
    }

    // Keep output queue manageable
    if (this.intelligenceFlow.outputQueue.length > 100) {
      this.intelligenceFlow.outputQueue = this.intelligenceFlow.outputQueue.slice(-50);
    }
  }

  async updateSystemMetrics() {
    this.coordinationState.systemMetrics.activeConnections = this.moduleRegistry.size;
    this.coordinationState.systemMetrics.processedMessages++;
  }

  async performHealthChecks() {
    for (const [moduleName, module] of this.moduleRegistry) {
      try {
        const health = module.getModuleHealth ? await module.getModuleHealth() : 'unknown';
        this.coordinationState.moduleHealth.set(moduleName, health);
      } catch (error) {
        this.coordinationState.moduleHealth.set(moduleName, 'error');
        this.emit('module_health_issue', { moduleName, error: error.message });
      }
    }
  }

  async requestIntelligence(event, data) {
    this.intelligenceFlow.inputQueue.push({
      event,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
  }

  async getBrainStemStatus() {
    return {
      status: this.isActive ? 'active' : 'inactive',
      role: 'central_coordinator',
      total_modules: this.coordinationState.systemMetrics.totalModules,
      active_modules: this.coordinationState.activeModules.length,
      healthy_modules: Array.from(this.coordinationState.moduleHealth.values())
        .filter(health => health === 'healthy').length,
      coordination_rules: this.coordinationRules.size,
      data_flows: this.dataFlow.size,
      processed_messages: this.coordinationState.systemMetrics.processedMessages,
      uptime: Date.now() - this.coordinationState.systemMetrics.systemUptime,
      input_queue_size: this.intelligenceFlow.inputQueue.length,
      processing_queue_size: this.intelligenceFlow.processingQueue.length
    };
  }

  async getDetailedCoordinationReport() {
    const moduleStatuses = {};
    for (const [moduleName, health] of this.coordinationState.moduleHealth) {
      moduleStatuses[moduleName] = health;
    }

    return {
      brainstem_overview: {
        coordination_active: this.isActive,
        intelligence_flow: 'continuous',
        module_orchestration: 'automated'
      },
      module_registry: moduleStatuses,
      coordination_rules: Object.fromEntries(this.coordinationRules),
      data_flow_channels: Object.fromEntries(this.dataFlow),
      recent_events: this.intelligenceFlow.outputQueue.slice(-10),
      system_metrics: this.coordinationState.systemMetrics,
      recommendations: this.generateCoordinationRecommendations()
    };
  }

  generateCoordinationRecommendations() {
    const recommendations = [];
    
    const unhealthyModules = Array.from(this.coordinationState.moduleHealth.entries())
      .filter(([_, health]) => health !== 'healthy');
    
    if (unhealthyModules.length > 0) {
      recommendations.push({
        category: 'module_health',
        recommendation: 'Address unhealthy modules for optimal system performance',
        affected_modules: unhealthyModules.map(([name, _]) => name)
      });
    }

    if (this.intelligenceFlow.inputQueue.length > 10) {
      recommendations.push({
        category: 'performance',
        recommendation: 'High input queue detected - consider optimizing processing speed',
        queue_size: this.intelligenceFlow.inputQueue.length
      });
    }

    return recommendations;
  }

  getModuleInfo() {
    return {
      name: 'KonsCore',
      title: 'Brainstem Coordinator',
      type: 'central_coordination',
      capabilities: [
        'Module Registration',
        'Intelligence Flow Control',
        'Coordination Rules',
        'Data Flow Management',
        'Health Monitoring',
        'System Orchestration'
      ],
      status: this.isActive ? 'active' : 'inactive',
      coordination_level: 'brainstem',
      version: '1.0.0'
    };
  }
}

export { KonsCore };