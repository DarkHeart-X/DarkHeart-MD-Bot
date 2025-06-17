// DarkHeart Bot - Input Validators
// Validates user inputs and commands

class Validators {
    // Validate phone number
    static isValidPhoneNumber(number) {
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,15}$/;
        return phoneRegex.test(number.trim());
    }

    // Validate email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }

    // Validate URL
    static isValidUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    // Validate mathematical expression
    static isValidMathExpression(expression) {
        // Allow only numbers, operators, parentheses, and basic math functions
        const mathRegex = /^[0-9+\-*/.()%\s√sincotanlgexppow ]+$/i;
        
        if (!mathRegex.test(expression)) {
            return false;
        }

        // Check for balanced parentheses
        let balance = 0;
        for (const char of expression) {
            if (char === '(') balance++;
            if (char === ')') balance--;
            if (balance < 0) return false;
        }
        
        return balance === 0;
    }

    // Validate command length
    static isValidCommandLength(command, maxLength = 2000) {
        return command.length <= maxLength;
    }

    // Validate file size (in bytes)
    static isValidFileSize(size, maxSizeMB = 50) {
        const maxBytes = maxSizeMB * 1024 * 1024;
        return size <= maxBytes;
    }

    // Validate image file type
    static isValidImageType(filename) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    // Validate video file type
    static isValidVideoType(filename) {
        const validExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    // Validate audio file type
    static isValidAudioType(filename) {
        const validExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    // Validate document file type
    static isValidDocumentType(filename) {
        const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx'];
        const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
        return validExtensions.includes(extension);
    }

    // Sanitize user input
    static sanitizeInput(input, maxLength = 1000) {
        if (typeof input !== 'string') {
            return '';
        }

        return input
            .trim()
            .substring(0, maxLength)
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: URLs
            .replace(/data:/gi, ''); // Remove data: URLs
    }

    // Validate group name
    static isValidGroupName(name) {
        return name.length >= 3 && name.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(name);
    }

    // Validate username
    static isValidUsername(username) {
        return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username);
    }

    // Check for spam patterns
    static isSpam(message) {
        const spamPatterns = [
            /(.)\1{10,}/, // Repeated characters
            /https?:\/\/[^\s]+/gi, // Multiple URLs
            /(free|win|prize|money|cash|lottery|urgent|click|now)/gi // Spam keywords
        ];

        for (const pattern of spamPatterns) {
            if (pattern.test(message)) {
                return true;
            }
        }

        return false;
    }

    // Validate time format (HH:MM)
    static isValidTime(time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }

    // Validate date format (DD/MM/YYYY)
    static isValidDate(date) {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/;
        if (!dateRegex.test(date)) return false;

        const [day, month, year] = date.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        
        return dateObj.getFullYear() === year &&
               dateObj.getMonth() === month - 1 &&
               dateObj.getDate() === day;
    }

    // Validate coordinate (latitude/longitude)
    static isValidCoordinate(lat, lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        return !isNaN(latitude) && 
               !isNaN(longitude) && 
               latitude >= -90 && 
               latitude <= 90 && 
               longitude >= -180 && 
               longitude <= 180;
    }

    // Validate color hex code
    static isValidHexColor(color) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return hexRegex.test(color);
    }

    // Validate JSON string
    static isValidJSON(str) {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    }

    // Validate IP address
    static isValidIP(ip) {
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ip);
    }

    // Validate password strength
    static isStrongPassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongRegex.test(password);
    }

    // Check content safety
    static isSafeContent(content) {
        const unsafePatterns = [
            /violence|kill|murder|death/gi,
            /sexual|porn|adult|xxx/gi,
            /drug|cocaine|heroin|marijuana/gi,
            /hack|exploit|malware|virus/gi
        ];

        for (const pattern of unsafePatterns) {
            if (pattern.test(content)) {
                return false;
            }
        }

        return true;
    }

    // Validate command rate limit
    static isWithinRateLimit(userId, commandHistory, maxCommands = 10, timeWindowMinutes = 1) {
        const now = Date.now();
        const timeWindow = timeWindowMinutes * 60 * 1000;
        
        if (!commandHistory[userId]) {
            commandHistory[userId] = [];
        }

        // Remove old entries
        commandHistory[userId] = commandHistory[userId].filter(
            timestamp => now - timestamp < timeWindow
        );

        return commandHistory[userId].length < maxCommands;
    }

    // Validate file name
    static isValidFileName(filename) {
        const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
        const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
        
        return !invalidChars.test(filename) && 
               !reservedNames.test(filename) && 
               filename.length > 0 && 
               filename.length <= 255;
    }
}

module.exports = Validators;
