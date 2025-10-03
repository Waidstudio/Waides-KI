import * as fs from 'fs';
import * as path from 'path';

export interface FileMetadata {
  path: string;
  relativePath: string;
  size: number;
  mtime: Date;
  extension: string;
  category: string;
  imports: string[];
  exports: string[];
  hasSmaisika: boolean;
  smaisikaVariants: string[];
  environmentVars: string[];
}

export interface ScanResult {
  timestamp: Date;
  totalFiles: number;
  totalSize: number;
  files: FileMetadata[];
  categories: {
    bots: FileMetadata[];
    exchanges: FileMetadata[];
    storage: FileMetadata[];
    routes: FileMetadata[];
    ui: FileMetadata[];
    services: FileMetadata[];
    utilities: FileMetadata[];
    other: FileMetadata[];
  };
  smaisika: {
    totalOccurrences: number;
    variants: Map<string, number>;
    files: FileMetadata[];
  };
  environmentVars: Set<string>;
  missingComponents: string[];
}

export class CodebaseScanner {
  private rootDir: string;
  private ignorePatterns: string[];
  private files: FileMetadata[] = [];
  
  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
      '.replit',
      'backups',
      'proposed',
      '.vite',
      'attached_assets'
    ];
  }

  async scan(): Promise<ScanResult> {
    console.log('🔍 Starting comprehensive codebase scan...');
    this.files = [];
    
    await this.scanDirectory(this.rootDir);
    
    console.log(`✅ Scan complete. Found ${this.files.length} files.`);
    
    return this.generateScanResult();
  }

  private async scanDirectory(dir: string): Promise<void> {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip ignored directories
      if (entry.isDirectory() && this.shouldIgnore(entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath);
      } else if (this.isRelevantFile(entry.name)) {
        const metadata = await this.analyzeFile(fullPath);
        this.files.push(metadata);
      }
    }
  }

  private shouldIgnore(name: string): boolean {
    return this.ignorePatterns.includes(name);
  }

  private isRelevantFile(filename: string): boolean {
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.sql'];
    return relevantExtensions.some(ext => filename.endsWith(ext));
  }

  private async analyzeFile(filePath: string): Promise<FileMetadata> {
    const stats = await fs.promises.stat(filePath);
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const relativePath = path.relative(this.rootDir, filePath);
    
    return {
      path: filePath,
      relativePath,
      size: stats.size,
      mtime: stats.mtime,
      extension: path.extname(filePath),
      category: this.categorizeFile(relativePath, content),
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      hasSmaisika: this.hasSmaisika(content),
      smaisikaVariants: this.extractSmaisaVariants(content),
      environmentVars: this.extractEnvironmentVars(content)
    };
  }

  private categorizeFile(relativePath: string, content: string): string {
    const lowerPath = relativePath.toLowerCase();
    const lowerContent = content.toLowerCase();
    
    // Bot detection
    if (lowerPath.includes('maibot') || lowerContent.includes('maibot')) return 'bots';
    if (lowerPath.includes('waidbot') || lowerContent.includes('waidbot')) return 'bots';
    if (lowerPath.includes('autonomous') || lowerContent.includes('autonomous trader')) return 'bots';
    if (lowerPath.includes('full-engine') || lowerPath.includes('fullengine')) return 'bots';
    if (lowerPath.includes('nwaora') || lowerContent.includes('nwaora')) return 'bots';
    if (lowerPath.includes('smai-chinnikstah') || lowerPath.includes('chinnikstah')) return 'bots';
    
    // Exchange detection
    if (lowerPath.includes('exchange') || lowerPath.includes('connector')) return 'exchanges';
    if (lowerContent.includes('binance') || lowerContent.includes('bybit') || 
        lowerContent.includes('kucoin') || lowerContent.includes('deriv')) return 'exchanges';
    
    // Storage detection
    if (lowerPath.includes('storage') || lowerPath.includes('database')) return 'storage';
    if (lowerPath.includes('schema') || lowerPath.includes('migration')) return 'storage';
    
    // Routes detection
    if (lowerPath.includes('routes') || lowerPath.includes('api')) return 'routes';
    
    // UI detection
    if (lowerPath.includes('pages') || lowerPath.includes('components')) return 'ui';
    
    // Services detection
    if (lowerPath.includes('services') || lowerPath.includes('lib')) return 'services';
    
    // Utilities
    if (lowerPath.includes('utils') || lowerPath.includes('helpers')) return 'utilities';
    
    return 'other';
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:[\w{},\s*]+\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|interface|type)\s+(\w+)/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  private hasSmaisika(content: string): boolean {
    const smaisaRegex = /smai[s]?[i]?[k]?[a]?/gi;
    return smaisaRegex.test(content);
  }

  private extractSmaisaVariants(content: string): string[] {
    const variants = new Set<string>();
    const smaisaRegex = /\b(smai\w*)\b/gi;
    let match;
    
    while ((match = smaisaRegex.exec(content)) !== null) {
      const variant = match[1];
      if (variant.toLowerCase().startsWith('smai')) {
        variants.add(variant);
      }
    }
    
    return Array.from(variants);
  }

  private extractEnvironmentVars(content: string): string[] {
    const envVars: string[] = [];
    const envRegex = /process\.env\.(\w+)|import\.meta\.env\.(\w+)/g;
    let match;
    
    while ((match = envRegex.exec(content)) !== null) {
      const varName = match[1] || match[2];
      if (varName) {
        envVars.push(varName);
      }
    }
    
    return envVars;
  }

  private generateScanResult(): ScanResult {
    const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
    
    // Categorize files
    const categories = {
      bots: this.files.filter(f => f.category === 'bots'),
      exchanges: this.files.filter(f => f.category === 'exchanges'),
      storage: this.files.filter(f => f.category === 'storage'),
      routes: this.files.filter(f => f.category === 'routes'),
      ui: this.files.filter(f => f.category === 'ui'),
      services: this.files.filter(f => f.category === 'services'),
      utilities: this.files.filter(f => f.category === 'utilities'),
      other: this.files.filter(f => f.category === 'other')
    };
    
    // Analyze Smaisika usage
    const smaisaFiles = this.files.filter(f => f.hasSmaisika);
    const variantCounts = new Map<string, number>();
    let totalOccurrences = 0;
    
    smaisaFiles.forEach(file => {
      const variants = file.smaisaVariants || [];
      variants.forEach(variant => {
        variantCounts.set(variant, (variantCounts.get(variant) || 0) + 1);
        totalOccurrences++;
      });
    });
    
    // Collect all environment variables
    const allEnvVars = new Set<string>();
    this.files.forEach(file => {
      const envVars = file.environmentVars || [];
      envVars.forEach(v => allEnvVars.add(v));
    });
    
    // Identify missing components
    const missingComponents = this.identifyMissingComponents(categories);
    
    return {
      timestamp: new Date(),
      totalFiles: this.files.length,
      totalSize,
      files: this.files,
      categories,
      smaisika: {
        totalOccurrences,
        variants: variantCounts,
        files: smaisaFiles
      },
      environmentVars: allEnvVars,
      missingComponents
    };
  }

  private identifyMissingComponents(categories: ScanResult['categories']): string[] {
    const missing: string[] = [];
    
    // Check for required bot modules
    const requiredBots = ['maibot', 'waidbot', 'waidbot-pro', 'autonomous-trader', 'full-engine', 'nwaora-chigozie'];
    const foundBots = new Set(
      categories.bots
        .map(f => {
          const lower = f.relativePath.toLowerCase();
          for (const bot of requiredBots) {
            if (lower.includes(bot)) return bot;
          }
          return null;
        })
        .filter((bot): bot is string => bot !== null)
    );
    
    requiredBots.forEach(bot => {
      if (!foundBots.has(bot)) {
        missing.push(`Bot module: ${bot}`);
      }
    });
    
    // Check for exchange connectors
    const requiredExchanges = ['binance', 'bybit', 'kucoin', 'deriv', 'quotex'];
    const foundExchanges = new Set(
      categories.exchanges
        .map(f => {
          const lower = f.relativePath.toLowerCase();
          for (const exchange of requiredExchanges) {
            if (lower.includes(exchange)) return exchange;
          }
          return null;
        })
        .filter((exchange): exchange is string => exchange !== null)
    );
    
    requiredExchanges.forEach(exchange => {
      if (!foundExchanges.has(exchange)) {
        missing.push(`Exchange connector: ${exchange}`);
      }
    });
    
    // Check for critical services
    if (!categories.services.some(f => f.relativePath.includes('profitSharing'))) {
      missing.push('Service: Profit sharing system');
    }
    
    if (!categories.services.some(f => f.relativePath.includes('ledger'))) {
      missing.push('Service: Smaisika ledger system');
    }
    
    if (!categories.services.some(f => f.relativePath.includes('gamification'))) {
      missing.push('Service: Gamification engine');
    }
    
    return missing;
  }
}

export async function saveScanReport(scanResult: ScanResult, outputPath: string): Promise<void> {
  const reportData = {
    ...scanResult,
    smaisika: {
      totalOccurrences: scanResult.smaisika.totalOccurrences,
      variants: Array.from(scanResult.smaisika.variants.entries()),
      files: scanResult.smaisika.files.map(f => f.relativePath)
    },
    environmentVars: Array.from(scanResult.environmentVars),
    categories: {
      bots: scanResult.categories.bots.map(f => f.relativePath),
      exchanges: scanResult.categories.exchanges.map(f => f.relativePath),
      storage: scanResult.categories.storage.map(f => f.relativePath),
      routes: scanResult.categories.routes.map(f => f.relativePath),
      ui: scanResult.categories.ui.map(f => f.relativePath),
      services: scanResult.categories.services.map(f => f.relativePath),
      utilities: scanResult.categories.utilities.map(f => f.relativePath),
      other: scanResult.categories.other.map(f => f.relativePath)
    }
  };
  
  await fs.promises.writeFile(
    outputPath,
    JSON.stringify(reportData, null, 2),
    'utf-8'
  );
  
  console.log(`📊 Scan report saved to: ${outputPath}`);
}
