# One image that contains the website and the server. Build:  docker build -t heritagehub .
# Run:  docker run -p 5000:5000 --env-file .env.production heritagehub
FROM node:20-alpine AS website
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client ./
ARG VITE_CONTACT_EMAIL=contact@yourdomain.com
ARG VITE_SITE_NAME=VirasatVault
ENV VITE_CONTACT_EMAIL=$VITE_CONTACT_EMAIL VITE_SITE_NAME=$VITE_SITE_NAME
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production SERVE_CLIENT=true
COPY server/package*.json server/
RUN cd server && npm ci --omit=dev
COPY server server
COPY --from=website /app/client/dist client/dist
RUN mkdir -p server/uploads && chown -R node:node /app
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:${PORT:-5000}/api/health || exit 1
CMD ["node", "server/src/index.js"]
