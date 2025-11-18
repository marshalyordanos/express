# Use Node.js LTS
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# Build NestJS
RUN npm run build

ENV PRISMA_SCHEMA_ENGINE_URL=${DIRECT_URL}

RUN npx prisma generate

# Expose port (optional)
EXPOSE 3000

# Default command
CMD ["npm", "run", "start:prod"]
