# Stage 1: Build
# Build stage for creating the production build
FROM node:20-alpine AS build 

WORKDIR /app

# Copy the package files
COPY package.json package-lock.json ./
 # Install dependencies
RUN npm ci 

 # Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build 


# Stage 2: Serve
# Serve stage for running the production build
FROM nginx:alpine 

# Copy the production build to the nginx server
COPY --from=build /app/dist /usr/share/nginx/html 
# Copy the nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80

# Start the nginx server
CMD ["nginx", "-g", "daemon off;"] 
