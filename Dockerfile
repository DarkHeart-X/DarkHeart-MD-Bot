# DarkHeart WhatsApp Bot - Pterodactyl Dockerfile
FROM node:18-alpine

# Install required system packages
RUN apk add --no-cache bash git curl

# Set working directory
WORKDIR /home/container

# Copy package files first for better caching
COPY package.json ./

# Pre-install dependencies to create a layer in the Docker image
# Comment this line out ONLY if causing problems with Pterodactyl
RUN npm install --production --no-audit --no-fund

# Make the entrypoint script executable
COPY entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

# Copy the rest of the application
COPY . .

# Create necessary directories
RUN mkdir -p data/sessions media/images media/audio

# Expose port if needed (adjust according to your needs)
EXPOSE 8080

# Set environment variables to help with installation
ENV NODE_ENV=production
ENV PATH=$PATH:/home/container/node_modules/.bin

# Use the entrypoint script as the command
ENTRYPOINT ["bash", "entrypoint.sh"]
