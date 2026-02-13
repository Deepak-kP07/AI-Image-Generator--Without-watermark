#!/bin/bash

# ==============================
# Configuration
# ==============================

IMAGE_NAME="kpdeepak/zopkit-ai"
CONTAINER_NAME="zopkit"
PORT="80:80"

echo "🚀 Starting deployment..."

# ==============================
# Pull latest image
# ==============================

echo "📦 Pulling latest Docker image..."
docker pull $IMAGE_NAME:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull image"
    exit 1
fi

# ==============================
# Stop & Remove Old Container
# ==============================

echo "🛑 Stopping old container..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# ==============================
# Run New Container
# ==============================

echo "▶️  Starting new container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $PORT \
  --restart unless-stopped \
  $IMAGE_NAME:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container"
    exit 1
fi

# ==============================
# Verify Container Running
# ==============================

sleep 3

if docker ps | grep -q $CONTAINER_NAME; then
    echo "✅ Deployment successful!"
    echo "🌐 App running at http://$(curl -s ifconfig.me)"
    docker ps | grep $CONTAINER_NAME
else
    echo "❌ Container failed to start"
    echo "📋 Checking logs..."
    docker logs $CONTAINER_NAME
    exit 1
fi

# ==============================
# Cleanup dangling images
# ==============================

echo "🧹 Cleaning unused images..."
docker image prune -f

echo "🎉 Deployment complete!"
