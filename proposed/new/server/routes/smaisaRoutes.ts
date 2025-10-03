import { Router } from 'express';
import { smaisaLedger } from '../lib/smaisaLedger';
import { db } from '@db';
import { smaisaConversionRates } from '../../shared/smaisika-schema';
import { z } from 'zod';

const router = Router();

/**
 * Get user's Smaisa balance
 * GET /api/smaisa/balance/:userId
 */
router.get('/balance/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const balanceRecord = await smaisaLedger.getOrCreateBalance(userId);
    
    res.json({
      success: true,
      data: {
        userId,
        balance: balanceRecord.balance,
        lockedBalance: balanceRecord.lockedBalance,
        availableBalance: (parseFloat(balanceRecord.balance) - parseFloat(balanceRecord.lockedBalance)).toString(),
        totalEarned: balanceRecord.totalEarned,
        totalSpent: balanceRecord.totalSpent,
        lastUpdated: balanceRecord.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error getting Smaisa balance:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get balance' 
    });
  }
});

/**
 * Get user's transaction history
 * GET /api/smaisa/transactions/:userId
 */
router.get('/transactions/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const transactions = await smaisaLedger.getTransactionHistory(userId, limit);
    
    res.json({
      success: true,
      data: {
        userId,
        count: transactions.length,
        transactions
      }
    });
  } catch (error) {
    console.error('Error getting transaction history:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get transactions' 
    });
  }
});

/**
 * Convert cryptocurrency to Smaisa
 * POST /api/smaisa/convert-to
 */
const convertToSchema = z.object({
  userId: z.number(),
  fromCurrency: z.string(),
  fromAmount: z.union([z.string(), z.number()]),
  description: z.string().optional()
});

router.post('/convert-to', async (req, res) => {
  try {
    const validated = convertToSchema.parse(req.body);
    
    const transaction = await smaisaLedger.convertToSmaisa(validated);
    
    res.json({
      success: true,
      message: 'Conversion successful',
      data: {
        transaction,
        smaisaReceived: transaction.amount
      }
    });
  } catch (error) {
    console.error('Error converting to Smaisa:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    });
  }
});

/**
 * Convert Smaisa to cryptocurrency
 * POST /api/smaisa/convert-from
 */
const convertFromSchema = z.object({
  userId: z.number(),
  toCurrency: z.string(),
  smaisaAmount: z.union([z.string(), z.number()]),
  description: z.string().optional()
});

router.post('/convert-from', async (req, res) => {
  try {
    const validated = convertFromSchema.parse(req.body);
    
    const result = await smaisaLedger.convertFromSmaisa(validated);
    
    res.json({
      success: true,
      message: 'Conversion successful',
      data: {
        transaction: result.transaction,
        cryptoAmount: result.cryptoAmount,
        currency: validated.toCurrency
      }
    });
  } catch (error) {
    console.error('Error converting from Smaisa:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Conversion failed' 
    });
  }
});

/**
 * Get conversion rates
 * GET /api/smaisa/rates
 */
router.get('/rates', async (req, res) => {
  try {
    const fromCurrency = req.query.from as string;
    const toCurrency = req.query.to as string;

    if (fromCurrency && toCurrency) {
      const rate = await smaisaLedger.getConversionRate(fromCurrency, toCurrency);
      return res.json({
        success: true,
        data: { rate }
      });
    }

    // Get all active rates
    const rates = await db
      .select()
      .from(smaisaConversionRates)
      .where(eq(smaisaConversionRates.isActive, true));

    res.json({
      success: true,
      data: { rates }
    });
  } catch (error) {
    console.error('Error getting conversion rates:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get rates' 
    });
  }
});

/**
 * Verify balance integrity (audit)
 * GET /api/smaisa/verify/:userId
 */
router.get('/verify/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const verification = await smaisaLedger.verifyBalanceIntegrity(userId);
    
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Error verifying balance:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Verification failed' 
    });
  }
});

/**
 * ADMIN: Set conversion rate
 * POST /api/smaisa/admin/set-rate
 */
const setRateSchema = z.object({
  fromCurrency: z.string(),
  toCurrency: z.string(),
  rate: z.union([z.string(), z.number()]),
  expiresAt: z.string().optional()
});

router.post('/admin/set-rate', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    const validated = setRateSchema.parse(req.body);
    
    // Deactivate old rates for this pair
    await db
      .update(smaisaConversionRates)
      .set({ isActive: false })
      .where(
        and(
          eq(smaisaConversionRates.fromCurrency, validated.fromCurrency),
          eq(smaisaConversionRates.toCurrency, validated.toCurrency)
        )
      );
    
    // Insert new rate
    const newRate = await db
      .insert(smaisaConversionRates)
      .values({
        fromCurrency: validated.fromCurrency,
        toCurrency: validated.toCurrency,
        rate: validated.rate.toString(),
        source: 'admin',
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        isActive: true
      })
      .returning();
    
    res.json({
      success: true,
      message: 'Conversion rate set successfully',
      data: { rate: newRate[0] }
    });
  } catch (error) {
    console.error('Error setting conversion rate:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to set rate' 
    });
  }
});

/**
 * INTERNAL: Credit Smaisa (for system use)
 * POST /api/smaisa/internal/credit
 */
const creditSchema = z.object({
  userId: z.number(),
  amount: z.union([z.string(), z.number()]),
  description: z.string(),
  type: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  metadata: z.any().optional()
});

router.post('/internal/credit', async (req, res) => {
  try {
    // TODO: Add internal service authentication
    const validated = creditSchema.parse(req.body);
    
    const transaction = await smaisaLedger.creditSmaisa(validated);
    
    res.json({
      success: true,
      message: 'Smaisa credited successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Error crediting Smaisa:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to credit Smaisa' 
    });
  }
});

/**
 * INTERNAL: Debit Smaisa (for system use)
 * POST /api/smaisa/internal/debit
 */
const debitSchema = z.object({
  userId: z.number(),
  amount: z.union([z.string(), z.number()]),
  description: z.string(),
  type: z.string().optional(),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  metadata: z.any().optional()
});

router.post('/internal/debit', async (req, res) => {
  try {
    // TODO: Add internal service authentication
    const validated = debitSchema.parse(req.body);
    
    const transaction = await smaisaLedger.debitSmaisa(validated);
    
    res.json({
      success: true,
      message: 'Smaisa debited successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Error debiting Smaisa:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to debit Smaisa' 
    });
  }
});

export default router;
