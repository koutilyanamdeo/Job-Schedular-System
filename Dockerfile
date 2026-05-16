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

# Debug: verify dist output exists during build
RUN ls -la /app && ls -la /app/dist || (echo "dist not generated" && exit 1)


# ---- runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app


# Install only production deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled output (TypeScript output)
# Railway previously failed because /app/dist wasn't present; ensure build emits it.
COPY --from=build /app/dist ./dist

# Prisma client is generated during the build stage. The runtime install omits
# dev dependencies, so copy the generated client artifacts into production.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma


# Environment variables should be provided at runtime
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Start the API
# TypeScript build emits compiled JS into dist/src/*.js
CMD ["sh", "-c", "PORT=8080 node dist/src/index.js"]
