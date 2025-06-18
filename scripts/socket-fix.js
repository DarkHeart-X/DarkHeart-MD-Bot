/**
 * WebSocket and Socket.js fixes for Baileys
 * This file addresses common errors:
 * - Cannot read properties of undefined (reading 'error')
 * - Cannot read properties of undefined (reading 'info')
 */

// This file contains patched versions of socket.js functions to prevent common errors
// It should be copied to node_modules/@whiskeysockets/baileys/lib/Socket/socket.js
// or relevant parts can be applied to fix the specific issues

// Fix for handling WebSocket errors more gracefully
const handleConnectionClose = (err) => {
    // Safely check for err properties
    const statusCode = err?.code || 0;
    const reason = err?.reason || 'Unknown';
    
    console.log('Connection closed due to:', {
        statusCode,
        reason,
        message: err?.message || 'No error message'
    });
    
    // Return safe defaults
    return {
        statusCode: statusCode || 500,
        reason: reason || 'Connection closed'
    };
};

// Fix for end function that safely handles undefined cases
const safeEndConnection = (connection) => {
    try {
        // Safe access to properties
        const statusCode = connection?.info?.statusCode || 500;
        const reason = connection?.info?.reason || 'Connection ended';
        
        console.log('Connection ended:', { statusCode, reason });
        return { statusCode, reason };
    } catch (error) {
        console.log('Error in end function:', error?.message);
        return { statusCode: 500, reason: 'Error ending connection' };
    }
};

// Export the functions
module.exports = {
    handleConnectionClose,
    safeEndConnection
};
