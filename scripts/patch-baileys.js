/**
 * DarkHeart WhatsApp Bot - Baileys Patcher
 * This script patches known issues in the @whiskeysockets/baileys library
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Running Baileys patcher...');

// Use our fixed implementation directly
const FIXED_FILES = [
  {
    targetPath: '../node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js',
    sourcePath: './fixed-noise-handler.js'
  }
];

// Additional files to patch with regex
const FILES_TO_PATCH = [
  {
    path: '../node_modules/@whiskeysockets/baileys/lib/Socket/socket.js',
    patches: [
      {
        // Add error handling for undefined functions
        find: /([a-zA-Z0-9_]+)\(/g,
        replace: 'typeof $1 === "function" ? $1 : ((...args) => { console.log("⚠️ Function $1 is undefined"); return null; })('
      }
    ]
  }
];

// Apply our fixed implementations first
console.log('\n📄 Applying fixed implementation files...');
FIXED_FILES.forEach(file => {
  try {
    const sourcePath = path.resolve(__dirname, file.sourcePath);
    const targetPath = path.resolve(__dirname, file.targetPath);
    
    // Check if source exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Fixed file not found: ${sourcePath}`);
      return;
    }
    
    // Check if target directory exists
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      console.log(`📁 Creating directory: ${targetDir}`);
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Backup original if exists
    if (fs.existsSync(targetPath)) {
      const backupPath = `${targetPath}.original`;
      if (!fs.existsSync(backupPath)) {
        console.log(`💾 Backing up original to: ${backupPath}`);
        fs.copyFileSync(targetPath, backupPath);
      }
    }
    
    // Copy our fixed file
    console.log(`📝 Copying fixed file to: ${targetPath}`);
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Successfully applied fixed file: ${path.basename(targetPath)}`);
  } catch (err) {
    console.error(`❌ Error applying fixed file: ${err.message}`);
  }
});

// Run the regex patches
console.log('\n📄 Applying regex patches...');
let patchCount = 0;
let errorCount = 0;

FILES_TO_PATCH.forEach(file => {
  const filePath = path.resolve(__dirname, file.path);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Skipping: File not found: ${filePath}`);
      return;
    }
    
    console.log(`📄 Patching: ${filePath}`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Apply each patch to the file
    file.patches.forEach(patch => {
      try {
        content = content.replace(patch.find, patch.replace);
        patchCount++;
      } catch (err) {
        console.error(`❌ Error applying patch: ${err.message}`);
        errorCount++;
      }
    });
    
    // Only write back if content changed
    if (content !== originalContent) {
      // Create backup
      fs.writeFileSync(`${filePath}.bak`, originalContent, 'utf8');
      // Write patched file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Successfully patched: ${filePath}`);
    } else {
      console.log(`ℹ️ No changes needed for: ${filePath}`);
    }
  } catch (err) {
    console.error(`❌ Error processing ${filePath}: ${err.message}`);
    errorCount++;
  }
});

console.log(`\n🔧 Patch summary: ${patchCount} patches applied, ${errorCount} errors`);

if (errorCount > 0) {
  console.log('⚠️ Some patches failed. Your bot may still work, but be prepared for possible errors.');
} else if (patchCount > 0) {
  console.log('✅ All patches successfully applied!');
} else {
  console.log('ℹ️ No patches were needed or files were not found.');
}
