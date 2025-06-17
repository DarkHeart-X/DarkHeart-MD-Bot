// DarkHeart Bot - Utility Functions
// Common utility functions used throughout the bot

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class Utils {
    // Format file size
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Format duration
    static formatDuration(seconds) {
        const duration = moment.duration(seconds, 'seconds');
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        const secs = duration.seconds();

        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        if (secs > 0) result += `${secs}s`;

        return result.trim() || '0s';
    }

    // Generate random string
    static generateRandomString(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // Clean phone number
    static cleanPhoneNumber(number) {
        return number.replace(/[^0-9]/g, '');
    }

    // Format phone number for WhatsApp
    static formatWhatsAppNumber(number) {
        const cleaned = this.cleanPhoneNumber(number);
        return cleaned.includes('@') ? cleaned : `${cleaned}@s.whatsapp.net`;
    }

    // Check if group chat
    static isGroupChat(jid) {
        return jid.endsWith('@g.us');
    }

    // Extract group/user ID
    static extractId(jid) {
        return jid.split('@')[0];
    }

    // Delay function
    static async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get file extension
    static getFileExtension(filename) {
        return path.extname(filename).toLowerCase().slice(1);
    }

    // Get mime type from extension
    static getMimeType(extension) {
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'avi': 'video/avi',
            'mov': 'video/quicktime',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'txt': 'text/plain'
        };
        
        return mimeTypes[extension] || 'application/octet-stream';
    }

    // Escape markdown
    static escapeMarkdown(text) {
        return text.replace(/[*_`~]/g, '\\$&');
    }

    // Create safe filename
    static createSafeFilename(originalName) {
        const timestamp = Date.now();
        const randomStr = this.generateRandomString(6);
        const extension = this.getFileExtension(originalName);
        
        return `${timestamp}_${randomStr}.${extension}`;
    }

    // Ensure directory exists
    static async ensureDir(dirPath) {
        try {
            await fs.ensureDir(dirPath);
            return true;
        } catch (error) {
            console.error('Error creating directory:', error);
            return false;
        }
    }

    // Save media file
    static async saveMediaFile(buffer, filename, mediaType = 'documents') {
        try {
            const mediaDir = path.join(__dirname, '..', 'media', mediaType);
            await this.ensureDir(mediaDir);
            
            const safeFilename = this.createSafeFilename(filename);
            const filePath = path.join(mediaDir, safeFilename);
            
            await fs.writeFile(filePath, buffer);
            
            return {
                success: true,
                path: filePath,
                filename: safeFilename,
                size: buffer.length
            };
        } catch (error) {
            console.error('Error saving media file:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Format memory usage
    static formatMemoryUsage(memUsage) {
        return {
            rss: this.formatFileSize(memUsage.rss),
            heapTotal: this.formatFileSize(memUsage.heapTotal),
            heapUsed: this.formatFileSize(memUsage.heapUsed),
            external: this.formatFileSize(memUsage.external),
            arrayBuffers: this.formatFileSize(memUsage.arrayBuffers || 0)
        };
    }

    // Validate URL
    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Truncate text
    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    // Parse command arguments
    static parseCommand(message, prefix) {
        if (!message.startsWith(prefix)) return null;
        
        const args = message.slice(prefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        
        return {
            command,
            args,
            fullArgs: args.join(' ')
        };
    }

    // Generate QR ASCII art
    static generateQRArt() {
        return `
🖤 ═══════════════════════════════════════════════ 🖤
║                                                 ║
║     ██████  ██████   ██████  ██████  ███████   ║
║     ██   ██ ██   ██ ██      ██    ██ ██        ║
║     ██   ██ ██████  ██      ██    ██ ███████   ║
║     ██   ██ ██   ██ ██      ██    ██      ██   ║
║     ██████  ██   ██  ██████  ██████  ███████   ║
║                                                 ║
║               DARKHEART BOT                     ║
║            Scan QR Code Above                   ║
║                                                 ║
🖤 ═══════════════════════════════════════════════ 🖤
        `;
    }

    // Get system info
    static getSystemInfo() {
        const os = require('os');
        return {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            uptime: this.formatDuration(process.uptime()),
            memory: this.formatMemoryUsage(process.memoryUsage()),
            cpus: os.cpus().length,
            hostname: os.hostname()
        };
    }

    // Clean temporary files
    static async cleanTempFiles(olderThanHours = 24) {
        try {
            const tempDirs = [
                path.join(__dirname, '..', 'media', 'images'),
                path.join(__dirname, '..', 'media', 'videos'),
                path.join(__dirname, '..', 'media', 'audio'),
                path.join(__dirname, '..', 'media', 'documents')
            ];

            const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);

            for (const dir of tempDirs) {
                if (await fs.pathExists(dir)) {
                    const files = await fs.readdir(dir);
                    
                    for (const file of files) {
                        const filePath = path.join(dir, file);
                        const stats = await fs.stat(filePath);
                        
                        if (stats.mtime.getTime() < cutoffTime) {
                            await fs.remove(filePath);
                            console.log(`🗑️ Cleaned temp file: ${file}`);
                        }
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error cleaning temp files:', error);
            return false;
        }
    }
}

module.exports = Utils;
