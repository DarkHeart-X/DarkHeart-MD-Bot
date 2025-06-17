// DarkHeart Bot - Advanced Features
// Anti-delete, anti-link, auto react, anti-view once, status saver

const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const Utils = require('./utils');

class AdvancedFeatures {
    constructor() {
        this.deletedMessages = new Map();
        this.deletedStatuses = new Map();
        this.groupSettings = new Map();
        this.ownerReactions = ['🖤', '👑', '⚡', '🔥', '💎', '✨'];
        this.decentEmojis = [
            '😊', '❤️', '👍', '🔥', '✨', '💎', '🌟', 
            '🎉', '👏', '🙌', '💪', '🚀', '⚡', '🌈', '🎯',
            '🎨', '🎵', '📚', '🏆', '💫', '🌸', '🌺', '🦋'
        ];
        this.emotionEmojis = {
            happy: ['😊', '😄', '😃', '🥰', '😍', '🤗', '🎉', '✨'],
            sad: ['😢', '😭', '💔', '😞', '😔', '🤧', '💙'],
            angry: ['😠', '😡', '🤬', '💢', '🔥', '😤'],
            love: ['❤️', '💕', '💖', '💗', '💘', '💝', '😍', '🥰'],
            funny: ['😂', '🤣', '😆', '😹', '🤪', '😜', '🙃'],
            surprise: ['😱', '🤯', '😲', '😮', '🤩', '✨', '💫'],
            thinking: ['🤔', '🧐', '💭', '🤨', '🔍'],
            cool: ['😎', '🔥', '💪', '👑', '⚡', '🚀', '💎']
        };
        
        this.dataDir = path.join(__dirname, '..', 'data');
        this.initializeData();
    }

    async initializeData() {
        await Utils.ensureDir(this.dataDir);
        await Utils.ensureDir(path.join(this.dataDir, 'deleted_messages'));
        await Utils.ensureDir(path.join(this.dataDir, 'deleted_statuses'));
        await Utils.ensureDir(path.join(this.dataDir, 'saved_statuses'));
        await this.loadGroupSettings();
    }

    // Load group settings from file
    async loadGroupSettings() {
        try {
            const settingsFile = path.join(this.dataDir, 'group_settings.json');
            if (await fs.pathExists(settingsFile)) {
                const settings = await fs.readJson(settingsFile);
                Object.entries(settings).forEach(([groupId, config]) => {
                    this.groupSettings.set(groupId, config);
                });
            }
        } catch (error) {
            console.error('Error loading group settings:', error);
        }
    }

    // Save group settings to file
    async saveGroupSettings() {
        try {
            const settingsFile = path.join(this.dataDir, 'group_settings.json');
            const settings = Object.fromEntries(this.groupSettings);
            await fs.writeJson(settingsFile, settings, { spaces: 2 });
        } catch (error) {
            console.error('Error saving group settings:', error);
        }
    }    // Get group settings
    getGroupSettings(groupId) {
        return this.groupSettings.get(groupId) || {
            antiDelete: false,
            antiLink: false,
            autoReact: false,
            customEmoji: null,
            antiViewOnce: false,
            saveStatus: false,
            autoViewStatus: false,
            autoStatusReact: false,
            statusReactEmoji: null
        };
    }

