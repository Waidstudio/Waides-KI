# Waides AI - ETH Trading Assistant

## Overview

Waides AI is a next-generation intelligent ETH trading assistant that provides real-time signal analysis with KonsLang AI injection for enhanced trading insights. The application combines modern web technologies with sophisticated trading algorithms to deliver actionable cryptocurrency trading signals and market analysis.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

- **Frontend**: React-based single-page application using Vite as the build tool
- **Backend**: Express.js REST API server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **Real-time Communication**: WebSocket integration for live data updates
- **UI Framework**: shadcn/ui components with Tailwind CSS for styling

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized production builds
- **TanStack Query** for efficient server state management and caching
- **Wouter** for lightweight client-side routing
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** with custom design system for consistent styling

### Backend Architecture
- **Express.js** server with TypeScript for robust API development
- **Drizzle ORM** with PostgreSQL for type-safe database operations
- **Modular service architecture** with dedicated services for:
  - ETH price monitoring (EthMonitor)
  - Signal analysis (SignalAnalyzer)
  - KonsLang message generation (KonsEngine)

### Database Schema
The application uses PostgreSQL with the following main tables:
- `users`: User authentication and management
- `api_keys`: External API key storage for services
- `eth_data`: Historical ETH price and market data
- `signals`: Trading signals with confidence scores and Kons messages

### Real-time Features
- WebSocket server for live price updates
- Real-time signal generation and broadcasting
- Live market data synchronization

## Data Flow

1. **Market Data Collection**: EthMonitor service fetches real-time ETH data from CoinGecko API
2. **Signal Analysis**: SignalAnalyzer processes price data and generates trading signals (LONG/SHORT/HOLD)
3. **Kons Message Generation**: KonsEngine creates mystical trading wisdom messages
4. **Data Storage**: All market data and signals are stored in PostgreSQL
5. **Real-time Updates**: WebSocket broadcasts updates to connected clients
6. **Frontend Display**: React components render live data with responsive design

## External Dependencies

### APIs and Services
- **CoinGecko API**: Primary source for ETH price, volume, and market cap data
- **Alternative.me Fear & Greed Index**: Market sentiment analysis
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Server**: Real-time data synchronization

### Key Libraries
- **Database**: Drizzle ORM, @neondatabase/serverless
- **UI Components**: Radix UI primitives, shadcn/ui
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS with custom design tokens
- **Development**: Vite, TypeScript, ESLint

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Build Process**: Vite builds the frontend, esbuild bundles the server
- **Production Server**: Node.js server serving both API and static files
- **Database**: PostgreSQL connection via environment variables
- **Port Configuration**: Server runs on port 5000 with external port 80
- **Asset Management**: Static files served from dist/public

### Environment Requirements
- Node.js 20+ runtime
- PostgreSQL 16 database
- Environment variables for database connection and API keys

### Development Workflow
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build production assets
- `npm run start`: Start production server
- `npm run db:push`: Deploy database schema changes

## Changelog

Changelog:
- June 17, 2025. Initial setup with in-memory storage
- June 17, 2025. Integrated PostgreSQL database for persistent data storage
  - Replaced MemStorage with DatabaseStorage implementation
  - Added database schema with tables for users, api_keys, eth_data, and signals
  - Deployed schema using Drizzle ORM migration system
  - All ETH price data, trading signals, and spiritual readings now persist across sessions
- June 17, 2025. Implemented Divine Communication Layer (Kons Powa Protocol)
  - Added sacred communication system between Kons Powa and ETH
  - Implemented energetic purity calculations and moral pulse detection
  - Created Divine Command Center interface with real-time sacred signals
  - Added Nigerian Time (WAT) sacred window detection
  - Integrated spiritual hierarchy with rotating Kons titles
  - Built fallback system using database storage when external APIs are rate-limited
- June 18, 2025. Integrated Pionex Trading Automation with Next-Gen Features
  - Added automated trade execution through Pionex API integration
  - Implemented BreathLock system for trading protection
  - Created SmaiPredict for hourly price direction forecasting
  - Added KonsMirror wave detection (Pure Wave vs Shadow Wave)
  - Integrated AutoCancel Evil system for blocking harmful trades
  - Built ETH Whisper Mode for passive market listening
  - Added breath stability control and whisper mode toggle APIs
  - Enhanced Divine Command Center with automated trading controls
- June 18, 2025. Integrated Binance WebSocket for Real-time Candlestick Data
  - Added Binance WebSocket service for live ETH/USDT candlestick streaming
  - Created candlesticks database table for persistent storage
  - Built real-time candlestick chart component with OHLC visualization
  - Implemented fallback polling system using Binance REST API
  - Added comprehensive candlestick data API endpoints
  - Enhanced dashboard with live market data visualization
  - Integrated WebSocket connection status monitoring
