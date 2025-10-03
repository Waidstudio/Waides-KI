import { generateManifestFromScan } from './manifest';
import * as path from 'path';

async function main() {
  try {
    console.log('🚀 Starting Manifest Generation...\n');

    const scanReportPath = path.join(process.cwd(), 'scan-report.json');
    const manifest = await generateManifestFromScan(scanReportPath);

    console.log('\n📊 MANIFEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Components: ${manifest.summary.total}`);
    console.log(`  ✅ Exists: ${manifest.summary.exists}`);
    console.log(`  ⚠️  Partial: ${manifest.summary.partial}`);
    console.log(`  ❌ Missing: ${manifest.summary.missing}`);
    console.log(`  🔴 Critical Missing: ${manifest.summary.criticalMissing}`);

    console.log('\n📁 Proposed Structure:');
    console.log(`  - New Modules: ${manifest.proposedStructure.newModules.length}`);
    console.log(`  - Modifications: ${manifest.proposedStructure.modifications.length}`);

    if (manifest.summary.criticalMissing > 0) {
      console.log('\n🔴 Critical Missing Components:');
      manifest.components
        .filter(c => c.status === 'missing' && c.priority === 'critical')
        .forEach(c => {
          console.log(`  - ${c.name} (${c.category})`);
        });
    }

    console.log('\n📦 Proposed New Modules (First 10):');
    manifest.proposedStructure.newModules.slice(0, 10).forEach(module => {
      console.log(`  - ${module}`);
    });

    if (manifest.proposedStructure.newModules.length > 10) {
      console.log(`  ... and ${manifest.proposedStructure.newModules.length - 10} more`);
    }

    console.log('\n✅ Manifest generation complete!');
    console.log('📄 View full details in manifest.json');

  } catch (error) {
    console.error('❌ Manifest generation error:', error);
    process.exit(1);
  }
}

main().catch(console.error);

export { main as runManifestGenerator };
