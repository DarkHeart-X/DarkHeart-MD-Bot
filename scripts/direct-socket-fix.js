/**
 * Direct fix for the socket.js errors in Baileys
 * This fixes the specific lines mentioned in the error stack trace:
 * - Line 454:20 - Cannot read properties of undefined (reading 'error')
 * - Line 254:16 - Cannot read properties of undefined (reading 'info')
 */

// Original code is likely:
/*
ws.on('close', ({ code, reason }) => {
  end({ statusCode: code, reason: Buffer.from(reason || '').toString('utf-8') });
});

// And:

const statusCode = connection.info.statusCode || ERROR_OUTPUT_MAP[reason];
logger?.info({ statusCode, reason }, 'closed connection');
*/

// Fixed version should use optional chaining and default values
module.exports = async function fixSocketJs() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    // Path to the socket.js file
    const socketPath = path.join(process.cwd(), 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket', 'socket.js');
    
    // Check if the file exists
    if (!fs.existsSync(socketPath)) {
      console.log('❌ socket.js not found at path:', socketPath);
      return false;
    }
    
    // Read the file content
    let content = fs.readFileSync(socketPath, 'utf8');
    
    // Create a backup
    fs.writeFileSync(`${socketPath}.bak`, content);
    
    // Fix 1: The "cannot read properties of undefined (reading 'error')" at line ~454
    // We'll look for patterns that match the `ws.on('close'` call
    content = content.replace(
      /ws\.on\(['"]close['"], *\(\{ *code, *reason *\}\) *=> *\{/g,
      `ws.on('close', (event) => {
        // Safely handle potentially undefined event
        const code = event?.code || 0;
        const reasonBuf = event?.reason ? event.reason : Buffer.from('');`
    );
    
    // Fix the next line where it uses the variables
    content = content.replace(
      /end\(\{ *statusCode: *code, *reason: *Buffer\.from\(reason *\|\| *['"]['"]\)\.toString\(['"]utf-8['"]\) *\}\);/g,
      `end({ statusCode: code, reason: Buffer.from(reasonBuf).toString('utf-8') });`
    );
    
    // Fix 2: The "cannot read properties of undefined (reading 'info')" at line ~254
    // We'll replace references to connection.info with safety checks
    content = content.replace(
      /const statusCode = connection\.info\.statusCode/g,
      'const statusCode = connection?.info?.statusCode'
    );
    
    content = content.replace(
      /connection\.info\.reason/g,
      'connection?.info?.reason'
    );
    
    // Additional safety - preventing other similar errors
    content = content.replace(
      /\(\{ statusCode: err\.code, reason: err\.reason \}\)/g,
      '({ statusCode: err?.code || 0, reason: err?.reason || "Unknown" })'
    );
    
    // Write the fixed content back
    fs.writeFileSync(socketPath, content);
    
    console.log('✅ Successfully fixed socket.js!');
    return true;
  } catch (error) {
    console.error('❌ Error fixing socket.js:', error);
    return false;
  }
};
