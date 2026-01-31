# ----------- Builder Stage -----------
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source code
COPY . .

# Build TypeScript
RUN npm run build


# ----------- Production Stage -----------
FROM node:18-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Copy package files and install only prod dependencies
COPY package*.json ./
RUN npm ci --ignore-scripts

# Copy built files from builder
COPY --from=builder /app/dist ./

# Expose port
EXPOSE 5500

# Run server (matches your structure: dist/src/server.js)
CMD ["node", "src/server.js"]
