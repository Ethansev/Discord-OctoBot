ARG NODE_VERSION=24-alpine

# ---------- builder ----------
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ---------- runtime ----------
FROM node:${NODE_VERSION} AS runtime

ENV NODE_ENV=production

WORKDIR /app

# ffmpeg is required by discord-player when FF_MUSIC is enabled.
RUN apk add --no-cache ffmpeg

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY media ./media
COPY prompts ./prompts

RUN addgroup -S bot && adduser -S bot -G bot \
    && chown -R bot:bot /app
USER bot

CMD ["node", "dist/index.js"]
