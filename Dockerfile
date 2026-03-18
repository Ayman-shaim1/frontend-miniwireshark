# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (--legacy-peer-deps for @tailwindcss/vite vs vite 8 conflict)
RUN npm ci --legacy-peer-deps


# Copy source and build
COPY . .

# Build args for API URLs (passed at build time for Vite)
ARG VITE_API_URL=http://localhost:8080/api
ARG VITE_SOCKET_URL=http://localhost:9092
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
