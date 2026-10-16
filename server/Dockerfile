
# Stage 1: Build the backend
FROM node:24-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Prisma CLI requires DATABASE_URL while loading prisma.config.ts.
# This placeholder is only for building the image.
RUN DATABASE_URL="postgresql://postgres:build-only-password@localhost:5432/bdms_db" npx prisma generate

RUN npm run build


# Stage 2: Production runtime
FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated/prisma ./src/generated/prisma
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 5000

CMD ["npm", "start"]
