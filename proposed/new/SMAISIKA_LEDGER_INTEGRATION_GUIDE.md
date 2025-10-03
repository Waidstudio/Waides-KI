# Smaisika Ledger System - Integration Guide

## 📋 Overview
Complete Smaisika Ledger System with automatic profit sharing, conversion tracking, and comprehensive audit trails.

## 🗄️ Database Schema

### Tables Created
1. **smaisa_transactions** - All Smaisika movements
2. **smaisa_balances** - User balance tracking
3. **smaisa_conversion_rates** - Currency conversion rates

### Migration Required
```sql
-- Run these migrations to add Smaisika tables
-- Located in: proposed/new/shared/smaisika-schema.ts

CREATE TABLE smaisa_balances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  balance DECIMAL(18,8) DEFAULT 0 NOT NULL,
  locked_balance DECIMAL(18,8) DEFAULT 0 NOT NULL,
  total_earned DECIMAL(18,8) DEFAULT 0 NOT NULL,
  total_spent DECIMAL(18,8) DEFAULT 0 NOT NULL,
  last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE smaisa_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  amount DECIMAL(18,8) NOT NULL,
  currency TEXT DEFAULT 'SMAISA' NOT NULL,
  balance_before DECIMAL(18,8) NOT NULL,
  balance_after DECIMAL(18,8) NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  is_reversed BOOLEAN DEFAULT FALSE,
  reversal_id INTEGER
);

CREATE TABLE smaisa_conversion_rates (
  id SERIAL PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate DECIMAL(18,8) NOT NULL,
  source TEXT DEFAULT 'admin' NOT NULL,
  effective_at TIMESTAMP DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_transactions_user_id ON smaisa_transactions(user_id);
CREATE INDEX idx_transactions_type ON smaisa_transactions(type);
CREATE INDEX idx_transactions_created_at ON smaisa_transactions(created_at);
CREATE INDEX idx_rates_active ON smaisa_conversion_rates(from_currency, to_currency, is_active);
```

## 🔧 Core Service Usage

### Import the Ledger
```typescript
import { smaisaLedger } from './server/lib/smaisaLedger';
```

### Get User Balance
```typescript
const balance = await smaisaLedger.getBalance(userId);
console.log(`User ${userId} has ${balance} SMAISA`);
```

### Credit Smaisa (Add to Balance)
```typescript
await smaisaLedger.creditSmaisa({
  userId: 123,
  amount: 1000,
  description: 'Mining reward',
  type: 'mining',
  referenceId: 'mining-session-456',
  metadata: { sessionDuration: 3600, hashrate: 1500 }
});
```

### Debit Smaisa (Subtract from Balance)
```typescript
await smaisaLedger.debitSmaisa({
  userId: 123,
  amount: 500,
  description: 'Membership upgrade to Gold',
  type: 'membership_payment',
  referenceId: 'membership-789'
});
```

### Convert Crypto to Smaisa
```typescript
await smaisaLedger.convertToSmaisa({
  userId: 123,
  fromCurrency: 'BTC',
  fromAmount: 0.001,
  description: 'Converted Bitcoin to Smaisa'
});
```

### Convert Smaisa to Crypto
```typescript
const result = await smaisaLedger.convertFromSmaisa({
  userId: 123,
  toCurrency: 'ETH',
  smaisaAmount: 5000
});

console.log(`User receives ${result.cryptoAmount} ETH`);
```

### Record Trade Profit with Automatic Profit Sharing
```typescript
const { userTransaction, treasuryTransaction } = await smaisaLedger.recordTradeProfit({
  userId: 123,
  grossProfit: 1000,
  profitShareRate: 0.5, // 50% to treasury, 50% to user
  tradeId: 'trade-001',
  metadata: {
    exchange: 'Binance',
    pair: 'BTC/USDT',
    entryPrice: 45000,
    exitPrice: 46000
  }
});

// User gets 500 SMAISA, Treasury gets 500 SMAISA
```

### Record Trade Loss
```typescript
await smaisaLedger.recordTradeLoss({
  userId: 123,
  lossAmount: 200,
  tradeId: 'trade-002',
  metadata: { exchange: 'Binance', pair: 'ETH/USDT' }
});
```

