#!/bin/bash

# 🚀 Sentra - Nosana Deployment Script
# This script handles the complete deployment process to Nosana Network

set -e

echo "🚀 Starting Sentra deployment to Nosana Network..."

# Configuration
DOCKER_USERNAME=${DOCKER_USERNAME:-"yourusername"}
IMAGE_NAME="sentra-ai"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "📦 Docker Configuration:"
echo "  Username: $DOCKER_USERNAME"
echo "  Image: $FULL_IMAGE_NAME"

# 1. Build Docker image
echo "🏗️  Building Docker image..."
docker build -t $FULL_IMAGE_NAME .

# 2. Test locally
echo "🧪 Testing container locally..."
echo "  Starting container on port 3000..."
docker run -d -p 3000:3000 --name sentra-test $FULL_IMAGE_NAME

# Wait for container to start
echo "  Waiting for container to start..."
sleep 10

# Test if container is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Container test successful!"
else
    echo "❌ Container test failed!"
    docker logs sentra-test
    docker stop sentra-test
    docker rm sentra-test
    exit 1
fi

# Stop test container
docker stop sentra-test
docker rm sentra-test

# 3. Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push $FULL_IMAGE_NAME

# 4. Update Nosana job definition
echo "📝 Updating Nosana job definition..."
sed -i "s/yourusername\/sentra-ai:latest/$FULL_IMAGE_NAME/g" nosana-job.json

echo "✅ Docker image pushed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Deploy to Nosana Network:"
echo "   - Option A: Use Nosana Dashboard"
echo "   - Option B: Run: nosana job post --file ./nosana-job.json --market nvidia-3090 --timeout 30"
echo ""
echo "2. Create video demo (1-3 minutes)"
echo "3. Update README.md with deployment info"
echo "4. Submit to Nosana Builders Challenge"
echo ""
echo "📋 See NOSANA_DEPLOYMENT_GUIDE.md for complete instructions"
echo ""
echo "🚀 Sentra is ready for Nosana deployment!"
