FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S springmeet -u 1001
COPY --from=builder --chown=springmeet:nodejs /app/dist ./dist
COPY --from=builder --chown=springmeet:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=springmeet:nodejs /app/prisma ./prisma
COPY --from=builder --chown=springmeet:nodejs /app/package.json ./
RUN mkdir -p logs && chown springmeet:nodejs logs
USER springmeet
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
