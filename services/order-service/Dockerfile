# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test

# Stage 2: Production Minimal Image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source
COPY --chown=node:node src/ ./src/

USER node
EXPOSE 3000

CMD ["node", "src/index.js"]
