FROM node:15.13.0-slim

COPY . /app

WORKDIR /app

RUN npm i
RUN npm start

ENTRYPOINT npx serve