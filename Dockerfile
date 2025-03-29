# Use the official Node.js 18 image as the base
FROM node:20

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Transpile TypeScript to JavaScript
RUN npm run build

# Start the application
CMD ["node", "dist/index.js"]