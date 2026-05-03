# Dockerfile
FROM node:20-alpine

# Native module (better-sqlite3) build toolchain
RUN apk add --no-cache python3 make g++

ENV SQLITE_PATH=/app/data/reminder.db

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN npm ci --only=production

# Install dev dependencies for building TypeScript
RUN npm install --save-dev typescript @types/node @types/better-sqlite3

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create volume for persistent database (if using file-based SQLite)
VOLUME ["/app/data"]

# Run the bot
CMD ["node", "dist/index.js"]
