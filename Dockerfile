# Dockerfile - Multi-stage Next.js production build
# Otimizado para performance e segurança

FROM node:20-alpine AS builder

LABEL maintainer="Projeto Páginas do Comércio"
LABEL description="Next.js application with SEO, Deploy, and Security features"

WORKDIR /app

# Copiar dependências
COPY package*.json ./
RUN npm ci --only=production && \
    npm ci

# Copiar código-fonte
COPY . .

# Build da aplicação
RUN npm run build

# ===== Production Runtime =====
FROM node:20-alpine AS runner

WORKDIR /app

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Criar usuário non-root para segurança
RUN addgroup --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos necessários do build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Permissões corretas
RUN chown -R nextjs:nodejs /app

# Usuário non-root
USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

CMD ["node", "server.js"]
