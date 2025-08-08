# KonsMesh Wallet System Implementation Plan

## Executive Summary

Based on comprehensive codebase analysis, this document outlines the implementation strategy for a unified KonsMesh-powered wallet system with Demo/Real account modes, atomic USD → SmaiSika conversion, real-time synchronization, and secure bot funding. The plan builds on the existing SmaiSika architecture while consolidating wallet operations through KonsMesh as the single source of truth.

## Current Architecture Assessment

### Existing Components Found:
- **Database Schema**: `wallets` table with `localBalance`, `smaiBalance`, conversion tracking
- **Wallet Pages**: `ProfessionalWalletPage.tsx`, `SmaiSikaWalletPage.tsx`, `EnhancedWalletPage.tsx`
- **KonsMesh Infrastructure**: Advanced mesh control center, security layers, broadcast system
- **Services**: `smaiWalletManager.ts`, `walletSecurityService.ts`, existing storage methods
- **Context**: `SmaiWalletContext.tsx` for frontend state management

### Current Issues Identified:
- Multiple wallet endpoints with inconsistent data sources
- No centralized balance truth through KonsMesh
- Missing Demo/Real account modes
- No atomic conversion operations
- WebSocket errors indicating connection issues
- Lack of unified bot funding system

## Implementation Strategy

### Phase 1: Database Schema Enhancement

#### 1.1 Extend Existing Wallet Schema
```sql
-- Extend wallets table for Demo/Real modes
ALTER TABLE wallets ADD COLUMN account_type VARCHAR(10) DEFAULT 'demo';
ALTER TABLE wallets ADD COLUMN usd_balance DECIMAL(30,8) DEFAULT 10000.00;

-- Create wallet ledger for atomic operations
CREATE TABLE wallet_ledger (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES wallets(id),
  change_usd DECIMAL(30,8) DEFAULT 0,
  change_smaisika DECIMAL(30,8) DEFAULT 0,
  reason VARCHAR(255) NOT NULL,
  meta JSONB DEFAULT '{}',
  tx_id VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create conversion history table
CREATE TABLE conversion_history (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES wallets(id),
  usd_amount DECIMAL(30,8) NOT NULL,
  smaisika_amount DECIMAL(30,8) NOT NULL,
  rate DECIMAL(10,6) NOT NULL,
  tx_id VARCHAR(100) UNIQUE NOT NULL,
  performed_by INTEGER REFERENCES users(id),
  request_id VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create bot funding table
CREATE TABLE bot_funding (
  id SERIAL PRIMARY KEY,
  wallet_id INTEGER REFERENCES wallets(id),
  bot_id VARCHAR(100) NOT NULL,
  smaisika_amount DECIMAL(30,8) NOT NULL,
  funding_type VARCHAR(50) DEFAULT 'allocation',
  tx_id VARCHAR(100) UNIQUE NOT NULL,
  request_id VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 Update Shared Schema
- Add new table definitions to `shared/schema.ts`
- Create insert schemas with Zod validation
- Export TypeScript types for all new entities

### Phase 2: KonsMesh Wallet Service Implementation

#### 2.1 Core KonsMesh Wallet Service
**File**: `server/services/konsMeshWalletService.ts`
- Implement singleton wallet service as canonical truth source
- Add WebSocket event broadcasting for all wallet changes
- Provide atomic transaction support with database locking
- Implement idempotency checking for all mutations

#### 2.2 Atomic Conversion Logic
**Function**: `convertToSmaisika(userId, usdAmount, rate, requestId)`
- Use database transactions with `SELECT ... FOR UPDATE`
- Validate sufficient USD balance
- Perform atomic USD deduction and SmaiSika addition
- Record immutable ledger entries
- Broadcast KonsMesh events to all connected clients

#### 2.3 Demo/Real Account Management
- Default all new accounts to 'demo' mode
- Implement `switchAccount(userId, targetType, mfaToken)` with MFA validation
- Audit logging for account mode changes
- Isolate demo trading from production payment rails

### Phase 3: API Endpoint Consolidation

#### 3.1 New KonsMesh Wallet Endpoints
```typescript
// Replace existing wallet endpoints with:
GET /api/konsmesh/wallet          // Single truth source for wallet data
POST /api/wallet/convert          // Atomic USD → SmaiSika conversion
POST /api/wallet/switch-account   // Demo/Real mode switching
POST /api/bots/fund              // Secure bot funding with SmaiSika
```

#### 3.2 Existing Endpoint Migration
- **Preserve**: Current payment gateway integrations in `ProfessionalWalletPage`
- **Consolidate**: All balance reads through KonsMesh service
- **Enhance**: Add conversion and bot funding capabilities
- **Maintain**: Existing transaction history and security features

### Phase 4: Frontend Architecture Refactor

#### 4.1 Global Wallet Hook
**File**: `client/src/hooks/useKonsMeshWallet.ts`
```typescript
export function useKonsMeshWallet() {
  // WebSocket connection to KonsMesh
  // Real-time wallet.updated event handling
  // Fallback to REST API on connection loss
  // Functions: convertToSmaisika, fundBot, switchAccount
  // Memory-only storage (no localStorage persistence)
}
```

#### 4.2 Wallet Context Enhancement
- Extend existing `SmaiWalletContext.tsx` to use KonsMesh service
- Add Demo/Real mode indicators
- Implement conversion rate display
- Add bot funding interface

#### 4.3 Component Updates
- **ProfessionalWalletPage**: Add conversion interface, account mode toggle
- **SmaiSikaWalletPage**: Integrate with KonsMesh real-time updates
- **Bot Pages**: Add funding interface using SmaiSika balance
- **All Wallet Displays**: Use unified KonsMesh balance source

### Phase 5: Real-Time Communication Enhancement

#### 5.1 WebSocket Event Types
```typescript
interface WalletUpdatedEvent {
  type: 'wallet.updated';
  wallet: WalletSnapshot;
}

