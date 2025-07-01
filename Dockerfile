FROM node:20

WORKDIR /src

COPY . .

RUN npm ci

RUN npm cache clean

# Build the application
RUN npm run build

# Default command
CMD ["node", "dist/index.js"]
