# Use Node.js 20 with glibc for uWebSockets.js compatibility
FROM node:20-slim

# Install system dependencies for uWebSockets.js
RUN apt-get update && apt-get install -y \
    libc6 \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables for Railway WebSocket support
ENV PORT=8000
ENV HOST=0.0.0.0

# Set working directory
WORKDIR /app

# Copy package files (use Railway-safe version)
COPY package.railway.json package.json
COPY package-lock.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build the project
RUN npm run railway:build

# Remove dev dependencies after build to reduce image size
RUN npm prune --production

# Expose port (Railway will provide PORT env variable)
EXPOSE ${PORT:-8000}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT:-8000}/stats.json', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]