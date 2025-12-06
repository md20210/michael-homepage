#!/bin/bash
set -e

echo "🚀 Uploading PrivateGPT Frontend to Strato (www.dabrock.eu)"
echo "============================================================"
echo ""

# Load environment variables
if [ -f .env.sftp ]; then
    echo "📄 Loading SFTP credentials from .env.sftp..."
    export $(cat .env.sftp | grep -v '^#' | grep -E 'SFTP_' | xargs)
else
    echo "❌ .env.sftp file not found!"
    exit 1
fi

# Check if credentials are set
if [ -z "$SFTP_HOST" ] || [ -z "$SFTP_USER" ] || [ -z "$SFTP_PASS" ]; then
    echo "❌ SFTP credentials missing in .env.sftp!"
    exit 1
fi

# Set defaults
SFTP_PORT="${SFTP_PORT:-22}"
SFTP_REMOTE_PATH="${SFTP_REMOTE_PATH:-/htdocs/}"
PRIVATEGPT_PATH="${SFTP_REMOTE_PATH}privategpt/"

echo "✅ SFTP credentials loaded"
echo "   Host: $SFTP_HOST"
echo "   User: $SFTP_USER"
echo "   Remote: $PRIVATEGPT_PATH"
echo ""

# Build directory
BUILD_DIR="./privategpt/frontend/dist"

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "❌ Build directory not found!"
  echo "Please run: cd privategpt/frontend && npm run build"
  exit 1
fi

echo "📦 Checking build directory..."
FILE_COUNT=$(find "$BUILD_DIR" -type f | wc -l)
echo "   Found $FILE_COUNT files to upload"
echo ""

# Test SFTP connection
echo "🔍 Testing SFTP connection..."
if curl -s --connect-timeout 10 "sftp://$SFTP_HOST:$SFTP_PORT/" --user "$SFTP_USER:$SFTP_PASS" -k > /dev/null 2>&1; then
    echo "✅ SFTP connection successful"
else
    echo "❌ SFTP connection failed!"
    exit 1
fi
echo ""

# Upload files
echo "📤 Uploading files to Strato..."
echo ""

UPLOADED=0
FAILED=0

cd "$BUILD_DIR"
for file in $(find . -type f); do
    file="${file#./}"
    remote_file="$PRIVATEGPT_PATH$file"

    # Get file size for timeout calculation
    file_size=$(stat -c%s "$file" 2>/dev/null || echo 0)
    size_kb=$((file_size / 1024))
    timeout=$((size_kb > 120 ? 180 : 120))  # 3min for large files, 2min for small

    echo -n "   Uploading $file (${size_kb}KB)... "
    if curl -s --ftp-create-dirs -T "$file" "sftp://$SFTP_HOST:$SFTP_PORT$remote_file" --user "$SFTP_USER:$SFTP_PASS" -k --connect-timeout 30 --max-time $timeout > /dev/null 2>&1; then
        echo "✅"
        ((UPLOADED++))
    else
        echo "❌ FAILED"
        ((FAILED++))
    fi
done
cd - > /dev/null

echo ""
echo "📊 Upload Summary"
echo "================="
echo "   ✅ Uploaded: $UPLOADED files"
echo "   ❌ Failed: $FAILED files"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 Upload completed successfully!"
    echo ""
    echo "🌐 PrivateGPT Frontend: https://www.dabrock.eu/privategpt"
    echo "📚 API Docs: https://backend-production-4cf2.up.railway.app/docs"
    echo ""
    exit 0
else
    echo "⚠️  Upload completed with errors!"
    exit 1
fi
