FROM node:20

WORKDIR /src

COPY . .

RUN npm ci

# npm cache clean requires --force on modern npm (and it's usually unnecessary in Docker)
# RUN npm cache clean --force

# Build the application
RUN npm run build

# Default command
CMD ["node", "dist/index.js"]
