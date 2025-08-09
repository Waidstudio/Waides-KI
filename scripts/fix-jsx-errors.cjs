#!/usr/bin/env node

/**
 * Fix JSX Syntax Errors for React 19 Upgrade
 * Fixes broken JSX structures in React components
 */

const fs = require('fs');
const path = require('path');

class JSXFixer {
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

    // Fix broken JSX structure by ensuring proper closing tags
    content = content.replace(/(\s*)<\/p>\s*<p className/g, '$1</p>\n$1<p className');
    
    // Fix missing closing tags and proper nesting
    content = content.replace(/(<Card[^>]*>)\s*(<CardContent[^>]*>)/g, '$1\n          $2');
    content = content.replace(/(<\/CardContent>)\s*(<\/Card>)/g, '$1\n        $2');
    
    // Fix template literal syntax in className
    content = content.replace(/className=\{`([^`]*)\$\{([^}]*)\}([^`]*)`\}/g, 'className={`$1$${$2}$3`}');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      this.fixCount++;
      console.log(`✅ Fixed JSX: ${filePath}`);
    }
  }

  async run() {
    console.log('🔧 Fixing JSX syntax errors for React 19...');

    // Fix files with JSX issues
    const filesToFix = [
      'client/src/components/WaidBot.tsx',
      'client/src/components/WaidesKIVisionPortal_BROKEN.tsx',
      'client/src/pages/dashboard-broken.tsx'
    ];

    for (const file of filesToFix) {
      this.fixFile(file);
    }

    console.log(`🎉 Fixed ${this.fixCount} JSX files`);
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new JSXFixer();
  fixer.run();
}

module.exports = JSXFixer;