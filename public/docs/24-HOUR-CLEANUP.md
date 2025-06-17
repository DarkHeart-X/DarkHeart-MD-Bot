# DarkHeart Bot - 24-Hour Auto Cleanup Feature

## 🕐 **24-Hour Message Deletion Policy**

**YES, messages are automatically deleted after 24 hours!** The DarkHeart Bot implements a comprehensive privacy-first auto-cleanup system.

### ✅ **What Gets Auto-Deleted After 24 Hours:**

1. **🗑️ Deleted Messages**
   - Saved deleted messages in memory
   - Deleted message JSON files in `data/deleted_messages/`
   - Screenshots/media from deleted messages

2. **📱 Status Data**
   - Saved status updates in `data/saved_statuses/`
   - Downloaded status media files
   - Status viewing logs

3. **📁 Media Files**
   - Files in `media/deleted/` folder
   - Files in `media/status/` folder  
   - Temporary files in `media/temp/`

### ⚙️ **Auto-Cleanup System:**

- **⏰ Frequency:** Runs every hour automatically
- **📅 Retention:** 24 hours maximum
- **🔄 Startup:** Initial cleanup 30 seconds after bot starts
- **🧹 Manual:** `!cleanup` command for immediate cleanup

### 🛡️ **Privacy Protection:**

```javascript
// Auto cleanup runs every hour
setInterval(() => {
    this.cleanupOldMessages();
}, 60 * 60 * 1000); // 1 hour

// Deletes data older than 24 hours
const cutoffTime = new Date(now.getTime() - (24 * 60 * 60 * 1000));
```

### 📊 **Commands for Cleanup Management:**

| Command | Access | Description |
|---------|---------|-------------|
| `!cleanup` | Admin/Owner | Force immediate cleanup |
| `!cleanupstats` | Admin/Owner | View cleanup statistics |
| `!settings` | Admin/Owner | View all feature settings |

### 🔧 **Implementation Details:**

1. **Memory Cleanup:** Removes data from bot's active memory
2. **File Cleanup:** Deletes physical files from disk
3. **Media Cleanup:** Removes downloaded images/videos
4. **Database Cleanup:** Clears JSON storage files

### 📈 **Cleanup Statistics:**

The bot tracks:
- Number of deleted messages cleaned
- Number of status files removed
- Total media files deleted
- Disk space freed
- Last cleanup timestamp

### 🖤 **Privacy-First Design:**

- **Default OFF:** All features start disabled
- **24-Hour Max:** No permanent data storage
- **Auto-Delete:** Hourly cleanup maintenance
- **Owner Control:** Bot owner receives all notifications
- **Secure Deletion:** Complete file removal from disk

## 💡 **Summary:**

**The DarkHeart Bot automatically deletes ALL saved messages, statuses, and media after 24 hours.** This ensures:

✅ **Privacy Protection** - No long-term data retention  
✅ **Storage Management** - Prevents disk space issues  
✅ **Legal Compliance** - Automatic data deletion  
✅ **Security** - Minimizes data exposure risk  

The bot prioritizes user privacy by implementing automatic data destruction after 24 hours!
