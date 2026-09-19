# ── Budowa klienta (React/Vite) ──────────────────────────────────────────────
FROM node:22-bookworm-slim AS client
WORKDIR /app/client
COPY client/package.json ./
RUN npm install --no-audit --no-fund
COPY client/ ./
# Pusty VITE_API_URL = klient pyta ten sam serwer, z którego się załadował.
# (client/.env.production trzyma adres dla aplikacji Capacitor i nadpisałby to w buildzie web.)
ENV VITE_API_URL=
RUN npm run build

# ── Serwer gry ───────────────────────────────────────────────────────────────
FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY server/package.json server/
RUN cd server && npm install --omit=dev --no-audit --no-fund
COPY server/src server/src
COPY server/margonem.sql server/margonem.sql
COPY --from=client /app/client/dist client/dist
# Grafiki gry (/assets) montowane jako wolumen: /app/original/MAEGONEM_pliki
EXPOSE 3002
USER node
CMD ["node", "server/src/index.js"]
