#!/bin/bash
# Maven build script for DevOps workflow

echo "=========================================="
echo "Maven Build Script"
echo "=========================================="

PROJECT_DIR=$(pwd)
BUILD_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="build_${BUILD_TIMESTAMP}.log"

echo "📦 Starting Maven build at $(date)" | tee -a $LOG_FILE

# Step 1: Clean
echo "🧹 Step 1: Cleaning previous build..."
mvn clean >> $LOG_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Clean successful"
else
    echo "✗ Clean failed"
    exit 1
fi

# Step 2: Compile
echo "🔨 Step 2: Compiling source code..."
mvn compile >> $LOG_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Compile successful"
else
    echo "✗ Compile failed"
    exit 1
fi

# Step 3: Test
echo "✅ Step 3: Running tests..."
mvn test >> $LOG_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Tests passed"
else
    echo "✗ Tests failed"
    exit 1
fi

# Step 4: Package
echo "📦 Step 4: Packaging application..."
mvn package >> $LOG_FILE 2>&1
if [ $? -eq 0 ]; then
    echo "✓ Package successful"
else
    echo "✗ Package failed"
    exit 1
fi

echo ""
echo "=========================================="
echo "✓ Build completed successfully!"
echo "=========================================="
echo "JAR file location: target/inventory-management-system-1.0.0.jar"
echo "Build log: $LOG_FILE"

# List generated artifacts
echo ""
echo "Build artifacts:"
ls -lh target/*.jar
