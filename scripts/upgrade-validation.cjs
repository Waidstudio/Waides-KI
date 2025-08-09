#!/usr/bin/env node

/**
 * Comprehensive Upgrade Validation for Waides KI
 * Tests all systems after forced upgrade
 */

const fs = require('fs');
const path = require('path');

class UpgradeValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.validationResults = {};
  }

  async validatePackageVersions() {
    console.log('📦 Validating package versions...');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const upgradedDeps = {
      'react': '19',
      'typescript': '5.7',
      'framer-motion': '12',
      'drizzle-orm': '0.40',
      '@tanstack/react-query': '5.62'
    };

    let allVersionsValid = true;
    for (const [pkg, expectedMajor] of Object.entries(upgradedDeps)) {
      const currentVersion = packageJson.dependencies[pkg] || packageJson.devDependencies[pkg];
      if (!currentVersion || !currentVersion.includes(expectedMajor)) {
        console.log(`❌ ${pkg}: Expected ${expectedMajor}.x, found ${currentVersion}`);
        allVersionsValid = false;
      } else {
        console.log(`✅ ${pkg}: ${currentVersion}`);
      }
    }
    
    this.validationResults.packageVersions = allVersionsValid;
    return allVersionsValid;
  }

  async validateKonsMeshIntegration() {
    console.log('🌐 Validating KonsMesh integration...');
    
    const meshFiles = [
      'server/services/konsaiMeshWebSocketBroadcaster.ts',
      'server/services/konsaiMeshDataDistributor.ts',
      'server/services/konsaiMeshCommunication.ts'
    ];

    let meshValid = true;
    for (const file of meshFiles) {
      if (!fs.existsSync(file)) {
        console.log(`❌ Missing: ${file}`);
        meshValid = false;
      } else {
        console.log(`✅ Found: ${file}`);
      }
    }

    this.validationResults.konsMeshIntegration = meshValid;
    return meshValid;
  }

  async validateComponentIntegrity() {
    console.log('🛡️ Validating component integrity...');
    
    try {
      const { execSync } = require('child_process');
      execSync('node scripts/component-lock-system.cjs verify', { stdio: 'inherit' });
      this.validationResults.componentIntegrity = true;
      return true;
    } catch (error) {
      console.log('❌ Component integrity check failed');
      this.validationResults.componentIntegrity = false;
      return false;
    }
  }

  async validateDesignSystem() {
    console.log('🎨 Validating design system...');
    
    try {
      const { execSync } = require('child_process');
      execSync('node scripts/ui-design-lock-system.cjs verify', { stdio: 'inherit' });
      this.validationResults.designSystem = true;
      return true;
    } catch (error) {
      console.log('❌ Design system check failed');
      this.validationResults.designSystem = false;
      return false;
    }
  }

  async validateApplicationStart() {
    console.log('🚀 Validating application start...');
    
    // Check if server is running by looking for the port
    try {
      const { execSync } = require('child_process');
      const result = execSync('curl -s http://localhost:5000/api/wallet/balance', { encoding: 'utf8' });
      if (result.includes('success')) {
        console.log('✅ Application responding on port 5000');
        this.validationResults.applicationStart = true;
        return true;
      }
    } catch (error) {
      console.log('❌ Application not responding properly');
      this.validationResults.applicationStart = false;
      return false;
    }
  }

  generateReport() {
    console.log('\n📋 UPGRADE VALIDATION REPORT');
    console.log('================================');
    
    const results = this.validationResults;
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(r => r).length;
    
    console.log(`📦 Package Versions: ${results.packageVersions ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🌐 KonsMesh Integration: ${results.konsMeshIntegration ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🛡️ Component Integrity: ${results.componentIntegrity ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🎨 Design System: ${results.designSystem ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`🚀 Application Start: ${results.applicationStart ? '✅ PASS' : '❌ FAIL'}`);
    
    console.log(`\n📊 Overall Score: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 UPGRADE SUCCESSFUL - All systems operational');
      return true;
    } else {
      console.log('⚠️ UPGRADE ISSUES DETECTED - Manual intervention required');
      return false;
    }
  }

  async run() {
    console.log('🔍 Starting comprehensive upgrade validation...\n');
    
    await this.validatePackageVersions();
    await this.validateKonsMeshIntegration();
    await this.validateComponentIntegrity();
    await this.validateDesignSystem();
    await this.validateApplicationStart();
    
    return this.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  const validator = new UpgradeValidator();
  validator.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = UpgradeValidator;