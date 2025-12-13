#!/bin/bash
# Build Docker image script

echo "🐳 Building Docker image..."

IMAGE_NAME="inventory-app"
IMAGE_TAG="1.0.0"
FULL_IMAGE="$IMAGE_NAME:$IMAGE_TAG"

# Build image
docker build -t $FULL_IMAGE .

if [ $? -eq 0 ]; then
    echo "✓ Docker image built successfully: $FULL_IMAGE"
    docker images | grep inventory
else
    echo "✗ Docker build failed"
    exit 1
fi
