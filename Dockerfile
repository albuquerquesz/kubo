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
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN bun install --frozen-lockfile --ignore-scripts
RUN cd apps/web && bun x fumadocs-mdx && cd ../.. && bun run build:web

FROM node:22-slim
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app /app
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["node", "node_modules/next/dist/bin/next", "start", "--port", "3000", "--hostname", "0.0.0.0"]
