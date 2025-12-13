#!/bin/bash
# Run Docker containers with docker-compose

echo "🐳 Starting containers with docker-compose..."

# Check if containers are already running
if docker-compose ps | grep -q "Up"; then
    echo "⚠️  Containers already running. Stopping first..."
    docker-compose down
fi

# Start containers
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check status
docker-compose ps

# Show logs
echo ""
echo "📋 Application logs:"
docker-compose logs app | tail -20

echo ""
echo "✓ Containers started successfully!"
echo "🌐 Access application at: http://localhost:8080"
echo "📊 Swagger UI: http://localhost:8080/swagger-ui.html"
