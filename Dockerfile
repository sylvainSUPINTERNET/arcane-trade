FROM node:22-alpine

ARG MICROSERVICE=

WORKDIR /monorepo

COPY . .

RUN npm install && npm install -g @nrwl/cli && npx nx build $MICROSERVICE --prod

ENTRYPOINT ["npx", "nx", "serve", "$MICROSERVICE", "--prod"]

