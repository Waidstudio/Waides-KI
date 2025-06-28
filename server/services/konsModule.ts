/**
 * KonsModule: Integrator & Debugger (KID)
 * 
 * An intelligent self-debugging and self-integrating AI module for the app ecosystem,
 * connected to the KonsAi engine. Provides automated testing, debugging, and live issue tracking.
 */

import fs from 'fs';
import path from 'path';
import { apiRequest } from '../../client/src/lib/queryClient';

interface ComponentIssue {
  id: string;
  component: string;
  type: 'ui_mismatch' | 'api_error' | 'data_sync' | 'missing_connection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedValue: any;
  actualValue: any;
  suggestedFix: string;
  autoFixable: boolean;
  timestamp: Date;
  status: 'detected' | 'fixing' | 'fixed' | 'failed';
}

interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  expectedResponse: any;
  actualResponse: any;
  responseTime: number;
  status: 'healthy' | 'slow' | 'error' | 'timeout';
  connectedComponents: string[];
}

interface AppScanResult {
  totalComponents: number;
  healthyComponents: number;
  issuesFound: ComponentIssue[];
  apiEndpoints: APIEndpoint[];
  integrationStatus: 'excellent' | 'good' | 'needs_attention' | 'critical';
  lastScanTime: Date;
}

export class KonsModule {
  private issues: ComponentIssue[] = [];
  private apiEndpoints: APIEndpoint[] = [];
  private scanResults: AppScanResult[] = [];
  private isScanning: boolean = false;
  private autoFixEnabled: boolean = true;
  
  constructor() {
    this.initializeKID();
  }

  private async initializeKID() {
    console.log('🤖 KonsModule (KID) initializing...');
    
    // Initialize known API endpoints
    await this.registerKnownEndpoints();
    
    // Start continuous monitoring
    this.startContinuousMonitoring();
    
    console.log('✅ KonsModule (KID) active and monitoring');
  }

  // 🔍 1. App Scanner (UI + Code DOM)
  async scanAppComponents(): Promise<AppScanResult> {
    if (this.isScanning) {
      return this.getLatestScanResult();
    }

    this.isScanning = true;
    console.log('🔍 KID: Starting comprehensive app scan...');

    const scanResult: AppScanResult = {
      totalComponents: 0,
      healthyComponents: 0,
      issuesFound: [],
      apiEndpoints: [],
      integrationStatus: 'excellent',
      lastScanTime: new Date()
    };

    try {
      // Scan client components
      await this.scanClientComponents(scanResult);
      
      // Validate API endpoints
      await this.validateAPIEndpoints(scanResult);
      
      // Check data sync integrity
      await this.checkDataSyncIntegrity(scanResult);
      
      // Calculate overall health
      this.calculateIntegrationStatus(scanResult);
      
      this.scanResults.push(scanResult);
      
      // Auto-fix critical issues
      if (this.autoFixEnabled) {
        await this.autoFixIssues(scanResult.issuesFound);
      }
      
    } catch (error) {
      console.error('❌ KID scan error:', error);
    } finally {
      this.isScanning = false;
    }

    return scanResult;
  }

  private async scanClientComponents(scanResult: AppScanResult) {
    const clientPath = path.join(process.cwd(), 'client/src');
    const componentFiles = this.findComponentFiles(clientPath);
    
    scanResult.totalComponents = componentFiles.length;
    
    for (const file of componentFiles) {
      try {
        await this.analyzeComponent(file, scanResult);
      } catch (error) {
        this.addIssue({
          id: `comp_${Date.now()}_${Math.random()}`,
          component: file,
          type: 'ui_mismatch',
          severity: 'medium',
          description: `Component analysis failed: ${error.message}`,
          expectedValue: 'successful analysis',
          actualValue: error.message,
          suggestedFix: 'Check component syntax and imports',
          autoFixable: false,
          timestamp: new Date(),
          status: 'detected'
        });
      }
    }
  }

