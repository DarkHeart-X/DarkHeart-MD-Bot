// DarkHeart Bot - Command Handlers
// Handles all advanced feature commands

const AdvancedFeatures = require('./advancedFeatures');
const Utils = require('./utils');
const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');

class CommandHandlers {
    constructor(advancedFeatures) {
        this.advancedFeatures = advancedFeatures;
    }

    // Handle anti-delete command
    async handleAntiDelete(sock, from, args, isAdmin = false) {
        if (!isAdmin) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly group admins can change anti-delete settings.'
            });
            return;
        }

        if (!Utils.isGroupChat(from)) {
            await sock.sendMessage(from, {
                text: '❌ This command only works in groups!'
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            await sock.sendMessage(from, {
                text: '🗑️ *Anti-Delete Settings* 🗑️\n\n📝 Usage: !antidelete on/off\n\n💡 When enabled, deleted messages will be restored.'
            });
            return;
        }

        const isEnabled = action === 'on';
        await this.advancedFeatures.updateGroupSettings(from, { antiDelete: isEnabled });

        await sock.sendMessage(from, {
            text: `🗑️ *Anti-Delete ${isEnabled ? 'Enabled' : 'Disabled'}* 🗑️\n\n${isEnabled ? '✅ Deleted messages will now be restored!' : '❌ Deleted messages will no longer be restored.'}`
        });
    }

    // Handle anti-link command
    async handleAntiLink(sock, from, args, isAdmin = false) {
        if (!isAdmin) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly group admins can change anti-link settings.'
            });
            return;
        }

        if (!Utils.isGroupChat(from)) {
            await sock.sendMessage(from, {
                text: '❌ This command only works in groups!'
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            await sock.sendMessage(from, {
                text: '🚫 *Anti-Link Settings* 🚫\n\n📝 Usage: !antilink on/off\n\n💡 When enabled, links will be automatically detected and warned.'
            });
            return;
        }

        const isEnabled = action === 'on';
        await this.advancedFeatures.updateGroupSettings(from, { antiLink: isEnabled });

        await sock.sendMessage(from, {
            text: `🚫 *Anti-Link ${isEnabled ? 'Enabled' : 'Disabled'}* 🚫\n\n${isEnabled ? '✅ Links will now be detected and warned!' : '❌ Links will no longer be detected.'}`
        });
    }

    // Handle auto react command
    async handleAutoReact(sock, from, args, isAdmin = false) {
        if (!isAdmin) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly group admins can change auto react settings.'
            });
            return;
        }

        if (!Utils.isGroupChat(from)) {
            await sock.sendMessage(from, {
                text: '❌ This command only works in groups!'
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            await sock.sendMessage(from, {
                text: '😊 *Auto React Settings* 😊\n\n📝 Usage: !autoreact on/off\n\n💡 When enabled, bot will automatically react to messages with random emojis.'
            });
            return;
        }

        const isEnabled = action === 'on';
        await this.advancedFeatures.updateGroupSettings(from, { autoReact: isEnabled });

        await sock.sendMessage(from, {
            text: `😊 *Auto React ${isEnabled ? 'Enabled' : 'Disabled'}* 😊\n\n${isEnabled ? '✅ Bot will now automatically react to messages!' : '❌ Bot will no longer auto react.'}`
        });
    }

    // Handle custom emoji command
    async handleCustomEmoji(sock, from, args, isAdmin = false) {
        if (!isAdmin) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly group admins can set custom emoji.'
            });
            return;
        }

        if (!Utils.isGroupChat(from)) {
            await sock.sendMessage(from, {
                text: '❌ This command only works in groups!'
            });
            return;
        }

        const emoji = args[0];
        
        if (!emoji) {
            await sock.sendMessage(from, {
                text: '🎭 *Custom Emoji Settings* 🎭\n\n📝 Usage: !customemoji <emoji>\n\n💡 Set a custom emoji for auto reactions.\n\nExample: !customemoji 🖤'
            });
            return;
        }

        // Reset custom emoji if "reset" or "remove" is passed
        if (['reset', 'remove', 'clear'].includes(emoji.toLowerCase())) {
            await this.advancedFeatures.updateGroupSettings(from, { customEmoji: null });
            await sock.sendMessage(from, {
                text: '🎭 *Custom Emoji Reset* 🎭\n\n✅ Custom emoji has been removed. Bot will use random emojis.'
            });
            return;
        }

        await this.advancedFeatures.updateGroupSettings(from, { customEmoji: emoji });

        await sock.sendMessage(from, {
            text: `🎭 *Custom Emoji Set* 🎭\n\n✅ Custom emoji set to: ${emoji}\n\n💡 Bot will now use this emoji for auto reactions!`
        });
    }

    // Handle anti-view once command
    async handleAntiViewOnce(sock, from, args, isAdmin = false) {
        if (!isAdmin) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly group admins can change anti-view once settings.'
            });
            return;
        }

        if (!Utils.isGroupChat(from)) {
            await sock.sendMessage(from, {
                text: '❌ This command only works in groups!'
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            await sock.sendMessage(from, {
                text: '👁️ *Anti-View Once Settings* 👁️\n\n📝 Usage: !antiviewonce on/off\n\n💡 When enabled, view-once messages will be saved and shared.'
            });
            return;
        }

        const isEnabled = action === 'on';
        await this.advancedFeatures.updateGroupSettings(from, { antiViewOnce: isEnabled });

        await sock.sendMessage(from, {
            text: `👁️ *Anti-View Once ${isEnabled ? 'Enabled' : 'Disabled'}* 👁️\n\n${isEnabled ? '✅ View-once messages will now be saved!' : '❌ View-once messages will no longer be saved.'}`
        });
    }    // Handle save status command
    async handleSaveStatus(sock, from, args, isOwner = false) {
        if (!isOwner) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can change status saving settings.'
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            await sock.sendMessage(from, {
                text: '💾 *Save Status Settings* 💾\n\n📝 Usage: !savestatus on/off\n\n💡 When enabled, all statuses will be automatically saved.'
            });
            return;
        }

        const isEnabled = action === 'on';
        await this.advancedFeatures.updateGroupSettings('global', { saveStatus: isEnabled });

        await sock.sendMessage(from, {
            text: `💾 *Save Status ${isEnabled ? 'Enabled' : 'Disabled'}* 💾\n\n${isEnabled ? '✅ Statuses will now be automatically saved!' : '❌ Statuses will no longer be saved.'}`
        });
    }

    // Handle auto view status command
    async handleAutoViewStatus(sock, from, args, isOwner = false) {
        if (!isOwner) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can change auto view status settings.'
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            await sock.sendMessage(from, {
                text: '👁️ *Auto View Status Settings* 👁️\n\n📝 Usage: !autoviewstatus on/off\n\n💡 When enabled, all statuses will be automatically viewed.'
            });
            return;
        }

        const isEnabled = action === 'on';
        await this.advancedFeatures.updateGroupSettings('global', { autoViewStatus: isEnabled });

        await sock.sendMessage(from, {
            text: `👁️ *Auto View Status ${isEnabled ? 'Enabled' : 'Disabled'}* 👁️\n\n${isEnabled ? '✅ Statuses will now be automatically viewed!' : '❌ Statuses will no longer be auto-viewed.'}`
        });
    }

    // Handle auto status react command
    async handleAutoStatusReact(sock, from, args, isOwner = false) {
        if (!isOwner) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can change auto status react settings.'
            });
            return;
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || !['on', 'off'].includes(action)) {
            await sock.sendMessage(from, {
                text: '😊 *Auto Status React Settings* 😊\n\n📝 Usage: !autostatusreact on/off\n\n💡 When enabled, bot will automatically react to all statuses.'
            });
            return;
        }

        const isEnabled = action === 'on';
        await this.advancedFeatures.updateGroupSettings('global', { autoStatusReact: isEnabled });

        await sock.sendMessage(from, {
            text: `😊 *Auto Status React ${isEnabled ? 'Enabled' : 'Disabled'}* 😊\n\n${isEnabled ? '✅ Bot will now automatically react to statuses!' : '❌ Bot will no longer auto react to statuses.'}`
        });
    }

    // Handle status react emoji command
    async handleStatusReactEmoji(sock, from, args, isOwner = false) {
        if (!isOwner) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can set status react emoji.'
            });
            return;
        }

        const emoji = args[0];
        
        if (!emoji) {
            await sock.sendMessage(from, {
                text: '🎭 *Status React Emoji Settings* 🎭\n\n📝 Usage: !statusreactemoji <emoji>\n\n💡 Set a custom emoji for status reactions.\n\nExample: !statusreactemoji 🖤'
            });
            return;
        }

        // Reset custom emoji if "reset" or "remove" is passed
        if (['reset', 'remove', 'clear'].includes(emoji.toLowerCase())) {
            await this.advancedFeatures.updateGroupSettings('global', { statusReactEmoji: null });
            await sock.sendMessage(from, {
                text: '🎭 *Status React Emoji Reset* 🎭\n\n✅ Custom status react emoji has been removed. Bot will use random emojis.'
            });
            return;
        }

        await this.advancedFeatures.updateGroupSettings('global', { statusReactEmoji: emoji });

        await sock.sendMessage(from, {
            text: `🎭 *Status React Emoji Set* 🎭\n\n✅ Status react emoji set to: ${emoji}\n\n💡 Bot will now use this emoji for status reactions!`
        });
    }

    // Handle settings command
    async handleSettings(sock, from) {
        if (!Utils.isGroupChat(from)) {
            await sock.sendMessage(from, {
                text: '❌ This command only works in groups!'
            });
            return;
        }

        const settingsText = this.advancedFeatures.generateSettingsText(from);
        await sock.sendMessage(from, { text: settingsText });
    }

    // Handle owner react command
    async handleOwnerReact(sock, from, args, messageKey) {
        const emoji = args[0] || '👑';
        
        await sock.sendMessage(from, {
            react: {
                text: emoji,
                key: messageKey
            }
        });

        await sock.sendMessage(from, {
            text: `👑 *Owner Reaction* 👑\n\n✅ Reacted with: ${emoji}`
        });
    }

    // Handle view saved statuses
    async handleViewSavedStatuses(sock, from, isOwner = false) {
        if (!isOwner) {
            await sock.sendMessage(from, {
                text: '🚫 *Access Denied* 🚫\n\nOnly bot owner can view saved statuses.'
            });
            return;
        }

        try {
            const statusDir = path.join(__dirname, '..', 'data', 'saved_statuses');
            const files = await fs.readdir(statusDir);
            
            if (files.length === 0) {
                await sock.sendMessage(from, {
                    text: '💾 *Saved Statuses* 💾\n\n❌ No statuses saved yet.'
                });
                return;
            }

            const recentFiles = files.slice(-10); // Show last 10
            let statusText = '💾 *Recent Saved Statuses* 💾\n\n';
            
            for (const file of recentFiles) {
                try {
                    const statusData = await fs.readJson(path.join(statusDir, file));
                    const sender = statusData.sender.split('@')[0];
                    const time = moment(statusData.timestamp).format('DD/MM HH:mm');
                    statusText += `📄 ${sender} - ${time}\n`;
                } catch (error) {
                    console.error('Error reading status file:', error);
                }
            }

            statusText += `\n📊 Total saved: ${files.length} statuses`;

            await sock.sendMessage(from, { text: statusText });

        } catch (error) {
            console.error('Error viewing saved statuses:', error);
            await sock.sendMessage(from, {
                text: '❌ Error accessing saved statuses.'
            });
        }
    }
}

module.exports = CommandHandlers;