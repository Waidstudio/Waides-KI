#!/usr/bin/env node

/**
 * Waides KI Version Control Setup Script
 * Automatically configures comprehensive version control for the entire application
 */

const fs = require('fs');
const path = require('path');

class VersionControlSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.manifest = this.loadManifest();
    this.changeLog = [];
  }

  loadManifest() {
    try {
      const manifestPath = path.join(this.projectRoot, 'FILE_TRACKING_MANIFEST.json');
      return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load tracking manifest:', error.message);
      return null;
    }
  }

  async scanProjectFiles() {
    console.log('🔍 Scanning project files...');
    
    const getAllFiles = (dirPath, arrayOfFiles = []) => {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.relative(this.projectRoot, fullPath);
        
        // Skip excluded directories
        if (this.isExcluded(relativePath)) {
          return;
        }
        
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
          arrayOfFiles.push({
            path: relativePath,
            size: fs.statSync(fullPath).size,
            modified: fs.statSync(fullPath).mtime,
            extension: path.extname(file),
            type: this.categorizeFile(relativePath)
          });
        }
      });
      
      return arrayOfFiles;
    };

    const files = getAllFiles(this.projectRoot);
    console.log(`📁 Found ${files.length} files to track`);
    
    return files;
  }

  isExcluded(filePath) {
    const excludedPatterns = [
      'node_modules',
      'dist',
      '.cache',
      'uploads',
      'temp',
      '.git'
    ];
    
    return excludedPatterns.some(pattern => filePath.includes(pattern));
  }

  categorizeFile(filePath) {
    const ext = path.extname(filePath);
    const fileName = path.basename(filePath);
    
    // Critical system files
    if (filePath.includes('auth') || filePath.includes('security')) {
      return 'AUTHENTICATION';
    }
    if (filePath.includes('wallet') || filePath.includes('trading') || filePath.includes('mining')) {
      return 'FINANCIAL';
    }
    if (filePath.includes('schema') || filePath.includes('migration')) {
      return 'DATABASE';
    }
    
    // File type categories
    if (['.ts', '.tsx'].includes(ext)) {
      return 'TYPESCRIPT';
    }
    if (['.js', '.jsx'].includes(ext)) {
      return 'JAVASCRIPT';
    }
    if (['.json'].includes(ext) || fileName.includes('config')) {
      return 'CONFIGURATION';
    }
    if (['.md', '.txt'].includes(ext)) {
      return 'DOCUMENTATION';
    }
    if (['.css', '.scss'].includes(ext)) {
      return 'STYLES';
    }
    
    return 'OTHER';
  }

  async detectChanges() {
    console.log('🔍 Detecting changes since last scan...');
    
    const currentFiles = await this.scanProjectFiles();
    const changes = [];
    
    // Compare with manifest if available
    if (this.manifest && this.manifest.criticalFiles) {
      this.manifest.criticalFiles.forEach(trackedFile => {
        const currentFile = currentFiles.find(f => f.path === trackedFile.path);
        
        if (!currentFile) {
          changes.push({
            type: 'DELETED',
            path: trackedFile.path,
            criticality: trackedFile.criticality,
            timestamp: new Date().toISOString()
          });
        } else if (new Date(currentFile.modified) > new Date(trackedFile.lastModified)) {
          changes.push({
            type: 'MODIFIED',
            path: trackedFile.path,
            criticality: trackedFile.criticality,
            timestamp: new Date().toISOString(),
            oldModified: trackedFile.lastModified,
            newModified: currentFile.modified.toISOString()
          });
        }
      });
    }
    
    console.log(`📊 Found ${changes.length} changes`);
    return changes;
  }

  async createBackup(filePath, criticality) {
    if (!['critical', 'high'].includes(criticality)) {
      return; // Only backup critical and high priority files
    }
    
    try {
      const backupDir = path.join(this.projectRoot, '.backups', new Date().toISOString().split('T')[0]);
      
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      const sourceFile = path.join(this.projectRoot, filePath);
      const backupFile = path.join(backupDir, filePath.replace(/[\/\\]/g, '_'));
      
      fs.copyFileSync(sourceFile, backupFile);
      console.log(`💾 Backed up: ${filePath}`);
    } catch (error) {
      console.error(`❌ Backup failed for ${filePath}:`, error.message);
    }
  }

  async generateChangeLog(changes) {
    const changelog = {
      timestamp: new Date().toISOString(),
      totalChanges: changes.length,
      criticalChanges: changes.filter(c => c.criticality === 'critical').length,
      changes: changes.map(change => ({
        ...change,
        requiresReview: ['critical', 'high'].includes(change.criticality),
        autoBackup: ['critical', 'high'].includes(change.criticality)
      }))
    };
    
    const logPath = path.join(this.projectRoot, '.version-control', 'change-log.json');
    
    // Ensure directory exists
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    // Append to existing log or create new
    let existingLog = [];
    if (fs.existsSync(logPath)) {
      try {
        existingLog = JSON.parse(fs.readFileSync(logPath, 'utf8'));
      } catch (error) {
        console.warn('⚠️ Could not read existing change log, creating new one');
      }
    }
    
    existingLog.push(changelog);
    
    // Keep only last 100 entries
    if (existingLog.length > 100) {
      existingLog = existingLog.slice(-100);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(existingLog, null, 2));
    console.log(`📝 Change log updated: ${logPath}`);
    
    return changelog;
  }

  async setupGitHooks() {
    console.log('🔧 Setting up Git hooks...');
    
    const hooksDir = path.join(this.projectRoot, '.git', 'hooks');
    if (!fs.existsSync(hooksDir)) {
      console.log('⚠️ Git hooks directory not found, skipping hook setup');
      return;
    }
    
    // Pre-commit hook
    const preCommitHook = `#!/bin/sh
# Waides KI Pre-commit Hook
echo "🔍 Running version control checks..."

# Check for sensitive data
if git diff --cached --name-only | xargs grep -l "API_KEY\\|SECRET\\|PASSWORD" 2>/dev/null; then
  echo "❌ Sensitive data detected in commit. Please remove before committing."
  exit 1
fi

# Run change detection
node scripts/version-control-setup.js --detect-changes

echo "✅ Pre-commit checks passed"
exit 0
`;
    
    const preCommitPath = path.join(hooksDir, 'pre-commit');
    fs.writeFileSync(preCommitPath, preCommitHook);
    fs.chmodSync(preCommitPath, '755');
    
    console.log('✅ Git hooks configured');
  }

  async run() {
    console.log('🚀 Starting Waides KI Version Control Setup...');
    
    try {
      // Scan current state
      const files = await this.scanProjectFiles();
      
      // Detect changes
      const changes = await this.detectChanges();
      
      // Create backups for critical changes
      for (const change of changes) {
        if (['MODIFIED', 'DELETED'].includes(change.type)) {
          await this.createBackup(change.path, change.criticality);
        }
      }
      
      // Generate change log
      const changelog = await this.generateChangeLog(changes);
      
      // Setup Git hooks
      await this.setupGitHooks();
      
      // Summary report
      console.log('\n📊 Version Control Setup Complete:');
      console.log(`   📁 Total files tracked: ${files.length}`);
      console.log(`   🔄 Changes detected: ${changes.length}`);
      console.log(`   ⚠️  Critical changes: ${changelog.criticalChanges}`);
      console.log(`   💾 Backups created: ${changes.filter(c => ['critical', 'high'].includes(c.criticality)).length}`);
      
      if (changelog.criticalChanges > 0) {
        console.log('\n⚠️  ATTENTION: Critical changes detected requiring review!');
        changelog.changes
          .filter(c => c.criticality === 'critical')
          .forEach(c => console.log(`   - ${c.type}: ${c.path}`));
      }
      
    } catch (error) {
      console.error('❌ Version control setup failed:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const setup = new VersionControlSetup();
  
  if (args.includes('--detect-changes')) {
    setup.detectChanges().then(changes => {
      if (changes.length > 0) {
        console.log(`🔍 Detected ${changes.length} changes`);
        changes.forEach(change => {
          console.log(`   ${change.type}: ${change.path} (${change.criticality})`);
        });
      } else {
        console.log('✅ No changes detected');
      }
    });
  } else {
    setup.run();
  }
}

module.exports = VersionControlSetup;