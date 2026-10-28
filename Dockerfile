# Web app (apps/web) image for Guara Cloud. Built from the monorepo root because
# the web build depends on workspace packages (types, template-generator, backend...).
FROM oven/bun:1.3.13 AS bun

FROM node:22-slim AS build
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_CONVEX_SITE_URL
ARG NEXT_PUBLIC_HIMETRICA_API_KEY
ARG NOTIFIQUE_API_KEY
ARG NOTIFIQUE_BASE_URL
ARG NOTIFIQUE_FROM_EMAIL
ARG NOTIFIQUE_NEWSLETTER_LIST_ID
ARG SKIP_ENV_VALIDATION
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT_STANDALONE=1

COPY . .
RUN bun install --frozen-lockfile --ignore-scripts
RUN cd apps/web && bun x fumadocs-mdx && cd ../.. && bun run build:web

# Runtime ships only Next's traced standalone server plus static assets.
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
