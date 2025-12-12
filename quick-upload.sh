#!/bin/bash
set -e

# Go to project root
cd /mnt/e/Project20250615/portfolio-website/michael-homepage

# Load credentials
source .env.sftp

cd privategpt/frontend/dist

echo "📤 Uploading small files first..."

# Upload small files
for file in index.html vite.svg .htaccess; do
    echo -n "Uploading $file... "
    curl -s --ftp-create-dirs -T "$file" \
        "sftp://$SFTP_USER:$SFTP_PASS@$SFTP_HOST:22/htdocs/privategpt/$file" \
        -k --connect-timeout 30 --max-time 60 && echo "✅" || echo "❌"
done

# Upload CSS
echo -n "Uploading CSS... "
curl -s --ftp-create-dirs -T "assets"/*.css \
    "sftp://$SFTP_USER:$SFTP_PASS@$SFTP_HOST:22/htdocs/privategpt/assets/" \
    -k --connect-timeout 30 --max-time 90 && echo "✅" || echo "❌"

# Upload JS (large file, more time)
echo -n "Uploading JS (large file, may take time)... "
curl -s --ftp-create-dirs -T "assets"/*.js \
    "sftp://$SFTP_USER:$SFTP_PASS@$SFTP_HOST:22/htdocs/privategpt/assets/" \
    -k --connect-timeout 30 --max-time 180 && echo "✅" || echo "❌"

echo ""
echo "🎉 Upload complete!"
echo "🌐 https://www.dabrock.eu/privategpt"
