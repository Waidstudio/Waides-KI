import { Router, type Request, Response } from 'express';
import { unifiedAdminAuth } from '../services/unifiedAdminAuthService';

const router = Router();

// Get available admin levels
router.get('/levels', async (req: Request, res: Response) => {
  try {
    const levels = await unifiedAdminAuth.getAdminLevels();
    res.json({ success: true, levels });
  } catch (error) {
    console.error('❌ Failed to get admin levels:', error);
    res.status(500).json({ success: false, message: 'Failed to get admin levels' });
  }
});

// Regular admin login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, level } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const result = await unifiedAdminAuth.authenticateAdmin(email, password, level);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// Super admin verification (first step)
router.post('/super/verify', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const result = await unifiedAdminAuth.authenticateAdmin(email, password, 'super');
    
    if (result.success) {
      // For demo purposes, just verify credentials
      res.json({ success: true, message: 'Credentials verified. Proceed to verification.' });
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('❌ Super admin verification error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

// Super admin final login (with confirmation code)
router.post('/super/login', async (req: Request, res: Response) => {
  try {
    const { email, password, confirmationCode } = req.body;
    
    if (!email || !password || !confirmationCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and confirmation code are required' 
      });
    }

    // Demo verification code
    if (confirmationCode !== 'SUPER2024') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid confirmation code' 
      });
    }

    const result = await unifiedAdminAuth.authenticateAdmin(email, password, 'super');
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('❌ Super admin login error:', error);
    res.status(500).json({ success: false, message: 'Super admin login failed' });
  }
});

// Validate admin session
router.get('/validate', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    const result = await unifiedAdminAuth.validateSession(token);
    
    if (result.valid) {
      res.json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('❌ Session validation error:', error);
    res.status(500).json({ valid: false, message: 'Session validation failed' });
  }
});

// Admin logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    const result = await unifiedAdminAuth.logout(token);
    res.json(result);
  } catch (error) {
    console.error('❌ Admin logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// Get audit logs (super admin only)
router.get('/audit', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sessionResult = await unifiedAdminAuth.validateSession(token);
    
    if (!sessionResult.valid || sessionResult.admin?.level !== 'super') {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const logs = await unifiedAdminAuth.getAuditLogs(100);
    res.json({ success: true, logs });
  } catch (error) {
    console.error('❌ Failed to get audit logs:', error);
    res.status(500).json({ success: false, message: 'Failed to get audit logs' });
  }
});

// Create new admin (super admin only)
router.post('/create', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sessionResult = await unifiedAdminAuth.validateSession(token);
    
    if (!sessionResult.valid || sessionResult.admin?.level !== 'super') {
      return res.status(403).json({ success: false, message: 'Only super admins can create admin users' });
    }

    const { email, password, level, displayName, department } = req.body;
    
    if (!email || !password || !level || !displayName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, level, and display name are required' 
      });
    }

    const result = await unifiedAdminAuth.createAdmin(
      { email, password, level, displayName, department },
      sessionResult.admin.id
    );
    
    res.json(result);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    res.status(500).json({ success: false, message: 'Failed to create admin user' });
  }
});

export default router;