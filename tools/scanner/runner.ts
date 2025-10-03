import { CodebaseScanner, saveScanReport } from './index';
import * as path from 'path';

async function main() {
  try {
    console.log('🚀 Starting Waides KI Master Scanner...\n');
    
    // Initialize scanner
    const rootDir = process.cwd();
    const scanner = new CodebaseScanner(rootDir);
    
    // Execute scan
    const scanResult = await scanner.scan();
    
    // Display summary
    console.log('\n📊 SCAN SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Files Scanned: ${scanResult.totalFiles}`);
    console.log(`Total Size: ${(scanResult.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log('\n📁 Categories:');
    console.log(`  - Bots: ${scanResult.categories.bots.length}`);
    console.log(`  - Exchanges: ${scanResult.categories.exchanges.length}`);
    console.log(`  - Storage: ${scanResult.categories.storage.length}`);
    console.log(`  - Routes: ${scanResult.categories.routes.length}`);
    console.log(`  - UI Components: ${scanResult.categories.ui.length}`);
    console.log(`  - Services: ${scanResult.categories.services.length}`);
    console.log(`  - Utilities: ${scanResult.categories.utilities.length}`);
    console.log(`  - Other: ${scanResult.categories.other.length}`);
    
    console.log('\n💰 Smaisika Analysis:');
    console.log(`  - Files with Smaisika: ${scanResult.smaisika.files.length}`);
    console.log(`  - Total Occurrences: ${scanResult.smaisika.totalOccurrences}`);
    console.log(`  - Unique Variants: ${scanResult.smaisika.variants.size}`);
    
    if (scanResult.smaisika.variants.size > 0) {
      console.log('\n  Variants found:');
      Array.from(scanResult.smaisika.variants.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([variant, count]) => {
          console.log(`    - ${variant}: ${count} occurrences`);
        });
    }
    
    console.log('\n🔐 Environment Variables:');
    console.log(`  - Unique Variables: ${scanResult.environmentVars.size}`);
    
    if (scanResult.missingComponents.length > 0) {
      console.log('\n⚠️  Missing Components:');
      scanResult.missingComponents.forEach(component => {
        console.log(`  - ${component}`);
      });
    } else {
      console.log('\n✅ All critical components found!');
    }
    
    // Save scan report
    const reportPath = path.join(rootDir, 'scan-report.json');
    await saveScanReport(scanResult, reportPath);
    
    console.log('\n✅ Scan complete! Report saved to scan-report.json');
    
  } catch (error) {
    console.error('❌ Scanner error:', error);
    process.exit(1);
  }
}

export { main as runScanner };

// Run if executed directly (ES module compatible)
main().catch(console.error);
