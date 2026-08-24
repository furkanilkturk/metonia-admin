# syntax=docker/dockerfile:1
# The build context must contain a Bun lockfile. Run `bun install` before building this image.
FROM oven/bun:1.4.0 AS dependencies
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM dependencies AS build
COPY . ./
RUN bun run build

FROM oven/bun:1.4.0 AS production-dependencies
WORKDIR /app
COPY package.json bun.lock ./
# Build-time prepare hooks require development tools. The runtime stage has no such tools.
RUN bun install --frozen-lockfile --production --ignore-scripts

# adapter-node emits a standalone server in build/. Keep the production runtime on Node LTS.
FROM node:24.19.0-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build

USER node
EXPOSE 3000
CMD ["node", "build"]
