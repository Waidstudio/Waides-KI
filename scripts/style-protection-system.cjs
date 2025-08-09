#!/usr/bin/env node

/**
 * Waides KI Style Protection System
 * Protects specific style properties and enforces design consistency
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class StyleProtectionSystem {
  constructor() {
    this.projectRoot = process.cwd();
    this.protectionDir = path.join(this.projectRoot, '.style-protection');
    this.protectedStylesFile = path.join(this.protectionDir, 'protected-styles.json');
    this.styleRulesFile = path.join(this.protectionDir, 'style-rules.json');
    this.ensureProtectionDirectory();
  }

  ensureProtectionDirectory() {
    if (!fs.existsSync(this.protectionDir)) {
      fs.mkdirSync(this.protectionDir, { recursive: true });
    }
  }

  // Initialize style protection with Waides KI specific rules
  async initializeStyleProtection() {
    console.log('🎨 Initializing style protection for Waides KI...');

    const protectedStyles = {
      // Global theme colors
      colors: {
        primary: {
          blue: 'hsl(221.2, 83.2%, 53.3%)',
          emerald: 'hsl(142.1, 76.2%, 36.3%)',
          slate: 'hsl(210, 40%, 98%)'
        },
        background: {
          light: 'hsl(0, 0%, 100%)',
          dark: 'hsl(222.2, 84%, 4.9%)',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        text: {
          primary: 'hsl(222.2, 84%, 4.9%)',
          secondary: 'hsl(215.4, 16.3%, 46.9%)',
          muted: 'hsl(215.4, 16.3%, 46.9%)'
        },
        accent: {
          success: 'hsl(142.1, 76.2%, 36.3%)',
          warning: 'hsl(38, 92%, 50%)',
          error: 'hsl(0, 84.2%, 60.2%)',
          info: 'hsl(221.2, 83.2%, 53.3%)'
        }
      },

      // Typography system
      typography: {
        fontFamily: {
          primary: 'Inter, ui-sans-serif, system-ui, sans-serif',
          mono: 'ui-monospace, SFMono-Regular, Consolas, monospace'
        },
        fontSize: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },

      // Spacing system
      spacing: {
        container: {
          padding: '2rem',
          maxWidth: '1200px'
        },
        component: {
          cardPadding: '1.5rem',
          buttonPadding: '0.5rem 1rem',
          inputPadding: '0.75rem 1rem',
          gap: '1rem'
        },
        layout: {
          headerHeight: '4rem',
          sidebarWidth: '16rem',
          footerHeight: '3rem'
        }
      },

      // Border and radius system
      borders: {
        radius: {
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          full: '9999px'
        },
        width: {
          thin: '1px',
          medium: '2px',
          thick: '4px'
        }
      },

      // Shadow system
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
        trading: '0 8px 32px rgb(59 130 246 / 0.15)',
        wallet: '0 8px 32px rgb(16 185 129 / 0.15)'
      },

      // Component-specific styles
      components: {
        navigation: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid hsl(210, 40%, 90%)'
        },
        card: {
          background: 'hsl(0, 0%, 100%)',
          border: '1px solid hsl(210, 40%, 90%)',
          borderRadius: '0.5rem',
          shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        },
        button: {
          primary: {
            background: 'hsl(221.2, 83.2%, 53.3%)',
            color: 'hsl(0, 0%, 100%)',
            hover: 'hsl(221.2, 83.2%, 45%)'
          },
          secondary: {
            background: 'hsl(210, 40%, 95%)',
            color: 'hsl(222.2, 84%, 4.9%)',
            hover: 'hsl(210, 40%, 90%)'
          }
        }
      }
    };

    const styleRules = {
      enforcement: {
        strict: true,
        allowedDeviations: 5, // 5% color variation allowed
        requireApproval: true
      },
      protectionLevels: {
        critical: ['colors.primary', 'colors.background', 'typography.fontFamily'],
        high: ['spacing.container', 'borders.radius', 'components.navigation'],
        medium: ['shadows', 'components.card', 'components.button']
      },
      violations: {
        colorChange: 'CRITICAL',
        fontChange: 'CRITICAL',
        spacingChange: 'HIGH',
        componentChange: 'MEDIUM'
      },
      exceptions: {
        developmentMode: true,
        temporaryOverrides: true,
        approvedVariations: []
      }
    };

    fs.writeFileSync(this.protectedStylesFile, JSON.stringify(protectedStyles, null, 2));
    fs.writeFileSync(this.styleRulesFile, JSON.stringify(styleRules, null, 2));

    console.log('🎨 Style protection initialized with Waides KI design system');
    return { protectedStyles, styleRules };
  }

  // Scan files for style violations
  async scanStyleViolations() {
    console.log('🔍 Scanning for style violations...');

    const protectedStyles = JSON.parse(fs.readFileSync(this.protectedStylesFile, 'utf8'));
    const styleRules = JSON.parse(fs.readFileSync(this.styleRulesFile, 'utf8'));
    
    const filesToScan = [
      'client/src/index.css',
      'tailwind.config.ts',
      'client/src/components/ui/StableNavigation.tsx',
      'client/src/pages/HomePage.tsx',
      'client/src/pages/ProfessionalWalletPage.tsx',
      'client/src/components/ui/button.tsx',
      'client/src/components/ui/card.tsx'
    ];

    const violations = [];

    for (const file of filesToScan) {
      const filePath = path.join(this.projectRoot, file);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const fileViolations = this.detectStyleViolations(content, file, protectedStyles, styleRules);
        violations.push(...fileViolations);
      }
    }

    console.log(`🔍 Found ${violations.length} style violations`);
    return violations;
  }

  // Detect specific style violations
  detectStyleViolations(content, fileName, protectedStyles, styleRules) {
    const violations = [];

    // Check for unauthorized color changes
    const colorRegex = /#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|hsl\([^)]+\)|rgb\([^)]+\)/g;
    const foundColors = content.match(colorRegex) || [];

    const protectedColors = this.flattenColorValues(protectedStyles.colors);
    
    for (const color of foundColors) {
      if (!protectedColors.includes(color)) {
        violations.push({
          file: fileName,
          type: 'UNAUTHORIZED_COLOR',
          severity: 'CRITICAL',
          message: `Unauthorized color found: ${color}`,
          line: this.findLineNumber(content, color),
          suggestion: this.suggestNearestProtectedColor(color, protectedColors)
        });
      }
    }

    // Check for font family violations
    const fontRegex = /font-family:\s*([^;]+)/g;
    let fontMatch;
    while ((fontMatch = fontRegex.exec(content)) !== null) {
      const fontFamily = fontMatch[1].trim();
      if (!this.isProtectedFont(fontFamily, protectedStyles.typography.fontFamily)) {
        violations.push({
          file: fileName,
          type: 'UNAUTHORIZED_FONT',
          severity: 'CRITICAL',
          message: `Unauthorized font family: ${fontFamily}`,
          line: this.findLineNumber(content, fontMatch[0])
        });
      }
    }

    // Check for spacing violations
    const spacingRegex = /padding:\s*([^;]+)|margin:\s*([^;]+)/g;
    let spacingMatch;
    while ((spacingMatch = spacingRegex.exec(content)) !== null) {
      const spacingValue = spacingMatch[1] || spacingMatch[2];
      if (!this.isProtectedSpacing(spacingValue, protectedStyles.spacing)) {
        violations.push({
          file: fileName,
          type: 'UNAUTHORIZED_SPACING',
          severity: 'HIGH',
          message: `Non-standard spacing: ${spacingValue}`,
          line: this.findLineNumber(content, spacingMatch[0])
        });
      }
    }

    return violations;
  }

  // Helper methods
  flattenColorValues(colorObj) {
    const colors = [];
    
    const flatten = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          colors.push(obj[key]);
        } else if (typeof obj[key] === 'object') {
          flatten(obj[key]);
        }
      }
    };
    
    flatten(colorObj);
    return colors;
  }

  findLineNumber(content, searchText) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return null;
  }

  suggestNearestProtectedColor(color, protectedColors) {
    // Simple suggestion based on hue similarity
    // In a real implementation, you'd use color distance algorithms
    return protectedColors[0]; // Simplified for demo
  }

  isProtectedFont(fontFamily, protectedFonts) {
    const cleanFont = fontFamily.replace(/['"]/g, '').toLowerCase();
    return Object.values(protectedFonts).some(font => 
      font.toLowerCase().includes(cleanFont) || cleanFont.includes('inter') || cleanFont.includes('system')
    );
  }

  isProtectedSpacing(spacing, protectedSpacing) {
    // Check if spacing follows the design system
    const standardSpacing = ['0.25rem', '0.5rem', '0.75rem', '1rem', '1.25rem', '1.5rem', '2rem', '2.5rem', '3rem'];
    return standardSpacing.some(standard => spacing.includes(standard));
  }

  // Generate style enforcement CSS
  async generateEnforcementCSS() {
    console.log('📝 Generating style enforcement CSS...');

    const protectedStyles = JSON.parse(fs.readFileSync(this.protectedStylesFile, 'utf8'));
    
    const enforcementCSS = `
/* Waides KI Style Protection - Auto-generated Enforcement CSS */
/* DO NOT MODIFY - Protected by style lock system */

