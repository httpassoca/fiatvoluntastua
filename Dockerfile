FROM node:20

WORKDIR /src

COPY package*.json ./

# Install dependencies
RUN npm ci

COPY . .

RUN npm run build

CMD ["node", "dist/index.js"]