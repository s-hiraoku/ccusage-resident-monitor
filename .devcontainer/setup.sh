#!/bin/bash

echo "🚀 Setting up CCUsage Monitor development environment..."

# Update package manager
apt-get update

# Install required packages for Swift development
apt-get install -y \
  build-essential \
  curl \
  git \
  vim \
  nano

# Install ccusage CLI tool
echo "📦 Installing ccusage..."
npm install -g ccusage

# Verify installations
echo "✅ Swift version:"
swift --version

echo "✅ ccusage version:"
ccusage --version || echo "ccusage installation may have issues"

echo "✅ Node.js version:"
node --version

echo "🎉 Development environment setup complete!"
echo "💡 Try running: swift build"