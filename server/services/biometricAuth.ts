import crypto from 'crypto';
import { db } from '../storage';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export interface BiometricCredential {
  id: string;
  rawId: ArrayBuffer;
  response: {
    authenticatorData: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle?: ArrayBuffer;
  };
  type: string;
}

export interface BiometricAuthResult {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
  error?: string;
}

export class BiometricAuthService {
  private readonly jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'waides-ki-biometric-secret';
  }

  // Generate challenge for biometric registration
  generateChallenge(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  // Register biometric credential for user
  async registerBiometric(userId: number, publicKey: string): Promise<boolean> {
    try {
      const biometricHash = crypto.createHash('sha256').update(publicKey).digest('hex');
      
      await db.update(users)
        .set({
          biometricHash,
          biometricPublicKey: publicKey
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('Error registering biometric:', error);
      return false;
    }
  }

  // Verify biometric authentication
  async verifyBiometric(credential: BiometricCredential): Promise<BiometricAuthResult> {
    try {
      // Extract user identifier from credential
      const userHandle = credential.response.userHandle;
      if (!userHandle) {
        return { success: false, error: 'Invalid credential format' };
      }

      const userId = new TextDecoder().decode(userHandle);
      
      // Find user with biometric data
      const userResult = await db.select()
        .from(users)
        .where(eq(users.id, parseInt(userId)))
        .limit(1);

      if (!userResult.length || !userResult[0].biometricPublicKey) {
        return { success: false, error: 'Biometric not registered for user' };
      }

      const user = userResult[0];

      // Verify signature (simplified for demo - in production use proper WebAuthn verification)
      const isValid = this.verifySignature(credential, user.biometricPublicKey);
      
      if (!isValid) {
        return { success: false, error: 'Biometric verification failed' };
      }

      // Update last biometric auth timestamp
      await db.update(users)
        .set({ lastBiometricAuth: new Date() })
        .where(eq(users.id, user.id));

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          authMethod: 'biometric'
        },
        this.jwtSecret,
        { expiresIn: '24h' }
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Error verifying biometric:', error);
      return { success: false, error: 'Biometric verification failed' };
    }
  }

  // Simplified signature verification (in production, use proper WebAuthn library)
  private verifySignature(credential: BiometricCredential, publicKey: string): boolean {
    try {
      // This is a simplified verification
      // In production, use @webauthn/server or similar library
      const signature = new Uint8Array(credential.response.signature);
      const clientDataJSON = new Uint8Array(credential.response.clientDataJSON);
      const authenticatorData = new Uint8Array(credential.response.authenticatorData);
      
      // Basic validation - in production implement proper ECDSA verification
      return signature.length > 0 && clientDataJSON.length > 0 && authenticatorData.length > 0;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  // Check if user has biometric enabled
  async hasBiometric(userId: number): Promise<boolean> {
    try {
      const userResult = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return userResult.length > 0 && !!userResult[0].biometricPublicKey;
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  }

  // Remove biometric credential
  async removeBiometric(userId: number): Promise<boolean> {
    try {
      await db.update(users)
        .set({
          biometricHash: null,
          biometricPublicKey: null,
          lastBiometricAuth: null
        })
        .where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error('Error removing biometric:', error);
      return false;
    }
  }
}

export const biometricAuthService = new BiometricAuthService();