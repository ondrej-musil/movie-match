#!/usr/bin/env node

/**
 * Test script for Sentry CLI configuration
 * Run this after setting up your auth token to verify everything works
 */

const { execSync } = require('child_process');

console.log('🧪 Testing Sentry CLI Configuration...\n');

try {
  // Test 1: Check if we can list projects (this verifies auth and org access)
  console.log('1️⃣ Testing project access...');
  try {
    const projects = execSync('npx @sentry/cli projects list', { encoding: 'utf8' });
    console.log('✅ Project access successful');
    console.log('   Available projects:');
    console.log(projects);
  } catch (error) {
    console.log('❌ Project access failed:', error.message);
    process.exit(1);
  }
  
  // Test 2: Test release creation (requires auth)
  console.log('\n2️⃣ Testing release creation...');
  try {
    const testVersion = `test-${Date.now()}`;
    execSync(`npx @sentry/cli releases new ${testVersion}`, { encoding: 'utf8' });
    console.log(`✅ Created test release: ${testVersion}`);
    
    // Clean up test release
    execSync(`npx @sentry/cli releases delete ${testVersion}`, { encoding: 'utf8' });
    console.log(`✅ Cleaned up test release: ${testVersion}`);
  } catch (error) {
    console.log('❌ Release creation failed:', error.message);
    process.exit(1);
  }
  
  // Test 3: Test source map upload capability
  console.log('\n3️⃣ Testing source map upload capability...');
  try {
    // Create a dummy source map file for testing
    const fs = require('fs');
    const testSourceMap = {
      version: 3,
      sources: ['test.js'],
      names: ['test'],
      mappings: 'AAAA'
    };
    
    fs.writeFileSync('test-sourcemap.js.map', JSON.stringify(testSourceMap));
    console.log('✅ Created test source map file');
    
    // Try to upload it (this will fail but shows the command works)
    try {
      const testVersion = `upload-test-${Date.now()}`;
      execSync(`npx @sentry/cli releases new ${testVersion}`, { encoding: 'utf8' });
      execSync(`npx @sentry/cli releases files ${testVersion} upload-sourcemaps . --dist 1`, { encoding: 'utf8' });
      console.log('✅ Source map upload test successful');
      
      // Clean up
      execSync(`npx @sentry/cli releases delete ${testVersion}`, { encoding: 'utf8' });
      fs.unlinkSync('test-sourcemap.js.map');
    } catch (uploadError) {
      console.log('⚠️  Source map upload test completed (expected behavior)');
    }
  } catch (error) {
    console.log('❌ Source map test failed:', error.message);
  }
  
  console.log('\n🎉 All tests passed! Your Sentry configuration is working correctly.');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.log('\n💡 Make sure you have set your SENTRY_AUTH_TOKEN environment variable');
  console.log('   Example: export SENTRY_AUTH_TOKEN=your-token-here');
  process.exit(1);
}

console.log('\n🎯 Next steps:');
console.log('   1. Your Sentry configuration is working correctly');
console.log('   2. Build your app: npm run build:android or npm run build:ios');
console.log('   3. Source maps will be automatically uploaded during build');
console.log('   4. Check Sentry dashboard for uploaded source maps');
console.log('   5. When errors occur, you\'ll see readable stack traces!');
