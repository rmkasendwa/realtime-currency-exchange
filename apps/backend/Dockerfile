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

FROM currency-exchange-common AS backend-build
COPY apps/backend ./apps/backend/
RUN npx nx run backend:build:production

FROM currency-exchange-node AS backend-prod
USER node
WORKDIR /src
COPY --from=backend-build --chown=node:node /src/dist/apps/backend ./
ENV NODE_ENV=production
RUN npm i --legacy-peer-deps --only=production
CMD ["dumb-init", "node", "main.js"]