### Verify Balance Integrity (Audit)
```typescript
const audit = await smaisaLedger.verifyBalanceIntegrity(userId);

if (!audit.isValid) {
  console.error(`Balance mismatch! Expected: ${audit.expectedBalance}, Actual: ${audit.actualBalance}`);
}
```

## 🌐 API Endpoints

### User Endpoints

**Get Balance**
```
GET /api/smaisa/balance/:userId
Response: {
  success: true,
  data: {
    balance: "10000.50000000",
    lockedBalance: "500.00000000",
    availableBalance: "9500.50000000",
    totalEarned: "15000.00000000",
    totalSpent: "5000.00000000"
  }
}
```

**Get Transaction History**
```
GET /api/smaisa/transactions/:userId?limit=50
Response: {
  success: true,
  data: {
    count: 25,
    transactions: [...]
  }
}
```

**Convert To Smaisa**
```
POST /api/smaisa/convert-to
Body: {
  "userId": 123,
  "fromCurrency": "BTC",
  "fromAmount": 0.001
}
```

**Convert From Smaisa**
```
POST /api/smaisa/convert-from
Body: {
  "userId": 123,
  "toCurrency": "ETH",
  "smaisaAmount": 5000
}
```

**Get Conversion Rates**
```
GET /api/smaisa/rates
GET /api/smaisa/rates?from=BTC&to=SMAISA
```

### Admin Endpoints

**Set Conversion Rate**
```
POST /api/smaisa/admin/set-rate
Body: {
  "fromCurrency": "BTC",
  "toCurrency": "SMAISA",
  "rate": 1000000,
  "expiresAt": "2025-12-31T23:59:59Z" (optional)
}
```

### Internal Service Endpoints

**Credit Smaisa (Internal)**
```
POST /api/smaisa/internal/credit
Body: {
  "userId": 123,
  "amount": 1000,
  "description": "Mining reward",
  "type": "mining"
}
```

**Debit Smaisa (Internal)**
```
POST /api/smaisa/internal/debit
Body: {
  "userId": 123,
  "amount": 500,
  "description": "Membership payment"
}
```

## 🔗 Integration with Existing Systems

### 1. Mining Engine Integration
```typescript
// In smaisikaMiningEngine.ts
import { smaisaLedger } from './smaisaLedger';

async function completeMiningSesion(userId: number, earnings: number) {
  await smaisaLedger.creditSmaisa({
    userId,
    amount: earnings,
    description: 'Mining session reward',
    type: 'mining',
    referenceId: `mining-${Date.now()}`,
    metadata: {
      algorithm: 'RandomX',
      duration: 3600,
      hashrate: 1500
    }
  });
}
```

### 2. Trading Bot Integration
```typescript
// In any trading bot (maibot, waidbot, etc.)
import { smaisaLedger } from './smaisaLedger';

async function closeTrade(userId: number, tradeId: string, profit: number) {
  if (profit > 0) {
    // Automatic 50/50 profit sharing
    await smaisaLedger.recordTradeProfit({
      userId,
      grossProfit: profit,
      profitShareRate: 0.5,
      tradeId,
      metadata: { bot: 'WaidBot α' }
    });
  } else {
    await smaisaLedger.recordTradeLoss({
      userId,
      lossAmount: Math.abs(profit),
      tradeId,
      metadata: { bot: 'WaidBot α' }
    });
  }
}
```

### 3. Membership System Integration
```typescript
// In membership upgrade
import { smaisaLedger } from './smaisaLedger';

async function upgradeMembership(userId: number, tier: string, price: number) {
  await smaisaLedger.debitSmaisa({
    userId,
    amount: price,
    description: `Upgraded to ${tier} membership`,
    type: 'membership_payment',
    referenceId: `membership-${userId}-${Date.now()}`,
    metadata: { tier, duration: '30 days' }
  });
}
```

