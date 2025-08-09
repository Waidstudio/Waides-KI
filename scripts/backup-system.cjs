#!/usr/bin/env node

/**
 * Waides KI Automated Backup System
 * Creates comprehensive backups of critical application components
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackupSystem {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, '.backups');
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  async createFullBackup() {
    console.log('🔄 Creating full application backup...');
    
    const backupPath = path.join(this.backupDir, `full-backup-${this.timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });

    // Critical files to backup
    const criticalFiles = [
      'server/routes.ts',
      'server/services/modeService.ts',
      'server/services/smaisikaMiningEngine.ts',
      'server/services/autonomousBotEngine.ts',
      'shared/schema.ts',
      'client/src/App.tsx',
      'client/src/components/ui/StableNavigation.tsx',
      'client/src/hooks/useModeSwitch.tsx',
      'package.json',
      'tsconfig.json',
      'drizzle.config.ts',
      'replit.md'
    ];

    // Configuration files
    const configFiles = [
      'tailwind.config.ts',
      'vite.config.ts',
      'postcss.config.js',
      'components.json'
    ];

    // Documentation files
    const docFiles = [
      'VERSION_CONTROL_IMPLEMENTATION.md',
      'CHANGELOG.md',
      'FILE_TRACKING_MANIFEST.json'
    ];

    const allFiles = [...criticalFiles, ...configFiles, ...docFiles];

    for (const file of allFiles) {
      try {
        const sourcePath = path.join(this.projectRoot, file);
        const targetPath = path.join(backupPath, file);
        
        if (fs.existsSync(sourcePath)) {
          // Ensure target directory exists
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Backed up: ${file}`);
        } else {
          console.log(`⚠️ File not found: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Failed to backup ${file}:`, error.message);
      }
    }

    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      type: 'full-backup',
      files: allFiles,
      projectVersion: this.getProjectVersion(),
      backupPath: backupPath
    };

    fs.writeFileSync(
      path.join(backupPath, 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`💾 Full backup created: ${backupPath}`);
    return backupPath;
  }

  async createIncrementalBackup() {
    console.log('🔄 Creating incremental backup...');
    
    // Get changed files since last backup
    const changedFiles = this.getChangedFiles();
    
    if (changedFiles.length === 0) {
      console.log('✅ No changes detected, skipping backup');
      return null;
    }

    const backupPath = path.join(this.backupDir, `incremental-${this.timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });

    for (const file of changedFiles) {
      try {
        const sourcePath = path.join(this.projectRoot, file);
        const targetPath = path.join(backupPath, file);
        
        if (fs.existsSync(sourcePath)) {
          const targetDir = path.dirname(targetPath);
          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }
          
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Backed up changed file: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Failed to backup ${file}:`, error.message);
      }
    }

    const manifest = {
      timestamp: new Date().toISOString(),
      type: 'incremental-backup',
      files: changedFiles,
      projectVersion: this.getProjectVersion(),
      backupPath: backupPath
    };

    fs.writeFileSync(
      path.join(backupPath, 'backup-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`💾 Incremental backup created: ${backupPath}`);
    return backupPath;
  }

  getChangedFiles() {
    // Check for files modified in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const changedFiles = [];

    const checkDirectory = (dirPath) => {
      try {
        const files = fs.readdirSync(dirPath);
        
        for (const file of files) {
          const fullPath = path.join(dirPath, file);
          const relativePath = path.relative(this.projectRoot, fullPath);
          
          // Skip excluded directories
          if (this.shouldExclude(relativePath)) {
            continue;
          }
          
          const stats = fs.statSync(fullPath);
          
          if (stats.isDirectory()) {
            checkDirectory(fullPath);
          } else if (stats.mtime > oneHourAgo) {
            changedFiles.push(relativePath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    checkDirectory(this.projectRoot);
    return changedFiles;
  }

  shouldExclude(filePath) {
    const excludePatterns = [
      'node_modules',
      'dist',
      '.cache',
      '.git',
      'uploads',
      'temp',
      '.backups'
    ];
    
    return excludePatterns.some(pattern => filePath.includes(pattern));
  }

  getProjectVersion() {
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );
      return packageJson.version || '1.0.0';
    } catch (error) {
      return 'unknown';
    }
  }

  async cleanOldBackups() {
    console.log('🧹 Cleaning old backups...');
    
    try {
      const backups = fs.readdirSync(this.backupDir)
        .map(name => {
          const fullPath = path.join(this.backupDir, name);
          const stats = fs.statSync(fullPath);
          return {
            name,
            path: fullPath,
            created: stats.birthtime
          };
        })
        .sort((a, b) => b.created - a.created);

      // Keep last 10 backups
      const toDelete = backups.slice(10);
      
      for (const backup of toDelete) {
        try {
          fs.rmSync(backup.path, { recursive: true });
          console.log(`🗑️ Deleted old backup: ${backup.name}`);
        } catch (error) {
          console.error(`❌ Failed to delete ${backup.name}:`, error.message);
        }
      }

      console.log(`✅ Cleanup complete. Kept ${Math.min(backups.length, 10)} backups`);
    } catch (error) {
      console.error('❌ Backup cleanup failed:', error.message);
    }
  }

  async restoreFromBackup(backupPath) {
    console.log(`🔄 Restoring from backup: ${backupPath}`);
    
    try {
      const manifestPath = path.join(backupPath, 'backup-manifest.json');
      
      if (!fs.existsSync(manifestPath)) {
        throw new Error('Backup manifest not found');
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      console.log(`📋 Restoring ${manifest.files.length} files from ${manifest.type}`);
      
      for (const file of manifest.files) {
        try {
          const backupFilePath = path.join(backupPath, file);
          const targetPath = path.join(this.projectRoot, file);
          
          if (fs.existsSync(backupFilePath)) {
            // Ensure target directory exists
            const targetDir = path.dirname(targetPath);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir, { recursive: true });
            }
            
            fs.copyFileSync(backupFilePath, targetPath);
            console.log(`✅ Restored: ${file}`);
          } else {
            console.log(`⚠️ Backup file not found: ${file}`);
          }
        } catch (error) {
          console.error(`❌ Failed to restore ${file}:`, error.message);
        }
      }

      console.log('✅ Restore completed successfully');
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw error;
    }
  }

  async run(command = 'full') {
    this.ensureBackupDirectory();
    
    switch (command) {
      case 'full':
        await this.createFullBackup();
        break;
      case 'incremental':
        await this.createIncrementalBackup();
        break;
      case 'clean':
        await this.cleanOldBackups();
        break;
      default:
        console.log('❓ Unknown command. Use: full, incremental, or clean');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';
  
  const backup = new BackupSystem();
  backup.run(command).catch(error => {
    console.error('❌ Backup system failed:', error);
    process.exit(1);
  });
}

module.exports = BackupSystem;