#!/usr/bin/env node

/**
 * Waides KI UI Design Lock System
 * Protects design elements, styles, colors, and layout configurations
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class UIDesignLockSystem {
  constructor() {
    this.projectRoot = process.cwd();
    this.lockDir = path.join(this.projectRoot, '.ui-design-locks');
    this.lockFile = path.join(this.lockDir, 'locked-design-elements.json');
    this.designChecksumFile = path.join(this.lockDir, 'design-checksums.json');
    this.themeConfigFile = path.join(this.lockDir, 'locked-theme-config.json');
    this.ensureLockDirectory();
  }

  ensureLockDirectory() {
    if (!fs.existsSync(this.lockDir)) {
      fs.mkdirSync(this.lockDir, { recursive: true });
    }
  }

  // Lock design-related files and configurations
  async lockDesignElements() {
    console.log('🎨 Locking UI design elements...');
    
    const designFiles = [
      // CSS and styling files
      'client/src/index.css',
      'tailwind.config.ts',
      'postcss.config.js',
      
      // Component UI files
      'client/src/components/ui/button.tsx',
      'client/src/components/ui/card.tsx',
      'client/src/components/ui/input.tsx',
      'client/src/components/ui/dialog.tsx',
      'client/src/components/ui/toast.tsx',
      'client/src/components/ui/StableNavigation.tsx',
      
      // Theme and configuration
      'components.json',
      'client/src/lib/utils.ts',
      
      // Main layout components
      'client/src/App.tsx',
      'client/src/pages/HomePage.tsx',
      'client/src/pages/ProfessionalWalletPage.tsx'
    ];

    const lockedDesignElements = {};
    const designChecksums = {};

    for (const file of designFiles) {
      const filePath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const checksum = this.calculateChecksum(content);
        const stats = fs.statSync(filePath);
        
        // Extract design-specific properties
        const designProps = this.extractDesignProperties(content, file);
        
        lockedDesignElements[file] = {
          locked: true,
          lockDate: new Date().toISOString(),
          originalChecksum: checksum,
          size: stats.size,
          lastModified: stats.mtime.toISOString(),
          lockLevel: this.determineDesignLockLevel(file),
          designProperties: designProps,
          protectedElements: this.identifyProtectedElements(content, file)
        };
        
        designChecksums[file] = checksum;
        console.log(`🎨 Locked: ${file} (${lockedDesignElements[file].lockLevel})`);
      } else {
        console.log(`⚠️ Design file not found: ${file}`);
      }
    }

    // Save design lock configuration
    fs.writeFileSync(this.lockFile, JSON.stringify(lockedDesignElements, null, 2));
    fs.writeFileSync(this.designChecksumFile, JSON.stringify(designChecksums, null, 2));
    
    // Create theme configuration lock
    await this.lockThemeConfiguration();
    
    console.log(`✅ Locked ${Object.keys(lockedDesignElements).length} design elements`);
    return lockedDesignElements;
  }

  // Lock theme configuration
  async lockThemeConfiguration() {
    console.log('🌈 Locking theme configuration...');
    
    const themeConfig = {
      colorPalette: {
        primary: {
          blue: 'hsl(221.2, 83.2%, 53.3%)',
          emerald: 'hsl(142.1, 76.2%, 36.3%)',
          slate: 'hsl(210, 40%, 98%)'
        },
        background: {
          light: 'hsl(0, 0%, 100%)',
          dark: 'hsl(222.2, 84%, 4.9%)',
          muted: 'hsl(210, 40%, 96%)'
        },
        text: {
          primary: 'hsl(222.2, 84%, 4.9%)',
          secondary: 'hsl(215.4, 16.3%, 46.9%)',
          muted: 'hsl(215.4, 16.3%, 46.9%)'
        },
        accent: {
          blue: 'hsl(210, 40%, 95%)',
          emerald: 'hsl(149, 80%, 90%)',
          destructive: 'hsl(0, 84.2%, 60.2%)'
        }
      },
      typography: {
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui'],
          mono: ['ui-monospace', 'SFMono-Regular']
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem'
        }
      },
      spacing: {
        container: {
          padding: '2rem',
          maxWidth: '1200px'
        },
        card: {
          padding: '1.5rem',
          gap: '1rem'
        },
        button: {
          height: '2.5rem',
          padding: '0.5rem 1rem'
        }
      },
      borderRadius: {
        sm: '0.125rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    };

    const themeChecksum = this.calculateChecksum(JSON.stringify(themeConfig));
    
    const lockedTheme = {
      config: themeConfig,
      locked: true,
      lockDate: new Date().toISOString(),
      checksum: themeChecksum,
      protectionLevel: 'critical'
    };

    fs.writeFileSync(this.themeConfigFile, JSON.stringify(lockedTheme, null, 2));
    console.log('🌈 Theme configuration locked');
    
    return lockedTheme;
  }

  // Extract design properties from file content
  extractDesignProperties(content, fileName) {
    const properties = {
      colors: [],
      classes: [],
      styles: [],
      variables: []
    };

    // Extract CSS variables
    const cssVarRegex = /--[\w-]+:\s*[^;]+/g;
    const cssVars = content.match(cssVarRegex) || [];
    properties.variables = cssVars;

    // Extract color values
    const colorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|hsl\([^)]+\)|rgb\([^)]+\)/g;
    const colors = content.match(colorRegex) || [];
    properties.colors = [...new Set(colors)];

    // Extract Tailwind classes
    const tailwindRegex = /className="([^"]+)"/g;
    let match;
    while ((match = tailwindRegex.exec(content)) !== null) {
      properties.classes.push(match[1]);
    }

    // Extract styled-components or CSS-in-JS
    const styledRegex = /styled\.\w+`([^`]+)`/g;
    while ((match = styledRegex.exec(content)) !== null) {
      properties.styles.push(match[1]);
    }

    return properties;
  }

  // Identify protected design elements
  identifyProtectedElements(content, fileName) {
    const protectedElements = [];

    // Navigation elements
    if (fileName.includes('Navigation')) {
      protectedElements.push('navigation-layout', 'menu-structure', 'header-styling');
    }

    // Card components
    if (fileName.includes('card') || content.includes('Card')) {
      protectedElements.push('card-background', 'card-borders', 'card-shadows');
    }

    // Button components
    if (fileName.includes('button') || content.includes('Button')) {
      protectedElements.push('button-colors', 'button-sizes', 'button-hover-states');
    }

    // Theme files
    if (fileName.includes('tailwind.config') || fileName.includes('index.css')) {
      protectedElements.push('global-colors', 'typography', 'spacing', 'breakpoints');
    }

    return protectedElements;
  }

  // Verify design integrity
  async verifyDesignIntegrity() {
    console.log('🔍 Verifying design integrity...');
    
    if (!fs.existsSync(this.lockFile)) {
      console.log('ℹ️ No locked design elements to verify');
      return { violations: [], verified: 0 };
    }

    const lockedElements = JSON.parse(fs.readFileSync(this.lockFile, 'utf8'));
    const designChecksums = JSON.parse(fs.readFileSync(this.designChecksumFile, 'utf8'));
    const violations = [];
    let verified = 0;

    for (const [file, lockInfo] of Object.entries(lockedElements)) {
      const filePath = path.join(this.projectRoot, file);
      
      if (!fs.existsSync(filePath)) {
        violations.push({
          file,
          type: 'DESIGN_FILE_DELETED',
          severity: 'CRITICAL',
          message: 'Locked design file has been deleted',
          protectedElements: lockInfo.protectedElements
        });
        continue;
      }

      const currentContent = fs.readFileSync(filePath, 'utf8');
      const currentChecksum = this.calculateChecksum(currentContent);
      
      if (currentChecksum !== designChecksums[file]) {
        const currentDesignProps = this.extractDesignProperties(currentContent, file);
        const changes = this.detectDesignChanges(lockInfo.designProperties, currentDesignProps);
        
        violations.push({
          file,
          type: 'DESIGN_MODIFICATION',
          severity: lockInfo.lockLevel.toUpperCase(),
          message: 'Design elements have been modified',
          originalChecksum: designChecksums[file],
          currentChecksum,
          designChanges: changes,
          protectedElements: lockInfo.protectedElements,
          modifiedDate: new Date().toISOString()
        });
      } else {
        verified++;
      }
    }

    // Verify theme configuration
    if (fs.existsSync(this.themeConfigFile)) {
      const themeViolation = await this.verifyThemeConfiguration();
      if (themeViolation) {
        violations.push(themeViolation);
      } else {
        verified++;
      }
    }

    if (violations.length > 0) {
      console.log(`⚠️ Found ${violations.length} design violations:`);
      violations.forEach(violation => {
        console.log(`   ${violation.severity}: ${violation.file} - ${violation.message}`);
        if (violation.designChanges) {
          violation.designChanges.forEach(change => {
            console.log(`     - ${change}`);
          });
        }
      });
    } else {
      console.log(`✅ All ${verified} design elements verified`);
    }

    return { violations, verified };
  }

  // Detect specific design changes
  detectDesignChanges(original, current) {
    const changes = [];
    
    // Check color changes
    const originalColors = new Set(original.colors);
    const currentColors = new Set(current.colors);
    
    for (const color of originalColors) {
      if (!currentColors.has(color)) {
        changes.push(`Color removed: ${color}`);
      }
    }
    
    for (const color of currentColors) {
      if (!originalColors.has(color)) {
        changes.push(`Color added: ${color}`);
      }
    }

    // Check CSS variable changes
    const originalVars = new Set(original.variables);
    const currentVars = new Set(current.variables);
    
    for (const variable of originalVars) {
      if (!currentVars.has(variable)) {
        changes.push(`CSS variable removed: ${variable}`);
      }
    }

    return changes;
  }

  // Verify theme configuration
  async verifyThemeConfiguration() {
    if (!fs.existsSync(this.themeConfigFile)) {
      return null;
    }

    const lockedTheme = JSON.parse(fs.readFileSync(this.themeConfigFile, 'utf8'));
    const currentChecksum = this.calculateChecksum(JSON.stringify(lockedTheme.config));
    
    if (currentChecksum !== lockedTheme.checksum) {
      return {
        file: 'theme-configuration',
        type: 'THEME_MODIFICATION',
        severity: 'CRITICAL',
        message: 'Theme configuration has been modified',
        originalChecksum: lockedTheme.checksum,
        currentChecksum
      };
    }

    return null;
  }

  // Create design snapshot for rollback
  async createDesignSnapshot() {
    console.log('📸 Creating design snapshot...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotDir = path.join(this.lockDir, 'design-snapshots', timestamp);
    fs.mkdirSync(snapshotDir, { recursive: true });

    const lockedElements = fs.existsSync(this.lockFile) 
      ? JSON.parse(fs.readFileSync(this.lockFile, 'utf8'))
      : {};

    const snapshot = {
      timestamp: new Date().toISOString(),
      designFiles: [],
      themeConfig: null
    };

    // Backup design files
    for (const file of Object.keys(lockedElements)) {
      const sourcePath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(sourcePath)) {
        const targetPath = path.join(snapshotDir, file);
        const targetDir = path.dirname(targetPath);
        
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        fs.copyFileSync(sourcePath, targetPath);
        snapshot.designFiles.push(file);
        console.log(`📸 Snapshotted: ${file}`);
      }
    }

    // Backup theme configuration
    if (fs.existsSync(this.themeConfigFile)) {
      const themeTargetPath = path.join(snapshotDir, 'theme-config.json');
      fs.copyFileSync(this.themeConfigFile, themeTargetPath);
      snapshot.themeConfig = 'theme-config.json';
    }

    // Save snapshot manifest
    fs.writeFileSync(
      path.join(snapshotDir, 'snapshot-manifest.json'),
      JSON.stringify(snapshot, null, 2)
    );

    console.log(`📸 Design snapshot created: ${snapshotDir}`);
    return snapshotDir;
  }

  // Generate design integrity report
  async generateDesignReport() {
    console.log('📊 Generating design integrity report...');
    
    const verification = await this.verifyDesignIntegrity();
    
    const report = {
      timestamp: new Date().toISOString(),
      designStatus: verification.violations.length === 0 ? 'PROTECTED' : 'COMPROMISED',
      totalElements: verification.verified + verification.violations.length,
      verifiedElements: verification.verified,
      violations: verification.violations.length,
      criticalViolations: verification.violations.filter(v => v.severity === 'CRITICAL').length,
      designViolations: verification.violations,
      recommendations: this.generateDesignRecommendations(verification.violations),
      protectedAspects: [
        'Color palette and theme consistency',
        'Typography and font specifications',
        'Component styling and layouts',
        'Spacing and sizing standards',
        'Border radius and shadow definitions',
        'Navigation and header styling',
        'Card and button appearances'
      ]
    };

    const reportPath = path.join(this.lockDir, 'design-integrity-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Design report generated: ${reportPath}`);
    console.log(`Status: ${report.designStatus}`);
    console.log(`Protected: ${report.verifiedElements}/${report.totalElements} elements`);
    
    return report;
  }

  generateDesignRecommendations(violations) {
    const recommendations = [];
    
    if (violations.length === 0) {
      recommendations.push('All design elements are protected - continue development safely');
      return recommendations;
    }

    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
    const colorChanges = violations.filter(v => 
      v.designChanges && v.designChanges.some(change => change.includes('Color'))
    );
    
    if (criticalViolations.length > 0) {
      recommendations.push('IMMEDIATE: Critical design elements have been modified');
      recommendations.push('Review all theme and color changes for consistency');
      recommendations.push('Create design snapshot before applying fixes');
    }
    
    if (colorChanges.length > 0) {
      recommendations.push('Color palette has been modified - verify brand consistency');
      recommendations.push('Update theme configuration if changes are intentional');
    }
    
    recommendations.push('Test UI across all pages after resolving violations');
    recommendations.push('Re-lock design elements after validation');
    
    return recommendations;
  }

  determineDesignLockLevel(fileName) {
    const criticalPatterns = [
      'tailwind.config',
      'index.css',
      'theme',
      'App.tsx'
    ];
    
    const highPatterns = [
      'Navigation',
      'card.tsx',
      'button.tsx',
      'dialog.tsx'
    ];
    
    if (criticalPatterns.some(pattern => fileName.includes(pattern))) {
      return 'critical';
    }
    
    if (highPatterns.some(pattern => fileName.includes(pattern))) {
      return 'high';
    }
    
    return 'medium';
  }

  calculateChecksum(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async run(command, options = {}) {
    switch (command) {
      case 'lock':
        return await this.lockDesignElements();
      case 'verify':
        return await this.verifyDesignIntegrity();
      case 'snapshot':
        return await this.createDesignSnapshot();
      case 'report':
        return await this.generateDesignReport();
      case 'theme':
        return await this.lockThemeConfiguration();
      default:
        console.log('Available commands: lock, verify, snapshot, report, theme');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'verify';
  
  const uiLockSystem = new UIDesignLockSystem();
  uiLockSystem.run(command).catch(error => {
    console.error('❌ UI design lock system failed:', error);
    process.exit(1);
  });
}

module.exports = UIDesignLockSystem;