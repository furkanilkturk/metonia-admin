# syntax=docker/dockerfile:1
# The build context must contain the selected package manager's lockfile.
FROM {{BUILD_IMAGE}} AS package-manager
WORKDIR /app
{{SETUP_COMMANDS}}

FROM package-manager AS dependencies
COPY {{DEPENDENCY_FILES}} ./
RUN {{INSTALL_COMMAND}}

FROM dependencies AS build
COPY . ./
RUN {{BUILD_COMMAND}}

FROM package-manager AS production-dependencies
WORKDIR /app
COPY {{DEPENDENCY_FILES}} ./
# Build-time prepare hooks require development tools. The runtime stage has no such tools.
RUN {{PRODUCTION_INSTALL_COMMAND}}

# Apply reviewed SQL with production dependencies only; no package-manager CLI or dev toolchain is
# required at runtime.
FROM node:24.19.0-bookworm-slim AS migration
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node drizzle ./drizzle
COPY --chown=node:node scripts/docker-migrate.mjs ./scripts/docker-migrate.mjs
USER node
CMD ["node", "scripts/docker-migrate.mjs"]

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
