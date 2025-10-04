# Waides KI - Autonomous Wealth Management System

## Overview
Waides KI (SmaiSika) is an advanced autonomous wealth management platform providing intelligent, ethical, and adaptive financial solutions through AI-powered trading, robust risk management, real-time analytics, and portfolio optimization. It targets professional and business users with institutional-grade features, aiming to integrate spiritual and metaphysical intelligence with advanced AI for a holistic wealth management approach.

## User Preferences
- Focus on fixing broken parts systematically
- Ensure all navigation routes work properly
- Maintain existing complex AI system architecture
- Prioritize working functionality over feature additions
- Complete comprehensive AI trading logic implementation for all 6 entities
- Development Constraints: DO NOT remove or overwrite existing files/functions unless explicitly told - build upon existing architecture only

## Recent Changes (Oct 4, 2025)
- **✅ Profit Sharing Model Aligned:** Implemented membership-tier-based profit sharing (free users pay 35% fee, paid tiers get progressively better shares: 20% → 2% fees)
- **✅ Bot Tier Schema Alignment:** All bot configurations now use BotTier enum from shared/subscriptions.ts for type safety
- **✅ Admin Bot Clarification:** Nwaora Chigozie ε (COSMIC_EPSILON) confirmed as platform admin bot only (0/100 split, NOT available to users)
- **✅ Single Source of Truth:** masterBotAlignmentService.ts now imports BotTier enum instead of defining duplicate types
- **✅ Production Ready:** Architect approved - all profit sharing percentages align with platformFeeRate across bot registry and subscription schema
- **✅ Wallet Validation & Monitoring System:** Comprehensive wallet validation system ensuring proper separation between Trading Wallet (main), Mining Wallet (SmaisikaMining - mining only), and System Wallets (admin fees, profit split, referrals). Includes automatic scanning, violation detection, health monitoring, and minor auto-fixes (expired locks). Separation enforced architecturally via separate database tables + API-level validation.

## System Architecture
Waides KI utilizes a modern stack with a clear separation of concerns. The frontend is built with **TypeScript/React** and **Wouter** for routing, while the backend is powered by **Express.js** and connects to a **PostgreSQL database**.

**UI/UX Decisions:**
- **Professional, Business-Focused Design:** Blue/emerald gradient scheme, responsive for mobile with adaptive grids and touch-friendly interactions.
- **Immersive Experiences:** Audio landscapes, spatial sound effects, and voice narration with AI personas.
- **Enhanced Wallet Interface:** Comprehensive wallet page with scrollable tabs for SmaiPin redemption, currency conversion, virtual accounts, and AI insights.
- **Streamlined Navigation:** Compact header and footer navigation, dynamic content, and consistent visual styling.
- **Gamified Analytics:** Integration of gamified performance metrics and real-time messaging across trading engines.
- **Mobile-Responsive Bot Settings:** Professional bot configuration interface with adaptive layouts and touch controls, including spiritual AI configurations.
- **Unified Header Navigation:** Consolidated `StableNavigation` across the application with organized dropdowns (Core Trading, AI Systems, Wallet, Profile), mobile responsiveness, and consistent styling.

