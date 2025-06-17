// DarkHeart Bot - Database Functions
// Handles all database operations and data persistence

const fs = require('fs-extra');
const path = require('path');

class Database {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.usersFile = path.join(this.dataDir, 'users.json');
        this.groupsFile = path.join(this.dataDir, 'groups.json');
        this.settingsFile = path.join(this.dataDir, 'bot_settings.json');
        this.logsFile = path.join(this.dataDir, 'logs.json');
        
        this.initDatabase();
    }

    // Initialize database files
    async initDatabase() {
        try {
            await fs.ensureDir(this.dataDir);
            
            // Initialize users file
            if (!await fs.pathExists(this.usersFile)) {
                await fs.writeJson(this.usersFile, {});
            }
            
            // Initialize groups file
            if (!await fs.pathExists(this.groupsFile)) {
                await fs.writeJson(this.groupsFile, {});
            }
            
            // Initialize settings file
            if (!await fs.pathExists(this.settingsFile)) {
                await fs.writeJson(this.settingsFile, {
                    maintenance: false,
                    totalCommands: 0,
                    totalUsers: 0,
                    totalGroups: 0
                });
            }
            
            // Initialize logs file
            if (!await fs.pathExists(this.logsFile)) {
                await fs.writeJson(this.logsFile, []);
            }
            
            console.log('✅ Database initialized successfully BY DarkHEARt 🖤');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
        }
    }

    // User management
    async getUser(userId) {
        try {
            const users = await fs.readJson(this.usersFile);
            return users[userId] || null;
        } catch (error) {
            console.error('Error reading user:', error);
            return null;
        }
    }

    async saveUser(userId, userData) {
        try {
            const users = await fs.readJson(this.usersFile);
            users[userId] = {
                ...userData,
                lastSeen: new Date(),
                userId: userId
            };
            await fs.writeJson(this.usersFile, users, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Error saving user:', error);
            return false;
        }
    }

    async updateUserStats(userId, command) {
        try {
            const user = await this.getUser(userId) || { commandsUsed: 0, commands: [] };
            user.commandsUsed = (user.commandsUsed || 0) + 1;
            user.commands = user.commands || [];
            user.commands.push({
                command: command,
                timestamp: new Date()
            });
            
            // Keep only last 50 commands
            if (user.commands.length > 50) {
                user.commands = user.commands.slice(-50);
            }
            
            await this.saveUser(userId, user);
            return true;
        } catch (error) {
            console.error('Error updating user stats:', error);
            return false;
        }
    }

    // Group management
    async getGroup(groupId) {
        try {
            const groups = await fs.readJson(this.groupsFile);
            return groups[groupId] || null;
        } catch (error) {
            console.error('Error reading group:', error);
            return null;
        }
    }

    async saveGroup(groupId, groupData) {
        try {
            const groups = await fs.readJson(this.groupsFile);
            groups[groupId] = {
                ...groupData,
                lastActivity: new Date(),
                groupId: groupId
            };
            await fs.writeJson(this.groupsFile, groups, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Error saving group:', error);
            return false;
        }
    }

    // Bot settings
    async getBotSettings() {
        try {
            return await fs.readJson(this.settingsFile);
        } catch (error) {
            console.error('Error reading bot settings:', error);
            return {};
        }
    }

    async updateBotSettings(settings) {
        try {
            const currentSettings = await this.getBotSettings();
            const updatedSettings = { ...currentSettings, ...settings };
            await fs.writeJson(this.settingsFile, updatedSettings, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Error updating bot settings:', error);
            return false;
        }
    }

    // Logging
    async addLog(logData) {
        try {
            const logs = await fs.readJson(this.logsFile);
            logs.push({
                ...logData,
                timestamp: new Date(),
                id: Date.now()
            });
            
            // Keep only last 1000 logs
            if (logs.length > 1000) {
                logs.splice(0, logs.length - 1000);
            }
            
            await fs.writeJson(this.logsFile, logs, { spaces: 2 });
            return true;
        } catch (error) {
            console.error('Error adding log:', error);
            return false;
        }
    }

    async getLogs(limit = 100) {
        try {
            const logs = await fs.readJson(this.logsFile);
            return logs.slice(-limit);
        } catch (error) {
            console.error('Error reading logs:', error);
            return [];
        }
    }

    // Statistics
    async getStats() {
        try {
            const users = await fs.readJson(this.usersFile);
            const groups = await fs.readJson(this.groupsFile);
            const settings = await this.getBotSettings();
            
            return {
                totalUsers: Object.keys(users).length,
                totalGroups: Object.keys(groups).length,
                totalCommands: settings.totalCommands || 0,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {};
        }
    }

    // Backup and restore
    async createBackup() {
        try {
            const backupDir = path.join(__dirname, '..', 'backups');
            await fs.ensureDir(backupDir);
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
            
            const backup = {
                users: await fs.readJson(this.usersFile),
                groups: await fs.readJson(this.groupsFile),
                settings: await fs.readJson(this.settingsFile),
                timestamp: new Date()
            };
            
            await fs.writeJson(backupFile, backup, { spaces: 2 });
            return backupFile;
        } catch (error) {
            console.error('Error creating backup:', error);
            return null;
        }
    }
}

module.exports = Database;
