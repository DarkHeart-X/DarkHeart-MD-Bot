#!/bin/bash
# Direct fix for socket.js errors in Baileys
# This script specifically fixes the errors shown in the Pterodactyl panel

echo "🔧 Applying direct fix for WebSocket errors in socket.js..."
SOCKET_JS="node_modules/@whiskeysockets/baileys/lib/Socket/socket.js"

# Check if the file exists
if [ ! -f "$SOCKET_JS" ]; then
    echo "❌ socket.js not found at path: $SOCKET_JS"
    exit 1
fi

# Create a backup
cp "$SOCKET_JS" "${SOCKET_JS}.bak"
echo "✅ Backup created at ${SOCKET_JS}.bak"

# First apply the JavaScript fix if available
if [ -f "scripts/direct-socket-fix.js" ]; then
    echo "🔧 Using JavaScript fix script..."
    node scripts/direct-socket-fix.js
    
    if [ $? -eq 0 ]; then
        echo "✅ socket.js fixed successfully!"
        exit 0
    else
        echo "⚠️ JavaScript fix failed, trying shell fixes..."
    fi
fi

# Apply direct fixes using sed
echo "🔧 Applying fixes with sed..."

# Fix 1: Line 454:20 - Cannot read properties of undefined (reading 'error')
# Pattern: ws.on('close', ({ code, reason }) => { ... })
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' -E 's/ws\.on\(["'"'"']close["'"'"'], *\(\{ *code, *reason *\}\) *=> *\{/ws.on('\''close'\'', (event) => { const code = event?.code || 0; const reason = event?.reason ? Buffer.from(event.reason) : Buffer.from(""); /g' "$SOCKET_JS"
else
    # Linux
    sed -i -E 's/ws\.on\(["'"'"']close["'"'"'], *\(\{ *code, *reason *\}\) *=> *\{/ws.on('\''close'\'', (event) => { const code = event?.code || 0; const reason = event?.reason ? Buffer.from(event.reason) : Buffer.from(""); /g' "$SOCKET_JS"
fi

# Fix 2: Line 254:16 - Cannot read properties of undefined (reading 'info')
# Replace connection.info with optional chaining
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' -E 's/connection\.info\.statusCode/connection?.info?.statusCode/g' "$SOCKET_JS"
    sed -i '' -E 's/connection\.info\.reason/connection?.info?.reason/g' "$SOCKET_JS" 
else
    # Linux
    sed -i -E 's/connection\.info\.statusCode/connection?.info?.statusCode/g' "$SOCKET_JS"
    sed -i -E 's/connection\.info\.reason/connection?.info?.reason/g' "$SOCKET_JS"
fi

# Fix 3: Add safety for err object
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' -E 's/\(\{ statusCode: err\.code, reason: err\.reason \}\)/({ statusCode: err?.code || 0, reason: err?.reason || "Unknown" })/g' "$SOCKET_JS"
else
    # Linux
    sed -i -E 's/\(\{ statusCode: err\.code, reason: err\.reason \}\)/({ statusCode: err?.code || 0, reason: err?.reason || "Unknown" })/g' "$SOCKET_JS"
fi

echo "✅ Direct fixes applied to socket.js!"
echo "🔄 If errors persist, try manually editing the socket.js file using the reference in scripts/socket-js-fixes.js"
