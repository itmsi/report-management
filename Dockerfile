# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps && npm cache clean --force

# Copy application code
COPY . .

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app /app

# Create necessary directories
RUN mkdir -p logs public storages

# Expose port (default 9604, bisa diubah via environment variable)
EXPOSE 9604

# Start application
CMD ["node", "--require", "./src/instrumentation.js", "src/server.js"]

