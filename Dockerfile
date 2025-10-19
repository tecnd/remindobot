# Dockerfile
FROM node:20-alpine

# Install build dependencies for sqlite3
RUN apk add sqlite

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN npm ci --only=production

# Install dev dependencies for building TypeScript
RUN npm install --save-dev typescript @types/node

# Build TypeScript
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Create volume for persistent database (if using file-based SQLite)
VOLUME ["/app/data"]

# Run the bot
CMD ["node", "dist/index.js"]
