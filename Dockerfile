# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client types (needed before TypeScript build)
# Prisma requires DATABASE_URL during `prisma generate`.
# Railway may not provide DATABASE_URL at build-time, so we set a safe fallback.
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL:-"mysql://root:password@localhost:3306/JobSchedularSystem"}
RUN npx prisma generate



# Build TypeScript
RUN npm run build


# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app

# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output (TypeScript output)
# Railway previously failed because /app/dist wasn't present; ensure build emits it.
COPY --from=build /app/dist ./dist


# Environment variables should be provided at runtime
ENV NODE_ENV=production

# Start the API
CMD ["node", "dist/index.js"]

