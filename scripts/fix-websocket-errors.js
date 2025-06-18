/**
 * Quick fix script for Baileys WebSocket errors
 * Run this directly with: node scripts/fix-websocket-errors.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const baileysSockets = path.join(process.cwd(), 'node_modules', '@whiskeysockets', 'baileys', 'lib', 'Socket');
const socketJs = path.join(baileysSockets, 'socket.js');

// Check if files exist
if (!fs.existsSync(socketJs)) {
  console.error(`❌ Error: ${socketJs} not found!`);
  process.exit(1);
}

console.log('🔧 Creating backup of socket.js...');
try {
  fs.copyFileSync(socketJs, `${socketJs}.backup`);
  console.log(`✅ Backup created: ${socketJs}.backup`);
} catch (err) {
  console.error('❌ Failed to create backup:', err.message);
}

// Fix socket.js
console.log('🔧 Fixing socket.js...');
try {
  let content = fs.readFileSync(socketJs, 'utf8');
  
  // Fix 1: The WebSocketClient.<anonymous> error at line 454:20
  // Replace event destructuring with safe access
  content = content.replace(
    /ws\.on\(['"]close['"], *\(\{.*?\}\) *=>/g,
    'ws.on(\'close\', (event) =>'
  );
  
  // Fix code and reason usage
  content = content.replace(
    /end\(\{ statusCode: code, reason: Buffer\.from\(reason \|\| ['"]['"]\)\.toString\(['"]utf-8['"]\) \}\)/g, 
    'end({ statusCode: event?.code || 0, reason: Buffer.from(event?.reason || \'\').toString(\'utf-8\') })'
  );
  
  // Fix 2: The connection.info.statusCode error at line 254:16
  content = content.replace(
    /connection\.info\.statusCode/g,
    'connection?.info?.statusCode'
  );
  
  content = content.replace(
    /connection\.info\.reason/g,
    'connection?.info?.reason'
  );
  
  // Fix 3: Add null checks for err object
  content = content.replace(
    /\{ statusCode: err\.code, reason: err\.reason \}/g,
    '{ statusCode: err?.code || 0, reason: err?.reason || "Unknown" }'
  );
  
  fs.writeFileSync(socketJs, content);
  console.log('✅ Socket.js fixed successfully!');
} catch (err) {
  console.error('❌ Error fixing socket.js:', err.message);
}

console.log('✅ All fixes applied!');
console.log('📝 If you still encounter errors, please restart the bot with: npm start');