    // Update group settings
    async updateGroupSettings(groupId, settings) {
        const currentSettings = this.getGroupSettings(groupId);
        const updatedSettings = { ...currentSettings, ...settings };
        this.groupSettings.set(groupId, updatedSettings);
        await this.saveGroupSettings();
        return updatedSettings;
    }    // Anti-delete message handler
    async handleDeletedMessage(sock, messageKey, originalMessage, ownerNumber) {
        try {
            const groupId = messageKey.remoteJid;
            const settings = this.getGroupSettings(groupId);
            
            if (!settings.antiDelete) return;

            // Store deleted message
            const deletedData = {
                messageKey,
                originalMessage,
                deletedAt: new Date(),
                sender: messageKey.participant || messageKey.remoteJid
            };

            this.deletedMessages.set(messageKey.id, deletedData);

            // Save to file
            const deletedFile = path.join(this.dataDir, 'deleted_messages', `${messageKey.id}.json`);
            await fs.writeJson(deletedFile, deletedData, { spaces: 2 });

            // Send anti-delete notification
            const messageType = Object.keys(originalMessage.message)[0];
            let messageContent = '';
            
            if (messageType === 'conversation') {
                messageContent = originalMessage.message.conversation;
            } else if (messageType === 'extendedTextMessage') {
                messageContent = originalMessage.message.extendedTextMessage.text;
            } else if (messageType === 'imageMessage') {
                messageContent = originalMessage.message.imageMessage.caption || '[Image]';
            } else if (messageType === 'videoMessage') {
                messageContent = originalMessage.message.videoMessage.caption || '[Video]';
            } else {
                messageContent = `[${messageType}]`;
            }

            const antiDeleteText = `🗑️ *Anti-Delete Alert* 🗑️

👤 *Sender:* @${deletedData.sender.split('@')[0]}
🕐 *Deleted at:* ${moment().format('DD/MM/YYYY HH:mm:ss')}
📝 *Message:* ${messageContent}
📍 *Group:* ${groupId.split('@')[0]}

💡 *Original message was deleted but DarkHeart saved it!*`;

            // Send to group
            await sock.sendMessage(groupId, {
                text: antiDeleteText,
                mentions: [deletedData.sender]
            });

            // Always send to bot owner (priority: passed ownerNumber, then detected bot number, then config)
            const targetOwner = ownerNumber || global.botNumber || require('../config').OWNER_NUMBER;
            if (targetOwner) {
                const ownerText = `🗑️ *Deleted Message Report* 🗑️

👤 *Sender:* ${deletedData.sender.split('@')[0]}
📍 *Group:* ${groupId.split('@')[0]}
🕐 *Time:* ${moment().format('DD/MM/YYYY HH:mm:ss')}
📝 *Content:* ${messageContent}

🖤 *DarkHeart Bot Auto-Report*`;

                try {
                    await sock.sendMessage(targetOwner, {
                        text: ownerText
                    });
                } catch (error) {
                    console.error('Error sending to owner:', error);
                }
            }

        } catch (error) {
            console.error('Error handling deleted message:', error);
        }
    }

