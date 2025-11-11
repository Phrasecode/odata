#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Building package...\n');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
execSync('npm run clean', { stdio: 'inherit' });

// Build CommonJS
console.log('\n📦 Building CommonJS...');
execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });

// Build ESM
console.log('\n📦 Building ESM...');
execSync('tsc -p tsconfig.esm.json', { stdio: 'inherit' });

// Copy ESM files to dist with .mjs extension
console.log('\n📋 Processing ESM files...');
const distEsmDir = path.join(__dirname, '..', 'dist-esm');
const distDir = path.join(__dirname, '..', 'dist');

function copyEsmFiles(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      copyEsmFiles(srcPath, destPath);
    } else if (entry.name.endsWith('.js')) {
      const mjsPath = destPath.replace(/\.js$/, '.mjs');
      fs.copyFileSync(srcPath, mjsPath);
    }
  }
}

if (fs.existsSync(distEsmDir)) {
  copyEsmFiles(distEsmDir, distDir);
  
  // Clean up dist-esm directory
  console.log('🧹 Cleaning temporary ESM directory...');
  fs.rmSync(distEsmDir, { recursive: true, force: true });
}

console.log('\n✅ Build completed successfully!\n');

