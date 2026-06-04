# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: builder — compile the React app
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package*.json ./

# Install ALL dependencies (including devDeps needed for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build optimized production bundle
# REACT_APP_API_URL is injected at build time via --build-arg
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build


# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: final — serve with Nginx (tiny, ~22MB image)
# ──────────────────────────────────────────────────────────────────────────────
FROM nginx:1.25-alpine AS final

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx config (handles React Router client-side routing)
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy the built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
