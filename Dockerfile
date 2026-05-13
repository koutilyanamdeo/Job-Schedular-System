# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client types (needed before TypeScript build)
# Prisma needs DATABASE_URL env var available at build time.
# Railway can inject env vars during build; if not present, set a placeholder.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate


# Build TypeScript
RUN npm run build


# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=build /app/dist ./dist

# Environment variables should be provided at runtime
ENV NODE_ENV=production

# Start the API
CMD ["node", "dist/index.js"]

