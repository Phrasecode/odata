#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Running pre-publish checks...\n');

let hasErrors = false;

// Check 1: Verify package.json
console.log('📋 Checking package.json...');
try {
  const pkg = require('../package.json');

  const requiredFields = [
    'name',
    'version',
    'description',
    'main',
    'types',
    'license',
    'repository',
  ];
  const missingFields = requiredFields.filter(field => !pkg[field]);

  if (missingFields.length > 0) {
    console.error(`   ❌ Missing required fields: ${missingFields.join(', ')}`);
    hasErrors = true;
  } else {
    console.log('   ✅ All required fields present');
  }

  // Check files field
  if (!pkg.files || !pkg.files.includes('dist')) {
    console.error('   ❌ "files" field should include "dist"');
    hasErrors = true;
  } else {
    console.log('   ✅ Files field configured correctly');
  }
} catch (error) {
  console.error('   ❌ Error reading package.json:', error.message);
  hasErrors = true;
}

// Check 2: Verify dist folder exists
console.log('\n📦 Checking build output...');
const distPath = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('   ❌ dist/ folder not found. Run "npm run build" first.');
  hasErrors = true;
} else {
  const distFiles = fs.readdirSync(distPath);
  if (distFiles.length === 0) {
    console.error('   ❌ dist/ folder is empty');
    hasErrors = true;
  } else {
    console.log(`   ✅ dist/ folder exists with ${distFiles.length} items`);

    // Check for both .js and .mjs files
    const hasJs = execSync('find dist -name "*.js" | wc -l', { encoding: 'utf-8' }).trim();
    const hasMjs = execSync('find dist -name "*.mjs" | wc -l', { encoding: 'utf-8' }).trim();
    const hasDts = execSync('find dist -name "*.d.ts" | wc -l', { encoding: 'utf-8' }).trim();

    console.log(`   ✅ Found ${hasJs} .js files (CommonJS)`);
    console.log(`   ✅ Found ${hasMjs} .mjs files (ESM)`);
    console.log(`   ✅ Found ${hasDts} .d.ts files (TypeScript definitions)`);
  }
}

// Check 3: Verify essential files
console.log('\n📄 Checking essential files...');
const essentialFiles = ['README.md', 'LICENSE'];
essentialFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ ${file} not found`);
    hasErrors = true;
  } else {
    console.log(`   ✅ ${file} exists`);
  }
});

// Check 4: Check for uncommitted changes
console.log('\n🔄 Checking git status...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (gitStatus.trim()) {
    console.warn('   ⚠️  You have uncommitted changes:');
    console.warn(gitStatus);
    console.warn('   Consider committing before publishing');
  } else {
    console.log('   ✅ No uncommitted changes');
  }
} catch (error) {
  console.warn('   ⚠️  Not a git repository or git not available');
}

// Check 5: Verify .npmignore exists
console.log('\n📦 Checking .npmignore...');
const npmignorePath = path.join(__dirname, '..', '.npmignore');
if (fs.existsSync(npmignorePath)) {
  console.log('   ✅ .npmignore exists');
} else {
  console.warn('   ⚠️  .npmignore not found - package may include unwanted files');
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Pre-publish checks FAILED');
  console.log('Please fix the errors above before publishing.');
  process.exit(1);
} else {
  console.log('✅ All pre-publish checks PASSED');
  console.log('\nYou can now publish with:');
  console.log('  npm publish --access public');
  console.log('\nOr use the release scripts:');
  console.log('  npm run release:patch');
  console.log('  npm run release:minor');
  console.log('  npm run release:major');
  process.exit(0);
}
