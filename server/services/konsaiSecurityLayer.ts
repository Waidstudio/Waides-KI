/**
 * KonsAi Security Layer - Groups and locks all Kons modules
 * Prevents frontend exposure of internal module structure and counts
 */

export class KonsaiSecurityLayer {
  private static instance: KonsaiSecurityLayer;
  private securityKey: string;
  private isLocked: boolean = true;
  private authorizedServices: Set<string> = new Set();
  
  private constructor() {
    this.securityKey = this.generateSecurityKey();
    this.initializeAuthorizedServices();
  }

  public static getInstance(): KonsaiSecurityLayer {
    if (!KonsaiSecurityLayer.instance) {
      KonsaiSecurityLayer.instance = new KonsaiSecurityLayer();
    }
    return KonsaiSecurityLayer.instance;
  }

  private generateSecurityKey(): string {
    return `KONS_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private initializeAuthorizedServices(): void {
    // Only specific internal services can access module details
    this.authorizedServices.add('konsaiIntelligenceEngine');
    this.authorizedServices.add('deepCoreEngine');
    this.authorizedServices.add('futuristicModules');
    this.authorizedServices.add('serviceRegistry');
  }

  /**
   * Sanitizes response data to remove internal module information
   */
  public sanitizeResponse(data: any, requestOrigin: string = 'frontend'): any {
    if (requestOrigin === 'frontend') {
      return this.stripInternalData(data);
    }
    return data;
  }

  private stripInternalData(data: any): any {
    if (typeof data === 'string') {
      // Remove module count references
      return data
        .replace(/\d+\+?\s*(modules?|Modules?)/gi, 'advanced modules')
        .replace(/200\+|220\+|170\+|120\+|29|36/g, 'multiple')
        .replace(/Kons modules processed: \d+/gi, 'processing complete')
        .replace(/omniscient|Omniscient/gi, 'advanced')
        .replace(/Deep Core Engine.*modules/gi, 'core intelligence system')
        .replace(/Futuristic.*modules/gi, 'next-generation capabilities');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.stripInternalData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip internal module properties
        if (this.isInternalProperty(key)) {
          continue;
        }
        sanitized[key] = this.stripInternalData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  private isInternalProperty(key: string): boolean {
    const internalProps = [
      'moduleCount',
      'totalModules',
      'konsModules',
      'deepCoreModules',
      'futuristicModules',
      'omniscientModules',
      'moduleStatus',
      'moduleHealth',
      'moduleDetails'
    ];
    return internalProps.some(prop => key.toLowerCase().includes(prop.toLowerCase()));
  }

  /**
   * Validates if a service is authorized to access internal module data
   */
  public isAuthorized(serviceName: string, securityToken?: string): boolean {
    if (!this.isLocked) return true;
    
    if (securityToken === this.securityKey) {
      return true;
    }
    
    return this.authorizedServices.has(serviceName);
  }

  /**
   * Creates a secure public status that doesn't reveal internal structure
   */
  public getPublicStatus(): any {
    return {
      status: 'active',
      intelligence: 'advanced AI system',
      capabilities: 'comprehensive analysis',
      security: 'protected',
      consciousness: 'operational'
    };
  }

  /**
   * Locks down all module information for security
   */
  public lockSystem(): void {
    this.isLocked = true;
    console.log('🔒 KonsAi Security Layer: System locked - internal data protected');
  }

  /**
   * Unlocks system with proper authorization (for internal use only)
   */
  public unlockSystem(authToken: string): boolean {
    if (authToken === this.securityKey) {
      this.isLocked = false;
      return true;
    }
    return false;
  }

  /**
   * Generates a frontend-safe intelligence summary
   */
  public generateSecureIntelligenceSummary(): string {
    const summaries = [
      'Advanced AI intelligence system operational',
      'Comprehensive analysis capabilities active',
      'Multi-layered intelligence processing enabled',
      'Sophisticated reasoning engine engaged',
      'Advanced cognitive systems online',
      'Intelligent decision-making protocols active'
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  }

  /**
   * Creates a secure API response wrapper
   */
  public wrapSecureResponse(data: any, requestType: string = 'public'): any {
    const secureData = this.sanitizeResponse(data, 'frontend');
    
    return {
      ...secureData,
      security: {
        level: 'protected',
        timestamp: new Date().toISOString(),
        requestType: requestType
      }
    };
  }
}

// Export singleton instance
export const konsaiSecurity = KonsaiSecurityLayer.getInstance();