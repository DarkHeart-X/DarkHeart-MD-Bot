/**
 * DarkHeart WhatsApp Bot - Baileys Dependency Checker
 * This script checks if the Baileys dependency is properly installed and patched
 */

console.log('🔍 DarkHeart WhatsApp Bot - Dependency Checker');
console.log('===============================================');

// List of critical dependencies to check
const CRITICAL_DEPENDENCIES = [
  '@whiskeysockets/baileys',
  'qrcode-terminal',
  'fs-extra'
];

// List of critical files to check
const CRITICAL_FILES = [
  ['node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js', 'Noise Handler'],
  ['node_modules/@whiskeysockets/baileys/lib/Socket/socket.js', 'Socket Implementation'],
  ['node_modules/@whiskeysockets/baileys/lib/WABinary/index.js', 'Binary Encoder/Decoder']
];

// Function to check dependencies
function checkDependencies() {
  console.log('\n📦 Checking critical dependencies...');
  
  let allFound = true;
  for (const dep of CRITICAL_DEPENDENCIES) {
    try {
      require(dep);
      console.log(`✅ ${dep}: Installed`);
    } catch (err) {
      console.error(`❌ ${dep}: NOT FOUND - ${err.message}`);
      allFound = false;
    }
  }
  
  return allFound;
}

// Function to check critical files
function checkCriticalFiles() {
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n📄 Checking critical library files...');
  
  let allFound = true;
  for (const [filePath, description] of CRITICAL_FILES) {
    const fullPath = path.resolve(__dirname, '..', filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${description} (${filePath}): Found`);
      
      // Check file size isn't empty
      const stats = fs.statSync(fullPath);
      if (stats.size < 10) {
        console.error(`⚠️ ${description} file is too small (${stats.size} bytes)!`);
        allFound = false;
      }
    } else {
      console.error(`❌ ${description} (${filePath}): NOT FOUND`);
      allFound = false;
    }
  }
  
  return allFound;
}

// Function to check for the noise-handler issue
function testNoiseHandler() {
  console.log('\n🧪 Testing noise-handler implementation...');
  
  try {
    const noiseHandlerPath = require.resolve('@whiskeysockets/baileys/lib/Utils/noise-handler');
    console.log(`📄 Found noise-handler at: ${noiseHandlerPath}`);
    
    // Try to load it
    const noiseHandler = require('@whiskeysockets/baileys/lib/Utils/noise-handler');
    
    // Check if makeNoiseHandler exists
    if (typeof noiseHandler.makeNoiseHandler !== 'function') {
      console.error('❌ makeNoiseHandler is not a function!');
      return false;
    }
    
    // Try creating a test noise handler
    const dummyOptions = {
      keyPair: {
        private: Buffer.alloc(32),
        public: Buffer.alloc(32)
      }
    };
    
    const handler = noiseHandler.makeNoiseHandler(dummyOptions);
    console.log('✅ Successfully created noise handler instance');
    
    // Check handler methods
    if (typeof handler.processHandshake !== 'function') {
      console.error('❌ handler.processHandshake is not a function!');
      return false;
    }
    
    if (typeof handler.encodeFrame !== 'function') {
      console.error('❌ handler.encodeFrame is not a function!');
      return false;
    }
    
    if (typeof handler.decodeFrame !== 'function') {
      console.error('❌ handler.decodeFrame is not a function!');
      return false;
    }
    
    console.log('✅ Noise handler implementation looks good');
    return true;
  } catch (err) {
    console.error(`❌ Error testing noise handler: ${err.message}`);
    return false;
  }
}

// Run the checks
const depsOk = checkDependencies();
const filesOk = checkCriticalFiles();
const noiseHandlerOk = testNoiseHandler();

// Summary
console.log('\n📊 Summary:');
console.log('==================');
console.log(`Dependencies: ${depsOk ? '✅ OK' : '❌ ISSUES FOUND'}`);
console.log(`Critical Files: ${filesOk ? '✅ OK' : '❌ ISSUES FOUND'}`);
console.log(`Noise Handler: ${noiseHandlerOk ? '✅ OK' : '❌ ISSUES FOUND'}`);
console.log('\n');

if (!depsOk || !filesOk || !noiseHandlerOk) {
  console.log('⚠️ Issues were found! Try running:');
  console.log('1. npm ci --force');
  console.log('2. node scripts/patch-baileys.js');
  process.exit(1);
} else {
  console.log('✅ All dependency checks passed!');
  process.exit(0);
}
