/**
 * DarkHeart WhatsApp Bot - Directory Structure Creator
 * This script creates all required directories for the bot to function properly
 */

const fs = require('fs-extra');
const path = require('path');

console.log('📂 Creating required directories for DarkHeart Bot...');

// Define directories to create
const directories = [
    // Data directories
    'data',
    'data/cache',
    'data/sessions',
    'data/temp',
    
    // Media directories
    'media',
    'media/audio',
    'media/documents',
    'media/images',
    'media/videos',
    'media/stickers',
    
    // Public directories
    'public',
    'public/docs',
    'public/images'
];

// Create each directory
directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        try {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created: ${dir}`);
        } catch (error) {
            console.error(`❌ Error creating ${dir}: ${error.message}`);
        }
    } else {
        console.log(`✓ Already exists: ${dir}`);
    }
});

console.log('📂 Directory structure setup complete!');
