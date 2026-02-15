# Use Node.js 20 alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies (including devDependencies for Vite)
RUN npm install

# Copy source code
COPY . .

# Expose port (must match vite.config.ts)
EXPOSE 8080

# Run in development mode
# "host" is already set in vite.config.ts, so just running the script is enough
CMD ["npm", "run", "dev"]
