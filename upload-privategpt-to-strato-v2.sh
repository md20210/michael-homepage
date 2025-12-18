#!/bin/bash
set -e

echo "🚀 Uploading PrivateGPT Frontend to Strato (www.dabrock.eu) - V2 with SFTP"
echo "=========================================================================="
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
PRIVATEGPT_PATH="${SFTP_REMOTE_PATH}privategpt"

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

echo "📦 Preparing files..."
cd "$BUILD_DIR"

# Clean up log files
rm -f deployment-*.log

FILE_COUNT=$(find . -type f | wc -l)
echo "   Found $FILE_COUNT files to upload"
echo ""

# Create SFTP batch commands file
SFTP_BATCH="/tmp/sftp_batch_$$"

# Build SFTP commands
echo "# SFTP Batch Commands for PrivateGPT Upload" > "$SFTP_BATCH"
echo "mkdir $PRIVATEGPT_PATH" >> "$SFTP_BATCH"
echo "mkdir $PRIVATEGPT_PATH/assets" >> "$SFTP_BATCH"

# Add put commands for all files
for file in $(find . -type f | sort); do
    file="${file#./}"

    # Skip deployment logs
    if [[ "$file" == deployment-*.log ]]; then
        continue
    fi

    remote_file="$PRIVATEGPT_PATH/$file"
    echo "put \"$file\" \"$remote_file\"" >> "$SFTP_BATCH"
done

echo "quit" >> "$SFTP_BATCH"

echo "📤 Uploading files via SFTP batch mode..."
echo "   Batch file: $SFTP_BATCH"
echo ""

# Show batch commands for debugging
echo "📋 SFTP Commands:"
cat "$SFTP_BATCH"
echo ""

# Execute SFTP batch upload using sshpass (or expect)
# Note: This requires sshpass to be installed, or we use expect
if command -v sshpass &> /dev/null; then
    echo "✅ Using sshpass for authentication"
    sshpass -p "$SFTP_PASS" sftp -oBatchMode=no -b "$SFTP_BATCH" -P "$SFTP_PORT" "$SFTP_USER@$SFTP_HOST"
    UPLOAD_STATUS=$?
else
    echo "⚠️  sshpass not available, using expect-based approach"

    # Create expect script
    EXPECT_SCRIPT="/tmp/sftp_expect_$$"
    cat > "$EXPECT_SCRIPT" <<'EXPECT_EOF'
#!/usr/bin/expect -f
set timeout 300
set host [lindex $argv 0]
set port [lindex $argv 1]
set user [lindex $argv 2]
set pass [lindex $argv 3]
set batch [lindex $argv 4]

spawn sftp -o StrictHostKeyChecking=no -P $port -b $batch $user@$host
expect {
    "password:" {
        send "$pass\r"
        exp_continue
    }
    eof
}
EXPECT_EOF

    chmod +x "$EXPECT_SCRIPT"

    if command -v expect &> /dev/null; then
        "$EXPECT_SCRIPT" "$SFTP_HOST" "$SFTP_PORT" "$SFTP_USER" "$SFTP_PASS" "$SFTP_BATCH"
        UPLOAD_STATUS=$?
    else
        echo "❌ Neither sshpass nor expect available!"
        echo "   Please install sshpass: sudo apt-get install sshpass"
        echo "   Or install expect: sudo apt-get install expect"
        rm -f "$SFTP_BATCH" "$EXPECT_SCRIPT"
        exit 1
    fi

    rm -f "$EXPECT_SCRIPT"
fi

# Cleanup
rm -f "$SFTP_BATCH"
cd - > /dev/null

echo ""
if [ $UPLOAD_STATUS -eq 0 ]; then
    echo "🎉 Upload completed successfully!"
    echo ""
    echo "🌐 PrivateGPT Frontend: https://www.dabrock.eu/privategpt"
    echo "📚 API Docs: https://backend-production-4cf2.up.railway.app/docs"
    echo ""
    exit 0
else
    echo "⚠️  Upload encountered errors (exit code: $UPLOAD_STATUS)"
    exit 1
fi
