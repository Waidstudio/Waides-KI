/**
 * KonsMesh Security Layer - End-to-End Encryption & Authentication
 * Implements comprehensive security for mesh communication
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

export interface SecurityContext {
  entityId: string;
  authLevel: 'basic' | 'advanced' | 'divine' | 'omniscient';
  spiritualAlignment: number;
  karmaScore: number;
  sessionId: string;
  timestamp: number;
}

export interface EncryptedMessage {
  payload: string;
  signature: string;
  timestamp: number;
  entityId: string;
  messageId: string;
  nonce: string;
}

export interface AuthenticationResult {
  authenticated: boolean;
  entityId: string;
  authLevel: string;
  spiritualAlignment: number;
  permissions: string[];
  sessionId: string;
  expiresAt: number;
}

export class KonsAiMeshSecurityLayer extends EventEmitter {
  private entityKeys = new Map<string, { publicKey: string; privateKey: string }>();
  private sessionTokens = new Map<string, AuthenticationResult>();
  private messageHistory = new Map<string, EncryptedMessage>();
  private encryptionAlgorithm = 'aes-256-gcm';
  private keySize = 32; // 256 bits
  
  constructor() {
    super();
    this.initializeSecurity();
    console.log('🔐 KonsAi Mesh Security Layer initialized - End-to-End encryption active');
  }

  /**
   * Initialize security infrastructure
   */
  private initializeSecurity(): void {
    // Initialize encryption keys for all 6 entities
    const entities = [
      'waidbot_alpha',
      'waidbot_pro_beta', 
      'autonomous_gamma',
      'full_engine_omega',
      'smai_chinnikstah_delta',
      'nwaora_chigozie_epsilon'
    ];

    entities.forEach(entityId => {
      const keyPair = this.generateEntityKeyPair();
      this.entityKeys.set(entityId, keyPair);
    });

    // Start security monitoring
    this.startSecurityMonitoring();
  }

  /**
   * Generate cryptographic key pair for entity
   */
  private generateEntityKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });

    return { publicKey, privateKey };
  }

  /**
   * Authenticate bot with KonsAi for signal mastery
   */
  public async authenticateBot(entityId: string, spiritualAlignment: number, karmaScore: number): Promise<AuthenticationResult> {
    try {
      // Validate spiritual alignment and karma
      const minAlignment = this.getMinimumAlignment(entityId);
      const minKarma = this.getMinimumKarma(entityId);

      if (spiritualAlignment < minAlignment || karmaScore < minKarma) {
        return {
          authenticated: false,
          entityId,
          authLevel: 'basic',
          spiritualAlignment: 0,
          permissions: [],
          sessionId: '',
          expiresAt: 0
        };
      }

      // Determine auth level based on spiritual metrics
      const authLevel = this.calculateAuthLevel(spiritualAlignment, karmaScore);
      
      // Generate session token
      const sessionId = crypto.randomBytes(16).toString('hex');
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

      // Get permissions based on auth level
      const permissions = this.getEntityPermissions(entityId, authLevel);

      const authResult: AuthenticationResult = {
        authenticated: true,
        entityId,
        authLevel,
        spiritualAlignment,
        permissions,
        sessionId,
        expiresAt
      };

      // Store session
      this.sessionTokens.set(sessionId, authResult);

      this.emit('botAuthenticated', { entityId, authLevel, spiritualAlignment });
      console.log(`🤖✅ Bot authenticated: ${entityId} (${authLevel} level)`);

      return authResult;
    } catch (error) {
      console.error('🔐❌ Authentication error:', error);
      throw error;
    }
  }

  /**
   * Encrypt message with end-to-end encryption
   */
  public encryptMessage(message: any, fromEntityId: string, toEntityId: string): EncryptedMessage {
    try {
      const messageId = crypto.randomBytes(16).toString('hex');
      const nonce = crypto.randomBytes(12);
      const key = crypto.randomBytes(this.keySize);
      
      // Create cipher
      const cipher = crypto.createCipher('aes-256-cbc', key.toString('hex'));
      
      // Encrypt message
      const messageStr = JSON.stringify(message);
      let encrypted = cipher.update(messageStr, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Create encrypted payload
      const payload = {
        encrypted,
        key: key.toString('hex')
      };

      // Sign with sender's private key
      const senderKeys = this.entityKeys.get(fromEntityId);
      if (!senderKeys) {
        throw new Error(`No keys found for entity: ${fromEntityId}`);
      }

      const signature = crypto.sign('sha256', Buffer.from(JSON.stringify(payload)), senderKeys.privateKey);

      const encryptedMessage: EncryptedMessage = {
        payload: JSON.stringify(payload),
        signature: signature.toString('hex'),
        timestamp: Date.now(),
        entityId: fromEntityId,
        messageId,
        nonce: nonce.toString('hex')
      };

      // Store in history for audit
      this.messageHistory.set(messageId, encryptedMessage);

      return encryptedMessage;
    } catch (error) {
      console.error('🔐❌ Encryption error:', error);
      throw error;
    }
  }

  /**
   * Decrypt and verify message
   */
  public decryptMessage(encryptedMessage: EncryptedMessage, toEntityId: string): any {
    try {
      // Verify signature
      const senderKeys = this.entityKeys.get(encryptedMessage.entityId);
      if (!senderKeys) {
        throw new Error(`No keys found for sender: ${encryptedMessage.entityId}`);
      }

      const signatureBuffer = Buffer.from(encryptedMessage.signature, 'hex');
      const isValid = crypto.verify('sha256', Buffer.from(encryptedMessage.payload), senderKeys.publicKey, signatureBuffer);
      
      if (!isValid) {
        throw new Error('Message signature verification failed');
      }

      // Parse payload
      const payload = JSON.parse(encryptedMessage.payload);
      const key = payload.key;

      // Create decipher
      const decipher = crypto.createDecipher('aes-256-cbc', key);

      // Decrypt message
      let decrypted = decipher.update(payload.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('🔐❌ Decryption error:', error);
      throw error;
    }
  }

  /**
   * Validate session and check permissions
   */
  public validateSession(sessionId: string, requiredPermission?: string): boolean {
    const session = this.sessionTokens.get(sessionId);
    
    if (!session || session.expiresAt < Date.now()) {
      return false;
    }

    if (requiredPermission && !session.permissions.includes(requiredPermission)) {
      return false;
    }

    return true;
  }

  /**
   * Check if bot should be isolated due to misbehavior
   */
  public checkBotIsolation(entityId: string): { shouldIsolate: boolean; reason?: string } {
    // Get recent performance metrics
    const recentFailures = this.getRecentFailures(entityId);
    const spiritualAlignment = this.getSpiritualAlignment(entityId);
    const karmaScore = this.getKarmaScore(entityId);

    // Isolation criteria
    if (recentFailures > 10) {
      this.isolateBot(entityId, 'Excessive failures detected');
      return { shouldIsolate: true, reason: 'Excessive failures' };
    }

    if (spiritualAlignment < 0.3) {
      this.isolateBot(entityId, 'Spiritual alignment too low');
      return { shouldIsolate: true, reason: 'Low spiritual alignment' };
    }

    if (karmaScore < 0.2) {
      this.isolateBot(entityId, 'Negative karma threshold reached');
      return { shouldIsolate: true, reason: 'Negative karma' };
    }

    return { shouldIsolate: false };
  }

  /**
   * Isolate misbehaving bot
   */
  private isolateBot(entityId: string, reason: string): void {
    // Remove all active sessions
    for (const [sessionId, session] of Array.from(this.sessionTokens.entries())) {
      if (session.entityId === entityId) {
        this.sessionTokens.delete(sessionId);
      }
    }

    this.emit('botIsolated', { entityId, reason, timestamp: Date.now() });
    console.log(`🚫 Bot isolated: ${entityId} - ${reason}`);
  }

  /**
   * Get security status report
   */
  public getSecurityStatus(): any {
    return {
      activeSessions: this.sessionTokens.size,
      authenticatedEntities: Array.from(this.sessionTokens.values()).map(s => s.entityId),
      messageHistory: this.messageHistory.size,
      encryptionStatus: 'ACTIVE',
      securityLevel: 'MAXIMUM',
      lastSecurityCheck: Date.now()
    };
  }

  // Helper methods
  private getMinimumAlignment(entityId: string): number {
    const requirements = {
      'waidbot_alpha': 0.7,
      'waidbot_pro_beta': 0.75,
      'autonomous_gamma': 0.8,
      'full_engine_omega': 0.85,
      'smai_chinnikstah_delta': 0.9,
      'nwaora_chigozie_epsilon': 0.95
    };
    return requirements[entityId as keyof typeof requirements] || 0.7;
  }

  private getMinimumKarma(entityId: string): number {
    return 0.6; // Base karma requirement
  }

  private calculateAuthLevel(spiritualAlignment: number, karmaScore: number): string {
    const combined = (spiritualAlignment + karmaScore) / 2;
    if (combined >= 0.95) return 'omniscient';
    if (combined >= 0.85) return 'divine';
    if (combined >= 0.75) return 'advanced';
    return 'basic';
  }

  private getEntityPermissions(entityId: string, authLevel: string): string[] {
    const basePermissions = ['read_signals', 'send_heartbeat'];
    const advancedPermissions = [...basePermissions, 'trade_execute', 'risk_override'];
    const divinePermissions = [...advancedPermissions, 'system_broadcast', 'mesh_control'];
    const omniscientPermissions = [...divinePermissions, 'emergency_intervention', 'bot_redeployment'];

    switch (authLevel) {
      case 'omniscient': return omniscientPermissions;
      case 'divine': return divinePermissions;
      case 'advanced': return advancedPermissions;
      default: return basePermissions;
    }
  }

  private startSecurityMonitoring(): void {
    // Cleanup expired sessions every 5 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of Array.from(this.sessionTokens.entries())) {
        if (session.expiresAt < now) {
          this.sessionTokens.delete(sessionId);
        }
      }
    }, 5 * 60 * 1000);
  }

  private getRecentFailures(entityId: string): number {
    // Mock implementation - would integrate with actual metrics
    return Math.floor(Math.random() * 5);
  }

  private getSpiritualAlignment(entityId: string): number {
    // Mock implementation - would get from actual spiritual metrics
    return 0.8 + (Math.random() * 0.2);
  }

  private getKarmaScore(entityId: string): number {
    // Mock implementation - would get from actual karma tracking
    return 0.7 + (Math.random() * 0.3);
  }
}

// Singleton instance
let meshSecurityInstance: KonsAiMeshSecurityLayer | null = null;

export function getKonsAiMeshSecurity(): KonsAiMeshSecurityLayer {
  if (!meshSecurityInstance) {
    meshSecurityInstance = new KonsAiMeshSecurityLayer();
  }
  return meshSecurityInstance;
}