    // Anti-link checker
    async checkAntiLink(sock, message, from) {
        try {
            const settings = this.getGroupSettings(from);
            if (!settings.antiLink || !Utils.isGroupChat(from)) return false;

            const messageText = this.extractMessageText(message);
            if (!messageText) return false;

            // Check for links
            const linkPatterns = [
                /https?:\/\/[^\s]+/gi,
                /www\.[^\s]+/gi,
                /[^\s]+\.(com|org|net|edu|gov|mil|int|co|io|me|tv|app|tk|ml|ga|cf|ly|bit\.ly|tinyurl|t\.co)/gi
            ];

            for (const pattern of linkPatterns) {
                if (pattern.test(messageText)) {
                    await sock.sendMessage(from, {
                        text: `🚫 *Anti-Link Protection* 🚫

❌ Links are not allowed in this group!
🔗 Detected link: ${messageText.match(pattern)[0]}

⚠️ Please remove the link or contact an admin.`,
                        quoted: message
                    });
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking anti-link:', error);
            return false;
        }
    }

    // Auto react with random decent emoji
    async autoReact(sock, messageKey, from, isOwner = false) {
        try {
            const settings = this.getGroupSettings(from);
            if (!settings.autoReact && !isOwner) return;

            let emoji;
            
            if (isOwner) {
                // Owner gets special reactions
                emoji = this.ownerReactions[Math.floor(Math.random() * this.ownerReactions.length)];
            } else if (settings.customEmoji) {
                // Use custom emoji if set
                emoji = settings.customEmoji;
            } else {
                // Use random decent emoji
                emoji = this.decentEmojis[Math.floor(Math.random() * this.decentEmojis.length)];
            }

            await sock.sendMessage(from, {
                react: {
                    text: emoji,
                    key: messageKey
                }
            });

        } catch (error) {
            console.error('Error auto reacting:', error);
        }
    }

    // Auto react based on emotion
    async emotionReact(sock, messageKey, from, messageText) {
        try {
            const settings = this.getGroupSettings(from);
            if (!settings.autoReact) return;

            const emotion = this.detectEmotion(messageText);
            if (!emotion) return;

            const emojis = this.emotionEmojis[emotion];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            await sock.sendMessage(from, {
                react: {
                    text: emoji,
                    key: messageKey
                }
            });

        } catch (error) {
            console.error('Error emotion reacting:', error);
        }
    }

    // Detect emotion in text
    detectEmotion(text) {
        const lowerText = text.toLowerCase();
        
        // Happy words
        if (/happy|joy|great|awesome|amazing|wonderful|fantastic|excellent|love|good|nice|cool|best/i.test(lowerText)) {
            return 'happy';
        }
        
        // Sad words
        if (/sad|cry|tears|hurt|pain|sorry|miss|lonely|depressed|upset/i.test(lowerText)) {
            return 'sad';
        }
        
        // Angry words
        if (/angry|mad|hate|stupid|idiot|damn|hell|wtf|annoying|frustrated/i.test(lowerText)) {
            return 'angry';
        }
        
        // Love words
        if (/love|heart|kiss|baby|honey|darling|sweetheart|beautiful|gorgeous/i.test(lowerText)) {
            return 'love';
        }
        
        // Funny words
        if (/lol|haha|funny|joke|laugh|comedy|hilarious|rofl|lmao/i.test(lowerText)) {
            return 'funny';
        }
        
        // Surprise words
        if (/wow|omg|amazing|incredible|unbelievable|shocking|surprise/i.test(lowerText)) {
            return 'surprise';
        }
        
        // Thinking words
        if (/think|maybe|probably|perhaps|wonder|question|confused|hmm/i.test(lowerText)) {
            return 'thinking';
        }
        
        // Cool words
        if (/cool|awesome|epic|fire|lit|dope|sick|beast|boss|king|queen/i.test(lowerText)) {
            return 'cool';
        }
        
        return null;
    }    // Anti-view once handler
    async handleViewOnce(sock, message, from) {
        try {
            const settings = this.getGroupSettings(from);
            if (!settings.antiViewOnce) return;

            const messageType = Object.keys(message.message)[0];
            const sender = message.key.participant || message.key.remoteJid;
            
            if (messageType === 'imageMessage' && message.message.imageMessage.viewOnce) {
                const imageBuffer = await sock.downloadMediaMessage(message);
                const filename = `viewonce_${Date.now()}.jpg`;
                
                await Utils.saveMediaFile(imageBuffer, filename, 'images');
                
                // Send to group
                await sock.sendMessage(from, {
                    image: imageBuffer,
                    caption: `👁️ *Anti-View Once* 👁️\n\n📸 Saved view-once image from @${sender.split('@')[0]}\n🕐 Time: ${moment().format('DD/MM/YYYY HH:mm:ss')}`,
                    mentions: [sender]
                });

                // Send to bot owner
                const targetOwner = global.botNumber || require('../config').OWNER_NUMBER;
                if (targetOwner) {
                    try {
                        await sock.sendMessage(targetOwner, {
                            image: imageBuffer,
                            caption: `👁️ *View-Once Image Saved* 👁️\n\n👤 *Sender:* ${sender.split('@')[0]}\n📍 *Group:* ${from.split('@')[0]}\n🕐 *Time:* ${moment().format('DD/MM/YYYY HH:mm:ss')}\n\n🤖 *DarkHeart Auto-Save*`
                        });
                    } catch (error) {
                        console.error('Error sending view-once to owner:', error);
                    }
                }
            }
            
            if (messageType === 'videoMessage' && message.message.videoMessage.viewOnce) {
                const videoBuffer = await sock.downloadMediaMessage(message);
                const filename = `viewonce_${Date.now()}.mp4`;
                
                await Utils.saveMediaFile(videoBuffer, filename, 'videos');
                
                // Send to group
                await sock.sendMessage(from, {
                    video: videoBuffer,
                    caption: `👁️ *Anti-View Once* 👁️\n\n🎥 Saved view-once video from @${sender.split('@')[0]}\n🕐 Time: ${moment().format('DD/MM/YYYY HH:mm:ss')}`,
                    mentions: [sender]
                });

                // Send to bot owner
                const targetOwner = global.botNumber || require('../config').OWNER_NUMBER;
                if (targetOwner) {
                    try {
                        await sock.sendMessage(targetOwner, {
                            video: videoBuffer,
                            caption: `👁️ *View-Once Video Saved* 👁️\n\n👤 *Sender:* ${sender.split('@')[0]}\n📍 *Group:* ${from.split('@')[0]}\n🕐 *Time:* ${moment().format('DD/MM/YYYY HH:mm:ss')}\n\n🤖 *DarkHeart Auto-Save*`
                        });
                    } catch (error) {
                        console.error('Error sending view-once to owner:', error);
                    }
                }
            }

        } catch (error) {
            console.error('Error handling view once:', error);
        }
    }// Auto view status handler
    async handleAutoViewStatus(sock, statusUpdate, ownerNumber) {
        try {
            const settings = this.getGroupSettings('global'); // Use global settings for status
            if (!settings.autoViewStatus) return;

            const sender = statusUpdate.key.participant || statusUpdate.key.remoteJid;
            const messageType = Object.keys(statusUpdate.message)[0];
            
            // Auto view the status
            await sock.readMessages([statusUpdate.key]);
            
            console.log(`👁️ Auto-viewed status from ${sender.split('@')[0]}`);

            // Always send notification to bot owner
            const targetOwner = ownerNumber || global.botNumber || require('../config').OWNER_NUMBER;
            if (targetOwner) {
                let content = '';
                if (messageType === 'conversation') {
                    content = statusUpdate.message.conversation;
                } else if (messageType === 'extendedTextMessage') {
                    content = statusUpdate.message.extendedTextMessage.text;
                } else if (messageType === 'imageMessage') {
                    content = statusUpdate.message.imageMessage.caption || '[Image]';
                } else if (messageType === 'videoMessage') {
                    content = statusUpdate.message.videoMessage.caption || '[Video]';
                } else {
                    content = `[${messageType}]`;
                }

                const statusViewText = `👁️ *Auto Status View* 👁️

👤 *User:* ${sender.split('@')[0]}
📝 *Content:* ${content}
🕐 *Time:* ${moment().format('DD/MM/YYYY HH:mm:ss')}

🤖 *Auto-viewed by DarkHeart Bot*`;

                try {
                    await sock.sendMessage(targetOwner, {
                        text: statusViewText
                    });
                } catch (error) {
                    console.error('Error sending status view notification to owner:', error);
                }
            }

        } catch (error) {
            console.error('Error auto viewing status:', error);
        }
    }

    // Auto react to status
    async handleAutoStatusReact(sock, statusUpdate) {
        try {
            const settings = this.getGroupSettings('global'); // Use global settings for status
            if (!settings.autoStatusReact) return;

            let emoji;
            
            if (settings.statusReactEmoji) {
                // Use custom status react emoji
                emoji = settings.statusReactEmoji;
            } else {
                // Use random decent emoji
                emoji = this.decentEmojis[Math.floor(Math.random() * this.decentEmojis.length)];
            }

            // React to the status
            await sock.sendMessage(statusUpdate.key.remoteJid, {
                react: {
                    text: emoji,
                    key: statusUpdate.key
                }
            });

            const sender = statusUpdate.key.participant || statusUpdate.key.remoteJid;            console.log(`😊 Auto-reacted to status from ${sender.split('@')[0]} with ${emoji}`);

        } catch (error) {
            console.error('Error auto reacting to status:', error);
        }
    }    // Save status handler
    async saveStatus(sock, statusUpdate) {
        try {
            const sender = statusUpdate.key.participant || statusUpdate.key.remoteJid;
            const messageType = Object.keys(statusUpdate.message)[0];
            
            const statusData = {
                sender,
                messageType,
                timestamp: new Date(),
                content: statusUpdate.message
            };

            // Save status data
            const statusFile = path.join(this.dataDir, 'saved_statuses', `status_${Date.now()}.json`);
            await fs.writeJson(statusFile, statusData, { spaces: 2 });

            // Download and save media if it's image/video
            if (messageType === 'imageMessage' || messageType === 'videoMessage') {
                try {
                    const mediaBuffer = await sock.downloadMediaMessage(statusUpdate);
                    const extension = messageType === 'imageMessage' ? 'jpg' : 'mp4';
                    const filename = `status_${Date.now()}.${extension}`;
                    const mediaType = messageType === 'imageMessage' ? 'images' : 'videos';
                    
                    await Utils.saveMediaFile(mediaBuffer, filename, mediaType);
                    statusData.savedMedia = filename;
                    
                    // Update status file with media info
                    await fs.writeJson(statusFile, statusData, { spaces: 2 });
                    
                } catch (mediaError) {
                    console.error('Error saving status media:', mediaError);
                }
            }

            console.log(`💾 Saved status from ${sender.split('@')[0]}`);

            // Send notification to bot owner
            const targetOwner = global.botNumber || require('../config').OWNER_NUMBER;
            if (targetOwner) {
                let content = '';
                if (messageType === 'conversation') {
                    content = statusUpdate.message.conversation;
                } else if (messageType === 'extendedTextMessage') {
                    content = statusUpdate.message.extendedTextMessage.text;
                } else if (messageType === 'imageMessage') {
                    content = statusUpdate.message.imageMessage.caption || '[Image Saved]';
                } else if (messageType === 'videoMessage') {
                    content = statusUpdate.message.videoMessage.caption || '[Video Saved]';
                } else {
                    content = `[${messageType} Saved]`;
                }

                const saveStatusText = `💾 *Status Saved* 💾

👤 *User:* ${sender.split('@')[0]}
📝 *Content:* ${content}
🕐 *Time:* ${moment().format('DD/MM/YYYY HH:mm:ss')}
📁 *File:* ${statusData.savedMedia || 'Text only'}

🤖 *Auto-saved by DarkHeart Bot*`;

                try {
                    await sock.sendMessage(targetOwner, {
                        text: saveStatusText
                    });
                } catch (error) {
                    console.error('Error sending status save notification to owner:', error);
                }
            }

            return true;

        } catch (error) {
            console.error('Error saving status:', error);
            return false;
        }
    }

    // Extract message text from various message types
    extractMessageText(message) {
        const messageType = Object.keys(message.message)[0];
        
        switch (messageType) {
            case 'conversation':
                return message.message.conversation;
            case 'extendedTextMessage':
                return message.message.extendedTextMessage.text;
            case 'imageMessage':
                return message.message.imageMessage.caption || '';
            case 'videoMessage':
                return message.message.videoMessage.caption || '';
            default:
                return '';
        }
    }    // Generate settings status text
    generateSettingsText(groupId) {
        const settings = this.getGroupSettings(groupId);
        const globalSettings = this.getGroupSettings('global');
        
        return `🖤 *DarkHeart Advanced Settings* 🖤

📝 *Group ID:* ${groupId === 'global' ? 'Global Settings' : groupId.split('@')[0]}

⚙️ *Group Settings:*
🗑️ Anti-Delete: ${settings.antiDelete ? '✅ ON' : '❌ OFF'}
🚫 Anti-Link: ${settings.antiLink ? '✅ ON' : '❌ OFF'}
😊 Auto React: ${settings.autoReact ? '✅ ON' : '❌ OFF'}
🎭 Custom Emoji: ${settings.customEmoji || '❌ Not Set'}
👁️ Anti-View Once: ${settings.antiViewOnce ? '✅ ON' : '❌ OFF'}

⚙️ *Global Settings:*
💾 Save Status: ${globalSettings.saveStatus ? '✅ ON' : '❌ OFF'}
👁️ Auto View Status: ${globalSettings.autoViewStatus ? '✅ ON' : '❌ OFF'}
😊 Auto Status React: ${globalSettings.autoStatusReact ? '✅ ON' : '❌ OFF'}
🎭 Status React Emoji: ${globalSettings.statusReactEmoji || '❌ Not Set'}

📋 *Available Commands:*
• !antidelete on/off
• !antilink on/off
• !autoreact on/off
• !customemoji <emoji>
• !antiviewonce on/off
• !savestatus on/off
• !autoviewstatus on/off
• !autostatusreact on/off
• !statusreactemoji <emoji>
• !settings - Show this menu

💡 *Note:* Status settings are global and apply to all contacts.`;
    }

    // Auto cleanup old messages (24 hours)
    async cleanupOldMessages() {
        try {
            const now = new Date();
            const cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000)); // 24 hours ago

            // Clean deleted messages from memory
            for (const [key, message] of this.deletedMessages) {
                if (new Date(message.deletedAt) < cutoffTime) {
                    this.deletedMessages.delete(key);
                    console.log(`🗑️ Cleaned up old deleted message: ${key}`);
                }
            }

            // Clean deleted statuses from memory
            for (const [key, status] of this.deletedStatuses) {
                if (new Date(status.deletedAt) < cutoffTime) {
                    this.deletedStatuses.delete(key);
                    console.log(`🗑️ Cleaned up old deleted status: ${key}`);
                }
            }

            // Clean deleted message files
            await this.cleanupDeletedMessageFiles(cutoffTime);

            // Clean saved status files
            await this.cleanupStatusFiles(cutoffTime);

            // Clean media files
            await this.cleanupMediaFiles(cutoffTime);

            console.log('✅ Auto cleanup completed - removed data older than 24 hours');

        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }

    // Clean up old deleted message files
    async cleanupDeletedMessageFiles(cutoffTime) {
        try {
            const deletedDir = path.join(this.dataDir, 'deleted_messages');
            if (!await fs.pathExists(deletedDir)) return;

            const files = await fs.readdir(deletedDir);
            let cleanedCount = 0;

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(deletedDir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime < cutoffTime) {
                        await fs.remove(filePath);
                        cleanedCount++;
                        console.log(`🗑️ Cleaned up old deleted message file: ${file}`);
                    }
                }
            }

            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned ${cleanedCount} deleted message files`);
            }
        } catch (error) {
            console.error('Error cleaning deleted message files:', error);
        }
    }

    // Clean up old status files
    async cleanupStatusFiles(cutoffTime) {
        try {
            const statusDir = path.join(this.dataDir, 'saved_statuses');
            if (!await fs.pathExists(statusDir)) return;

            const files = await fs.readdir(statusDir);
            let cleanedCount = 0;

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(statusDir, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime < cutoffTime) {
                        await fs.remove(filePath);
                        cleanedCount++;
                        console.log(`🗑️ Cleaned up old status file: ${file}`);
                    }
                }
            }

            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned ${cleanedCount} status files`);
            }
        } catch (error) {
            console.error('Error cleaning status files:', error);
        }
    }

    // Clean up old media files
    async cleanupMediaFiles(cutoffTime) {
        try {
            const mediaDir = path.join(__dirname, '..', 'media');
            const subDirs = ['deleted', 'status', 'temp'];
            let totalCleaned = 0;

            for (const subDir of subDirs) {
                const dirPath = path.join(mediaDir, subDir);
                if (!await fs.pathExists(dirPath)) continue;

                const files = await fs.readdir(dirPath);
                let cleanedCount = 0;
                
                for (const file of files) {
                    const filePath = path.join(dirPath, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime < cutoffTime) {
                        await fs.remove(filePath);
                        cleanedCount++;
                        console.log(`🗑️ Cleaned up old media file: ${subDir}/${file}`);
                    }
                }

                if (cleanedCount > 0) {
                    console.log(`🧹 Cleaned ${cleanedCount} files from ${subDir}/`);
                    totalCleaned += cleanedCount;
                }
            }

            if (totalCleaned > 0) {
                console.log(`🧹 Total media files cleaned: ${totalCleaned}`);
            }
        } catch (error) {
            console.error('Error cleaning media files:', error);
        }
    }

    // Start auto cleanup timer
    startAutoCleanup() {
        // Run cleanup every hour
        setInterval(() => {
            this.cleanupOldMessages();
        }, 60 * 60 * 1000); // 1 hour

        // Run initial cleanup on startup
        setTimeout(() => {
            this.cleanupOldMessages();
        }, 30000); // 30 seconds after startup

        console.log('🕐 Auto cleanup timer started (runs every hour, removes data older than 24h)');
    }

    // Manual cleanup command
    async manualCleanup() {
        console.log('🧹 Starting manual cleanup...');
        await this.cleanupOldMessages();
        return '✅ Manual cleanup completed! Old messages and media (24h+) have been deleted.';
    }

    // Get cleanup stats
    getCleanupStats() {
        const deletedCount = this.deletedMessages.size;
        const statusCount = this.deletedStatuses.size;
        
        return {
            deletedMessages: deletedCount,
            deletedStatuses: statusCount,
            lastCleanup: new Date().toISOString()
        };
    }
}

module.exports = AdvancedFeatures;