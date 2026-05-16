# ---- build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client types (needed before TypeScript build).
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

# Copy compiled output and Prisma files needed for runtime/migrations.
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Environment variables should be provided at runtime
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the API
CMD ["sh", "-c", "PORT=8080 node dist/src/index.js"]
