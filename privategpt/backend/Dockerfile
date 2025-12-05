# Railway Dockerfile for PrivateGPT Backend
FROM python:3.11-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Download Qwen2.5-0.5B model during build
RUN python3 download_model.py

# Create necessary directories with proper permissions
RUN mkdir -p /data/chroma_db /app/uploads && \
    chmod -R 777 /data /app/uploads

# Expose port (Railway sets this via $PORT)
EXPOSE 8000

# Start command (ENTRYPOINT cannot be overridden by Railway auto-detect!)
ENTRYPOINT ["bash", "railway_startup.sh"]
