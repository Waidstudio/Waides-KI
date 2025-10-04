# Wallet Alignment & Sync System

## Overview
The Wallet Alignment System ensures proper separation and synchronization between Trading Wallet, Mining Wallet, and System Wallets in Waides KI platform.

## Wallet Architecture

### 1. **Trading Wallet (Main)** 
**Table:** `wallets`  
**Purpose:** Primary wallet for all trading operations  
**Operations:**
- ✅ User deposits (USDT, BTC, ETH, Smaisika)
- ✅ User withdrawals
- ✅ Trading operations (Binary, Forex, Spot)
- ✅ Bot trading balance allocation
- ✅ Currency conversion (USD ↔ Smaisika)

**Key Fields:**
- `usdBalance` - USD trading balance
- `smaiBalance` - Smaisika (SS) balance  
- `accountType` - 'demo' or 'real'

### 2. **Mining Wallet (SmaisikaMining)**
**Table:** `smaisikaMining`  
**Purpose:** ONLY for cryptocurrency mining rewards  
**Operations:**
- ✅ Mining rewards (Monero, Bitcoin, Ethereum)
- ✅ Crypto-to-Smaisika conversion (1:1000 ratio)
- ✅ Mining session tracking
- ❌ **NOT for trading operations**
- ❌ **NOT for deposits/withdrawals**

**Key Fields:**
- `smaiSikaEarned` - Mining rewards
- `miningType` - Type of mining (monero/bitcoin/ethereum)
- `hashRate` - Mining power

### 3. **System Wallets**
**Purpose:** Platform operations and profit distribution  
**Operations:**
- ✅ Platform fees collection
- ✅ Profit sharing distribution (tier-based: 35% → 2%)
- ✅ Referral bonuses (5% rewards)
- ✅ Admin treasury operations

### 4. **Admin Reserve Wallet**
**Purpose:** Administrative control and audit  
**Operations:**
- ✅ Platform admin bot (Nwaora Chigozie ε)
- ✅ Emergency interventions
- ✅ System audits and overrides
- ✅ Backup trading operations

## Wallet Isolation Rules

### Critical Requirements:
1. **Mining Wallet Isolation**
   - Mining wallet can ONLY process mining operations
   - No trading operations allowed from mining wallet
   - No direct deposits/withdrawals to mining wallet
   - Mining rewards automatically transferred to Trading Wallet

2. **Trading Wallet Operations**
   - All user deposits → Trading Wallet
   - All user withdrawals → from Trading Wallet
   - All bot trading → uses Trading Wallet balance
   - All currency conversions → Trading Wallet

3. **System Wallet Operations**
   - Profit sharing fees → System Wallet
   - Referral rewards → paid from System Wallet
   - Platform fees → collected to System Wallet

## API Endpoints

### Admin Endpoints

#### Initialize Wallet Alignment
```bash
POST /api/wallet-alignment/initialize
Authorization: Admin Token Required
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet alignment complete",
  "health": {
    "ok": true,
    "issues": [],
    "checks": {
      "miningIsolated": true,
      "tradingActive": true,
      "systemWalletsActive": true,
      "adminReserveActive": true,
      "balancesSynced": true,
      "permissionsCorrect": true
    }
  }
}
```

#### Get Wallet Health Status
```bash
GET /api/wallet-alignment/health
Authorization: Admin Token Required
```

**Response:**
```json
{
  "success": true,
  "tradingWallet": { ... },
  "miningWallet": [ ... ],
  "systemWallet": { "status": "active", "type": "system" },
  "health": {
    "ok": true,
    "issues": [],
    "checks": { ... }
  }
}
```

### User Endpoints

#### Get User Wallet Summary
```bash
GET /api/wallet-alignment/summary/:userId
Authorization: User Token Required
```

**Response:**
```json
{
  "success": true,
  "tradingWallet": {
    "id": 1,
    "userId": 123,
    "usdBalance": "10000.00",
    "smaiBalance": "5000.00",
    "accountType": "demo"
  },
  "miningWallet": [
    {
      "sessionId": "mining_123_...",
      "miningType": "monero",
      "smaiSikaEarned": "125.50",
      "isActive": true
    }
  ],
  "health": { ... }
}
```

## Deployment Checklist

Before production deployment, verify:

