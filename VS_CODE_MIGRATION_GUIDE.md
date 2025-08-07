# 🚀 Waides Ki - VS Code Migration Guide
*Complete Step-by-Step Export Process*

## Pre-Migration Checklist

### 1. Enable Database Connection
```bash
# In Neon Dashboard:
# 1. Go to your Neon project dashboard
# 2. Enable the database endpoint
# 3. Copy the connection string

# In Replit:
npm run db:push  # Ensure schema is up to date
```

### 2. Download Complete Project
```bash
# From Replit Shell:
zip -r waides-ki-export.zip . -x "node_modules/*" ".replit" "**/node_modules/*"
```

---

## VS Code Setup Instructions

### 1. Prerequisites
```bash
# Ensure you have:
- Node.js 18+ installed
- PostgreSQL database (Neon or local)
- VS Code with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
```

### 2. Project Setup
```bash
# Extract and navigate
unzip waides-ki-export.zip
cd waides-ki

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 3. Environment Configuration
```bash
# Edit .env file with your values:
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV="development"
SESSION_SECRET="your-session-secret"

# Optional API keys for full functionality:
ANTHROPIC_API_KEY="your-anthropic-key"
BINANCE_API_KEY="your-binance-key"
BINANCE_API_SECRET="your-binance-secret"
```

### 4. Database Setup
```bash
# Push schema to your database
npm run db:push

# Verify connection
npm run check
```

### 5. Start Development Server
```bash
# Development mode
npm run dev

# Production build (optional)
npm run build
npm run start
```

---

## Configuration Adjustments

### 1. Remove Replit-Specific Files
```bash
# Delete these files in VS Code:
rm .replit
rm replit.nix  # if exists
```

### 2. VS Code Workspace Setup
Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### 3. Update Package Scripts (if needed)
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

---

## Feature Verification Checklist

### Core System Tests
```bash
# 1. Start the application
npm run dev

# 2. Navigate to http://localhost:5000
# 3. Verify these components load:
```

- [ ] Landing page displays correctly
- [ ] User authentication works
- [ ] Admin panel accessible
- [ ] All 6 trading bots show status
- [ ] Real-time price data updates
- [ ] KonsAi chat responds
- [ ] Wallet functionality operational

### API Endpoint Tests
```bash
# Test key endpoints:
curl http://localhost:5000/api/health
curl http://localhost:5000/api/platform/user-metrics  
curl http://localhost:5000/api/eth/current-price
curl http://localhost:5000/api/waidbot-engine/waidbot/status
```

### Exchange Integration Tests
- [ ] Binance API connection
- [ ] Real-time price feeds
- [ ] Order simulation
- [ ] Admin exchange pool management

---

## Troubleshooting Guide

### Database Connection Issues
```bash
# If database connection fails:
1. Verify DATABASE_URL is correct
2. Check database is accessible
3. Run: npm run db:push
4. Restart the application
```

### Port Conflicts
```bash
# If port 5000 is busy:
1. Edit server/index.ts
2. Change PORT environment variable
3. Or kill process: lsof -ti:5000 | xargs kill
```

### TypeScript Errors
```bash
# For TypeScript compilation errors:
npm run check          # Check for errors
npm install --save-dev @types/node  # If missing types
```

### Missing Dependencies
```bash
# If modules are missing:
rm -rf node_modules package-lock.json
npm install
```

---

## Performance Optimization for VS Code

### 1. Enable Hardware Acceleration
In `.vscode/settings.json`:
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false,
  "extensions.ignoreRecommendations": false
}
```

### 2. Optimize Build Process
```bash
# For faster builds:
npm install --save-dev @swc/core @swc/cli
# Update build script to use SWC instead of esbuild
```

### 3. Memory Management
```bash
# If experiencing memory issues:
export NODE_OPTIONS="--max-old-space-size=8192"
npm run dev
```

---

## Production Deployment (Post-Export)

### 1. Environment Variables
```bash
# Production .env:
NODE_ENV="production"
DATABASE_URL="your-production-db-url"
SESSION_SECRET="secure-session-secret"
```

### 2. Build for Production
```bash
npm run build
npm run start
```

### 3. Deploy to Platform
```bash
# For Vercel:
npm install -g vercel
vercel

# For Railway:
npm install -g @railway/cli
railway deploy

# For DigitalOcean:
# Use their App Platform with this repo
```

---

## Maintenance and Updates

### Regular Tasks
```bash
# Weekly:
npm audit fix              # Security updates
npm run check             # TypeScript check
npm run db:push           # Schema updates

# Monthly:
npm update                # Dependency updates
npm run build             # Test production build
```

### Monitoring
- Check application logs regularly
- Monitor database performance
- Verify API endpoint response times
- Review error rates and user feedback

---

## Support and Documentation

### Key Files to Reference
- `replit.md` - Project overview and architecture
- `API_ENDPOINTS_SUMMARY.md` - Complete API documentation
- `PRODUCTION_READINESS_FINAL_REPORT.md` - System status
- `shared/schema.ts` - Database schema reference

### Getting Help
1. Check troubleshooting section above
2. Review error logs in console
3. Verify environment variables
4. Test individual components

---

**Migration Complete! 🎉**

Your Waides Ki system should now be fully operational in VS Code with all features preserved from the Replit environment.