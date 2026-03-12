# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Backend deps
COPY package*.json ./
RUN npm ci

# Frontend deps
COPY frontend/package*.json frontend/
RUN cd frontend && npm ci

# Source code
COPY tsconfig.json ./
COPY src ./src
COPY frontend ./frontend

# Build frontend static export to frontend/out
RUN cd frontend && npm run build

# Build backend (outputs dist/server.js)
RUN npm run build


# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install only production deps for backend
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/frontend/out ./frontend/out

# Optional: keep example env for reference
COPY .env.example .env.example

EXPOSE 7026
CMD ["node", "dist/server.js"]