- [x] Is Mining Wallet isolated from trading?
- [x] Does Trading Wallet handle deposits, withdrawals, trades?
- [x] Are profits routed correctly to System Wallet?
- [x] Are referrals credited from System Wallet?
- [x] Is Admin Reserve wallet active with override power?
- [x] Did balance sync complete with no mismatch?
- [x] Is wallet isolation enforced (mining not used for trading)?
- [x] Are all bots connected only to Trading Wallet?
- [x] Does Mining Wallet only process mining rewards?
- [x] Are logs & audits stored in Admin Reserve?

## Wallet Flow Diagrams

### Deposit Flow
```
User Deposit (USDT/BTC/ETH)
        ↓
  Trading Wallet
        ↓
   [Available for Trading]
```

### Trading Flow
```
User Initiates Trade
        ↓
  Trading Wallet (deduct amount)
        ↓
  Bot Executes Trade
        ↓
  Profit/Loss Calculated
        ↓
  Platform Fee → System Wallet (tier-based: 35% → 2%)
  User Share → Trading Wallet (tier-based: 65% → 98%)
```

### Mining Flow
```
User Starts Mining
        ↓
  Mining Wallet (track session)
        ↓
  Cryptocurrency Mined
        ↓
  Auto-Convert to Smaisika (1:1000)
        ↓
  Mining Wallet (store rewards)
        ↓
  User Claims → Trading Wallet
```

### Withdrawal Flow
```
User Requests Withdrawal
        ↓
  Trading Wallet (check balance)
        ↓
  Process Withdrawal
        ↓
  Update Trading Wallet Balance
```

## Security Features

1. **Transaction Isolation**
   - Mining operations cannot access trading balance
   - Trading operations cannot access mining rewards directly
   - System wallet operations require admin authorization

2. **Balance Verification**
   - Real-time balance synchronization
   - Automatic reconciliation checks
   - Mismatch detection and alerts

3. **Permission Enforcement**
   - Trading Wallet: deposit, withdraw, trade
   - Mining Wallet: mine only
   - System Wallet: fees, referrals, splits
   - Admin Reserve: override, audit

## Profit Sharing Model Integration

The wallet system supports tier-based profit sharing:

| Tier | Monthly Fee | Platform Fee | User Share |
|------|------------|--------------|------------|
| FREE (Maibot) | 0 SS | 35% | 65% |
| BASIC (WaidBot α) | 50 SS | 20% | 80% |
| PRO (WaidBot Pro β) | 150 SS | 10% | 90% |
| ELITE (Autonomous Trader γ) | 300 SS | 5% | 95% |
| MASTER (Full Engine Ω) | 500 SS | 3% | 97% |
| DIVINE_DELTA (Smai Chinnikstah δ) | 1000 SS | 2% | 98% |
| COSMIC_EPSILON (Nwaora ε) | Admin Only | 100% | 0% |

**Business Logic:**
- Free users pay with profit percentage (35% fee)
- Paid members get better shares as tier increases
- Platform fees collected to System Wallet
- User shares credited to Trading Wallet

## Troubleshooting

### Issue: Mining wallet used for trading
**Solution:** Run wallet alignment initialization
```bash
POST /api/wallet-alignment/initialize
```

### Issue: Balance mismatch between wallets
**Solution:** Check wallet health status
```bash
GET /api/wallet-alignment/health
```

### Issue: Trading wallet not receiving mining rewards
**Solution:** Verify mining-to-trading wallet transfer logic in SmaisikaMiningEngine

## Technical Implementation

### Services Used:
- `walletAlignmentScript.ts` - Main alignment logic
- `konsMeshWalletService.ts` - Trading wallet operations
- `smaisikaMiningEngine.ts` - Mining wallet operations
- `masterBotAlignmentService.ts` - Profit sharing integration

### Database Tables:
- `wallets` - Trading wallet storage
- `smaisikaMining` - Mining wallet storage
- `walletLedger` - Transaction history
- `botFunding` - Bot allocation tracking

## Maintenance

### Regular Tasks:
1. **Daily:** Monitor wallet health status
2. **Weekly:** Run balance synchronization
3. **Monthly:** Audit wallet separation compliance
4. **Quarterly:** Review profit sharing accuracy

### Automated Checks:
- Mining wallet isolation verification
- Trading wallet activity monitoring
- System wallet balance tracking
- Admin reserve audit logging

---

**Version:** 1.0.0  
**Last Updated:** October 4, 2025  
**Status:** Production Ready ✅
