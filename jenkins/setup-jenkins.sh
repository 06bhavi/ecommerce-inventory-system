#!/bin/bash
# Setup Jenkins locally for DevOps pipeline

echo "=========================================="
echo "Jenkins Setup Script"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "✗ Docker is not installed. Please install Docker first."
    exit 1
fi

# Run Jenkins container
echo "🚀 Starting Jenkins container..."

docker run -d \
    --name jenkins-devops \
    -p 8081:8080 \
    -p 50000:50000 \
    -v jenkins_home:/var/jenkins_home \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -e JAVA_OPTS="-Xmx1024m" \
    jenkins/jenkins:lts

echo "⏳ Waiting for Jenkins to start..."
sleep 10

# Get initial admin password
echo ""
echo "=========================================="
echo "Jenkins is starting..."
echo "Access URL: http://localhost:8081"
echo "=========================================="

# Wait for Jenkins to be ready and show initial password
docker logs jenkins-devops | grep "initialAdminPassword" || echo "Jenkins is initializing..."

sleep 20

# Try to get password from logs
JENKINS_PASSWORD=$(docker exec jenkins-devops cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null)

if [ -z "$JENKINS_PASSWORD" ]; then
    echo "⏳ Jenkins still initializing. Check logs in a moment..."
    echo "docker logs -f jenkins-devops"
else
    echo ""
    echo "🔐 Jenkins Initial Admin Password:"
    echo "$JENKINS_PASSWORD"
    echo ""
    echo "📝 Next steps:"
    echo "1. Open http://localhost:8081 in browser"
    echo "2. Enter the password above"
    echo "3. Install suggested plugins"
    echo "4. Create admin user"
fi

echo ""
echo "View logs with: docker logs -f jenkins-devops"
echo "Stop Jenkins with: docker stop jenkins-devops"
echo "Remove Jenkins with: docker rm -v jenkins-devops"
