#!/usr/bin/env node

/**
 * Emergency Restore System for Waides KI
 * Restores the application from the latest backup
 */

const fs = require('fs');
const path = require('path');

class EmergencyRestore {
  constructor() {
    this.projectRoot = process.cwd();
    this.backupDir = path.join(this.projectRoot, '.component-locks/protected-backups');
    this.designBackupDir = path.join(this.projectRoot, '.ui-design-locks/design-snapshots');
  }

  async restoreLatestBackup() {
    console.log('🚨 Emergency restore initiated...');
    
    // Find latest backup
    const backups = fs.readdirSync(this.backupDir).sort().reverse();
    if (backups.length === 0) {
      throw new Error('No backups found');
    }
    
    const latestBackup = backups[0];
    const backupPath = path.join(this.backupDir, latestBackup);
    
    console.log(`🔄 Restoring from backup: ${latestBackup}`);
    
    // Restore each file
    const files = fs.readdirSync(backupPath);
    for (const file of files) {
      const backupFilePath = path.join(backupPath, file);
      const targetPath = path.join(this.projectRoot, file);
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(backupFilePath, targetPath);
      console.log(`✅ Restored: ${file}`);
    }
    
    console.log('🔄 Emergency restore completed');
    return latestBackup;
  }

  async run() {
    try {
      await this.restoreLatestBackup();
      console.log('✅ Emergency restore successful');
    } catch (error) {
      console.error('❌ Emergency restore failed:', error.message);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const restore = new EmergencyRestore();
  restore.run();
}

module.exports = EmergencyRestore;