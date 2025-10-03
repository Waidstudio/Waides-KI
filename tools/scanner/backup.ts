import * as fs from 'fs';
import * as path from 'path';

export interface BackupMetadata {
  timestamp: string;
  originalPath: string;
  backupPath: string;
  size: number;
  checksum: string;
}

export class BackupManager {
  private backupDir: string;
  private backupLog: BackupMetadata[] = [];

  constructor(baseBackupDir: string = 'backups') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    this.backupDir = path.join(baseBackupDir, timestamp);
  }

  async initialize(): Promise<void> {
    await fs.promises.mkdir(this.backupDir, { recursive: true });
    console.log(`🛡️ Backup directory created: ${this.backupDir}`);
  }

  async backupFile(filePath: string): Promise<BackupMetadata> {
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      await this.initialize();
    }

    // Read original file
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const stats = await fs.promises.stat(filePath);
    
    // Create relative backup path
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(this.backupDir, relativePath);
    
    // Ensure backup subdirectories exist
    const backupSubdir = path.dirname(backupPath);
    await fs.promises.mkdir(backupSubdir, { recursive: true });
    
    // Write backup
    await fs.promises.writeFile(backupPath, content, 'utf-8');
    
    // Calculate checksum
    const checksum = this.calculateChecksum(content);
    
    const metadata: BackupMetadata = {
      timestamp: new Date().toISOString(),
      originalPath: filePath,
      backupPath,
      size: stats.size,
      checksum
    };
    
    this.backupLog.push(metadata);
    
    console.log(`✅ Backed up: ${relativePath} -> ${backupPath}`);
    
    return metadata;
  }

  async backupMultipleFiles(filePaths: string[]): Promise<BackupMetadata[]> {
    const backups: BackupMetadata[] = [];
    
    for (const filePath of filePaths) {
      try {
        const backup = await this.backupFile(filePath);
        backups.push(backup);
      } catch (error) {
        console.error(`❌ Failed to backup ${filePath}:`, error);
      }
    }
    
    return backups;
  }

  async saveBackupLog(): Promise<void> {
    const logPath = path.join(this.backupDir, 'backup-log.json');
    await fs.promises.writeFile(
      logPath,
      JSON.stringify(this.backupLog, null, 2),
      'utf-8'
    );
    console.log(`📝 Backup log saved: ${logPath}`);
  }

  async restoreFile(backupMetadata: BackupMetadata): Promise<void> {
    const { backupPath, originalPath } = backupMetadata;
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }
    
    const content = await fs.promises.readFile(backupPath, 'utf-8');
    
    // Verify checksum
    const checksum = this.calculateChecksum(content);
    if (checksum !== backupMetadata.checksum) {
      throw new Error('Backup file checksum mismatch - file may be corrupted');
    }
    
    // Restore to original location
    const originalDir = path.dirname(originalPath);
    await fs.promises.mkdir(originalDir, { recursive: true });
    await fs.promises.writeFile(originalPath, content, 'utf-8');
    
    console.log(`♻️ Restored: ${backupPath} -> ${originalPath}`);
  }

  private calculateChecksum(content: string): string {
    // Simple checksum - could be replaced with crypto hash if needed
    let checksum = 0;
    for (let i = 0; i < content.length; i++) {
      checksum = ((checksum << 5) - checksum) + content.charCodeAt(i);
      checksum |= 0; // Convert to 32-bit integer
    }
    return checksum.toString(16);
  }

  getBackupLog(): BackupMetadata[] {
    return [...this.backupLog];
  }

  getBackupDirectory(): string {
    return this.backupDir;
  }
}

export async function createSafeBackup(filePaths: string[]): Promise<BackupManager> {
  const backupManager = new BackupManager();
  await backupManager.initialize();
  await backupManager.backupMultipleFiles(filePaths);
  await backupManager.saveBackupLog();
  return backupManager;
}
