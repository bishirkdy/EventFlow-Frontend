FROM node:24-alpine AS build

WORKDIR /app
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build -- --configuration production

# ---------- Runtime stage ----------
FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4200

COPY --from=build /app/dist/eventflow-frontend ./dist/eventflow-frontend

EXPOSE 4200

CMD ["node", "dist/eventflow-frontend/server/server.mjs"]