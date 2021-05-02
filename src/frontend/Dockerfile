FROM node:latest

COPY . /app

WORKDIR /app


RUN npm i
RUN npm run build

FROM node:slim
COPY --from=0 /app /app
RUN npm install -g serve
WORKDIR /app
CMD ["npx", "serve", "-s", "build", "-l", "3000"]