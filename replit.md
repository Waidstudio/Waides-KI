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

## User Preferences

Preferred communication style: Simple, everyday language.