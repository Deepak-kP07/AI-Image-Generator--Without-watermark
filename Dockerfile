# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG API_KEY
ARG STABILITY_API_KEY
ARG HF_API_KEY

ENV API_KEY=$API_KEY
ENV STABILITY_API_KEY=$STABILITY_API_KEY
ENV HF_API_KEY=$HF_API_KEY

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

