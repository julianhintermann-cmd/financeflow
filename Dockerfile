# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ ./
RUN npx tsc

# Stage 3: Production
FROM node:20-alpine
WORKDIR /app

COPY --from=backend-build /app/backend/package.json /app/backend/package-lock.json* ./backend/
WORKDIR /app/backend
RUN npm install --omit=dev

WORKDIR /app
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

RUN mkdir -p /app/data/uploads /app/data/Monatsreport /app/data/reports

ENV NODE_ENV=production
ENV DATA_DIR=/app/data
ENV PORT=3000

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]
