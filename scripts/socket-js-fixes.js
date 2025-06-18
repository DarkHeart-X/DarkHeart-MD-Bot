/**
 * This file contains fixes for specific parts of socket.js in Baileys that commonly causes errors
 * For reference or for manual fixes - not meant to be imported directly
 */

// 1. Fix for WebSocketClient error handling (around line ~454 in socket.js)
// Original: 
// ws.on('close', ({ code, reason }) => { end({ statusCode: code, reason: Buffer.from(reason || '').toString('utf-8') }); });

// Fixed version:
ws.on('close', (event) => { 
    // Use safe optional chaining to prevent undefined errors
    const code = event?.code || 0;
    const reasonBuf = event?.reason || Buffer.from('Connection closed');
    const reason = Buffer.from(reasonBuf).toString('utf-8');
    
    // Call end with safe values
    end({ 
        statusCode: code, 
        reason: reason
    }); 
});

// 2. Fix for end function to safely handle undefined connection.info (around line ~254 in socket.js)
// Original:
// const statusCode = connection.info.statusCode || ERROR_OUTPUT_MAP[reason];
// logger?.info({ statusCode, reason }, 'closed connection');

// Fixed version:
const statusCode = connection?.info?.statusCode || ERROR_OUTPUT_MAP[reason] || 500;
const safeReason = connection?.info?.reason || reason || 'unknown';
logger?.info({ statusCode, reason: safeReason }, 'closed connection');

// 3. Add better error handling for WebSocket client creation (around WebSocketClient creation)
// Add try-catch around the WebSocket connection
try {
    const ws = new WebSocketClient(`${config.waWebSocketUrl}/ws`, {
        origin: DEFAULT_ORIGIN,
        headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Host': 'web.whatsapp.com',
            'Pragma': 'no-cache',
            'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
        },
        handshakeTimeout: timeoutMs,
        timeout: timeoutMs,
        agent
    });
} catch (wsError) {
    console.error('WebSocket connection error:', wsError);
    end({ 
        statusCode: 500, 
        reason: `WebSocket connection error: ${wsError.message || 'Unknown error'}`
    });
}
