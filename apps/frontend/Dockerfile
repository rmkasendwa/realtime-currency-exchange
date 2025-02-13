FROM node:20.5-alpine3.18 AS currency-exchange-node
RUN apk add --no-cache dumb-init=1.2.5-r2

FROM currency-exchange-node AS currency-exchange-common

WORKDIR /src
COPY package.json \
  tsconfig* \
  nx.json \
  package-lock.json \
  .npmrc \
  eslint.config.mjs \
  jest.preset.js \
  ./
RUN npm i --legacy-peer-deps

FROM currency-exchange-common AS frontend-build
WORKDIR /src
COPY apps/frontend ./apps/frontend
RUN npx nx run frontend:build:production

FROM currency-exchange-node AS frontend-prod
WORKDIR /src
COPY --from=frontend-build /src/dist/apps/frontend/ ./
ENV NODE_ENV=production
RUN npm i --legacy-peer-deps
CMD npm start
