#!/bin/bash

echo "🚀 Microtweet Setup Script"
echo "=========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✓ Docker is installed"
echo "✓ Docker Compose is installed"

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo "⚠️  Please review and update .env file with your configuration"
else
    echo "✓ .env file already exists"
fi

# Check directory structure
echo ""
echo "📁 Checking directory structure..."

REQUIRED_DIRS=(
    "api-gateway/src"
    "auth-service/src"
    "user-service/src"
    "tweet-service/src"
    "feed-service/src"
    "scripts"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Missing directory: $dir"
        exit 1
    fi
done

echo "✓ All required directories exist"

# Stop any running containers
echo ""
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build and start services
echo ""
echo "🔨 Building Docker images..."
docker-compose build

echo ""
echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo ""
echo "🔍 Checking service health..."

SERVICES=("api-gateway" "auth-service" "user-service" "tweet-service" "feed-service")
ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        echo "✓ $service is running"
    else
        echo "❌ $service is not running"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = true ]; then
    echo ""
    echo "✅ All services are running!"
    echo ""
    echo "📋 Service URLs:"
    echo "  API Gateway:   http://localhost:3000"
    echo "  Auth Service:  http://localhost:3001"
    echo "  User Service:  http://localhost:3002"
    echo "  Tweet Service: http://localhost:3003"
    echo "  Feed Service:  http://localhost:3004"
    echo "  PostgreSQL:    localhost:5432"
    echo "  Redis:         localhost:6379"
    echo ""
    echo "🧪 Run tests with: bash scripts/test-api.sh"
    echo "📖 View logs with: docker-compose logs -f"
    echo "🛑 Stop services with: docker-compose down"
else
    echo ""
    echo "❌ Some services failed to start. Check logs with:"
    echo "   docker-compose logs"
    exit 1
fi