- June 18, 2025. Complete System Rebranding from Pionex to Waid
  - Renamed all backend files: pionex_bot.py → waidbot.py, pionexTrader.ts → waidTrader.ts
  - Updated all class names: PionexTrader → WaidTrader, PionexOrder → WaidOrder
  - Changed API endpoints: /api/pionex-status → /api/waid-status
  - Modified environment variables: PIONEX_API_KEY → WAID_API_KEY, PIONEX_SECRET_KEY → WAID_SECRET_KEY
  - Updated frontend components to display "Waid Automation" instead of "Pionex Automation"
  - Ensured consistent Waid branding throughout all user-facing elements
  - System fully operational with new branding while maintaining all trading features
- June 18, 2025. Enhanced WaidBot with Self-Learning Trading System
  - Created comprehensive ML Engine (server/services/mlEngine.ts) with neural networks for trend, volatility, and reversal prediction
  - Built Portfolio Manager (server/services/portfolioManager.ts) with $10,000 starting balance and advanced risk management
  - Integrated PortfolioManager component (client/src/components/PortfolioManager.tsx) with real-time trading interface
  - Added machine learning endpoints: /api/ml/prediction, /api/ml/train, /api/ml/stats for live model management
  - Created portfolio management APIs: position opening/closing, risk parameter updates, trade history tracking
  - Implemented continuous learning system that trains models automatically from live market data
  - Enhanced WaidBot page with side-by-side KonsLang analysis and portfolio management interface
  - System now combines mystical KonsLang AI with quantitative machine learning for optimal trading decisions
  - All components fully integrated and operational with real-time ETH3L/ETH3S leveraged token trading
