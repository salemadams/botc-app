FROM node:20-alpine

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

# Install all workspace dependencies, then add @expo/ngrok which is
# required for --tunnel mode but not in the project's package.json
# (it's a Docker-only concern, not needed for native dev builds)
RUN npm install && \
    npm install --workspace=client --save-dev @expo/ngrok@^4

# Copy source files after install to preserve the cache layer above
COPY shared/ ./shared/
COPY client/ ./client/

EXPOSE 8081
EXPOSE 19000
EXPOSE 19001

# Run expo from inside the client workspace directory
CMD ["sh", "-c", "cd /app/client && npx expo start --tunnel"]
