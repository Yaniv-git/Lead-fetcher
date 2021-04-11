FROM node:15.13.0-slim

COPY . /app

WORKDIR /app

RUN npm i
RUN npm run build

ENTRYPOINT npx serve