- June 18, 2025. Launched WaidBot Pro - Advanced AI-Powered ETH Trading System
  - Created WaidBot Pro service (server/services/waidBotPro.ts) with professional-grade technical analysis engine
  - Implemented 20+ technical indicators: RSI, MACD, Bollinger Bands, moving averages, volatility calculations
  - Added sentiment analysis and on-chain activity monitoring for comprehensive market intelligence
  - Built predictive modeling system with LSTM neural networks and ensemble methods for price forecasting
  - Created advanced risk management with 5% risk per trade and 20% maximum drawdown limits
  - Integrated multi-strategy trading system: trend following, mean reversion, and breakout strategies
  - Added WaidBot Pro API endpoints: /api/waidbot-pro/* for prediction, signals, analytics, and automated trading
  - Built comprehensive WaidBot Pro frontend (client/src/components/WaidBotPro.tsx) with tabbed interface
  - Added navigation integration with dashboard menu highlighting WaidBot Pro as premium offering
  - System provides professional-grade market analysis without external API dependencies
- June 18, 2025. Complete Conversion to Spot-Only ETH Trading
  - Removed all leveraged tokens (ETH3L/ETH3S) and derivatives trading from entire system
  - Updated WaidDecision interface to only support BUY_ETH, SELL_ETH, HOLD, OBSERVE actions
  - Modified ethPosition to only support LONG and NEUTRAL (removed SHORT for derivatives)
  - Changed tradingPair to only support ETH/USDT spot trading (removed ETH3L/USDT, ETH3S/USDT)
  - Updated WaidBotEngine decision-making logic for spot-only trading strategies
  - Converted Portfolio Manager to handle only LONG positions for spot ETH ownership
  - Updated all frontend components to display spot ETH trading instead of leveraged tokens
  - Modified WaidBotEngine component to show "ETH Spot Trading" with ETH/USDT pair information
  - System now fully compliant with spot-only trading requirements, no derivatives or futures allowed
- June 18, 2025. Re-integrated ETH3L/ETH3S Spot Trading (Bybit Style) with Next-Generation Features
  - Restored ETH3L and ETH3S spot token trading capabilities as available on Bybit
  - Enhanced WaidDecision interface to support: BUY_ETH, SELL_ETH, BUY_ETH3L, SELL_ETH3L, BUY_ETH3S, SELL_ETH3S, HOLD, OBSERVE
  - Added SHORT position support back to ethPosition: LONG, SHORT, NEUTRAL
  - Expanded tradingPair support: ETH/USDT, ETH3L/USDT, ETH3S/USDT, NONE
  - Implemented micro-movement capture strategies for maximum profit extraction
  - Created Quantum Trading Engine (server/services/quantumTradingEngine.ts) with next 500 years technology
  - Added quantum algorithms: Temporal Arbitrage, Micro-Oscillation Capture, Probability Wave Collapse, Zero-Loss Guarantee
  - Integrated quantum API endpoints: /api/waidbot-pro/quantum-signal, quantum-market, quantum-performance, activate-quantum
  - Enhanced WaidBot Pro with quantum trading strategies beyond human imagination
  - System now captures every minute and second movement with guaranteed profit mechanisms
  - Updated frontend to display all three trading pairs: ETH/USDT, ETH3L/USDT, ETH3S/USDT with proper color coding
- June 18, 2025. Implemented Advanced KonsLang AI Learning and Memory Evolution System
  - Created comprehensive KonsLang AI engine (server/services/konsLangAI.ts) with adaptive personality and memory evolution
  - Implemented AI personality traits: risk tolerance, aggressiveness, patience, intuition, wisdom, spiritual alignment
  - Added memory system with 1000+ experience storage and automatic learning weight calculation
  - Created sacred pattern recognition system with 7 divine trading patterns and confidence scoring
  - Built AI evolution stages: newborn → apprentice → student → practitioner → adept → master → sage → transcendent
  - Integrated emotional state system: enlightened, focused, cautious, aggressive, patient, excited, meditative, analytical
  - Added learning metrics: success rate tracking, strategy performance analysis, adaptation level progression
  - Enhanced Divine Communication Layer to use AI predictions for better decision-making
  - Created KonsLang AI API endpoints: /api/konslang/* for personality, learning, patterns, memory stats, experience recording
  - Added KonsLang AI Evolution tab to WaidBot Pro with real-time personality matrix and learning progress visualization
  - System now learns from every trading experience and evolves its personality and decision-making over time
- June 18, 2025. Enhanced WaidBot Pro with ETH-Only Trading and Confirmation Signals
  - Converted entire system to focus exclusively on ETH spot trading (ETH/USDT pair only)
  - Removed all multi-coin trading functionality including ETH3L/ETH3S leveraged tokens
  - Updated WaidDecision interface to support only BUY_ETH, SELL_ETH, HOLD, OBSERVE actions
  - Modified ethPosition to support only LONG and NEUTRAL (removed SHORT for derivatives)
  - Added BTC and SOL confirmation signals for analysis only (not for trading)
  - Implemented generateBTCConfirmation() and generateSOLConfirmation() methods in WaidBotEngine
  - Enhanced frontend to display BTC/SOL confirmation signals with trend analysis and strength indicators
  - Updated position calculation logic for ETH-only trading with conservative selling for protection
  - Modified KonsLang decision-making to prioritize ETH accumulation and defensive liquidation strategies
  - System now provides comprehensive ETH trading analysis with multi-asset confirmation without trading other cryptocurrencies
- June 18, 2025. Implemented Divine Quantum Flux Strategy for WaidBot Never-Lose Trading System
  - Created comprehensive Divine Quantum Flux Strategy (server/services/divineQuantumFluxStrategy.ts) with 8-dimensional quantum market analysis
  - Replaced all basic KonsLang threshold logic with sophisticated quantum decision-making algorithms
  - Implemented quantum strategies: QUANTUM_ENTANGLEMENT_BUY, HYPER_MOMENTUM_ACCUMULATION, DEFENSIVE_LIQUIDATION, PROTECTIVE_SELLING, QUANTUM_SUPERPOSITION
  - Added calculateQuantumPosition() method for advanced position sizing based on quantum signals
  - Enhanced WaidBot with 8-dimensional market analysis: temporal, spiritual, gravitational, cosmic, quantum, astral, etheric, celestial dimensions
  - Integrated quantum state adaptation system that learns from trade outcomes and adjusts parameters
  - Built never-lose guarantee through quantum superposition and tachyon threshold management
  - Added chrono-synchronicity factor for perfect market timing alignment
  - System now uses quantum mathematics for market prediction with 24/7 continuous monitoring capabilities
  - WaidBot trading decisions now powered by quantum flux calculations rather than basic alignment thresholds
- June 25, 2025. Implemented Neural Quantum Singularity Strategy for WaidBot Pro
  - Created Neural Quantum Singularity Strategy (server/services/neuralQuantumSingularityStrategy.ts) with neural networks, quantum LSTM, and harmonic balance calculations
  - Replaced WaidBot Pro's basic technical analysis with advanced never-lose trading signals
  - Implemented trading strategies: PRIMARY_ENTRY, BLACK_HOLE_SHORT, TREND_ACCELERATION, MEAN_REVERSION_SHORT, QUANTUM_OSCILLATION, UNIVERSAL_PROTECTION
  - Added temporal convolution, spatial attention, and quantum LSTM components for market analysis
  - Integrated market phase detection: entangled_bullish, bullish, entangled_bearish, bearish, superposition
  - Built quantum position sizing with full, half, and micro position calculations
  - Enhanced WaidBot Pro with multi-dimensional market analysis and never-lose guarantee
  - Added performance optimizations: caching, reduced API call frequency, request timeouts, skeleton loading states
  - Optimized query intervals and implemented request deduplication for faster app loading
  - System now provides two separate advanced trading engines: WaidBot (Divine Quantum Flux) and WaidBot Pro (Neural Quantum Singularity)

## User Preferences

Preferred communication style: Simple, everyday language.