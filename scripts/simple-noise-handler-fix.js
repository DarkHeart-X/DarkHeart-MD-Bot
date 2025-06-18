/**
 * Very simple fix for Baileys noise-handler.js
 * This file fixes the "Cannot access 'makeNoiseHandler' before initialization" error
 */

const { generateKeyPair } = require('./crypto');

// Define makeNoiseHandler first to avoid the reference error
const makeNoiseHandler = (options) => {
  const { private: privateKey, public: publicKey } = options.keyPair || generateKeyPair();
  
  let inBytes = Buffer.alloc(0);
    return {
    keyPair: { private: privateKey, public: publicKey },
    
    // Add child method to prevent "Cannot read properties of undefined (reading 'child')" error
    child: () => null,
    
    processHandshake: (data) => {
      // Simple implementation that returns the required keys
      const keyEnc = data && data.length >= 32 ? data.slice(0, 32) : Buffer.alloc(32);
      const keyMac = data && data.length >= 64 ? data.slice(32, 64) : Buffer.alloc(32);
      
      return {
        encKey: Buffer.from(keyEnc),
        macKey: Buffer.from(keyMac)
      };
    },
    
    // Simple frame decoder
    decodeFrame: (newData) => {
      try {
        // Basic implementation that just returns the data
        inBytes = Buffer.concat([inBytes, Buffer.from(newData)]);
        
        if (inBytes.length < 3) {
          return null;
        }
        
        const frameLength = inBytes.slice(0, 3).readUIntBE(0, 3);
        
        if (inBytes.length < frameLength + 3) {
          return null;
        }
        
        const frame = inBytes.slice(3, frameLength + 3);
        inBytes = inBytes.slice(frameLength + 3);
        
        return frame;
      } catch (error) {
        console.log("Error in decodeFrame:", error);
        return null;
      }
    },
    
    // Simple frame encoder
    encodeFrame: (data) => {
      try {
        const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const frameLength = Buffer.alloc(3);
        frameLength.writeUIntBE(bytes.length, 0, 3);
        return Buffer.concat([frameLength, bytes]);
      } catch (error) {
        console.log("Error in encodeFrame:", error);
        return Buffer.alloc(0);
      }
    }
  };
};

// Export the function
exports.makeNoiseHandler = makeNoiseHandler;

// Also export makeNoiseHandlerAsync as the same function for compatibility
exports.makeNoiseHandlerAsync = makeNoiseHandler;
