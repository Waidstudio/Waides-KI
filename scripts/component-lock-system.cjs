#!/usr/bin/env node

/**
 * Waides KI Component Lock System
 * Protects critical components from accidental modification
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ComponentLockSystem {
  constructor() {
    this.projectRoot = process.cwd();
    this.lockDir = path.join(this.projectRoot, '.component-locks');
    this.lockFile = path.join(this.lockDir, 'locked-components.json');
    this.checksumFile = path.join(this.lockDir, 'checksums.json');
    this.ensureLockDirectory();
  }

  ensureLockDirectory() {
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }
  }

  // Lock critical components
  async lockComponents(components = []) {
    console.log('🔒 Locking critical components...');
    
    const defaultCriticalComponents = [
      'server/routes.ts',
      'server/services/modeService.ts',
      'server/services/smaisikaMiningEngine.ts',
      'server/services/autonomousBotEngine.ts',
      'shared/schema.ts',
      'client/src/App.tsx',
      'client/src/components/ui/StableNavigation.tsx',
      'client/src/hooks/useModeSwitch.tsx',
      'drizzle.config.ts',
      'tsconfig.json'
    ];

    const componentsToLock = components.length > 0 ? components : defaultCriticalComponents;
    const lockedComponents = {};
    const checksums = {};

    for (const component of componentsToLock) {
      const filePath = path.join(this.projectRoot, component);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const checksum = this.calculateChecksum(content);
        const stats = fs.statSync(filePath);
        
        lockedComponents[component] = {
          locked: true,
          lockDate: new Date().toISOString(),
          originalChecksum: checksum,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          lockLevel: this.determineLockLevel(component)
        };
        
        checksums[component] = checksum;
        console.log(`🔒 Locked: ${component} (${lockedComponents[component].lockLevel})`);
      } else {
        console.log(`⚠️ File not found: ${component}`);
      }
    }

    // Save lock configuration
    fs.writeFileSync(this.lockFile, JSON.stringify(lockedComponents, null, 2));
    fs.writeFileSync(this.checksumFile, JSON.stringify(checksums, null, 2));
    
    console.log(`✅ Locked ${Object.keys(lockedComponents).length} components`);
    return lockedComponents;
  }

  // Unlock specific components
  async unlockComponents(components) {
    console.log('🔓 Unlocking components...');
    
    if (!fs.existsSync(this.lockFile)) {
      console.log('❌ No locked components found');
      return;
    }

    const lockedComponents = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
    
    for (const component of components) {
      if (lockedComponents[component]) {
        delete lockedComponents[component];
        console.log(`🔓 Unlocked: ${component}`);
      } else {
        console.log(`⚠️ Component not locked: ${component}`);
      }
    }

    fs.writeFileSync(this.lockFile, JSON.stringify(lockedComponents, null, 2));
    console.log('✅ Components unlocked');
  }

  // Check for unauthorized modifications
  async verifyLocks() {
    console.log('🔍 Verifying component locks...');
    
    if (!fs.existsSync(this.lockFile)) {
      console.log('ℹ️ No locked components to verify');
      return { violations: [], verified: 0 };
    }

    const lockedComponents = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
    const checksums = JSON.parse(fs.readFileSync(this.checksumFile, 'utf8'));
    const violations = [];
    let verified = 0;

    for (const [component, lockInfo] of Object.entries(lockedComponents)) {
      const filePath = path.join(this.projectRoot, component);
      
      if (!fs.existsSync(filePath)) {
        violations.push({
          component,
          type: 'FILE_DELETED',
          severity: 'CRITICAL',
          message: 'Locked file has been deleted'
        });
        continue;
      }

      const currentContent = fs.readFileSync(filePath, 'utf8');
      const currentChecksum = this.calculateChecksum(currentContent);
      
      if (currentChecksum !== checksums[component]) {
        const stats = fs.statSync(filePath);
        violations.push({
          component,
          type: 'UNAUTHORIZED_MODIFICATION',
          severity: lockInfo.lockLevel.toUpperCase(),
          message: 'Component has been modified without unlocking',
          originalChecksum: checksums[component],
          currentChecksum,
          modifiedDate: stats.mtime.toISOString(),
          lockLevel: lockInfo.lockLevel
        });
      } else {
        verified++;
      }
    }

    if (violations.length > 0) {
      console.log(`⚠️ Found ${violations.length} lock violations:`);
      violations.forEach(violation => {
        console.log(`   ${violation.severity}: ${violation.component} - ${violation.message}`);
      });
    } else {
      console.log(`✅ All ${verified} locked components verified`);
    }

    return { violations, verified };
  }

  // Create protected backup before changes
  async createProtectedBackup(components = []) {
    console.log('💾 Creating protected backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.projectRoot, '.component-locks', 'protected-backups', timestamp);
    fs.mkdirSync(backupDir, { recursive: true });

    const lockedComponents = fs.existsSync(this.lockFile) 
      ? JSON.parse(fs.readFileSync(this.lockFile, 'utf8'))
      : {};

    const componentsToBackup = components.length > 0 
      ? components 
      : Object.keys(lockedComponents);

    const backupManifest = {
      timestamp: new Date().toISOString(),
      components: [],
      lockStates: {}
    };

    for (const component of componentsToBackup) {
      const filePath = path.join(this.projectRoot, component);
      
      if (fs.existsSync(filePath)) {
        const targetPath = path.join(backupDir, component);
        const targetDir = path.dirname(targetPath);
        
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        fs.copyFileSync(filePath, targetPath);
        
        backupManifest.components.push(component);
        backupManifest.lockStates[component] = lockedComponents[component] || null;
        
        console.log(`💾 Backed up: ${component}`);
      }
    }

    fs.writeFileSync(
      path.join(backupDir, 'backup-manifest.json'),
      JSON.stringify(backupManifest, null, 2)
    );

    console.log(`✅ Protected backup created: ${backupDir}`);
    return backupDir;
  }

  // Restore from protected backup
  async restoreFromBackup(backupPath) {
    console.log(`🔄 Restoring from protected backup: ${backupPath}`);
    
    const manifestPath = path.join(backupPath, 'backup-manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Backup manifest not found');
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    for (const component of manifest.components) {
      const backupFilePath = path.join(backupPath, component);
      const targetPath = path.join(this.projectRoot, component);
      
      if (fs.existsSync(backupFilePath)) {
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        fs.copyFileSync(backupFilePath, targetPath);
        console.log(`✅ Restored: ${component}`);
      }
    }

    // Restore lock states
    if (Object.keys(manifest.lockStates).length > 0) {
      fs.writeFileSync(this.lockFile, JSON.stringify(manifest.lockStates, null, 2));
      console.log('🔒 Lock states restored');
    }

    console.log('✅ Restore completed');
  }

  // Enable development mode (temporary unlock)
  async enableDevelopmentMode(duration = 3600) { // 1 hour default
    console.log(`🚧 Enabling development mode for ${duration} seconds...`);
    
    const devModeFile = path.join(this.lockDir, 'dev-mode.json');
    const devMode = {
      enabled: true,
      startTime: new Date().toISOString(),
      duration: duration,
      expiresAt: new Date(Date.now() + duration * 1000).toISOString()
    };

    fs.writeFileSync(devModeFile, JSON.stringify(devMode, null, 2));
    
    console.log(`🚧 Development mode enabled until ${devMode.expiresAt}`);
    console.log('⚠️ Component locks are temporarily disabled');
    
    // Set auto-disable timer
    setTimeout(() => {
      this.disableDevelopmentMode();
    }, duration * 1000);
    
    return devMode;
  }

  // Disable development mode
  disableDevelopmentMode() {
    console.log('🔒 Disabling development mode...');
    
    const devModeFile = path.join(this.lockDir, 'dev-mode.json');
    
    if (fs.existsSync(devModeFile)) {
      fs.unlinkSync(devModeFile);
    }
    
    console.log('🔒 Development mode disabled - locks re-enabled');
  }

  // Check if development mode is active
  isDevelopmentModeActive() {
    const devModeFile = path.join(this.lockDir, 'dev-mode.json');
    
    if (!fs.existsSync(devModeFile)) {
      return false;
    }

    const devMode = JSON.parse(fs.readFileSync(devModeFile, 'utf8'));
    const now = new Date();
    const expiresAt = new Date(devMode.expiresAt);
    
    if (now > expiresAt) {
      this.disableDevelopmentMode();
      return false;
    }
    
    return true;
  }

  // Generate component integrity report
  async generateIntegrityReport() {
    console.log('📊 Generating component integrity report...');
    
    const verification = await this.verifyLocks();
    const devModeActive = this.isDevelopmentModeActive();
    
    const report = {
      timestamp: new Date().toISOString(),
      developmentMode: devModeActive,
      totalLocked: verification.verified + verification.violations.length,
      verified: verification.verified,
      violations: verification.violations.length,
      status: verification.violations.length === 0 ? 'SECURE' : 'COMPROMISED',
      details: verification.violations,
      recommendations: this.generateRecommendations(verification.violations)
    };

    const reportPath = path.join(this.lockDir, 'integrity-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Report generated: ${reportPath}`);
    console.log(`Status: ${report.status}`);
    console.log(`Verified: ${report.verified}/${report.totalLocked} components`);
    
    return report;
  }

  generateRecommendations(violations) {
    const recommendations = [];
    
    if (violations.length === 0) {
      recommendations.push('All components are secure - continue normal development');
      return recommendations;
    }

    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
    const highViolations = violations.filter(v => v.severity === 'HIGH');
    
    if (criticalViolations.length > 0) {
      recommendations.push('IMMEDIATE ACTION: Critical components have been modified');
      recommendations.push('Create emergency backup before any changes');
      recommendations.push('Review all critical modifications for security implications');
    }
    
    if (highViolations.length > 0) {
      recommendations.push('Review high-priority component changes');
      recommendations.push('Consider re-locking components after validation');
    }
    
    recommendations.push('Run full system test after resolving violations');
    
    return recommendations;
  }

  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  determineLockLevel(component) {
    const criticalPatterns = [
      'routes.ts',
      'schema.ts',
      'modeService.ts',
      'smaisikaMiningEngine.ts',
      'autonomousBotEngine.ts'
    ];
    
    const highPatterns = [
      'App.tsx',
      'StableNavigation.tsx',
      'useModeSwitch.tsx'
    ];
    
    if (criticalPatterns.some(pattern => component.includes(pattern))) {
      return 'critical';
    }
    
    if (highPatterns.some(pattern => component.includes(pattern))) {
      return 'high';
    }
    
    return 'medium';
  }

  async run(command, options = {}) {
    switch (command) {
      case 'lock':
        return await this.lockComponents(options.components || []);
      case 'unlock':
        return await this.unlockComponents(options.components || []);
      case 'verify':
        return await this.verifyLocks();
      case 'backup':
        return await this.createProtectedBackup(options.components || []);
      case 'restore':
        return await this.restoreFromBackup(options.backupPath);
      case 'dev-mode':
        return await this.enableDevelopmentMode(options.duration || 3600);
      case 'disable-dev':
        return this.disableDevelopmentMode();
      case 'report':
        return await this.generateIntegrityReport();
      default:
        console.log('Available commands: lock, unlock, verify, backup, restore, dev-mode, disable-dev, report');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'verify';
  
  const lockSystem = new ComponentLockSystem();
  lockSystem.run(command).catch(error => {
    console.error('❌ Component lock system failed:', error);
    process.exit(1);
  });
}

module.exports = ComponentLockSystem;