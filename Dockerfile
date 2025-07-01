FROM node:20-alpine AS build

WORKDIR /src

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:20-alpine

WORKDIR /src

COPY --from=build /src/dist ./dist
COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/package*.json ./


CMD ["node", "dist/index.js"]