:root {
  /* Protected Color Palette */
  --primary-blue: ${protectedStyles.colors.primary.blue};
  --primary-emerald: ${protectedStyles.colors.primary.emerald};
  --primary-slate: ${protectedStyles.colors.primary.slate};
  
  --bg-light: ${protectedStyles.colors.background.light};
  --bg-dark: ${protectedStyles.colors.background.dark};
  --bg-gradient: ${protectedStyles.colors.background.gradient};
  
  --text-primary: ${protectedStyles.colors.text.primary};
  --text-secondary: ${protectedStyles.colors.text.secondary};
  --text-muted: ${protectedStyles.colors.text.muted};
  
  /* Protected Typography */
  --font-primary: ${protectedStyles.typography.fontFamily.primary};
  --font-mono: ${protectedStyles.typography.fontFamily.mono};
  
  /* Protected Spacing */
  --container-padding: ${protectedStyles.spacing.container.padding};
  --container-max-width: ${protectedStyles.spacing.container.maxWidth};
  --card-padding: ${protectedStyles.spacing.component.cardPadding};
  --button-padding: ${protectedStyles.spacing.component.buttonPadding};
  
  /* Protected Borders */
  --radius-sm: ${protectedStyles.borders.radius.sm};
  --radius-md: ${protectedStyles.borders.radius.md};
  --radius-lg: ${protectedStyles.borders.radius.lg};
  --radius-xl: ${protectedStyles.borders.radius.xl};
  
  /* Protected Shadows */
  --shadow-sm: ${protectedStyles.shadows.sm};
  --shadow-md: ${protectedStyles.shadows.md};
  --shadow-lg: ${protectedStyles.shadows.lg};
  --shadow-trading: ${protectedStyles.shadows.trading};
  --shadow-wallet: ${protectedStyles.shadows.wallet};
}

