FROM node:20-alpine

WORKDIR /app

# Copy workspace manifests first — Docker caches this layer and skips
# re-running npm install on rebuilds if these files haven't changed
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/

# Install all workspace dependencies from the monorepo root
RUN npm install

# Copy source files after install to preserve the cache layer above
COPY shared/ ./shared/
COPY server/ ./server/

EXPOSE 4000

CMD ["npm", "run", "server"]