interface ConversionCompletedEvent {
  type: 'conversion.completed';
  conversion: ConversionRecord;
  wallet: WalletSnapshot;
}

interface BotFundedEvent {
  type: 'bot.funded';
  botId: string;
  fundingRecord: BotFundingRecord;
  wallet: WalletSnapshot;
}

interface AccountModeChangedEvent {
  type: 'account.mode.changed';
  wallet: WalletSnapshot;
  previousMode: 'demo' | 'real';
}
```

#### 5.2 KonsMesh Integration
- Extend existing `konsaiMeshControlCenter.ts` with wallet broadcasting
- Add wallet event handlers to mesh communication contracts
- Implement persistent event store for reconnection scenarios
- Add authentication during WebSocket handshake

### Phase 6: Security & Validation Implementation

#### 6.1 Idempotency System
- Request ID validation for all mutation operations
- Duplicate operation prevention with cached results
- Atomic operation retry logic with exponential backoff

#### 6.2 Rate Limiting & Validation
- Convert endpoint: Max 10 conversions per hour per user
- Bot funding: Admin/owner permission validation
- Account switching: MFA requirement with audit logging
- Input sanitization for all JSON metadata fields

### Phase 7: Testing & Quality Assurance

#### 7.1 Automated Test Suite
**File**: `scripts/run_wallet_smoke_tests.sh`
- Seed test user with 10,000 USD
- Test concurrent conversion attempts (only one should succeed)
- Validate WebSocket event broadcasting
- Test bot funding with balance validation
- Verify audit trails and ledger integrity

#### 7.2 Integration Tests
- Real-time WebSocket reconnection scenarios
- Database transaction rollback testing
- Multi-user concurrent operation validation
- Cross-browser WebSocket compatibility

### Phase 8: Migration & Deployment Strategy

#### 8.1 Backward Compatibility
- Preserve all existing wallet API endpoints during transition
- Gradual frontend migration to KonsMesh endpoints
- Fallback mechanisms for WebSocket failures
- Database migration with rollback scripts

#### 8.2 Data Migration
- Migrate existing wallet balances to new schema
- Populate demo/real account types (default to demo)
- Create initial ledger entries for existing balances
- Validate data integrity post-migration

## Implementation Timeline

### Week 1: Foundation
- Database schema updates and migrations
- Core KonsMesh wallet service implementation
- Basic conversion and bot funding logic

### Week 2: Integration
- API endpoint implementation
- Frontend hook and context updates
- WebSocket event system integration

### Week 3: Enhancement
- Security features and validation
- Demo/Real account mode implementation
- Comprehensive testing suite

### Week 4: Polish & Deploy
- Performance optimization
- Production deployment
- Documentation and training

## Risk Mitigation

### Technical Risks
- **WebSocket Stability**: Implement robust reconnection with exponential backoff
- **Database Locks**: Use timeout limits to prevent deadlocks
- **Concurrent Operations**: Implement pessimistic locking for critical sections

### Business Risks
- **Demo/Real Separation**: Clear UI indicators and confirmation dialogs
- **Fund Security**: Multi-layer validation for bot funding operations
- **Audit Compliance**: Immutable ledger with cryptographic integrity

## Success Metrics

### Functional
- Zero balance discrepancies across all wallet displays
- Sub-100ms WebSocket event propagation
- 100% idempotency compliance for mutations
- Zero unauthorized fund movements

### Technical
- 99.9% WebSocket uptime
- <500ms API response times
- Zero data loss during network interruptions
- Complete audit trail coverage

## Dependencies

### External
- PostgreSQL with transaction support
- WebSocket infrastructure (existing)
- MFA/2FA service integration
- Payment gateway APIs (existing)

### Internal
- KonsMesh communication system (existing)
- User authentication system (existing)
- Admin permission framework (existing)
- Existing wallet security services

## Deliverables

1. **replit_scan_report.json** - Complete codebase analysis
2. **replit_changes_summary.md** - Detailed change log with diffs
3. **Database migration scripts** with rollback procedures
4. **Automated test suite** with smoke tests
5. **Updated documentation** for API endpoints
6. **Production deployment guide** with rollback instructions

## Conclusion

This implementation plan leverages SmaiSika's existing sophisticated architecture while implementing the KonsMesh wallet specification. By building on the current KonsMesh infrastructure, wallet services, and database schema, we can deliver a robust, scalable wallet system that maintains backward compatibility while providing the requested atomic operations, real-time synchronization, and secure bot funding capabilities.

The plan prioritizes data integrity, real-time performance, and security while ensuring a smooth migration path that preserves existing functionality and user experience.