/* Enforcement Classes */
.protected-navigation {
  background: ${protectedStyles.components.navigation.background} !important;
  backdrop-filter: ${protectedStyles.components.navigation.backdropFilter} !important;
  border-bottom: ${protectedStyles.components.navigation.borderBottom} !important;
}

.protected-card {
  background: ${protectedStyles.components.card.background} !important;
  border: ${protectedStyles.components.card.border} !important;
  border-radius: ${protectedStyles.components.card.borderRadius} !important;
  box-shadow: ${protectedStyles.components.card.shadow} !important;
}

.protected-button-primary {
  background-color: ${protectedStyles.components.button.primary.background} !important;
  color: ${protectedStyles.components.button.primary.color} !important;
}

.protected-button-primary:hover {
  background-color: ${protectedStyles.components.button.primary.hover} !important;
}

.protected-button-secondary {
  background-color: ${protectedStyles.components.button.secondary.background} !important;
  color: ${protectedStyles.components.button.secondary.color} !important;
}

.protected-button-secondary:hover {
  background-color: ${protectedStyles.components.button.secondary.hover} !important;
}

/* Override protection - prevents unauthorized style changes */
*[data-protected="true"] {
  color: var(--text-primary) !important;
  font-family: var(--font-primary) !important;
}

.container[data-protected="true"] {
  max-width: var(--container-max-width) !important;
  padding: var(--container-padding) !important;
}
`;

    const enforcementPath = path.join(this.protectionDir, 'enforcement.css');
    fs.writeFileSync(enforcementPath, enforcementCSS);
    
    console.log(`📝 Style enforcement CSS generated: ${enforcementPath}`);
    return enforcementPath;
  }

  // Create style protection report
  async generateStyleReport() {
    console.log('📊 Generating style protection report...');

    const violations = await this.scanStyleViolations();
    
    const report = {
      timestamp: new Date().toISOString(),
      styleStatus: violations.length === 0 ? 'PROTECTED' : 'VIOLATIONS_DETECTED',
      totalViolations: violations.length,
      criticalViolations: violations.filter(v => v.severity === 'CRITICAL').length,
      highViolations: violations.filter(v => v.severity === 'HIGH').length,
      mediumViolations: violations.filter(v => v.severity === 'MEDIUM').length,
      violations: violations,
      protectedElements: [
        'Primary color palette (blue/emerald gradient)',
        'Typography system (Inter font family)',
        'Spacing and layout standards',
        'Component styling consistency',
        'Border radius and shadow system',
        'Navigation and header appearance',
        'Card and button styling'
      ],
      recommendations: this.generateStyleRecommendations(violations)
    };

    const reportPath = path.join(this.protectionDir, 'style-protection-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Style report generated: ${reportPath}`);
    console.log(`Status: ${report.styleStatus}`);
    console.log(`Violations: ${report.totalViolations} (${report.criticalViolations} critical)`);
    
    return report;
  }

  generateStyleRecommendations(violations) {
    const recommendations = [];
    
    if (violations.length === 0) {
      recommendations.push('All styles are protected and consistent');
      return recommendations;
    }

    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
    const colorViolations = violations.filter(v => v.type === 'UNAUTHORIZED_COLOR');
    const fontViolations = violations.filter(v => v.type === 'UNAUTHORIZED_FONT');
    
    if (criticalViolations.length > 0) {
      recommendations.push('IMMEDIATE: Critical style violations detected');
      recommendations.push('Review and revert unauthorized color/font changes');
    }
    
    if (colorViolations.length > 0) {
      recommendations.push('Update colors to use protected palette variables');
      recommendations.push('Apply enforcement CSS classes to components');
    }
    
    if (fontViolations.length > 0) {
      recommendations.push('Standardize font usage to Inter/system fonts');
    }
    
    recommendations.push('Run style enforcement after fixes');
    recommendations.push('Test visual consistency across all pages');
    
    return recommendations;
  }

  async run(command, options = {}) {
    switch (command) {
      case 'init':
        return await this.initializeStyleProtection();
      case 'scan':
        return await this.scanStyleViolations();
      case 'enforce':
        return await this.generateEnforcementCSS();
      case 'report':
        return await this.generateStyleReport();
      default:
        console.log('Available commands: init, scan, enforce, report');
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'scan';
  
  const styleProtection = new StyleProtectionSystem();
  styleProtection.run(command).catch(error => {
    console.error('❌ Style protection system failed:', error);
    process.exit(1);
  });
}

module.exports = StyleProtectionSystem;