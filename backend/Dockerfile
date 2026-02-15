# Use Python 3.12 slim image for a balance of size and compatibility
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for potential build tools or audio libraries
# - build-essential: for compiling C extensions
# - curl: for healthchecks or downloads
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
# Upgrade pip first to avoid issues
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
# using 0.0.0.0 to allow external access (essential for Docker)
# We use shell form to allow variable expansion, but exec form is better for signals.
# Let's use sh -c to expand the variable
CMD sh -c "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"