### 4. Referral System Integration
```typescript
// In referral reward
import { smaisaLedger } from './smaisaLedger';

async function grantReferralBonus(referrerId: number, amount: number) {
  await smaisaLedger.creditSmaisa({
    userId: referrerId,
    amount,
    description: 'Referral bonus',
    type: 'referral_bonus',
    referenceId: `referral-${Date.now()}`
  });
}
```

## 📊 Transaction Types

- `credit` - Manual credit
- `debit` - Manual debit
- `convert_to` - Crypto converted to Smaisa
- `convert_from` - Smaisa converted to crypto
- `mining` - Mining rewards
- `trade_profit` - Profit from trade
- `trade_loss` - Loss from trade
- `profit_share` - Treasury profit share
- `referral_bonus` - Referral rewards
- `membership_payment` - Membership fees
- `achievement_reward` - Achievement bonuses

## 🛡️ Security Features

1. **Atomic Transactions** - All operations use database transactions
2. **Balance Verification** - Built-in integrity checking
3. **Audit Trail** - Every operation is logged
4. **Insufficient Balance Protection** - Automatic checks before debits
5. **Metadata Tracking** - Complete context for every transaction

## 🎯 Profit Sharing Configuration

Default: **50/50 split** (configurable per trade)
- User gets 50% of gross profit
- Treasury (userId: 1) gets 50% of gross profit

To change profit share rate:
```typescript
await smaisaLedger.recordTradeProfit({
  userId: 123,
  grossProfit: 1000,
  profitShareRate: 0.3, // 30% to treasury, 70% to user
  tradeId: 'trade-001'
});
```

## 📝 Initial Setup Steps

### Step 1: Run Database Migrations
Apply the SQL migrations above to create the three tables.

### Step 2: Set Conversion Rates
```typescript
// Set initial conversion rates
await db.insert(smaisaConversionRates).values([
  { fromCurrency: 'BTC', toCurrency: 'SMAISA', rate: '1000000', isActive: true },
  { fromCurrency: 'ETH', toCurrency: 'SMAISA', rate: '50000', isActive: true },
  { fromCurrency: 'USDT', toCurrency: 'SMAISA', rate: '100', isActive: true },
  { fromCurrency: 'XMR', toCurrency: 'SMAISA', rate: '10000', isActive: true },
  
  { fromCurrency: 'SMAISA', toCurrency: 'BTC', rate: '0.000001', isActive: true },
  { fromCurrency: 'SMAISA', toCurrency: 'ETH', rate: '0.00002', isActive: true },
  { fromCurrency: 'SMAISA', toCurrency: 'USDT', rate: '0.01', isActive: true },
  { fromCurrency: 'SMAISA', toCurrency: 'XMR', rate: '0.0001', isActive: true }
]);
```

### Step 3: Register Routes
```typescript
// In server/routes.ts
import smaisaRoutes from './routes/smaisaRoutes';

app.use('/api/smaisa', smaisaRoutes);
```

### Step 4: Import Schema in Drizzle
```typescript
// In shared/schema.ts
export * from '../../proposed/new/shared/smaisika-schema';
```

## ✅ Testing

```typescript
// Test basic operations
const userId = 123;

// Credit 1000 SMAISA
await smaisaLedger.creditSmaisa({
  userId,
  amount: 1000,
  description: 'Test credit'
});

// Check balance
const balance = await smaisaLedger.getBalance(userId);
console.log('Balance:', balance); // Should be 1000

// Debit 300 SMAISA
await smaisaLedger.debitSmaisa({
  userId,
  amount: 300,
  description: 'Test debit'
});

// Verify integrity
const audit = await smaisaLedger.verifyBalanceIntegrity(userId);
console.log('Balance valid:', audit.isValid); // Should be true
console.log('Final balance:', audit.actualBalance); // Should be 700
```

## 📈 Next Integration Points

1. **Connect to all 6 trading bots** for automatic profit sharing
2. **Integrate with mining engine** for reward distribution
3. **Link to membership system** for Smaisa-based payments
4. **Connect referral system** for automatic bonuses
5. **Add to achievement system** for reward distribution

---

**Status:** ✅ Ready for Integration  
**Location:** `proposed/new/`  
**Safety:** Non-destructive, all files in proposed directory
