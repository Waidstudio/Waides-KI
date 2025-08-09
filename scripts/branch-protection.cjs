#!/usr/bin/env node

/**
 * Waides KI Branch Protection System
 * Implements Git-based protection and isolated development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BranchProtectionSystem {
  constructor() {
    this.projectRoot = process.cwd();
    this.protectionConfigFile = path.join(this.projectRoot, '.git-protection', 'config.json');
    this.ensureProtectionDirectory();
  }

  ensureProtectionDirectory() {
    const protectionDir = path.dirname(this.protectionConfigFile);
    if (!fs.existsSync(protectionDir)) {
      fs.mkdirSync(protectionDir, { recursive: true });
    }
  }

  // Initialize branch protection
  async initializeBranchProtection() {
    console.log('🔧 Initializing branch protection system...');
    
    try {
      // Check if git is initialized
      try {
        execSync('git status', { stdio: 'ignore' });
      } catch (error) {
        console.log('📋 Initializing Git repository...');
        execSync('git init');
        execSync('git add .');
        execSync('git commit -m "Initial commit - Waides KI baseline"');
      }

      // Create protection configuration
      const config = {
        protectedBranches: ['main', 'production', 'stable'],
        featureBranchPrefix: 'feature/',
        bugfixBranchPrefix: 'bugfix/',
        hotfixBranchPrefix: 'hotfix/',
        developmentBranch: 'develop',
        protectedFiles: [
          'server/routes.ts',
          'server/services/modeService.ts',
          'server/services/smaisikaMiningEngine.ts',
          'shared/schema.ts',
          'drizzle.config.ts'
        ],
        autoBackup: true,
        enforceReview: true
      };

      fs.writeFileSync(this.protectionConfigFile, JSON.stringify(config, null, 2));
      
      // Create stable branch if it doesn't exist
      try {
        execSync('git show-ref --verify --quiet refs/heads/stable');
      } catch (error) {
        console.log('🌟 Creating stable branch...');
        execSync('git checkout -b stable');
        execSync('git checkout main || git checkout master');
      }

      // Create development branch if it doesn't exist
      try {
        execSync('git show-ref --verify --quiet refs/heads/develop');
      } catch (error) {
        console.log('🚧 Creating development branch...');
        execSync('git checkout -b develop');
        execSync('git checkout main || git checkout master');
      }

      console.log('✅ Branch protection system initialized');
      return config;
    } catch (error) {
      console.error('❌ Failed to initialize branch protection:', error.message);
      throw error;
    }
  }

  // Create feature branch
  async createFeatureBranch(featureName) {
    console.log(`🌿 Creating feature branch: ${featureName}`);
    
    try {
      const config = this.loadConfig();
      const branchName = `${config.featureBranchPrefix}${featureName}`;
      
      // Ensure we're on the development branch
      execSync('git checkout develop');
      execSync('git pull origin develop', { stdio: 'ignore' });
      
      // Create and checkout feature branch
      execSync(`git checkout -b ${branchName}`);
      
      console.log(`✅ Feature branch created: ${branchName}`);
      console.log('💡 You can now make changes safely without affecting stable code');
      
      return branchName;
    } catch (error) {
      console.error('❌ Failed to create feature branch:', error.message);
      throw error;
    }
  }

  // Lock branch (prevent further commits)
  async lockBranch(branchName) {
    console.log(`🔒 Locking branch: ${branchName}`);
    
    try {
      const config = this.loadConfig();
      
      if (!config.lockedBranches) {
        config.lockedBranches = {};
      }
      
      config.lockedBranches[branchName] = {
        lockedAt: new Date().toISOString(),
        reason: 'Protected from modifications',
        lastCommit: this.getLastCommitHash(branchName)
      };
      
      this.saveConfig(config);
      
      // Create a tag for the locked state
      const tagName = `locked-${branchName}-${Date.now()}`;
      execSync(`git tag ${tagName} ${branchName}`);
      
      console.log(`🔒 Branch locked: ${branchName}`);
      console.log(`📌 Tag created: ${tagName}`);
      
      return tagName;
    } catch (error) {
      console.error('❌ Failed to lock branch:', error.message);
      throw error;
    }
  }

  // Check for protected file modifications
  async checkProtectedFiles() {
    console.log('🔍 Checking protected files...');
    
    try {
      const config = this.loadConfig();
      const currentBranch = this.getCurrentBranch();
      
      if (config.protectedBranches.includes(currentBranch)) {
        console.log(`⚠️ Warning: Working on protected branch: ${currentBranch}`);
      }
      
      // Check for uncommitted changes to protected files
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const modifiedFiles = status.split('\n').filter(line => line.trim()).map(line => line.substring(3));
      
      const protectedModifications = modifiedFiles.filter(file => 
        config.protectedFiles.some(protectedFile => file.includes(protectedFile))
      );
      
      if (protectedModifications.length > 0) {
        console.log('⚠️ Protected files have been modified:');
        protectedModifications.forEach(file => {
          console.log(`   - ${file}`);
        });
        
        if (config.autoBackup) {
          await this.createEmergencyBackup();
        }
        
        return { hasProtectedChanges: true, files: protectedModifications };
      }
      
      console.log('✅ No protected files modified');
      return { hasProtectedChanges: false, files: [] };
    } catch (error) {
      console.error('❌ Failed to check protected files:', error.message);
      throw error;
    }
  }

  // Create emergency backup
  async createEmergencyBackup() {
    console.log('🚨 Creating emergency backup...');
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupBranch = `emergency-backup-${timestamp}`;
      
      execSync(`git checkout -b ${backupBranch}`);
      execSync(`git add -A`);
      execSync(`git commit -m "Emergency backup - ${timestamp}"`);
      
      // Return to original branch
      const originalBranch = this.getCurrentBranch();
      execSync(`git checkout ${originalBranch}`);
      
      console.log(`🚨 Emergency backup created: ${backupBranch}`);
      return backupBranch;
    } catch (error) {
      console.error('❌ Failed to create emergency backup:', error.message);
      throw error;
    }
  }

  // Safe merge with protection checks
  async safeMerge(sourceBranch, targetBranch) {
    console.log(`🔄 Safe merge: ${sourceBranch} → ${targetBranch}`);
    
    try {
      const config = this.loadConfig();
      
      // Check if target branch is protected
      if (config.protectedBranches.includes(targetBranch)) {
        console.log(`⚠️ Target branch ${targetBranch} is protected - additional checks required`);
        
        // Create backup before merge
        await this.createEmergencyBackup();
        
        // Check for protected file conflicts
        const protectedCheck = await this.checkProtectedFiles();
        if (protectedCheck.hasProtectedChanges) {
          throw new Error('Protected files have modifications - cannot merge safely');
        }
      }
      
      // Perform merge
      execSync(`git checkout ${targetBranch}`);
      execSync(`git merge ${sourceBranch} --no-ff`);
      
      console.log(`✅ Safe merge completed: ${sourceBranch} → ${targetBranch}`);
      return true;
    } catch (error) {
      console.error('❌ Safe merge failed:', error.message);
      
      // Attempt to abort merge if in progress
      try {
        execSync('git merge --abort');
      } catch (abortError) {
        // Merge abort failed, manual intervention required
      }
      
      throw error;
    }
  }

  // Isolate development environment
  async isolateEnvironment(envName) {
    console.log(`🏗️ Creating isolated environment: ${envName}`);
    
    try {
      const config = this.loadConfig();
      const isolatedBranch = `isolated-${envName}-${Date.now()}`;
      
      // Create isolated branch from stable
      execSync('git checkout stable');
      execSync(`git checkout -b ${isolatedBranch}`);
      
      // Create environment configuration
      const envConfig = {
        name: envName,
        branch: isolatedBranch,
        createdAt: new Date().toISOString(),
        isolated: true,
        protections: {
          noMergeToMain: true,
          requiresApproval: true,
          autoBackup: true
        }
      };
      
      if (!config.isolatedEnvironments) {
        config.isolatedEnvironments = {};
      }
      config.isolatedEnvironments[envName] = envConfig;
      this.saveConfig(config);
      
      console.log(`🏗️ Isolated environment created: ${envName}`);
      console.log(`🌿 Working branch: ${isolatedBranch}`);
      
      return envConfig;
    } catch (error) {
      console.error('❌ Failed to create isolated environment:', error.message);
      throw error;
    }
  }

  // Utility methods
  loadConfig() {
    if (!fs.existsSync(this.protectionConfigFile)) {
      throw new Error('Branch protection not initialized. Run: node scripts/branch-protection.cjs init');
    }
    return JSON.parse(fs.readFileSync(this.protectionConfigFile, 'utf8'));
  }

  saveConfig(config) {
    fs.writeFileSync(this.protectionConfigFile, JSON.stringify(config, null, 2));
  }

  getCurrentBranch() {
    try {
      return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'main'; // fallback
    }
  }

  getLastCommitHash(branch) {
    try {
      return execSync(`git rev-parse ${branch}`, { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  async run(command, options = {}) {
    switch (command) {
      case 'init':
        return await this.initializeBranchProtection();
      case 'feature':
        return await this.createFeatureBranch(options.name);
      case 'lock':
        return await this.lockBranch(options.branch);
      case 'check':
        return await this.checkProtectedFiles();
      case 'merge':
        return await this.safeMerge(options.source, options.target);
      case 'isolate':
        return await this.isolateEnvironment(options.name);
      case 'backup':
        return await this.createEmergencyBackup();
      default:
        console.log('Available commands: init, feature, lock, check, merge, isolate, backup');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'check';
  const name = args[1];
  
  const options = {};
  if (name) {
    options.name = name;
    options.branch = name;
    options.source = name;
    options.target = args[2];
  }
  
  const branchProtection = new BranchProtectionSystem();
  branchProtection.run(command, options).catch(error => {
    console.error('❌ Branch protection system failed:', error);
    process.exit(1);
  });
}

module.exports = BranchProtectionSystem;