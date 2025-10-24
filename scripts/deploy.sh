#!/bin/bash

# 🚀 Sentra Deployment Script
# This script handles the complete deployment process for Sentra

set -e

echo "🚀 Starting Sentra deployment process..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 2. Run linting and type checking
echo "🔍 Running linting and type checking..."
pnpm run lint
pnpm run type-check

# 3. Run tests (if available)
echo "🧪 Running tests..."
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    pnpm run test
else
    echo "⚠️  No tests found, skipping..."
fi

# 4. Build the application
echo "🏗️  Building application..."
pnpm run build

# 5. Check build output
echo "✅ Build completed successfully!"
echo "📊 Build statistics:"
du -sh .next/static

# 6. Start production server (for testing)
echo "🚀 Starting production server..."
echo "🌐 Application will be available at http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"

# 7. Deployment options
echo ""
echo "🎯 Deployment Options:"
echo "1. Vercel: vercel --prod"
echo "2. Nosana Network: Follow Nosana deployment guide"
echo "3. Self-hosted: pnpm run start"
echo ""
echo "📋 See DEPLOYMENT_CHECKLIST.md for complete deployment guide"

# Start the server
pnpm run start
