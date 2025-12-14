#!/bin/bash
echo "=========================================="
echo "Final System Verification"
echo "=========================================="

FAILED=0

# Check Docker
echo "1️⃣  Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed"
    FAILED=$((FAILED+1))
else
    echo "✅ Docker installed"
fi

# Check Git
echo "2️⃣  Checking Git..."
if ! command -v git &> /dev/null; then
    echo "❌ Git not installed"
    FAILED=$((FAILED+1))
else
    echo "✅ Git installed"
fi

# Check Maven
echo "3️⃣  Checking Maven..."
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven not installed"
    FAILED=$((FAILED+1))
else
    echo "✅ Maven installed"
    mvn --version | head -1
fi

# Check Java
echo "4️⃣  Checking Java..."
if ! command -v java &> /dev/null; then
    echo "❌ Java not installed"
    FAILED=$((FAILED+1))
else
    echo "✅ Java installed"
    java -version 2>&1 | head -1
fi

# Check Docker Compose
echo "5️⃣  Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed"
    FAILED=$((FAILED+1))
else
    echo "✅ Docker Compose installed"
fi

# Check project structure
echo "6️⃣  Checking project structure..."
REQUIRED_FILES=("pom.xml" "Dockerfile" "docker-compose.yml" "Jenkinsfile" "README.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        FAILED=$((FAILED+1))
    fi
done

echo ""
echo "=========================================="
if [ $FAILED -eq 0 ]; then
    echo "✅ All checks passed! Ready for deployment."
else
    echo "❌ $FAILED checks failed. Please fix and retry."
fi
echo "=========================================="
exit $FAILED
