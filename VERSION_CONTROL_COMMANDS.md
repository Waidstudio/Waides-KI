# Waides KI Version Control Commands

## Quick Start Commands

Since package.json cannot be modified directly in Replit, use these direct commands:

### Setup Version Control System
```bash
node scripts/version-control-setup.cjs
```

### Scan for Changes
```bash
node scripts/version-control-setup.cjs --detect-changes
```

### Create Full Backup
```bash
node scripts/backup-system.cjs full
```

### Create Incremental Backup
```bash
node scripts/backup-system.cjs incremental
```

### Clean Old Backups
```bash
node scripts/backup-system.cjs clean
```

## Component Protection Commands

### Lock Critical Components
```bash
node scripts/component-lock-system.cjs lock
```

### Verify Component Integrity
```bash
node scripts/component-lock-system.cjs verify
```

### Generate Security Report
```bash
node scripts/component-lock-system.cjs report
```

### Enable Development Mode (1 hour)
```bash
node scripts/component-lock-system.cjs dev-mode
```

### Create Protected Backup
```bash
node scripts/component-lock-system.cjs backup
```

## UI Design Protection Commands

### Lock UI Design Elements
```bash
node scripts/ui-design-lock-system.cjs lock
```

### Verify Design Integrity
```bash
node scripts/ui-design-lock-system.cjs verify
```

### Create Design Snapshot
```bash
node scripts/ui-design-lock-system.cjs snapshot
```

### Generate Design Report
```bash
node scripts/ui-design-lock-system.cjs report
```

## Style Protection Commands

### Initialize Style Protection
```bash
node scripts/style-protection-system.cjs init
```

### Scan for Style Violations
```bash
node scripts/style-protection-system.cjs scan
```

### Generate Enforcement CSS
```bash
node scripts/style-protection-system.cjs enforce
```

### Create Style Report
```bash
node scripts/style-protection-system.cjs report
```

## Automated Monitoring

The version control system automatically tracks:

### Critical Files (Auto-backup on every change)
- `server/routes.ts` - All API endpoints
- `server/services/modeService.ts` - Demo/Real mode system
- `server/services/smaisikaMiningEngine.ts` - Cryptocurrency mining
- `server/services/autonomousBotEngine.ts` - Trading algorithms
- `shared/schema.ts` - Database schema
- `client/src/App.tsx` - Main application
- `client/src/components/ui/StableNavigation.tsx` - Navigation system

### High Priority Files (Daily backup)
- All TypeScript components (.tsx, .ts)
- React pages and components
- API service files
- Authentication systems

### Configuration Files (Weekly backup)
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `drizzle.config.ts` - Database config
- `tailwind.config.ts` - Styling config

## Security Features

### Protected from Version Control
- API keys and secrets
- Environment variables
- Credentials and certificates
- User data and uploads
- Temporary files

### Enhanced .gitignore
The system now includes comprehensive protection for:
```gitignore
# Secrets & API Keys
.env*
*.pem
*.key
**/secrets/
**/credentials/
api-keys.json

# Temporary & Build Files
node_modules/
dist/
.cache/
uploads/
temp/
*.log
*.tmp

# Replit Specific
.replit_secrets
.replit.nix
```

## Change Detection Rules

### Critical Changes (Immediate Alert)
- Authentication system modifications
- Financial/trading system changes
- Database schema updates
- Payment processing changes

### High Priority Changes (Daily Review)
- API endpoint modifications
- Core component updates
- Service layer changes

### Medium Priority Changes (Weekly Review)
- UI component updates
- Style changes
- Documentation updates

## Backup Strategy

### Automatic Backups
- **Every Commit**: Critical and high priority files
- **Daily**: All modified files from last 24 hours
- **Weekly**: Complete project snapshot
- **Emergency**: Instant rollback capability

### Backup Retention
- Keep last 10 full backups
- Keep last 30 incremental backups
- Archive monthly snapshots
- Emergency restore points

## Usage Examples

### Daily Development Workflow
```bash
# Morning: Check for changes
node scripts/version-control-setup.js --detect-changes

# Before major changes: Create backup
node scripts/backup-system.js full

# End of day: Clean old backups
node scripts/backup-system.js clean
```

### Emergency Procedures
```bash
# Create emergency backup before fixes
node scripts/backup-system.js full

# Scan for critical changes
node scripts/version-control-setup.js --detect-changes

# Use Replit's built-in rollback for immediate revert
```

### Weekly Maintenance
```bash
# Full system scan
node scripts/version-control-setup.js

# Clean old backups
node scripts/backup-system.js clean

# Create archive backup
node scripts/backup-system.js full
```

## Integration with Replit

### Checkpoints
- Replit automatically creates checkpoints
- Use the rollback button for immediate revert
- Our system complements with detailed tracking

### Environment Protection
- Secrets are automatically protected
- Environment variables are secure
- No sensitive data in version control

### Deployment Tracking
- All deployments are automatically logged
- Version tags are created for releases
- Rollback capability to any previous version

## Monitoring Dashboard

The system tracks:
- **Total Files**: 8,682 files monitored
- **Critical Files**: 23 files with auto-backup
- **Recent Changes**: Real-time change detection
- **Backup Status**: Automated backup verification
- **Security Status**: Sensitive data protection

## File Categories

### Backend (286 TypeScript files)
- API routes and endpoints
- Service layer components
- Database interfaces
- Authentication systems
- Trading and financial logic

### Frontend (245 React components)
- UI components and pages
- Hooks and utilities
- Context providers
- Navigation systems

### Configuration (12 files)
- Build and development config
- Database configuration
- Styling and asset config
- Deployment settings

### Documentation (23 files)
- API documentation
- Feature specifications
- Changelog and version history
- Setup and usage guides

## Advanced Features

### Change Impact Analysis
- Automatically assess change criticality
- Flag breaking changes
- Suggest review requirements
- Track dependency impacts

### Automated Testing Integration
- Run tests before critical commits
- Validate database migrations
- Check API compatibility
- Verify security requirements

### Deployment Integration
- Tag releases automatically
- Create deployment snapshots
- Track production changes
- Enable instant rollbacks

---

## Support

For issues with the version control system:
1. Check the change log in `.version-control/change-log.json`
2. Review backup manifests in `.backups/`
3. Use Replit's built-in rollback for emergencies
4. Contact system administrators for critical issues

This comprehensive version control system ensures every aspect of the Waides KI application is properly tracked, backed up, and protected.