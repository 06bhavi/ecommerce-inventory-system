#!/bin/bash
echo "=========================================="
echo "Application Logs Monitoring"
echo "=========================================="

# Jenkins logs
echo "📋 Jenkins logs:"
docker logs jenkins-devops | tail -20

echo ""
echo "=========================================="

# Application logs
echo "📋 Application logs:"
docker-compose logs app | tail -30

echo ""
echo "=========================================="

# MySQL logs
echo "📋 MySQL logs:"
docker-compose logs mysql | tail -20

echo ""
echo "=========================================="

# System logs
echo "📋 System resource usage:"
docker stats --no-stream

echo ""
echo "=========================================="

# Network status
echo "📋 Container network status:"
docker network ls
docker network inspect inventory-network

echo ""
echo "✅ Logs monitoring complete!"
