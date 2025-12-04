#!/bin/bash
# Strato SFTP Upload Script
# Uploads the dist/ folder to Strato hosting via SFTP
#
# Usage:
#   ./upload-to-strato.sh            # Full upload (all files)
#   ./upload-to-strato.sh --skip-audio   # Skip audio files (MP3, WAV, etc.)
#   ./upload-to-strato.sh --only-audio   # Only upload audio files

set -e  # Exit on error

# Parse command line arguments
SKIP_AUDIO=false
ONLY_AUDIO=false

for arg in "$@"; do
    case $arg in
        --skip-audio)
            SKIP_AUDIO=true
            shift
            ;;
        --only-audio)
            ONLY_AUDIO=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-audio    Skip audio files (*.mp3, *.wav, etc.)"
            echo "  --only-audio    Upload only audio files"
            echo "  --help, -h      Show this help message"
            exit 0
            ;;
        *)
            # Unknown option
            ;;
    esac
done

echo "🚀 Strato SFTP Upload Script"
echo "============================"
if [ "$SKIP_AUDIO" = true ]; then
    echo "📝 Mode: SKIP AUDIO FILES"
elif [ "$ONLY_AUDIO" = true ]; then
    echo "📝 Mode: ONLY AUDIO FILES"
else
    echo "📝 Mode: FULL UPLOAD"
fi
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
    echo "Required variables: SFTP_HOST, SFTP_USER, SFTP_PASS, SFTP_REMOTE_PATH"
    exit 1
fi

# Set default values
SFTP_PORT="${SFTP_PORT:-22}"
SFTP_REMOTE_PATH="${SFTP_REMOTE_PATH:-/htdocs/}"

echo "✅ SFTP credentials loaded"
echo "   Host: $SFTP_HOST"
echo "   Port: $SFTP_PORT"
echo "   User: $SFTP_USER"
echo "   Remote: $SFTP_REMOTE_PATH"
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ dist/ folder not found!"
    echo "Please run 'npm run build' first."
    exit 1
fi

echo "📦 Checking dist/ folder..."
FILE_COUNT=$(find dist -type f | wc -l)
echo "   Found $FILE_COUNT files to upload"
echo ""

# Test SFTP connection
echo "🔍 Testing SFTP connection..."
if curl -s --connect-timeout 10 "sftp://$SFTP_HOST:$SFTP_PORT/" --user "$SFTP_USER:$SFTP_PASS" -k > /dev/null 2>&1; then
    echo "✅ SFTP connection successful"
else
    echo "❌ SFTP connection failed!"
    echo "Please check your credentials and try again."
    exit 1
fi
echo ""

# Upload files
echo "📤 Uploading files to Strato..."
echo "   This may take a few minutes..."
echo ""

UPLOADED=0
FAILED=0

# Function to upload a file
upload_file() {
    local file="$1"
    local relative_path="${file#dist/}"
    local remote_file="$SFTP_REMOTE_PATH$relative_path"

    # Get file size
    local file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    local size_mb=$((file_size / 1024 / 1024))

    # Create directory structure if needed
    local remote_dir=$(dirname "$remote_file")

    # Set timeout based on file size (at least 60s, 1s per MB for large files)
    local timeout=$((size_mb > 60 ? size_mb : 60))

    # Upload file with SFTP
    echo -n "   Uploading $relative_path (${size_mb}MB)... "
    if curl -s --ftp-create-dirs -T "$file" "sftp://$SFTP_HOST:$SFTP_PORT$remote_file" --user "$SFTP_USER:$SFTP_PASS" -k --connect-timeout 30 --max-time $timeout 2>&1 | grep -q "completely uploaded" || \
       curl -s --ftp-create-dirs -T "$file" "sftp://$SFTP_HOST:$SFTP_PORT$remote_file" --user "$SFTP_USER:$SFTP_PASS" -k --connect-timeout 30 --max-time $timeout > /dev/null 2>&1; then
        echo "✅"
        ((UPLOADED++))
        return 0
    else
        echo "❌ FAILED"
        ((FAILED++))
        return 1
    fi
}

# Function to check if file is audio
is_audio_file() {
    local file="$1"
    case "$file" in
        *.mp3|*.MP3|*.wav|*.WAV|*.ogg|*.OGG|*.flac|*.FLAC|*.m4a|*.M4A)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Upload all files from dist/
cd dist
for file in $(find . -type f); do
    # Remove leading ./
    file="${file#./}"

    # Apply filters
    if is_audio_file "$file"; then
        if [ "$SKIP_AUDIO" = true ]; then
            echo "   ⏭️  Skipping $file (audio file)"
            continue
        fi
    else
        if [ "$ONLY_AUDIO" = true ]; then
            echo "   ⏭️  Skipping $file (not audio)"
            continue
        fi
    fi

    upload_file "$file" || true  # Continue on error
done
cd ..

echo ""
echo "📊 Upload Summary"
echo "================="
echo "   ✅ Uploaded: $UPLOADED files"
echo "   ❌ Failed: $FAILED files"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 Upload completed successfully!"
    echo ""
    echo "🌐 Website: https://www.dabrock.eu"
    echo ""
    echo "✅ Test the following:"
    echo "   • Homepage: https://www.dabrock.eu"
    echo "   • CV EN: https://www.dabrock.eu/Resume_EN.pdf"
    echo "   • CV DE: https://www.dabrock.eu/Resume_DE.pdf"
    echo "   • CV ES: https://www.dabrock.eu/Resume_ES.pdf"
    echo ""
    exit 0
else
    echo "⚠️  Upload completed with errors!"
    echo "Some files failed to upload. Please check the errors above."
    exit 1
fi
