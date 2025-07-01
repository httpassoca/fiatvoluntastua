FROM node:20

WORKDIR /src

COPY . .

RUN npm ci

# Build the application
RUN npm run build

# Default command
CMD ["node", "dist/index.js"]
