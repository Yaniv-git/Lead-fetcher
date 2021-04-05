FROM node:10-slim

COPY . /app

WORKDIR /app

RUN npm i
RUN npm run build

ENTRYPOINT npm run start