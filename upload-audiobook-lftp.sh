#!/bin/bash
# Upload large audiobook file with lftp
# This script is specialized for large file uploads with resume capability

set -e

echo "🎵 Audiobook Upload Script (lftp)"
echo "==================================="
echo ""

# Load SFTP credentials
if [ -f .env.sftp ]; then
    echo "📄 Loading SFTP credentials..."
    export $(cat .env.sftp | grep -v '^#' | grep -E 'SFTP_' | xargs)
else
    echo "❌ .env.sftp file not found!"
    exit 1
fi

# Check if lftp is installed
if ! command -v lftp &> /dev/null; then
    echo "❌ lftp is not installed!"
    echo ""
    echo "Please install it first:"
    echo "  sudo apt-get update && sudo apt-get install -y lftp"
    echo ""
    exit 1
fi

# Check if audiobook exists
AUDIOBOOK="dist/Michael_Dabrock_Audiobook.mp3"
if [ ! -f "$AUDIOBOOK" ]; then
    echo "❌ Audiobook not found: $AUDIOBOOK"
    exit 1
fi

# Get file size
FILE_SIZE=$(stat -f%z "$AUDIOBOOK" 2>/dev/null || stat -c%s "$AUDIOBOOK" 2>/dev/null)
SIZE_MB=$((FILE_SIZE / 1024 / 1024))

echo "✅ Found audiobook: ${SIZE_MB}MB"
echo "   File: $AUDIOBOOK"
echo ""
echo "📤 Uploading to Strato..."
echo "   This may take several minutes..."
echo ""

# Upload with lftp
lftp -c "
set sftp:auto-confirm yes
set ssl:verify-certificate no
open sftp://$SFTP_USER:$SFTP_PASS@$SFTP_HOST:$SFTP_PORT
cd $SFTP_REMOTE_PATH
put -c $AUDIOBOOK -o Michael_Dabrock_Audiobook.mp3
bye
"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Upload successful!"
    echo ""
    echo "🌐 Test it at: https://www.dabrock.eu/Michael_Dabrock_Audiobook.mp3"
else
    echo ""
    echo "❌ Upload failed!"
    exit 1
fi
