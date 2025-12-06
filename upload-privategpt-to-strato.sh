#!/bin/bash
set -e

echo "🚀 Uploading PrivateGPT Frontend to Strato (www.dabrock.eu)"

# Strato SSH Configuration
STRATO_USER="ssh-w01b0f3f"
STRATO_HOST="ssh.strato.de"
STRATO_PATH="/privategpt"  # Adjust this path as needed

# Build directory
BUILD_DIR="./privategpt/frontend/dist"

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory not found! Run 'npm run build' first."
  exit 1
fi

echo "📦 Uploading $BUILD_DIR to $STRATO_USER@$STRATO_HOST:$STRATO_PATH"

# Upload via SCP (with auto host key acceptance)
scp -o StrictHostKeyChecking=accept-new -r "$BUILD_DIR"/* "$STRATO_USER@$STRATO_HOST:$STRATO_PATH/"

echo "✅ Upload complete!"
echo "🌐 Visit: https://www.dabrock.eu/privategpt"
