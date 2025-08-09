#!/usr/bin/env node

/**
 * Fix TypeScript Syntax Errors for Waides KI Forced Upgrade
 * Systematically fixes spacing and naming issues in the codebase
 */

const fs = require('fs');
const path = require('path');

class SyntaxFixer {
  constructor() {
    this.projectRoot = process.cwd();
    this.fixCount = 0;
  }

  fixFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Fix "kons powa" spacing issues
    content = content.replace(/kons\s+powa/g, 'konsPowa');
    content = content.replace(/Kons\s+Powa/g, 'KonsPowa');
    content = content.replace(/KONS\s+POWA/g, 'KONS_POWA');

    // Fix method names with spaces
    content = content.replace(/analyzeKons\s+PowaMarket/g, 'analyzeKonsPowaMarket');
    content = content.replace(/getKons\s+PowaPerformance/g, 'getKonsPowaPerformance');
    content = content.replace(/generateKons\s+PowaSignal/g, 'generateKonsPowaSignal');
    content = content.replace(/activateKons\s+PowaMode/g, 'activateKonsPowaMode');

    // Fix class names with spaces
    content = content.replace(/class\s+Kons\s+Powa/g, 'class KonsPowa');

    // Fix property access with spaces
    content = content.replace(/this\.kons\s+powa/g, 'this.konsPowa');

    // Fix object properties with spaces
    content = content.replace(/kons\s+powaAdvantage/g, 'konsPowaAdvantage');
    content = content.replace(/kons\s+powaShield/g, 'konsPowaShield');
    content = content.replace(/kons\s+powaStates/g, 'konsPowaStates');
    content = content.replace(/kons\s+powaAccuracy/g, 'konsPowaAccuracy');
    content = content.replace(/kons\s+powaProcessing/g, 'konsPowaProcessing');

    // Fix API endpoints
    content = content.replace(/\/kons\s+powa-/g, '/kons-powa-');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.fixCount++;
      console.log(`✅ Fixed: ${filePath}`);
    }
  }

  async run() {
    console.log('🔧 Fixing TypeScript syntax errors...');

    // Fix problematic files
    const filesToFix = [
      'server/services/quantumTradingEngine.ts',
      'server/routes_original.ts',
      'server/services/neuralQuantumSingularityStrategy.ts',
      'client/src/components/WaidBot.tsx',
      'client/src/components/WaidesKIVisionPortal_BROKEN.tsx',
      'client/src/pages/dashboard-broken.tsx'
    ];

    for (const file of filesToFix) {
      this.fixFile(file);
    }

    console.log(`🎉 Fixed ${this.fixCount} files with syntax errors`);
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new SyntaxFixer();
  fixer.run();
}

module.exports = SyntaxFixer;