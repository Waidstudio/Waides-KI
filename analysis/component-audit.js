// Component Analysis Script for Waides KI System
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComponentAuditor {
  constructor() {
    this.results = {
      totalComponents: 0,
      mainComponents: 0,
      uiComponents: 0,
      legacyJSComponents: 0,
      exportedCorrectly: [],
      exportErrors: [],
      usedInPages: [],
      unusedComponents: [],
      dataConnected: [],
      noDataConnection: [],
      brokenComponents: [],
      outdatedComponents: [],
      summary: {}
    };
  }

  analyzeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath);
      const componentName = fileName.replace(/\.(tsx|jsx|ts|js)$/, '');
      
      const analysis = {
        name: componentName,
        path: filePath,
        isLegacy: fileName.endsWith('.js'),
        hasExport: this.checkExports(content),
        hasDataConnection: this.checkDataConnections(content),
        usesHooks: this.checkReactHooks(content),
        hasTyping: this.checkTypeScript(content, fileName),
        isUsedInPages: false, // Will be set later
        isUsedInComponents: false, // Will be set later
        issues: []
      };

      // Check for common issues
      this.checkForIssues(content, analysis);
      
      return analysis;
    } catch (error) {
      return {
        name: path.basename(filePath),
        path: filePath,
        error: error.message,
        issues: ['FILE_READ_ERROR']
      };
    }
  }

  checkExports(content) {
    const exportPatterns = [
      /export default/,
      /export \{[^}]+\}/,
      /export const/,
      /export function/
    ];
    
    return exportPatterns.some(pattern => pattern.test(content));
  }

  checkDataConnections(content) {
    const dataPatterns = [
      /useQuery/,
      /useMutation/,
      /apiRequest/,
      /fetch\(/,
      /axios\./,
      /useState.*api/i,
      /useEffect.*api/i
    ];
    
    return dataPatterns.some(pattern => pattern.test(content));
  }

  checkReactHooks(content) {
    const hookPatterns = [
      /useState/,
      /useEffect/,
      /useCallback/,
      /useMemo/,
      /useContext/,
      /useRef/
    ];
    
    return hookPatterns.some(pattern => pattern.test(content));
  }

  checkTypeScript(content, fileName) {
    if (!fileName.endsWith('.tsx') && !fileName.endsWith('.ts')) {
      return false;
    }
    
    const tsPatterns = [
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /:\s*\w+(\[\])?/,
      /<\w+>/
    ];
    
    return tsPatterns.some(pattern => pattern.test(content));
  }

  checkForIssues(content, analysis) {
    // Check for missing error handling
    if (analysis.hasDataConnection && !content.includes('catch') && !content.includes('onError')) {
      analysis.issues.push('MISSING_ERROR_HANDLING');
    }

    // Check for missing types in TypeScript
    if (analysis.name.endsWith('.tsx') && !analysis.hasTyping) {
      analysis.issues.push('MISSING_TYPESCRIPT_TYPES');
    }

    // Check for unused state
    const stateMatches = content.match(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g);
    if (stateMatches) {
      stateMatches.forEach(match => {
        const stateName = match.match(/const\s+\[(\w+),/)[1];
        if (!content.includes(stateName + '.') && !content.includes(stateName + '[') && !content.includes('{' + stateName + '}')) {
          analysis.issues.push(`UNUSED_STATE:${stateName}`);
        }
      });
    }

    // Check for missing loading states
    if (analysis.hasDataConnection && !content.includes('loading') && !content.includes('isLoading')) {
      analysis.issues.push('MISSING_LOADING_STATE');
    }
  }

  async findComponentUsage() {
    const pagesDir = path.resolve(path.dirname(__dirname), 'client/src/pages');
    const appFile = path.resolve(path.dirname(__dirname), 'client/src/App.tsx');
    
    try {
      // Check App.tsx
      const appContent = fs.readFileSync(appFile, 'utf8');
      this.findImportsInFile(appContent, 'App.tsx');

      // Check all pages
      const pageFiles = fs.readdirSync(pagesDir).filter(file => 
        file.endsWith('.tsx') || file.endsWith('.jsx')
      );

      for (const pageFile of pageFiles) {
        const pageContent = fs.readFileSync(path.join(pagesDir, pageFile), 'utf8');
        this.findImportsInFile(pageContent, pageFile);
      }
    } catch (error) {
      console.log('Error checking usage:', error.message);
    }
  }

  findImportsInFile(content, fileName) {
    const importRegex = /import.*from\s+['"](.*components[^'"]*)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      const componentName = importPath.split('/').pop();
      
      if (!this.results.usedInPages.includes(componentName)) {
        this.results.usedInPages.push(componentName);
      }
    }
  }

  async auditAll() {
    console.log('🔍 Starting Component Audit...\n');
    
    const componentsDir = path.resolve(path.dirname(__dirname), 'client/src/components');
    
    try {
      const files = fs.readdirSync(componentsDir, { withFileTypes: true });
      
      for (const file of files) {
        if (file.isFile() && (file.name.endsWith('.tsx') || file.name.endsWith('.jsx') || file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
          // Skip ui components for main analysis
          if (file.name.startsWith('ui/')) continue;
          
          const filePath = path.join(componentsDir, file.name);
          const analysis = this.analyzeComponent(filePath);
          
          this.results.totalComponents++;
          
          if (file.name.endsWith('.js')) {
            this.results.legacyJSComponents++;
            this.results.outdatedComponents.push(analysis);
          } else {
            this.results.mainComponents++;
          }

          // Categorize components
          if (analysis.hasExport) {
            this.results.exportedCorrectly.push(analysis);
          } else {
            this.results.exportErrors.push(analysis);
          }

          if (analysis.hasDataConnection) {
            this.results.dataConnected.push(analysis);
          } else {
            this.results.noDataConnection.push(analysis);
          }

          if (analysis.issues && analysis.issues.length > 0) {
            this.results.brokenComponents.push(analysis);
          }
        }
      }

      // Check component usage
      await this.findComponentUsage();

      // Identify unused components
      this.results.exportedCorrectly.forEach(comp => {
        if (!this.results.usedInPages.includes(comp.name)) {
          this.results.unusedComponents.push(comp);
        }
      });

      // UI Components count
      const uiDir = path.resolve(componentsDir, 'ui');
      if (fs.existsSync(uiDir)) {
        const uiFiles = fs.readdirSync(uiDir).filter(file => 
          file.endsWith('.tsx') || file.endsWith('.jsx')
        );
        this.results.uiComponents = uiFiles.length;
      }

      this.generateSummary();
      this.displayResults();
      
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
    }
  }

  generateSummary() {
    this.results.summary = {
      totalFiles: this.results.totalComponents + this.results.uiComponents,
      healthScore: Math.round(((this.results.exportedCorrectly.length - this.results.brokenComponents.length) / this.results.totalComponents) * 100),
      dataConnectionRate: Math.round((this.results.dataConnected.length / this.results.totalComponents) * 100),
      legacyFileCount: this.results.legacyJSComponents,
      unusedCount: this.results.unusedComponents.length,
      issueCount: this.results.brokenComponents.length
    };
  }

  displayResults() {
    console.log('📊 COMPONENT AUDIT RESULTS');
    console.log('=' .repeat(50));
    
    console.log(`\n📁 COMPONENT INVENTORY:`);
    console.log(`   Total Components: ${this.results.totalComponents}`);
    console.log(`   Main Components: ${this.results.mainComponents}`);
    console.log(`   UI Components: ${this.results.uiComponents}`);
    console.log(`   Legacy JS Files: ${this.results.legacyJSComponents}`);
    
    console.log(`\n✅ EXPORTS STATUS:`);
    console.log(`   Properly Exported: ${this.results.exportedCorrectly.length}`);
    console.log(`   Export Errors: ${this.results.exportErrors.length}`);
    
    console.log(`\n🔗 DATA CONNECTION STATUS:`);
    console.log(`   Connected to APIs: ${this.results.dataConnected.length}`);
    console.log(`   No Data Connection: ${this.results.noDataConnection.length}`);
    console.log(`   Connection Rate: ${this.results.summary.dataConnectionRate}%`);
    
    console.log(`\n📱 USAGE STATUS:`);
    console.log(`   Used in Pages/App: ${this.results.usedInPages.length}`);
    console.log(`   Unused Components: ${this.results.unusedComponents.length}`);
    
    console.log(`\n⚠️ COMPONENT ISSUES:`);
    console.log(`   Components with Issues: ${this.results.brokenComponents.length}`);
    console.log(`   Legacy JS Components: ${this.results.outdatedComponents.length}`);
    
    console.log(`\n🎯 HEALTH SUMMARY:`);
    console.log(`   Overall Health Score: ${this.results.summary.healthScore}%`);
    console.log(`   Data Integration: ${this.results.summary.dataConnectionRate}%`);
    
    if (this.results.unusedComponents.length > 0) {
      console.log(`\n🚫 UNUSED COMPONENTS:`);
      this.results.unusedComponents.forEach(comp => {
        console.log(`   - ${comp.name} (${comp.path})`);
      });
    }
    
    if (this.results.brokenComponents.length > 0) {
      console.log(`\n💥 COMPONENTS WITH ISSUES:`);
      this.results.brokenComponents.forEach(comp => {
        console.log(`   - ${comp.name}: ${comp.issues.join(', ')}`);
      });
    }
    
    if (this.results.outdatedComponents.length > 0) {
      console.log(`\n📜 LEGACY COMPONENTS (Need Migration):`);
      this.results.outdatedComponents.forEach(comp => {
        console.log(`   - ${comp.name} (${comp.path})`);
      });
    }

    if (this.results.noDataConnection.length > 0) {
      console.log(`\n🔌 COMPONENTS WITHOUT DATA CONNECTION:`);
      this.results.noDataConnection.slice(0, 10).forEach(comp => {
        console.log(`   - ${comp.name}`);
      });
      if (this.results.noDataConnection.length > 10) {
        console.log(`   ... and ${this.results.noDataConnection.length - 10} more`);
      }
    }
  }
}

// Run the audit
const auditor = new ComponentAuditor();
auditor.auditAll().catch(console.error);