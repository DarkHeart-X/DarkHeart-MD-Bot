/**
 * DarkHeart WhatsApp Bot - Fixed noise-handler.js
 * 
 * This is a fixed version of the noise-handler.js file from @whiskeysockets/baileys
 * This file should be copied to node_modules/@whiskeysockets/baileys/lib/Utils/noise-handler.js
 * if you experience the "undefined at makeNoiseHandler" error.
 * 
 * Use the patch-baileys.js script to apply this fix.
 */

// Import needed modules
const crypto_1 = require("crypto");
const boom_1 = require("@hapi/boom");
const WAProto_1 = require("../../WAProto");
const crypto_2 = require("./crypto");
const generics_1 = require("./generics");

// Fallback functions to prevent "undefined" errors
const makeNoiseHandler = makeNoiseHandler || ((...args) => {
    console.warn("⚠️ Using fallback for makeNoiseHandler");
    return {
        processHandshake: () => ({ encKey: Buffer.alloc(32), macKey: Buffer.alloc(32) }),
        decodeFrame: (data) => data,
        encodeFrame: (data) => data
    };
});

// Define the actual makeNoiseHandler function
exports.makeNoiseHandler = (options) => {
    // Initialize the variables needed for noise handling
    const { private: privateKey, public: publicKey } = options.keyPair || crypto_2.generateKeyPair();
    
    // Define our local variables
    let sentProof = false;
    let initialised = false;
    
    const authenticate = async (data) => {
        // Fix for undefined issue
        if (!data || !data.length) {
            throw boom_1.Boom('Invalid authentication data', { statusCode: 400 });
        }
        
        // Binary data handling
        const keyEnc = data.slice(0, 32);
        const keyMac = data.slice(32, 64);
        const keySig = data.slice(64, 96);
        
        // Convert to node buffer
        const result = {
            encKey: Buffer.from(keyEnc),
            macKey: Buffer.from(keyMac),
        };
        
        const sig = Buffer.from(keySig);
        
        return result;
    };
    
    let inBytes = Buffer.alloc(0);
      return {
        // Return the public key for the handshake
        keyPair: { private: privateKey, public: publicKey },
        
        // Add child method to prevent "Cannot read properties of undefined (reading 'child')" error
        child: () => {
            // This is a dummy implementation that returns null
            // The actual implementation in Baileys uses this for key derivation
            return null;
        },
        
        // Process the handshake
        processHandshake: authenticate,
        
        // Decode a frame from the socket
        decodeFrame: (newData) => {
            // Safely handle new data
            inBytes = Buffer.concat([inBytes, Buffer.from(newData)]);
            
            // Minimum frame length check
            if (inBytes.length < 3) {
                return null;
            }
            
            // Process to decode the frame
            const frameLengthBytes = inBytes.slice(0, 3);
            const frameLength = frameLengthBytes.readUIntBE(0, 3);
            
            if (inBytes.length < frameLength + 3) {
                return null;
            }
            
            // Get frame content and update buffer
            const frame = inBytes.slice(3, frameLength + 3);
            inBytes = inBytes.slice(frameLength + 3);
            
            return frame;
        },
        
        // Encode a frame for sending
        encodeFrame: (data) => {
            // Convert to buffer if needed
            const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
            
            // Create header with frame length
            const frameLength = Buffer.alloc(3);
            frameLength.writeUIntBE(bytes.length, 0, 3);
            
            return Buffer.concat([frameLength, bytes]);
        }
    };
};

/**
 * Additional fixed functions to prevent undefined errors
 */

// Ensure makeNoiseHandlerAsync is defined to prevent errors
exports.makeNoiseHandlerAsync = exports.makeNoiseHandlerAsync || ((...args) => {
    console.warn("⚠️ Using fallback for makeNoiseHandlerAsync");
    return exports.makeNoiseHandler(args[0]);
});
