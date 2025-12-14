#!/bin/bash
echo "=========================================="
echo "System Health Check"
echo "=========================================="

# Application health
echo "🔍 Checking Application..."
if curl -f http://localhost:8080/api/v1/products/health > /dev/null 2>&1; then
    echo "✅ Application is UP"
else
    echo "❌ Application is DOWN"
fi

# MySQL health
echo ""
echo "🔍 Checking MySQL..."
if docker-compose exec mysql mysqladmin ping -u root -proot123 > /dev/null 2>&1; then
    echo "✅ MySQL is UP"
else
    echo "❌ MySQL is DOWN"
fi

# Jenkins health
echo ""
echo "🔍 Checking Jenkins..."
if curl -f http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Jenkins is UP"
else
    echo "❌ Jenkins is DOWN"
fi

# Docker containers
echo ""
echo "🔍 Checking Docker containers..."
docker-compose ps

echo ""
echo "=========================================="
echo "✅ Health check complete!"
echo "=========================================="
