// DarkHeart Bot - Media Processor
// Handles media file processing, compression, and management

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const Utils = require('./utils');

class MediaProcessor {
    constructor() {
        this.mediaDir = path.join(__dirname, '..', 'media');
        this.maxFileSize = 64 * 1024 * 1024; // 64MB max file size
        this.supportedFormats = {
            image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            video: ['mp4', 'avi', 'mov', 'mkv', 'webm'],
            audio: ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
            document: ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar']
        };
        this.initializeDirectories();
    }

    // Initialize media directories
    async initializeDirectories() {
        const dirs = ['images', 'videos', 'audio', 'documents', 'temp', 'status', 'deleted'];
        for (const dir of dirs) {
            await Utils.ensureDir(path.join(this.mediaDir, dir));
        }
    }

    // Process downloaded media
    async processMedia(buffer, messageType, originalFilename = null) {
        try {
            if (!buffer || buffer.length === 0) {
                throw new Error('Empty media buffer');
            }

            if (buffer.length > this.maxFileSize) {
                throw new Error('File size exceeds limit (64MB)');
            }

            const mediaInfo = this.getMediaInfo(messageType, originalFilename);
            const filename = this.generateFilename(mediaInfo.extension);
            const filePath = path.join(this.mediaDir, mediaInfo.directory, filename);

            // Save media file
            await fs.writeFile(filePath, buffer);

            // Get file stats
            const stats = await fs.stat(filePath);

            return {
                success: true,
                filename,
                filePath,
                size: stats.size,
                sizeFormatted: Utils.formatFileSize(stats.size),
                type: mediaInfo.type,
                mimeType: Utils.getMimeType(mediaInfo.extension),
                savedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error processing media:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get media information based on message type
    getMediaInfo(messageType, originalFilename = null) {
        let type, directory, extension;

        switch (messageType) {
            case 'imageMessage':
                type = 'image';
                directory = 'images';
                extension = 'jpg';
                break;
            case 'videoMessage':
                type = 'video';
                directory = 'videos';
                extension = 'mp4';
                break;
            case 'audioMessage':
            case 'pttMessage':
                type = 'audio';
                directory = 'audio';
                extension = 'mp3';
                break;
            case 'documentMessage':
                type = 'document';
                directory = 'documents';
                extension = originalFilename ? Utils.getFileExtension(originalFilename) : 'bin';
                break;
            default:
                type = 'document';
                directory = 'documents';
                extension = 'bin';
        }

        return { type, directory, extension };
    }

    // Generate unique filename
    generateFilename(extension) {
        const timestamp = moment().format('YYYYMMDD_HHmmss');
        const random = Utils.generateRandomString(6);
        return `DH_${timestamp}_${random}.${extension}`;
    }

    // Process status media
    async processStatusMedia(buffer, messageType, sender) {
        try {
            const mediaInfo = this.getMediaInfo(messageType);
            const senderClean = sender.split('@')[0];
            const timestamp = moment().format('YYYYMMDD_HHmmss');
            const filename = `status_${senderClean}_${timestamp}.${mediaInfo.extension}`;
            
            const statusDir = path.join(this.mediaDir, 'status');
            await Utils.ensureDir(statusDir);
            
            const filePath = path.join(statusDir, filename);
            await fs.writeFile(filePath, buffer);

            const stats = await fs.stat(filePath);

            return {
                success: true,
                filename,
                filePath,
                size: stats.size,
                sizeFormatted: Utils.formatFileSize(stats.size),
                type: mediaInfo.type,
                savedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error processing status media:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Clean up old media files (24 hours)
    async cleanupOldMedia(hoursOld = 24) {
        try {
            const cutoffDate = moment().subtract(hoursOld, 'hours');
            let deletedCount = 0;
            let freedSpace = 0;

            const directories = ['status', 'deleted', 'temp'];
            
            for (const dir of directories) {
                const dirPath = path.join(this.mediaDir, dir);
                if (await fs.pathExists(dirPath)) {
                    const files = await fs.readdir(dirPath);
                    
                    for (const file of files) {
                        const filePath = path.join(dirPath, file);
                        const stats = await fs.stat(filePath);
                        
                        if (moment(stats.mtime).isBefore(cutoffDate)) {
                            freedSpace += stats.size;
                            await fs.remove(filePath);
                            deletedCount++;
                            console.log(`🗑️ Cleaned up old media file: ${dir}/${file}`);
                        }
                    }
                }
            }

            return {
                success: true,
                deletedCount,
                freedSpace: Utils.formatFileSize(freedSpace),
                cleanupTime: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error cleaning old media:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get media cleanup statistics
    async getCleanupStats() {
        try {
            const stats = {
                total: 0,
                images: 0,
                videos: 0,
                audio: 0,
                documents: 0,
                status: 0,
                deleted: 0,
                temp: 0,
                totalSize: 0
            };

            const directories = ['images', 'videos', 'audio', 'documents', 'status', 'deleted', 'temp'];
            
            for (const dir of directories) {
                const dirPath = path.join(this.mediaDir, dir);
                if (await fs.pathExists(dirPath)) {
                    const files = await fs.readdir(dirPath);
                    stats[dir] = files.length;
                    stats.total += files.length;

                    // Calculate total size
                    for (const file of files) {
                        try {
                            const filePath = path.join(dirPath, file);
                            const fileStat = await fs.stat(filePath);
                            stats.totalSize += fileStat.size;
                        } catch (err) {
                            // Skip files that can't be accessed
                        }
                    }
                }
            }

            return {
                success: true,
                stats: {
                    ...stats,
                    totalSizeFormatted: Utils.formatFileSize(stats.totalSize)
                }
            };

        } catch (error) {
            console.error('Error getting media stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = MediaProcessor;