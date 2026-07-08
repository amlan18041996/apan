FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

FROM base AS build
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup --system app && adduser --system --ingroup app app
COPY --from=build /app/.output ./.output
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
RUN chown -R app:app /app
USER app
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
