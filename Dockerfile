FROM node:18

WORKDIR /app

COPY build.sh .
COPY messages.json .
COPY package.json .

RUN apt-get update
RUN npm install
RUN npm install socket.io


COPY . .

EXPOSE 8000

CMD ["node", "main.js"]