**Technical Implementations & Feature Specifications:**
- **Bot Hierarchy System:** Comprehensive bot tier subscription system with 6 trading entities (e.g., Maibot), subscription-based access, a unified management dashboard, and integrated monetization.
- **KonsMesh & KonsAi Communication System:** Spiritual AI communication infrastructure with a Metaphysical Intelligence layer (Web∞ Consciousness Level 7), central coordination for trading entities, secure mesh communication (end-to-end encryption, heartbeat monitoring, broadcasting), and formal communication contracts (KonsLang protocol).
- **Comprehensive AI Trading Logic System:** Advanced AI models for all 6 trading entities (Alpha, Beta, Gamma, Omega, Delta, Epsilon), ethical decision-making, Kelly sizing, psychology analysis, spiritual AI integration, A/B testing, and loss streak monitoring.
- **Universal Exchange Integration:** Multi-exchange connectivity system with an Exchange Manager for centralized management, encrypted API key security, 30-point verification, and automated signal routing. Supports major exchanges like Binance, Coinbase, Kraken, KuCoin, Bybit, Bitfinex, OKX, Gate.io, and Gemini. Features universal connector interface, rate limiting, connection health monitoring, multi-exchange arbitrage, and automatic failover.
- **Market-Type Connector Architecture:** Dedicated connector infrastructure for Binary Options (9 brokers), Forex/CFD (6 platforms), and Spot Exchange (9 exchanges). Includes a market-type routing manager, connector status monitoring, bot-to-market validation, and API endpoints for management.
- **Authentication System:** Robust dual-fallback authentication with persistent sessions (JWT), behavioral pattern analysis (SmaiTrust), and karmic authentication (Shavoka).
- **Financial Management:** SmaiSika Wallet for SmaiPin transfers, virtual banking, multi-currency support, and secure generation/management of BTC, ETH, and USDT crypto wallets.
- **Real-time Data & Analytics:** Integration of real-time market feeds, candlestick charts, performance metrics, and analytics for trading profit tracking, bot strategy performance, and liquidity.
- **Knowledge Base & KI Advisor:** Structured knowledge base and an enhanced KI Advisor for guidance on loss handling, profit protection, emotional control, and trading strategies.
- **Forum System & Community Platform:** Comprehensive community forum with interactive features, real-time AI entity responses, interactive discussions, and advanced community features (category organization, search, tag filtering, AI badges, analytics).
- **Candlestick Chart Optimization:** Enhanced real-time data stability with optimized refresh intervals, improved caching, and stabilized WebSocket connections.
- **Admin Exchange Pool Management:** System for users to trade via admin-managed shared credentials on 9 major exchanges. Features encrypted storage, automatic user assignment, usage monitoring, and a comprehensive admin interface.
- **Real Cryptocurrency Mining Platform:** Comprehensive mining system supporting Monero (RandomX), Bitcoin (SHA-256), and Ethereum (Ethash) with SmaiSika as an internal token layer. Features real mining pool connections, admin wallet reserves, automatic crypto-to-SmaiSika conversion (1:1000), real-time hashrate monitoring, and secure swap functionality.
- **Trading Bot Profit-Sharing Ledger System:** Integrated SmaiSika ledger with automatic profit/loss tracking for 6 user-accessible bots. Features **membership-tier-based profit sharing** (Free: 65/35, Basic: 80/20, Pro: 90/10, Elite: 95/5, Master: 97/3, Divine: 98/2), wallet credit/debit, comprehensive trade profit recording, and a Treasury Analytics Dashboard. **Note:** Nwaora Chigozie ε (COSMIC_EPSILON) is a platform admin bot only (0/100 split - all profits to treasury), NOT available to users.
- **Wallet Validation & Monitoring System:** Automated wallet validation and monitoring system ensuring proper isolation between Trading Wallet (deposits, withdrawals, trading), Mining Wallet (mining only - NOT trading), and System Wallets (fees, profit sharing, referrals). Features database scanning, violation detection, balance validation, compliance reporting, and comprehensive health monitoring. Wallet separation enforced architecturally through separate database tables (wallets for trading, smaisikaMining for mining) with API-level validation.
- **Admin Dashboards:** Enterprise-grade dashboards for system administration, trading bot management, customer support, and content analytics with real-time metrics.
- **Master Bot Alignment Service:** Defines 7 TredBeings (trading bots) with market-type alignments, required tiers, recommended connectors, and risk management settings.
- **Currency System Standardization:** Smaisika (SS) as base platform currency (1:1 USD parity), with cryptocurrency deposit/withdrawal support (USDT, BTC, ETH, BNB) and automatic conversion.
- **Membership Tier System:** Seven tiers aligned with BotTier enum from shared/subscriptions.ts:
  - **FREE (Maibot):** 0 SS/month, 35% platform fee (65% user profit)
  - **BASIC (WaidBot α):** 50 SS/month, 20% platform fee (80% user profit)
  - **PRO (WaidBot Pro β):** 150 SS/month, 10% platform fee (90% user profit)
  - **ELITE (Autonomous Trader γ):** 300 SS/month, 5% platform fee (95% user profit)
  - **MASTER (Full Engine Ω):** 500 SS/month, 3% platform fee (97% user profit)
  - **DIVINE_DELTA (Smai Chinnikstah δ):** 1000 SS/month, 2% platform fee (98% user profit)
  - **COSMIC_EPSILON (Nwaora Chigozie ε):** Admin reserved only, 100% to treasury
  
  **Business Logic:** Free users pay with profit percentage (35% fee). Paid members get progressively better profit shares as tiers increase, since they already pay monthly subscriptions. Higher tier = lower platform fee.
- **Risk Management Framework:** Default 2% risk per trade (configurable 1-5% per bot), with admin-adjustable settings and maximum position size limits.
- **System Health Check Service:** Comprehensive monitoring of bots, wallets, connectors, APIs, and system resources, including a 30-point deployment readiness checklist.
- **Gamification & Referral System:** Level system (Bronze to Diamond), XP earning for trades and challenges, 42 achievements, and a referral program (5% bonus).
- **Complete User Flow Service:** 8-step onboarding (Welcome → KYC → Deposit → Bot Selection → Connector Setup → Risk Config → First Trade → Success) and integrated deposit/withdrawal flows.

**System Design Choices:**
- **Modularity:** Highly modular architecture with services for specific functionalities.
- **TypeScript First:** 100% TypeScript codebase for type safety and maintainability.
- **Scalability:** Designed for scalability to handle millions of operations with comprehensive monitoring.
- **Separation of Interfaces:** Distinct interfaces for AI interaction (`/portal`) and trading execution (`/trading`).

## External Dependencies
- **PostgreSQL Database:** Primary data persistence layer.
- **Neon (Serverless PostgreSQL):** Used for database hosting and management.
- **React Query:** For data fetching, caching, and synchronization.
- **Recharts:** For charting and data visualization.
- **`ws` (WebSocket library):** For real-time communication.
- **Web Speech API (SpeechSynthesisUtterance):** Used for text-to-speech capabilities.
- **Payment Gateways:** Integration with various global payment providers.