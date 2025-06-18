# DarkHeart WhatsApp Bot - Pterodactyl Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /home/container

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies when building the image (optional)
# RUN npm install --no-audit --no-fund

# Make the entrypoint script executable
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Copy the rest of the application
COPY . .

# Expose port if needed (adjust according to your needs)
EXPOSE 8080

# Use the entrypoint script as the command
CMD ["./entrypoint.sh"]