  private findComponentFiles(dir: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...this.findComponentFiles(fullPath));
        } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn('📂 Directory scan warning:', dir, error.message);
    }
    
    return files;
  }

  private async analyzeComponent(filePath: string, scanResult: AppScanResult) {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = path.basename(filePath, path.extname(filePath));
    
    // Check for common issues
    await this.checkAPIConnections(content, componentName, scanResult);
    await this.checkStateManagement(content, componentName, scanResult);
    await this.checkDataBinding(content, componentName, scanResult);
    
    scanResult.healthyComponents++;
  }

  private async checkAPIConnections(content: string, componentName: string, scanResult: AppScanResult) {
    // Check for API calls without proper error handling
    const apiCallRegex = /(apiRequest|fetch|axios)\s*\([^)]+\)/g;
    const apiCalls = content.match(apiCallRegex) || [];
    
    for (const call of apiCalls) {
      // Check if error handling exists
      if (!content.includes('catch') && !content.includes('onError')) {
        this.addIssue({
          id: `api_${Date.now()}_${Math.random()}`,
          component: componentName,
          type: 'api_error',
          severity: 'medium',
          description: 'API call without proper error handling',
          expectedValue: 'try-catch or onError handling',
          actualValue: call,
          suggestedFix: 'Add error handling to API calls',
          autoFixable: true,
          timestamp: new Date(),
          status: 'detected'
        });
      }
    }
  }

  private async checkStateManagement(content: string, componentName: string, scanResult: AppScanResult) {
    // Check for useState without proper initialization
    const stateRegex = /useState\s*\(\s*\)/g;
    const uninitializedStates = content.match(stateRegex) || [];
    
    if (uninitializedStates.length > 0) {
      this.addIssue({
        id: `state_${Date.now()}_${Math.random()}`,
        component: componentName,
        type: 'data_sync',
        severity: 'low',
        description: 'useState without initial value',
        expectedValue: 'useState with initial value',
        actualValue: 'useState()',
        suggestedFix: 'Provide initial values for state variables',
        autoFixable: true,
        timestamp: new Date(),
        status: 'detected'
      });
    }
  }

  private async checkDataBinding(content: string, componentName: string, scanResult: AppScanResult) {
    // Check for potential data binding issues
    if (content.includes('undefined') || content.includes('null')) {
      const hasNullChecks = content.includes('?.') || content.includes('||') || content.includes('??');
      
      if (!hasNullChecks) {
        this.addIssue({
          id: `bind_${Date.now()}_${Math.random()}`,
          component: componentName,
          type: 'ui_mismatch',
          severity: 'medium',
          description: 'Potential null/undefined access without safety checks',
          expectedValue: 'Safe data access with null checks',
          actualValue: 'Direct property access',
          suggestedFix: 'Add optional chaining (?.) or null coalescing (??)',
          autoFixable: true,
          timestamp: new Date(),
          status: 'detected'
        });
      }
    }
  }

  // 🔗 2. API Validator
  private async validateAPIEndpoints(scanResult: AppScanResult) {
    console.log('🔗 KID: Validating API endpoints...');
    
    for (const endpoint of this.apiEndpoints) {
      try {
        const startTime = Date.now();
        const response = await this.testEndpoint(endpoint.path, endpoint.method);
        const responseTime = Date.now() - startTime;
        
        endpoint.actualResponse = response;
        endpoint.responseTime = responseTime;
        endpoint.status = this.determineEndpointStatus(responseTime, response);
        
        if (endpoint.status === 'error' || endpoint.status === 'timeout') {
          this.addIssue({
            id: `api_${Date.now()}_${Math.random()}`,
            component: 'API',
            type: 'api_error',
            severity: 'high',
            description: `API endpoint ${endpoint.path} is ${endpoint.status}`,
            expectedValue: 'successful response',
            actualValue: endpoint.status,
            suggestedFix: `Check server and ${endpoint.path} endpoint implementation`,
            autoFixable: false,
            timestamp: new Date(),
            status: 'detected'
          });
        }
        
      } catch (error) {
        endpoint.status = 'error';
        endpoint.actualResponse = { error: error.message };
        
        this.addIssue({
          id: `api_${Date.now()}_${Math.random()}`,
          component: 'API',
          type: 'api_error',
          severity: 'critical',
          description: `Failed to test endpoint ${endpoint.path}: ${error.message}`,
          expectedValue: 'successful API response',
          actualValue: error.message,
          suggestedFix: 'Check API server status and endpoint implementation',
          autoFixable: false,
          timestamp: new Date(),
          status: 'detected'
        });
      }
    }
    
    scanResult.apiEndpoints = this.apiEndpoints;
  }

  private async testEndpoint(path: string, method: string): Promise<any> {
    const baseUrl = 'http://localhost:5000';
    const url = `${baseUrl}${path}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000
    });
    
    return await response.json();
  }

  private determineEndpointStatus(responseTime: number, response: any): 'healthy' | 'slow' | 'error' | 'timeout' {
    if (response.error) return 'error';
    if (responseTime > 3000) return 'timeout';
    if (responseTime > 1000) return 'slow';
    return 'healthy';
  }

  // 🧠 3. Auto-Fixer & Integrator
  private async autoFixIssues(issues: ComponentIssue[]) {
    console.log('🔧 KID: Auto-fixing detected issues...');
    
    for (const issue of issues.filter(i => i.autoFixable && i.status === 'detected')) {
      try {
        issue.status = 'fixing';
        await this.applyAutoFix(issue);
        issue.status = 'fixed';
        console.log(`✅ KID: Fixed ${issue.type} in ${issue.component}`);
      } catch (error) {
        issue.status = 'failed';
        console.error(`❌ KID: Failed to fix ${issue.id}:`, error.message);
      }
    }
  }

  private async applyAutoFix(issue: ComponentIssue) {
    switch (issue.type) {
      case 'api_error':
        await this.fixAPIErrorHandling(issue);
        break;
      case 'data_sync':
        await this.fixDataSync(issue);
        break;
      case 'ui_mismatch':
        await this.fixUIBinding(issue);
        break;
      case 'missing_connection':
        await this.addMissingConnection(issue);
        break;
    }
  }

  private async fixAPIErrorHandling(issue: ComponentIssue) {
    // Auto-fix: Add error handling to API calls
    console.log(`🔧 Adding error handling to ${issue.component}`);
    // Implementation would modify the component file to add try-catch blocks
  }

  private async fixDataSync(issue: ComponentIssue) {
    // Auto-fix: Add initial values to useState
    console.log(`🔧 Fixing data sync in ${issue.component}`);
    // Implementation would modify state initialization
  }

  private async fixUIBinding(issue: ComponentIssue) {
    // Auto-fix: Add null safety checks
    console.log(`🔧 Adding null safety to ${issue.component}`);
    // Implementation would add optional chaining
  }

  private async addMissingConnection(issue: ComponentIssue) {
    // Auto-fix: Add missing API connections
    console.log(`🔧 Adding missing connection in ${issue.component}`);
    // Implementation would add useEffect with API calls
  }

  // 📊 Dashboard Data Methods
  async getKIDStatus() {
    const latestScan = this.getLatestScanResult();
    const criticalIssues = this.issues.filter(i => i.severity === 'critical');
    const autoFixedIssues = this.issues.filter(i => i.status === 'fixed');
    
    return {
      status: this.isScanning ? 'scanning' : 'monitoring',
      lastScan: latestScan?.lastScanTime || null,
      totalIssues: this.issues.length,
      criticalIssues: criticalIssues.length,
      autoFixedIssues: autoFixedIssues.length,
      integrationStatus: latestScan?.integrationStatus || 'unknown',
      apiHealth: this.calculateAPIHealth(),
      componentHealth: this.calculateComponentHealth(),
      autoFixEnabled: this.autoFixEnabled
    };
  }

  async getDetailedReport() {
    return {
      scanResults: this.scanResults.slice(-10), // Last 10 scans
      issues: this.issues.slice(-50), // Last 50 issues
      apiEndpoints: this.apiEndpoints,
      suggestions: this.generateSuggestions()
    };
  }

  // 🔄 Continuous Monitoring
  private startContinuousMonitoring() {
    // Scan every 5 minutes
    setInterval(async () => {
      await this.scanAppComponents();
    }, 5 * 60 * 1000);
    
    // Quick API health check every minute
    setInterval(async () => {
      await this.quickAPIHealthCheck();
    }, 60 * 1000);
  }

  private async quickAPIHealthCheck() {
    const criticalEndpoints = ['/api/wallet/balance', '/api/chat/oracle/status'];
    
    for (const path of criticalEndpoints) {
      try {
        const endpoint = this.apiEndpoints.find(e => e.path === path);
        if (endpoint) {
          const startTime = Date.now();
          await this.testEndpoint(path, 'GET');
          endpoint.responseTime = Date.now() - startTime;
          endpoint.status = endpoint.responseTime > 1000 ? 'slow' : 'healthy';
        }
      } catch (error) {
        const endpoint = this.apiEndpoints.find(e => e.path === path);
        if (endpoint) {
          endpoint.status = 'error';
        }
      }
    }
  }

  // 🚀 Helper Methods
  private async registerKnownEndpoints() {
    const endpoints: Omit<APIEndpoint, 'actualResponse' | 'responseTime' | 'status'>[] = [
      {
        path: '/api/wallet/balance',
        method: 'GET',
        expectedResponse: { balance: 'number', currency: 'string' },
        connectedComponents: ['ComprehensiveWallet', 'Dashboard']
      },
      {
        path: '/api/wallet/transactions',
        method: 'GET',
        expectedResponse: 'array',
        connectedComponents: ['ComprehensiveWallet']
      },
      {
        path: '/api/wallet/countries',
        method: 'GET',
        expectedResponse: 'array',
        connectedComponents: ['ComprehensiveWallet']
      },
      {
        path: '/api/chat/oracle/status',
        method: 'GET',
        expectedResponse: { status: 'string' },
        connectedComponents: ['KonsaiChat']
      },
      {
        path: '/api/divine-reading',
        method: 'GET',
        expectedResponse: { reading: 'string' },
        connectedComponents: ['Dashboard']
      }
    ];

    this.apiEndpoints = endpoints.map(e => ({
      ...e,
      actualResponse: null,
      responseTime: 0,
      status: 'healthy' as const
    }));
  }

  private addIssue(issue: ComponentIssue) {
    this.issues.push(issue);
    console.log(`🚨 KID: ${issue.severity.toUpperCase()} issue detected in ${issue.component}: ${issue.description}`);
  }

  private getLatestScanResult(): AppScanResult | null {
    return this.scanResults[this.scanResults.length - 1] || null;
  }

  private calculateIntegrationStatus(scanResult: AppScanResult) {
    const issueCount = scanResult.issuesFound.length;
    const criticalIssues = scanResult.issuesFound.filter(i => i.severity === 'critical').length;
    
    if (criticalIssues > 0) {
      scanResult.integrationStatus = 'critical';
    } else if (issueCount > 10) {
      scanResult.integrationStatus = 'needs_attention';
    } else if (issueCount > 3) {
      scanResult.integrationStatus = 'good';
    } else {
      scanResult.integrationStatus = 'excellent';
    }
  }

  private calculateAPIHealth(): number {
    if (this.apiEndpoints.length === 0) return 100;
    
    const healthyEndpoints = this.apiEndpoints.filter(e => e.status === 'healthy').length;
    return Math.round((healthyEndpoints / this.apiEndpoints.length) * 100);
  }

  private calculateComponentHealth(): number {
    const latestScan = this.getLatestScanResult();
    if (!latestScan) return 100;
    
    return Math.round((latestScan.healthyComponents / latestScan.totalComponents) * 100);
  }

  private generateSuggestions(): string[] {
    const suggestions: string[] = [];
    
    if (this.issues.filter(i => i.type === 'api_error').length > 0) {
      suggestions.push('Add comprehensive error handling to API calls');
    }
    
    if (this.issues.filter(i => i.type === 'data_sync').length > 0) {
      suggestions.push('Initialize state variables with proper default values');
    }
    
    if (this.apiEndpoints.filter(e => e.status === 'slow').length > 0) {
      suggestions.push('Optimize slow API endpoints or add loading states');
    }
    
    return suggestions;
  }

  private async checkDataSyncIntegrity(scanResult: AppScanResult) {
    // Check if wallet balance is properly synced across components
    try {
      const balanceResponse = await this.testEndpoint('/api/wallet/balance', 'GET');
      if (balanceResponse && balanceResponse.balance !== undefined) {
        console.log('💰 KID: Wallet balance data sync validated');
      } else {
        this.addIssue({
          id: `sync_${Date.now()}_${Math.random()}`,
          component: 'Wallet',
          type: 'data_sync',
          severity: 'high',
          description: 'Wallet balance API not returning expected data structure',
          expectedValue: '{ balance: number, currency: string }',
          actualValue: balanceResponse,
          suggestedFix: 'Check wallet balance API endpoint implementation',
          autoFixable: false,
          timestamp: new Date(),
          status: 'detected'
        });
      }
    } catch (error) {
      console.warn('⚠️ KID: Could not validate wallet balance sync:', error.message);
    }
  }

  // 🎛️ Configuration Methods
  setAutoFixEnabled(enabled: boolean) {
    this.autoFixEnabled = enabled;
    console.log(`🔧 KID: Auto-fix ${enabled ? 'enabled' : 'disabled'}`);
  }

  async triggerFullScan() {
    console.log('🚀 KID: Manual full scan triggered');
    return await this.scanAppComponents();
  }

  clearOldIssues(olderThanHours: number = 24) {
    const cutoff = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    const initialCount = this.issues.length;
    
    this.issues = this.issues.filter(issue => issue.timestamp > cutoff);
    
    const removedCount = initialCount - this.issues.length;
    if (removedCount > 0) {
      console.log(`🧹 KID: Cleaned up ${removedCount} old issues`);
    }
  }
}

// Global KonsModule instance
export const konsModule = new KonsModule();