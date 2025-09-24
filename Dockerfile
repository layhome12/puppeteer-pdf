# Node.js 18 slim
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependency Puppeteer/Chromium
RUN apt-get update && apt-get install -y \
    wget \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json, package-lock.json
COPY package*.json ./

# Install App
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Run app
CMD ["npm", "start"]
